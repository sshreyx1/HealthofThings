const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');

const app = express();
const port = 3001;

// Constants
const PROBABILITY_THRESHOLD_HIGH = 0.8;
const PROBABILITY_THRESHOLD_SIGNIFICANT = 0.5;
const MIN_QUESTIONS = 10;

// Question type mappings for better answers
const QUESTION_TYPES = {
    DURATION: 'duration',
    LOCATION: 'location',
    SEVERITY: 'severity',
    FREQUENCY: 'frequency',
    BINARY: 'single',
    ONSET: 'onset',
    CHARACTER: 'character',
    AGGRAVATING: 'aggravating',
    RELIEVING: 'relieving'
};

const ANSWER_MAPPINGS = {
    duration: [
        { id: 'less_than_30m', label: 'Less than 30 minutes' },
        { id: '30m_to_8h', label: '30 minutes to 8 hours' },
        { id: '8h_to_24h', label: '8 to 24 hours' },
        { id: 'more_than_24h', label: 'More than 24 hours' }
    ],
    location: [
        { id: 'center', label: 'Center of chest/behind breastbone' },
        { id: 'left_side', label: 'Left side of chest' },
        { id: 'right_side', label: 'Right side of chest' },
        { id: 'widespread', label: 'Widespread across chest' }
    ],
    severity: [
        { id: 'mild', label: 'Mild - noticeable but not disturbing' },
        { id: 'moderate', label: 'Moderate - uncomfortable but manageable' },
        { id: 'severe', label: 'Severe - intense and very disturbing' }
    ],
    frequency: [
        { id: 'constant', label: 'Constant' },
        { id: 'intermittent', label: 'Comes and goes' },
        { id: 'occasional', label: 'Occasional episodes' }
    ],
    onset: [
        { id: 'sudden', label: 'Suddenly' },
        { id: 'gradual', label: 'Gradually' }
    ],
    character: [
        { id: 'sharp', label: 'Sharp/Stabbing' },
        { id: 'dull', label: 'Dull/Aching' },
        { id: 'pressure', label: 'Pressure/Squeezing' },
        { id: 'burning', label: 'Burning' }
    ],
    aggravating: [
        { id: 'movement', label: 'Physical activity/Movement' },
        { id: 'breathing', label: 'Deep breathing' },
        { id: 'lying', label: 'Lying down' },
        { id: 'stress', label: 'Stress/Anxiety' }
    ],
    relieving: [
        { id: 'rest', label: 'Rest' },
        { id: 'position', label: 'Changing position' },
        { id: 'medication', label: 'Medication' },
        { id: 'nothing', label: 'Nothing helps' }
    ],
    single: [
        { id: 'present', label: 'Yes' },
        { id: 'absent', label: 'No' },
        { id: 'unknown', label: "I don't know" }
    ]
};

// Create axios instance with extended timeout
const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 30000, // 30 second timeout
    validateStatus: function (status) {
        return status >= 200 && status < 500; // Handle only server errors
    }
});

// Middleware setup
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Interview-Id', 'App-Id', 'App-Key', 'Model'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// API Configuration
const INFERMEDICA_API = 'https://api.infermedica.com/v3';
const APP_ID = 'fcf593f8';
const APP_KEY = 'c1950b8f100e2a08e4b4d9bd8751b2e8';

const headers = {
    'App-Id': APP_ID,
    'App-Key': APP_KEY,
    'Content-Type': 'application/json',
    'Model': 'infermedica-en'
};

// Helper functions
const determineQuestionType = (question) => {
    if (!question?.text) return 'single';

    // First check if it's a binary question based on choices
    if (question.items?.[0]?.choices?.every(choice => 
        ['present', 'absent', 'unknown'].includes(choice.id)
    )) {
        return 'single';
    }

    const text = question.text.toLowerCase();

    if (text.includes('how long') || text.includes('duration')) {
        return 'duration';
    }
    if (text.includes('where exactly') || text.includes('location') || text.includes('where is') || text.includes('which part')) {
        return 'location';
    }
    if (text.includes('how severe') || text.includes('intensity') || text.includes('how bad')) {
        return 'severity';
    }
    if (text.includes('how often') || text.includes('frequency') || text.includes('how frequently')) {
        return 'frequency';
    }
    if (text.includes('when did') || text.includes('start') || text.includes('begin')) {
        return 'onset';
    }
    if (text.includes('what type') || text.includes('describe') || text.includes('what kind')) {
        return 'character';
    }
    if (text.includes('worse') || text.includes('aggravate') || text.includes('triggers')) {
        return 'aggravating';
    }
    if (text.includes('better') || text.includes('relieve') || text.includes('improves')) {
        return 'relieving';
    }

    // If no specific type is detected, keep the original question format
    return null;
};

const getAppropriateChoices = (questionType, originalChoices) => {
    // For binary questions, always use single type choices
    if (originalChoices?.every(choice => ['present', 'absent', 'unknown'].includes(choice.id))) {
        return ANSWER_MAPPINGS.single;
    }

    // For recognized question types, use mapped choices
    if (questionType && ANSWER_MAPPINGS[questionType]) {
        return ANSWER_MAPPINGS[questionType];
    }

    // Default to original choices if no mapping exists
    return originalChoices;
};

const formatQuestionAndChoices = (question) => {
    if (!question?.items?.[0]) return question;

    const questionType = determineQuestionType(question);
    const appropriateChoices = getAppropriateChoices(questionType, question.items[0].choices);

    // Only modify the question if we have appropriate choices
    if (appropriateChoices) {
        return {
            ...question,
            items: [{
                ...question.items[0],
                choices: appropriateChoices
            }]
        };
    }

    return question;
};

const logDiagnosisProgress = (conditions, evidenceCount, question) => {
    console.log('\n=== Diagnosis Progress ===');
    console.log(`Evidence Count: ${evidenceCount}`);
    
    if (conditions && conditions.length > 0) {
        console.log('\nPotential Conditions:');
        conditions.forEach((condition, index) => {
            console.log(`${index + 1}. ${condition.common_name} (${(condition.probability * 100).toFixed(1)}%)`);
        });
    }

    if (question) {
        console.log('\nNext Question:', question.text);
        console.log('Question Type:', determineQuestionType(question));
        if (question.items && question.items[0]) {
            console.log('Options:');
            question.items[0].choices.forEach((choice, index) => {
                console.log(`${index + 1}. ${choice.label}`);
            });
        }
    }
    
    console.log('========================\n');
};

const shouldStopQuestioning = (conditions, evidenceCount) => {
    if (evidenceCount < MIN_QUESTIONS) {
        return false;
    }

    return conditions.some(c => c.probability >= PROBABILITY_THRESHOLD_HIGH);
};

// Routes
app.post('/parse', async (req, res) => {
    try {
        console.log('\n=== Parsing Symptoms ===');
        console.log('Input Text:', req.body.text);

        const parseRequest = {
            text: req.body.text,
            age: {
                value: req.body.age?.value || 30
            },
            sex: req.body.sex || 'male',
            include_tokens: true,
            correct_spelling: true
        };

        const response = await api.post(`${INFERMEDICA_API}/parse`, parseRequest, { headers });
        
        console.log('\nDetected Symptoms:');
        response.data.mentions?.forEach((mention, index) => {
            console.log(`${index + 1}. ${mention.common_name}`);
        });

        res.json(response.data);
    } catch (error) {
        console.error('Parse error:', error.response?.data || error);
        res.status(500).json({
            error: 'Failed to parse symptoms',
            details: error.response?.data || error.message
        });
    }
});

app.post('/diagnosis', async (req, res) => {
    try {
        const diagnosisRequest = {
            sex: req.body.sex,
            age: req.body.age,
            evidence: req.body.evidence || [],
            extras: { disable_groups: true }
        };

        console.log('\n=== Diagnosis Request ===');
        console.log('Patient:', { sex: req.body.sex, age: req.body.age?.value });
        console.log('Evidence Count:', diagnosisRequest.evidence.length);

        const response = await api.post(`${INFERMEDICA_API}/diagnosis`, diagnosisRequest, {
            headers: {
                ...headers,
                'Interview-Id': req.body.interview_token
            }
        });

        const evidenceCount = diagnosisRequest.evidence.length;
        const conditions = (response.data.conditions || [])
            .filter(c => c.probability >= PROBABILITY_THRESHOLD_SIGNIFICANT)
            .sort((a, b) => b.probability - a.probability);

        const shouldStop = shouldStopQuestioning(conditions, evidenceCount);
        const formattedQuestion = formatQuestionAndChoices(response.data.question);

        if (formattedQuestion) {
            console.log('\nOriginal Question:', response.data.question);
            console.log('Formatted Question:', formattedQuestion);
        }

        const diagnosisStatus = {
            status: shouldStop ? 'complete' : 'in_progress',
            confidence_level: conditions[0]?.probability >= PROBABILITY_THRESHOLD_HIGH ? 'high' : 
                          conditions[0]?.probability >= PROBABILITY_THRESHOLD_SIGNIFICANT ? 'medium' : 'low',
            message: conditions[0]?.probability >= PROBABILITY_THRESHOLD_SIGNIFICANT ? 
                `Most likely condition: ${conditions[0].common_name} (${(conditions[0].probability * 100).toFixed(1)}%)` :
                'Gathering more information to determine the most likely condition...',
            probability: conditions[0]?.probability
        };

        const enrichedResponse = {
            ...response.data,
            question: formattedQuestion,
            should_stop: shouldStop,
            conditions: conditions,
            evidence_count: evidenceCount,
            diagnosis_status: diagnosisStatus
        };

        logDiagnosisProgress(conditions, evidenceCount, formattedQuestion);
        res.json(enrichedResponse);
    } catch (error) {
        console.error('Diagnosis error:', error.response?.data || error);
        res.status(500).json({
            error: 'Failed to process diagnosis',
            details: error.response?.data || error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.response?.data || err.message
    });
});

// Server initialization
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('\nConfiguration:');
    console.log(`- High Confidence Threshold: ${PROBABILITY_THRESHOLD_HIGH * 100}%`);
    console.log(`- Significant Confidence Threshold: ${PROBABILITY_THRESHOLD_SIGNIFICANT * 100}%`);
    console.log(`- Minimum Questions: ${MIN_QUESTIONS}`);
});

// Global error handling
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

module.exports = app;