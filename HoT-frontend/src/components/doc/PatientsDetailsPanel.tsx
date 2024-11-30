// File: src/components/doc/PatientDetailsPanel.tsx
import React from 'react';
import {
    User,
    Heart,
    Activity,
    Thermometer,
    Droplet,
    XCircle,
    Calendar,
    MapPin,
    Phone,
    Mail,
    AlertTriangle,
    Hospital,
    Badge
} from 'lucide-react';
import { VitalSigns, Patient } from '../../types/patient';
import './PatientDetailPanel.css';

interface PatientDetailsPanelProps {
    patient: Patient | null;
    onClose: () => void;
}

const PatientDetailsPanel: React.FC<PatientDetailsPanelProps> = ({ patient, onClose }) => {
    if (!patient) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'critical':
                return 'critical';
            case 'urgent':
                return 'urgent';
            case 'stable':
                return 'stable';
            default:
                return 'normal';
        }
    };

    return (
        <div className="patient-details-panel">
            <div className="panel-header">
                <div className="header-content">
                    <User size={20} />
                    <h2>{patient.name}</h2>
                    <span className={`status-badge ${getStatusColor(patient.status)}`}>
                        {patient.status}
                    </span>
                </div>
                <button className="close-button" onClick={onClose}>
                    <XCircle size={20} />
                </button>
            </div>
            <div className="panel-content">
                <section className="details-section">
                    <h3>Patient Information</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <Badge size={16} />
                            <div>
                                <span className="info-label">Patient ID</span>
                                <div>{patient.patient_id}</div>
                            </div>
                        </div>
                        <div className="info-item">
                            <User size={16} />
                            <div>
                                <span className="info-label">Age & Gender</span>
                                <div>{patient.age} years, {patient.gender}</div>
                            </div>
                        </div>
                        {patient.contact && (
                            <div className="info-item">
                                <Phone size={16} />
                                <div>
                                    <span className="info-label">Contact</span>
                                    <div>{patient.contact.phone}</div>
                                </div>
                            </div>
                        )}
                        <div className="info-item">
                            <MapPin size={16} />
                            <div>
                                <span className="info-label">Location</span>
                                <div>{patient.location}</div>
                            </div>
                        </div>
                        <div className="info-item">
                            <Hospital size={16} />
                            <div>
                                <span className="info-label">Monitoring Type</span>
                                <div>{patient.monitoring_type}</div>
                            </div>
                        </div>
                    </div>
                </section>

                {patient.vital_signs && (
                    <section className="details-section">
                        <h3>Current Vitals</h3>
                        <div className="vitals-grid">
                            <div className="vital-box">
                                <Heart size={20} />
                                <div className="vital-info">
                                    <span className="vital-label">Heart Rate</span>
                                    <span className="vital-value">
                                        {patient.vital_signs.heartbeat} bpm
                                    </span>
                                </div>
                            </div>
                            <div className="vital-box">
                                <Activity size={20} />
                                <div className="vital-info">
                                    <span className="vital-label">Blood Pressure</span>
                                    <span className="vital-value">
                                        {patient.vital_signs.blood_pressure_systolic}/
                                        {patient.vital_signs.blood_pressure_diastolic}
                                    </span>
                                </div>
                            </div>
                            <div className="vital-box">
                                <Thermometer size={20} />
                                <div className="vital-info">
                                    <span className="vital-label">Temperature</span>
                                    <span className="vital-value">
                                        {patient.vital_signs.temperature.toFixed(1)}°C
                                    </span>
                                </div>
                            </div>
                            <div className="vital-box">
                                <Droplet size={20} />
                                <div className="vital-info">
                                    <span className="vital-label">SpO2</span>
                                    <span className="vital-value">
                                        {patient.vital_signs.oxygen_saturation}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {patient.medical_history && patient.medical_history.length > 0 && (
                    <section className="details-section">
                        <h3>Medical History</h3>
                        <div className="medical-history-list">
                            {patient.medical_history.map((history, index) => (
                                <div key={index} className="history-item">
                                    <span className="condition">{history.condition}</span>
                                    <span className="year">{history.year}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {patient.emergency_contacts && patient.emergency_contacts.length > 0 && (
                    <section className="details-section">
                        <h3>Emergency Contacts</h3>
                        <div className="emergency-contacts-list">
                            {patient.emergency_contacts.map((contact, index) => (
                                <div key={index} className="contact-item">
                                    <span className="name">{contact.name}</span>
                                    <span className="phone">{contact.phone}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};

export default PatientDetailsPanel;