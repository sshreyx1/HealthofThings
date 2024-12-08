import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Consultation.css'
import {
    Video, Mic, MicOff, VideoOff, MessageSquare, Phone,
    FileText, Send, Paperclip, X, Camera, Calendar,
    Bell, Search, Download
} from 'lucide-react';

interface Doctor {
    id: string;
    name: string;
    specialization: string;
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

interface CallState {
    status: 'inactive' | 'calling' | 'connected';
    startTime?: Date;
}

const mockDoctors: Doctor[] = [
    {
        id: "D001",
        name: "Dr. Sarah Wilson",
        specialization: "Cardiologist",
        status: "Online",
        nextConsultation: "2024-11-15T14:30:00",
        unreadMessages: 2
    },
    {
        id: "D002",
        name: "Dr. Michael Chen",
        specialization: "Endocrinologist",
        status: "In Consultation",
        nextConsultation: "2024-11-15T16:00:00",
        unreadMessages: 0
    },
    {
        id: "D003",
        name: "Dr. Emily Brooks",
        specialization: "General Physician",
        status: "Offline",
        nextConsultation: "2024-11-15T15:30:00",
        unreadMessages: 3
    }
];

const PatientConsultation: React.FC = () => {
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [messages, setMessages] = useState<{ [key: string]: Message[] }>({});
    const [newMessage, setNewMessage] = useState('');
    const [consultationNotes, setConsultationNotes] = useState<ConsultationNote[]>([]);
    const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [callState, setCallState] = useState<CallState>({ status: 'inactive' });

    const videoRef = useRef<HTMLVideoElement>(null);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (videoEnabled && callState.status === 'connected' && selectedDoctor) {
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
    }, [videoEnabled, audioEnabled, callState.status, selectedDoctor]);

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    const filteredDoctors = mockDoctors.filter(doctor =>
        doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getUpcomingConsultations = () => {
        const now = new Date();
        return mockDoctors
            .filter(d => d.nextConsultation && new Date(d.nextConsultation) > now)
            .sort((a, b) => new Date(a.nextConsultation!).getTime() - new Date(b.nextConsultation!).getTime());
    };

    const upcomingConsultations = getUpcomingConsultations();

    if (!selectedDoctor) {
        return (
            <div className="patient-consult-page">
                <Sidebar />
                <div className="patient-consult-content">
                    <div className="patient-consult-header">
                        <h1>My Doctors</h1>
                        <div className="patient-consult-search">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search doctors by name, ID, or specialization..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {upcomingConsultations.length > 0 && (
                            <div className="patient-consult-reminder">
                                <div className="patient-consult-reminder-content">
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

                    <div className="patient-consult-doctors-grid">
                        {filteredDoctors.map(doctor => (
                            <div
                                key={doctor.id}
                                className="patient-consult-doctor-card"
                                onClick={() => setSelectedDoctor(doctor)}
                            >
                                <div className="patient-consult-doctor-info">
                                    <div>
                                        <h3>{doctor.name}</h3>
                                        <span className={`patient-consult-status ${doctor.status.toLowerCase()}`}>
                                            {doctor.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="patient-consult-doctor-details">
                                    <p>ID: {doctor.id}</p>
                                    <p>Specialization: {doctor.specialization}</p>
                                    <p>Next consultation: {new Date(doctor.nextConsultation!).toLocaleString()}</p>
                                </div>
                                {doctor.unreadMessages > 0 && (
                                    <div className="patient-consult-unread">
                                        {doctor.unreadMessages} new messages
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
        <div className="patient-consult-page">
            <Sidebar />
            <div className="patient-consult-content">
                <div className="patient-consult-header1">
                    <div className="patient-consult-doctor-header1">
                        <button
                            className="patient-consult-back"
                            onClick={() => {
                                endCall();
                                setSelectedDoctor(null);
                            }}
                        >
                            <X size={24} />
                        </button>
                        <div className="patient-consult-doctor-info">
                            <div>
                                <h2>{selectedDoctor.name}</h2>
                                <span>ID: {selectedDoctor.id} • {selectedDoctor.specialization}</span>
                            </div>
                        </div>
                    </div>
                    <div className="patient-consult-date">
                        <Calendar size={16} />
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="patient-consult-main">
                    <div className="patient-consult-left">
                        <div className="patient-consult-call">
                            {callState.status === 'inactive' ? (
                                <button className="patient-consult-call-button" onClick={startCall}>
                                    <Video size={20} />
                                    Start Video Consultation
                                </button>
                            ) : (
                                <div className="patient-consult-video">
                                    <button className="patient-consult-video-close" onClick={endCall}>
                                        <X size={20} />
                                    </button>
                                    {callState.status === 'calling' ? (
                                        <div className="patient-consult-call-status">
                                            Calling {selectedDoctor.name}...
                                        </div>
                                    ) : (
                                        <>
                                            <video
                                                ref={videoRef}
                                                autoPlay
                                                playsInline
                                                muted
                                                className="patient-consult-video-stream"
                                            />
                                            <div className="patient-consult-controls">
                                                <button
                                                    className={`patient-consult-control-btn ${!videoEnabled ? 'disabled' : ''}`}
                                                    onClick={toggleVideo}
                                                >
                                                    {videoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                                                </button>
                                                <button
                                                    className={`patient-consult-control-btn ${!audioEnabled ? 'disabled' : ''}`}
                                                    onClick={toggleAudio}
                                                >
                                                    {audioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                                                </button>
                                                <button
                                                    className="patient-consult-control-btn end-call"
                                                    onClick={endCall}
                                                >
                                                    <Phone size={20} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="patient-consult-chat">
                            <div className="patient-consult-messages">
                                {(messages[selectedDoctor.id] || []).map((message) => (
                                    <div
                                        key={message.id}
                                        className={`patient-consult-message ${message.sender === 'patient' ? 'sent' : 'received'}`}
                                    >
                                        {message.type === 'file' ? (
                                            <div className="patient-consult-file-message">
                                                <FileText size={16} />
                                                <span>{message.fileName}</span>
                                                <button className="patient-consult-download">
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <p>{message.content}</p>
                                        )}
                                        <span className="patient-consult-message-time">
                                            {new Date(message.timestamp).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messageEndRef} />
                            </div>
                            <div className="patient-consult-input-container">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const newMessage: Message = {
                                                id: Date.now().toString(),
                                                sender: 'patient',
                                                content: 'File attached',
                                                fileName: file.name,
                                                timestamp: new Date().toISOString(),
                                                type: 'file'
                                            };
                                            setMessages(prev => ({
                                                ...prev,
                                                [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), newMessage]
                                            }));
                                            scrollToBottom();
                                        }
                                    }}
                                />
                                <input
                                    type="text"
                                    className="patient-consult-input"
                                    placeholder="Type your message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && newMessage.trim()) {
                                            const message: Message = {
                                                id: Date.now().toString(),
                                                sender: 'patient',
                                                content: newMessage,
                                                timestamp: new Date().toISOString(),
                                                type: 'text'
                                            };
                                            setMessages(prev => ({
                                                ...prev,
                                                [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), message]
                                            }));
                                            setNewMessage('');
                                            scrollToBottom();
                                        }
                                    }}
                                />
                                <div className="patient-consult-msg-buttons">
                                    <button
                                        className="patient-consult-attach"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Paperclip size={20} />
                                    </button>
                                    <button
                                        className="patient-consult-send"
                                        onClick={() => {
                                            if (newMessage.trim()) {
                                                const message: Message = {
                                                    id: Date.now().toString(),
                                                    sender: 'patient',
                                                    content: newMessage,
                                                    timestamp: new Date().toISOString(),
                                                    type: 'text'
                                                };
                                                setMessages(prev => ({
                                                    ...prev,
                                                    [selectedDoctor.id]: [...(prev[selectedDoctor.id] || []), message]
                                                }));
                                                setNewMessage('');
                                                scrollToBottom();
                                            }
                                        }} >
                                        <Send size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="patient-consult-right">
                        <div className="patient-consult-notes">
                            <div className="patient-consult-section-header">
                                <h3>Doctor's Notes</h3>
                            </div>
                            <div className="patient-consult-messages">
                                {consultationNotes.map((note) => (
                                    <div key={note.id} className={`patient-consult-note-item ${note.type}`}>
                                        <div className="patient-consult-note-header">
                                            <span className="patient-consult-note-type">{note.type}</span>
                                            <span className="patient-consult-message-time">
                                                {new Date(note.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <p>{note.content}</p>
                                    </div>
                                ))}
                                {consultationNotes.length === 0 && (
                                    <div className="patient-consult-no-content">
                                        No consultation notes available yet.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="patient-consult-prescriptions">
                            <div className="patient-consult-section-header">
                                <h3>Prescriptions</h3>
                            </div>
                            <div className="patient-consult-messages">
                                {prescriptions.map((prescription) => (
                                    <div key={prescription.id} className="patient-consult-prescription-item">
                                        <h4>{prescription.medication}</h4>
                                        <div className="patient-consult-prescription-details">
                                            <p><strong>Dosage:</strong> {prescription.dosage}</p>
                                            <p><strong>Frequency:</strong> {prescription.frequency}</p>
                                            <p><strong>Duration:</strong> {prescription.duration}</p>
                                            {prescription.notes && (
                                                <p className="patient-consult-prescription-notes">
                                                    {prescription.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {prescriptions.length === 0 && (
                                    <div className="patient-consult-no-content">
                                        No prescriptions available yet.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientConsultation;