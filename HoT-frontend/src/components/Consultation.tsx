import React, { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import './DocConsultation.css';
import {
    Video,
    Mic,
    MicOff,
    VideoOff,
    MessageSquare,
    Phone,
    FileText,
    Send,
    Paperclip,
    X,
    Maximize2,
    Minimize2,
    Camera,
    Monitor,
    User,
    Clock,
    Calendar,
    AlertTriangle,
    Plus,
    Download
} from 'lucide-react';

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

interface Message {
    id: string;
    sender: 'doctor' | 'patient';
    content: string;
    timestamp: string;
    type: 'text' | 'file';
    fileName?: string;
}

const Consultation: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'video' | 'chat'>('video');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);
    const [newNote, setNewNote] = useState('');
    const [noteType, setNoteType] = useState<ConsultationNote['type']>('general');
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
    const [newPrescription, setNewPrescription] = useState<Prescription>({
        id: '',
        medication: '',
        dosage: '',
        frequency: '',
        duration: '',
        notes: ''
    });

    const messageEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            const message: Message = {
                id: Date.now().toString(),
                sender: 'doctor',
                content: newMessage,
                timestamp: new Date().toISOString(),
                type: 'text'
            };
            setMessages([...messages, message]);
            setNewMessage('');
            scrollToBottom();
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const message: Message = {
                id: Date.now().toString(),
                sender: 'doctor',
                content: 'File attached',
                fileName: file.name,
                timestamp: new Date().toISOString(),
                type: 'file'
            };
            setMessages([...messages, message]);
            scrollToBottom();
        }
    };

    const handleAddNote = () => {
        if (newNote.trim()) {
            const note: ConsultationNote = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                content: newNote,
                type: noteType
            };
            setConsultationNotes([...consultationNotes, note]);
            setNewNote('');
        }
    };

    const handleAddPrescription = () => {
        if (newPrescription.medication && newPrescription.dosage) {
            setPrescriptions([...prescriptions, {
                ...newPrescription,
                id: Date.now().toString()
            }]);
            setShowPrescriptionForm(false);
            setNewPrescription({
                id: '',
                medication: '',
                dosage: '',
                frequency: '',
                duration: '',
                notes: ''
            });
        }
    };

    return (
        <div className="doc-consultation-page">
            <Sidebar/>
            <div className="consultation-content">
                <div className="consultation-header">
                    <div className="patient-info">
                        <User size={24} />
                        <div>
                            <h2>John Doe</h2>
                            <span>Patient ID: P001 • Age: 45 • Male</span>
                        </div>
                    </div>
                    <div className="consultation-status">
                        <Clock size={16} />
                        <span>Duration: 00:15:30</span>
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="consultation-main">
                    <div className="consultation-left">
                        <div className="video-controls">
                            <button
                                className={`control-button ${!videoEnabled ? 'disabled' : ''}`}
                                onClick={() => setVideoEnabled(!videoEnabled)}
                            >
                                {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                            </button>
                            <button
                                className={`control-button ${!audioEnabled ? 'disabled' : ''}`}
                                onClick={() => setAudioEnabled(!audioEnabled)}
                            >
                                {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                            </button>
                            <button className="control-button end-call">
                                <Phone size={20} />
                            </button>
                            <button
                                className="control-button"
                                onClick={() => setIsFullScreen(!isFullScreen)}
                            >
                                {isFullScreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                            </button>
                        </div>

                        <div className={`video-container ${isFullScreen ? 'fullscreen' : ''}`}>
                            <div className="remote-video">
                                {!videoEnabled && (
                                    <div className="video-placeholder">
                                        <Camera size={48} />
                                        <p>Video is disabled</p>
                                    </div>
                                )}
                            </div>
                            <div className="local-video">
                                {!videoEnabled && (
                                    <div className="video-placeholder">
                                        <User size={24} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="consultation-tabs">
                            <button
                                className={`tab-button ${activeTab === 'video' ? 'active' : ''}`}
                                onClick={() => setActiveTab('video')}
                            >
                                <Monitor size={20} />
                                Video Call
                            </button>
                            <button
                                className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
                                onClick={() => setActiveTab('chat')}
                            >
                                <MessageSquare size={20} />
                                Chat
                            </button>
                        </div>

                        {activeTab === 'chat' && (
                            <div className="chat-container">
                                <div className="messages">
                                    {messages.map((message) => (
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
                                <div className="message-input">
                                    <button
                                        className="attach-button"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Type your message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    />
                                    <button
                                        className="send-button"
                                        onClick={handleSendMessage}
                                    >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        )}
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
                                <button onClick={handleAddNote}>Add Note</button>
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
                                    <input
                                        type="text"
                                        placeholder="Medication"
                                        value={newPrescription.medication}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            medication: e.target.value
                                        })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Dosage"
                                        value={newPrescription.dosage}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            dosage: e.target.value
                                        })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Frequency"
                                        value={newPrescription.frequency}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            frequency: e.target.value
                                        })}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Duration"
                                        value={newPrescription.duration}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            duration: e.target.value
                                        })}
                                    />
                                    <textarea
                                        placeholder="Additional notes..."
                                        value={newPrescription.notes}
                                        onChange={(e) => setNewPrescription({
                                            ...newPrescription,
                                            notes: e.target.value
                                        })}
                                    />
                                    <div className="form-buttons">
                                        <button onClick={handleAddPrescription}>Add</button>
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

export default Consultation;