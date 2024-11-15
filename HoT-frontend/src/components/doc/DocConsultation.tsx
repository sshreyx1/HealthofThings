import React, { useState, useRef, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import './DocConsultation.css';
import {
    Video, Mic, MicOff, VideoOff, MessageSquare, Phone,
    FileText, Send, Paperclip, X, Camera, Calendar,
    AlertTriangle, Plus, Download, Search, Bell
} from 'lucide-react';

// Constants remain the same
const MEDICATIONS = [
    { name: "Amoxicillin", dosages: ["250mg", "500mg", "875mg"] },
    { name: "Omeprazole", dosages: ["20mg", "40mg"] },
    { name: "Metformin", dosages: ["500mg", "850mg", "1000mg"] },
    { name: "Amlodipine", dosages: ["2.5mg", "5mg", "10mg"] },
    { name: "Metoprolol", dosages: ["25mg", "50mg", "100mg"] },
    { name: "Lisinopril", dosages: ["5mg", "10mg", "20mg"] },
    { name: "Atorvastatin", dosages: ["10mg", "20mg", "40mg", "80mg"] }
];

const FREQUENCIES = [
    "Once daily",
    "Twice daily",
    "Three times daily",
    "Four times daily",
    "Every 4 hours",
    "Every 6 hours",
    "Every 8 hours",
    "Every 12 hours",
    "As needed"
];

const DURATIONS = [
    "3 days",
    "5 days",
    "7 days",
    "10 days",
    "14 days",
    "21 days",
    "28 days",
    "30 days",
    "60 days",
    "90 days",
    "Ongoing"
];

// Interfaces remain the same
interface CallState {
    status: 'inactive' | 'calling' | 'connected';
    startTime?: Date;
}

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    condition: string;
    status: 'Online' | 'Offline' | 'In Consultation';
    nextConsultation?: string;
    unreadMessages: number;
}

interface Message {
    id: string;
    sender: 'doctor' | 'patient';
    content: string;
    timestamp: string;
    type: 'text' | 'file';
    fileName?: string;
}

interface ConsultationNote {
    id: string;
    timestamp: string;
    content: string;
    type: 'symptom' | 'diagnosis' | 'prescription' | 'general';
}

interface Prescription {
    id: string;
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes: string;
}

const mockPatients: Patient[] = [
    {
        id: "P001",
        name: "John Doe",
        age: 45,
        gender: "Male",
        condition: "Post-Cardiac Surgery",
        status: "Online",
        nextConsultation: "2024-11-15T14:30:00",
        unreadMessages: 3
    },
    {
        id: "P002",
        name: "Jane Smith",
        age: 35,
        gender: "Female",
        condition: "Diabetes Monitoring",
        status: "In Consultation",
        nextConsultation: "2024-11-15T15:00:00",
        unreadMessages: 0
    },
    {
        id: "P003",
        name: "Robert Johnson",
        age: 52,
        gender: "Male",
        condition: "Hypertension",
        status: "Offline",
        nextConsultation: "2024-11-15T16:30:00",
        unreadMessages: 5
    }
];

const DocConsultation: React.FC = () => {
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
    const [newMessage, setNewMessage] = useState('');
    const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<ConsultationNote['type']>('general');
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callState, setCallState] = useState<CallState>({ status: 'inactive' });
    const [availableDosages, setAvailableDosages] = useState<string[]>(MEDICATIONS[0].dosages);
    const [newPrescription, setNewPrescription] = useState<Prescription>({
        id: '',
        medication: MEDICATIONS[0].name,
        dosage: MEDICATIONS[0].dosages[0],
        frequency: FREQUENCIES[0],
        duration: DURATIONS[0],
        notes: ''
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (videoEnabled && callState.status === 'connected' && selectedPatient) {
            navigator.mediaDevices.getUserMedia({ video: true, audio: audioEnabled })
                .then(stream => {
                    setStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => console.error('Error accessing camera:', err));
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [videoEnabled, audioEnabled, callState.status, selectedPatient]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleMedicationChange = (medicationName: string) => {
        const medication = MEDICATIONS.find(med => med.name === medicationName);
        setAvailableDosages(medication?.dosages || []);
        setNewPrescription({
            ...newPrescription,
            medication: medicationName,
            dosage: medication?.dosages[0] || ''
        });
    };

    const startCall = () => {
        setCallState({ status: 'calling' });
        setVideoEnabled(true);
        setAudioEnabled(true);
    };

    const endCall = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        setStream(null);
        setCallState({ status: 'inactive' });
        setVideoEnabled(true);
        setAudioEnabled(true);
    };

    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoEnabled;
                setVideoEnabled(!videoEnabled);
            }
        }
    };

    const toggleAudio = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioEnabled;
                setAudioEnabled(!audioEnabled);
            }
        }
    };

    const filteredPatients = mockPatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUpcomingConsultations = () => {
        const now = new Date();
        return mockPatients
            .filter(p => p.nextConsultation && new Date(p.nextConsultation) > now)
            .sort((a, b) => new Date(a.nextConsultation!).getTime() - new Date(b.nextConsultation!).getTime());
    };

    const upcomingConsultations = getUpcomingConsultations();

    if (!selectedPatient) {
        return (
            <div className="docconsultation-page">
                <DocSidebar />
                <div className="docconsultation-content">
                    <div className="docconsultation-header">
                        <div className="header-top">
                            <h1>Consultations</h1>
                        </div>
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search patients by name or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {upcomingConsultations.length > 0 && (
                            <div className="consultation-reminder-banner">
                                <div className="reminder-content">
                                    <Bell size={20} />
                                    <div>
                                        <strong>Upcoming Consultations:</strong>
                                        {upcomingConsultations.map((consultation, index) => (
                                            <div key={consultation.id}>
                                                {consultation.name} - {new Date(consultation.nextConsultation!).toLocaleTimeString()}
                                                {index < upcomingConsultations.length - 1 && ', '}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="patients-grid">
                        {filteredPatients.map(patient => (
                            <div
                                key={patient.id}
                                className={`patient-card ${patient.status.toLowerCase()}`}
                                onClick={() => setSelectedPatient(patient)}
                            >
                                <div className="patient-info">
                                    <div>
                                        <h3>{patient.name}</h3>
                                        <span className={`status-indicator ${patient.status.toLowerCase()}`}>
                                            {patient.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="patient-details">
                                    <p>ID: {patient.id}</p>
                                    <p>Age: {patient.age} • {patient.gender}</p>
                                    <p>Condition: {patient.condition}</p>
                                    <p>Next consultation: {new Date(patient.nextConsultation!).toLocaleString()}</p>
                                </div>
                                {patient.unreadMessages > 0 && (
                                    <div className="unread-badge">
                                        {patient.unreadMessages} new messages
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="docconsultation-page">
            <DocSidebar />
            <div className="docconsultation-content">
                <div className="consultation-header">
                    <div className="patient-info">
                        <button className="back-button" onClick={() => {
                            endCall();
                            setSelectedPatient(null);
                        }}>
                            <X size={24} />
                        </button>
                        <div>
                            <h2>{selectedPatient.name}</h2>
                            <span>ID: {selectedPatient.id} • Age: {selectedPatient.age} • {selectedPatient.gender}</span>
                        </div>
                    </div>
                    <div className="consultation-date">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="consultation-main">
                    <div className="consultation-left">
                        <div className="call-section">
                            {callState.status === 'inactive' ? (
                                <button className="start-call-button" onClick={startCall}>
                                    <Video size={20} />
                                    Start Video Consultation
                                </button>
                            ) : (
                                <div className="video-container">
                                    <button className="close-call-button" onClick={endCall}>
                                        <X size={20} />
                                    </button>
                                    {callState.status === 'calling' ? (
                                        <div className="call-status">
                                            Calling {selectedPatient.name}...
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="main-video-stream"
                                            />
                                            <div className="call-controls">
                                                <button
                                                    className={`control-button ${!videoEnabled ? 'disabled' : ''}`}
                                                    onClick={toggleVideo}
                                                >
                                                    {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                                </button>
                                                <button
                                                    className={`control-button ${!audioEnabled ? 'disabled' : ''}`}
                                                    onClick={toggleAudio}
                                                >
                                                    {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                                </button>
                                                <button className="control-button end-call" onClick={endCall}>
                                                    <Phone size={20} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="chat-section">
                            <div className="messages">
                                {(messages[selectedPatient.id] || []).map((message) => (
                                    <div
                                        key={message.id}
                                        className={`message ${message.sender === 'doctor' ? 'sent' : 'received'}`}
                                    >
                                        {message.type === 'file' ? (
                                            <div className="file-message">
                                                <FileText size={16} />
                                                <span>{message.fileName}</span>
                                                <button className="download-button">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <p>{message.content}</p>
                                        )}
                                        <span className="message-time">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messageEndRef} />
                            </div>
                            <div className="message-input-container">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const newMessage: Message = {
                                                id: Date.now().toString(),
                                                sender: 'doctor',
                                                content: 'File attached',
                                                fileName: file.name,
                                                timestamp: new Date().toISOString(),
                                                type: 'file'
                                            };
                                            setMessages(prev => ({
                                                ...prev,
                                                [selectedPatient.id]: [...(prev[selectedPatient.id] || []), newMessage]
                                            }));
                                            scrollToBottom();
                                        }
                                    }}
                                />
                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newMessage.trim()) {
                                            const message: Message = {
                                                id: Date.now().toString(),
                                                sender: 'doctor',
                                                content: newMessage,
                                                timestamp: new Date().toISOString(),
                                                type: 'text'
                                            };
                                            setMessages(prev => ({
                                                ...prev,
                                                [selectedPatient.id]: [...(prev[selectedPatient.id] || []), message]
                                            }));
                                            setNewMessage('');
                                            scrollToBottom();
                                        }
                                    }}
                                />
                                <div className="message-buttons">
                                    <button
                                        className="attach-button"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <button
                                        className="send-button"
                                        onClick={() => {
                                            if (newMessage.trim()) {
                                                const message: Message = {
                                                    id: Date.now().toString(),
                                                    sender: 'doctor',
                                                    content: newMessage,
                                                    timestamp: new Date().toISOString(),
                                                    type: 'text'
                                                };
                                                setMessages(prev => ({
                                                    ...prev,
                                                    [selectedPatient.id]: [...(prev[selectedPatient.id] || []), message]
                                                }));
                                                setNewMessage('');
                                                scrollToBottom();
                                            }
                                        }}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="consultation-right">
                        <div className="consultation-notes">
                            <div className="section-header">
                                <h3>Consultation Notes</h3>
                                <div className="note-type-selector">
                                    <select
                                        value={noteType}
                                        onChange={(e) => setNoteType(e.target.value as ConsultationNote['type'])}
                                    >
                                        <option value="general">General</option>
                                        <option value="symptom">Symptoms</option>
                                        <option value="diagnosis">Diagnosis</option>
                                        <option value="prescription">Prescription</option>
                                    </select>
                                </div>
                            </div>
                            <div className="notes-container">
                                {consultationNotes.map((note) => (
                                    <div key={note.id} className={`note-item ${note.type}`}>
                                        <div className="note-header">
                                            <span className="note-type">{note.type}</span>
                                            <span className="note-time">
                                                {new Date(note.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p>{note.content}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="note-input">
                                <textarea
                                    placeholder="Add consultation notes..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                />
                                <button onClick={() => {
                                    if (newNote.trim()) {
                                        setConsultationNotes([...consultationNotes, {
                                            id: Date.now().toString(),
                                            timestamp: new Date().toISOString(),
                                            content: newNote,
                                            type: noteType
                                        }]);
                                        setNewNote('');
                                    }
                                }}>Add Note</button>
                            </div>
                        </div>

                        <div className="prescriptions-section">
                            <div className="section-header">
                                <h3>Prescriptions</h3>
                                <button
                                    className="add-prescription-button"
                                    onClick={() => setShowPrescriptionForm(true)}
                                >
                                    <Plus size={16} />
                                    New Prescription
                                </button>
                            </div>
                            {showPrescriptionForm && (
                                <div className="prescription-form">
                                    <select
                                        value={newPrescription.medication}
                                        onChange={(e) => handleMedicationChange(e.target.value)}
                                        className="prescription-select"
                                    >
                                        {MEDICATIONS.map(med => (
                                            <option key={med.name} value={med.name}>{med.name}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={newPrescription.dosage}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            dosage: e.target.value
                                        })}
                                        className="prescription-select"
                                    >
                                        {availableDosages.map(dosage => (
                                            <option key={dosage} value={dosage}>{dosage}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={newPrescription.frequency}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            frequency: e.target.value
                                        })}
                                        className="prescription-select"
                                    >
                                        {FREQUENCIES.map(freq => (
                                            <option key={freq} value={freq}>{freq}</option>
                                        ))}
                                    </select>

                                    <select
                                        value={newPrescription.duration}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            duration: e.target.value
                                        })}
                                        className="prescription-select"
                                    >
                                        {DURATIONS.map(duration => (
                                            <option key={duration} value={duration}>{duration}</option>
                                        ))}
                                    </select>

                                    <textarea
                                        placeholder="Additional notes (optional)..."
                                        value={newPrescription.notes}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            notes: e.target.value
                                        })}
                                        className="prescription-textarea"
                                    />
                                    <div className="form-buttons">
                                        <button onClick={() => {
                                            const prescription: Prescription = {
                                                ...newPrescription,
                                                id: Date.now().toString()
                                            };
                                            setPrescriptions([...prescriptions, prescription]);
                                            setShowPrescriptionForm(false);
                                            setNewPrescription({
                                                id: '',
                                                medication: MEDICATIONS[0].name,
                                                dosage: MEDICATIONS[0].dosages[0],
                                                frequency: FREQUENCIES[0],
                                                duration: DURATIONS[0],
                                                notes: ''
                                            });
                                        }}>Add</button>
                                        <button onClick={() => setShowPrescriptionForm(false)}>Cancel</button>
                                    </div>
                                </div>
                            )}
                            <div className="prescriptions-list">
                                {prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="prescription-item">
                                        <h4>{prescription.medication}</h4>
                                        <div className="prescription-details">
                                            <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                            <p><strong>Frequency:</strong> {prescription.frequency}</p>
                                            <p><strong>Duration:</strong> {prescription.duration}</p>
                                            {prescription.notes && (
                                                <p className="prescription-notes">{prescription.notes}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocConsultation;