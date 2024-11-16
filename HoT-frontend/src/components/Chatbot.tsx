import React, { useState, useRef, useEffect } from 'react';
import { FaMale, FaFemale } from 'react-icons/fa';
import { AlertCircle, X, ArrowRight, Send, Info, CheckCircle2 } from 'lucide-react';
import Sidebar from './Sidebar';
import './Chatbot.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isWarning?: boolean;
}

interface UserInfo {
  sex: 'male' | 'female' | null;
  age: number | null;
}

interface DiagnosisSession {
  diagnosis_id?: string;
  evidence: Array<{
    id: string;
    choice_id: string;
    source: 'initial' | 'suggest';
  }>;
}

interface Symptom {
  id: string;
  name: string;
  common_name: string;
  choice_id?: string;
}

interface Question {
  type: string;
  text: string;
  items: Array<{
    id: string;
    name: string;
    choices: Array<{
      id: string;
      label: string;
    }>;
  }>;
}

interface Condition {
  id: string;
  name: string;
  common_name: string;
  probability: number;
  description?: string;
}

interface EvidenceItem {
  id: string;
  name: string;
  choice: string;
}

interface EvidenceAnalysis {
  condition: {
    name: string;
    probability: number;
  };
  supporting_evidence: EvidenceItem[];
  opposing_evidence: EvidenceItem[];
}

interface DiagnosisStatus {
  status: 'in_progress' | 'complete';
  confidence: 'low' | 'medium' | 'high';
  message?: string;
}

const Chatbot: React.FC = () => {
  const [step, setStep] = useState<'disclaimer' | 'userInfo' | 'symptoms' | 'chat'>('disclaimer');
  const [userInfo, setUserInfo] = useState<UserInfo>({ sex: null, age: null });
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<DiagnosisSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [evidenceAnalysis, setEvidenceAnalysis] = useState<EvidenceAnalysis | null>(null);
  const [diagnosisStatus, setDiagnosisStatus] = useState<DiagnosisStatus | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot', isWarning?: boolean) => {
    if (!text) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      text,
      sender,
      timestamp: new Date(),
      isWarning
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleDisclaimerAccept = () => {
    setDisclaimerAccepted(true);
    setStep('userInfo');
  };

  const handleUserInfoSubmit = () => {
    if (userInfo.sex && userInfo.age) {
      setStep('symptoms');
      addMessage("Please describe your symptoms in detail. Include when they started and how severe they are.", 'bot');
    }
  };

  const presentFinalDiagnosis = (status: DiagnosisStatus, evidence: EvidenceAnalysis | null) => {
    if (status.message) {
      // First show the warning/disclaimer message
      addMessage(
        'Important: This is not a definitive diagnosis. Please consult with a healthcare provider ' +
        'for a proper medical evaluation. They can perform a thorough examination and provide ' +
        'appropriate treatment recommendations.',
        'bot',
        true
      );
      
      // Only show condition if evidence exists and has condition data
      if (evidence && evidence.condition && evidence.condition.name) {
        addMessage(`Most likely condition: ${evidence.condition.name} (${evidence.condition.probability}%)`, 'bot');
      }
    }
  };

  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    const errorMessage = error.response?.data?.details || error.message || 'An unexpected error occurred';
    setError(errorMessage);
    addMessage('I encountered an error processing your request. Please try again.', 'bot');
    setIsLoading(false);
  };

  const createDiagnosis = async (symptoms: Symptom[]): Promise<void> => {
    try {
      const evidence = symptoms.map(s => ({
        id: s.id,
        choice_id: 'present',
        source: 'initial' as const
      }));

      const response = await fetch(`${API_URL}/diagnosis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sex: userInfo.sex,
          age: { value: userInfo.age },
          evidence: evidence,
          extras: { disable_groups: true }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to create diagnosis session');
      }

      const data = await response.json();

      setCurrentSession({
        diagnosis_id: data.interview_token,
        evidence: evidence
      });

      if (data.evidence_analysis) {
        setEvidenceAnalysis(data.evidence_analysis);
      }

      if (data.diagnosis_status) {
        setDiagnosisStatus(data.diagnosis_status);
      }

      if (data.should_stop) {
        presentFinalDiagnosis(data.diagnosis_status, data.evidence_analysis);
      } else if (data.question) {
        setCurrentQuestion(data.question);
        addMessage(data.question.text, 'bot');
      }

      setStep('chat');
    } catch (error) {
      handleApiError(error);
    }
  };

  const parseSymptoms = async (text: string): Promise<Symptom[]> => {
    try {
      const response = await fetch(`${API_URL}/parse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          sex: userInfo.sex,
          age: { value: userInfo.age }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || 'Failed to parse symptoms');
      }

      const data = await response.json();
      return data.mentions || [];
    } catch (error) {
      handleApiError(error);
      return [];
    }
  };

  const handleSymptomsSubmit = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);
    addMessage(inputText, 'user');

    try {
      const symptoms = await parseSymptoms(inputText);

      if (symptoms.length > 0) {
        if (currentSession) {
          const newEvidence = symptoms.map(s => ({
            id: s.id,
            choice_id: 'present',
            source: 'initial' as const
          }));

          const updatedEvidence = [...currentSession.evidence, ...newEvidence];

          const response = await fetch(`${API_URL}/diagnosis`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sex: userInfo.sex,
              age: { value: userInfo.age },
              evidence: updatedEvidence,
              extras: { disable_groups: true }
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Failed to update diagnosis');
          }

          const data = await response.json();

          setCurrentSession(prev => ({
            ...prev!,
            evidence: updatedEvidence
          }));

          if (data.evidence_analysis) {
            setEvidenceAnalysis(data.evidence_analysis);
          }

          if (data.diagnosis_status) {
            setDiagnosisStatus(data.diagnosis_status);
          }

          if (data.should_stop) {
            presentFinalDiagnosis(data.diagnosis_status, data.evidence_analysis);
          } else if (data.question) {
            setCurrentQuestion(data.question);
            addMessage(data.question.text, 'bot');
          }
        } else {
          await createDiagnosis(symptoms);
        }
      } else {
        addMessage(
          "I couldn't detect any specific symptoms. Please try to describe:\n" +
          "• What symptoms you're experiencing\n" +
          "• When they started\n" +
          "• How severe they are\n" +
          "• Any factors that make them better or worse",
          'bot'
        );
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
      setInputText('');
    }
  };

  const handleQuestionAnswer = async (questionId: string, answerId: string) => {
    if (!currentSession?.diagnosis_id) return;

    setIsLoading(true);
    setError(null);

    try {
      const answerText = currentQuestion?.items[0].choices.find(choice => choice.id === answerId)?.label;
      addMessage(`Your answer: ${answerText}`, 'user');

      setCurrentQuestion(null);

      const newEvidence = {
        id: questionId,
        choice_id: answerId,
        source: 'suggest' as const
      };

      const updatedEvidence = [...currentSession.evidence, newEvidence];

      const response = await fetch(`${API_URL}/diagnosis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sex: userInfo.sex,
          age: { value: userInfo.age },
          evidence: updatedEvidence,
          extras: { disable_groups: true }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to process answer');
      }

      const data = await response.json();

      setCurrentSession(prev => ({
        ...prev!,
        evidence: updatedEvidence
      }));

      if (data.evidence_analysis) {
        setEvidenceAnalysis(data.evidence_analysis);
      }

      if (data.diagnosis_status && data.diagnosis_status.status === 'complete') {
        setDiagnosisStatus(data.diagnosis_status);
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      if (data.should_stop) {
        presentFinalDiagnosis(data.diagnosis_status, data.evidence_analysis);
      } else if (data.question) {
        setCurrentQuestion(data.question);
        addMessage(data.question.text, 'bot');
      }
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDisclaimer = () => (
    <div className="disclaimer-container">
      <div className="disclaimer-content bg-white rounded-xl shadow-lg overflow-hidden">
        <h2 className="text-xl font-semibold mb-4">Legal Disclaimer</h2>
        <div className="disclaimer-text bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium mb-4">
            Please read this section carefully as it contains the legal terms and conditions that you agree to when you use our Site.
          </h3>

          <h4 className="text-base font-medium mb-3">Terms & Conditions</h4>
          <ol className="list-decimal pl-5 space-y-3">
            <li>The information on this bot has been included in good faith for general informational purposes only. The Site may contain information submitted by a third party including adverts.</li>
            <li>The information should not be relied upon for any specific purpose and no representation or warranty is given as to its accuracy or completeness.</li>
            <li>
              Any opinions (express or implied) are those of the AI Bot based on the structured code by{' '}
              <a
                href="https://infermedica.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="infermedica-link text-blue-600 hover:text-blue-800"
              >
                Infermedica
              </a>
              . Symptoms are auto-generated, therefore any kind of confirmation is absent.
            </li>
            <li>
              Do not use make copies of the AI Bot. Developer source code available from official site of{' '}
              <a
                href="https://infermedica.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="infermedica-link text-blue-600 hover:text-blue-800"
              >
                Infermedica
              </a>
              .
            </li>
          </ol>

          <div className="disclaimer-checkbox mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={disclaimerAccepted}
                onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span>I have read and agree to the terms and conditions</span>
            </label>
          </div>
        </div>
        <button
          className="accept-button w-full mt-4 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={!disclaimerAccepted}
          onClick={handleDisclaimerAccept}
        >
          <CheckCircle2 size={20} />
          <span>Accept & Continue</span>
        </button>
      </div>
    </div>
  );

  const renderUserInfoStep = () => (
    <div className="step-container">
      <div className="step-header">
        <h2>Tell us about yourself</h2>
        <p>Help us provide more accurate results</p>
      </div>
      <div className="user-info-content">
        <div className="info-section">
          <h3>Biological Sex</h3>
          <div className="sex-selection">
            <label
              className={`sex-option ${userInfo.sex === 'male' ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="sex"
                value="male"
                checked={userInfo.sex === 'male'}
                onChange={(e) => setUserInfo(prev => ({
                  ...prev,
                  sex: e.target.value as 'male' | 'female'
                }))}
              />
              <div className="icon-wrapper">
                <FaMale className="icon" />
              </div>
              <span>Male</span>
            </label>
            <label
              className={`sex-option ${userInfo.sex === 'female' ? 'selected female' : ''}`}
            >
              <input
                type="radio"
                name="sex"
                value="female"
                checked={userInfo.sex === 'female'}
                onChange={(e) => setUserInfo(prev => ({
                  ...prev,
                  sex: e.target.value as 'male' | 'female'
                }))}
              />
              <div className="icon-wrapper">
                <FaFemale className="icon" />
              </div>
              <span>Female</span>
            </label>
          </div>
        </div>

        <div className="info-section">
          <h3>Your Age</h3>
          <div className="age-input">
            <input
              type="number"
              min="0"
              max="120"
              value={userInfo.age || ''}
              onChange={(e) => setUserInfo(prev => ({
                ...prev,
                age: parseInt(e.target.value) || null
              }))}
              placeholder="Enter age"
            />
            <span className="age-label">years old</span>
          </div>
        </div>

        <button
          className="next-button"
          disabled={!userInfo.sex || !userInfo.age}
          onClick={handleUserInfoSubmit}
        >
          <span>Continue</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );

  const renderDiagnosisStatus = () => {
    if (!diagnosisStatus?.message || diagnosisStatus.status !== 'complete') {
      return null;
    }

    return (
      <div className={`diagnosis-status final bg-green-50 border border-green-200 p-4 rounded-lg my-4`}>
        <p className="text-green-800">{diagnosisStatus.message}</p>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    if (message.isWarning) {
      return (
        <div className="warning-message bg-amber-50 border border-amber-200 p-4 rounded-lg my-4 flex items-start gap-3">
          <Info className="icon text-amber-500 w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-amber-700">{message.text}</p>
        </div>
      );
    }

    return (
      <div
        key={message.id}
        className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
      >
        <div className={`p-3 rounded-lg ${message.sender === 'user'
          ? 'bg-blue-500 text-white rounded-br-none ml-auto'
          : 'bg-gray-50 border border-gray-200 rounded-bl-none mr-auto'
          }`}>
          <p>{message.text}</p>
        </div>
        <span className="timestamp text-xs text-gray-500">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>
    );
  };

  const renderChat = () => (
    <div className="chat-container">
      <div className="messages">
        {messages.map(message => renderMessage(message))}
        {renderDiagnosisStatus()}
        {currentQuestion && (
          <div className="question-container bg-gray-50 p-4 rounded-lg border border-gray-200 my-4">
            <p className="mb-3 text-sm">{currentQuestion.text}</p>
            <div className="question-options flex flex-wrap gap-2">
              {currentQuestion.items[0].choices.map(choice => (
                <button
                  key={choice.id}
                  className="choice-button"
                  onClick={() => handleQuestionAnswer(currentQuestion.items[0].id, choice.id)}
                  disabled={isLoading}
                >
                  {choice.label}
                </button>
              ))}
            </div>
          </div>
        )}
        {isLoading && (
          <div className="typing-indicator">
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="input-container"
        onSubmit={(e) => {
          e.preventDefault();
          handleSymptomsSubmit();
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentQuestion
              ? "Please answer the question above first..."
              : "Describe your symptoms in detail..."
          }
          disabled={isLoading || !!currentQuestion}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-50"
        />
        <button
          type="submit"
          className="send-button flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          disabled={isLoading || !!currentQuestion || !inputText.trim()}
        >
          <Send size={18} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );

  return (
    <div className="chatbot-page">
      <Sidebar />
      <div className="chatbot-content">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Medical Symptom Checker</h1>
        {error && (
          <div className="error-banner flex items-center justify-between bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            <p className="text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        {step === 'disclaimer' && renderDisclaimer()}
        {step === 'userInfo' && renderUserInfoStep()}
        {(step === 'symptoms' || step === 'chat') && renderChat()}

      </div>
    </div>
  );
};

export default Chatbot;