import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import { VitalsService } from '../../services/vitalsService';
import {
    AlertTriangle, Heart, Activity, Thermometer, Search, Hospital,
    Building2, Bed, Ambulance, User, XCircle, Calendar, Clock,
    Phone, Mail, MapPin, Badge, Users, Home, Droplets, Wind } from 'lucide-react';
import './DocPatients.css';


interface VitalSigns {
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    oxygen_saturation: number;
    blood_glucose: number;
    respiration_rate: number;
}

interface Patient {
    patient_id: string;
    name: string;
    age: number;
    gender: string;
    location: string;
    monitoring_type: string;
    status: string;
    contact: {
        phone: string;
    };
    medical_history: Array<{
        condition: string;
        year: number;
    }>;
    emergency_contacts: Array<{
        name: string;
        phone: string;
    }>;
    vital_signs?: VitalSigns;
}

const DocPatients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

    useEffect(() => {
        fetchPatientsAndSubscribe();
        return () => {
            // Cleanup will be handled by VitalsService
        };
    }, []);

    const fetchPatientsAndSubscribe = async () => {
        try {
            const data = await VitalsService.getAllPatients();
            setPatients(data);
            setError(null);

            VitalsService.subscribeToVitalsUpdates((patientId, vitals) => {
                setPatients(prev => prev.map(patient => 
                    patient.patient_id === patientId
                        ? { ...patient, vital_signs: vitals }
                        : patient
                ));
            });
        } catch (err) {
            setError('Failed to fetch patients');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredPatients = patients.filter(patient => {
        const matchesSearch = 
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesLocation = 
            selectedLocation === 'all' || 
            patient.location === selectedLocation;

        const matchesStatus =
            selectedStatus === 'all' ||
            patient.status === selectedStatus;

        return matchesSearch && matchesLocation && matchesStatus;
    });

    const groupedPatients = {
        ICU: filteredPatients.filter(p => p.monitoring_type === 'icu'),
        Emergency: filteredPatients.filter(p => p.monitoring_type === 'emergency'),
        General: filteredPatients.filter(p => p.monitoring_type === 'hospital'),
        Remote: filteredPatients.filter(p => p.monitoring_type === 'remote')
    };

    const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
        <div 
            className={`patient-card ${patient.status.toLowerCase()} ${selectedPatient?.patient_id === patient.patient_id ? 'selected' : ''}`}
            onClick={() => setSelectedPatient(patient)}
        >
            <div className="patient-info">
                <h4>{patient.name}</h4>
                <p>{patient.medical_history?.[0]?.condition || patient.monitoring_type}</p>
            </div>
            {patient.vital_signs && (
                <div className="vital-signs">
                    <div className="vital-item">
                        <Heart size={16} />
                        <span>{patient.vital_signs.heartbeat} bpm</span>
                    </div>
                    <div className="vital-item">
                        <Activity size={16} />
                        <span>
                            {patient.vital_signs.blood_pressure_systolic}/
                            {patient.vital_signs.blood_pressure_diastolic}
                        </span>
                    </div>
                    <div className="vital-item">
                        <Thermometer size={16} />
                        <span>{patient.vital_signs.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="vital-item">
                        <Droplets size={16} />
                        <span>{patient.vital_signs.oxygen_saturation}%</span>
                    </div>
                    <div className="vital-item">
                        <Activity size={16} />
                        <span>{patient.vital_signs.blood_glucose} mg/dL</span>
                    </div>
                    <div className="vital-item">
                        <Wind size={16} />
                        <span>{patient.vital_signs.respiration_rate}/min</span>
                    </div>
                </div>
            )}
        </div>
    );

    const RemotePatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
        <div
            className={`remote-patient-card ${patient.status.toLowerCase()} ${selectedPatient?.patient_id === patient.patient_id ? 'selected' : ''}`}
            onClick={() => setSelectedPatient(patient)}
        >
            <div className="patient-header">
                <User size={20} />
                <h4>{patient.name}</h4>
                <span className={`status-badge ${patient.status.toLowerCase()}`}>
                    {patient.status}
                </span>
            </div>
            <div className="patient-details">
                <p className="condition">{patient.medical_history?.[0]?.condition || patient.monitoring_type}</p>
                {patient.vital_signs && (
                    <div className="remote-vitals">
                        <div className="vital-item">
                            <Heart size={16} />
                            <span>{patient.vital_signs.heartbeat} bpm</span>
                        </div>
                        <div className="vital-item">
                            <Activity size={16} />
                            <span>
                                {patient.vital_signs.blood_pressure_systolic}/
                                {patient.vital_signs.blood_pressure_diastolic}
                            </span>
                        </div>
                        <div className="vital-item">
                            <Thermometer size={16} />
                            <span>{patient.vital_signs.temperature.toFixed(1)}°C</span>
                        </div>
                        <div className="vital-item">
                            <Droplets size={16} />
                            <span>{patient.vital_signs.oxygen_saturation}%</span>
                        </div>
                        <div className="vital-item">
                            <Activity size={16} />
                            <span>{patient.vital_signs.blood_glucose} mg/dL</span>
                        </div>
                        <div className="vital-item">
                            <Wind size={16} />
                            <span>{patient.vital_signs.respiration_rate}/min</span>
                        </div>
                    </div>
                )}
                <div className="last-checkin">
                    <Clock size={14} />
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="doc-patients-page">
                <DocSidebar />
                <div className="doc-patients-content">
                    <div className="loading">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="doc-patients-page">
            <DocSidebar />
            <div className={`doc-patients-content ${selectedPatient ? 'with-details' : ''}`}>
                <div className="header-top">
                    <h1>Patient Management</h1>
                </div>

                <div className="header-controls">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filters">
                        <div className="filter-group">
                            <Hospital size={20} />
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                            >
                                <option value="all">All Locations</option>
                                <option value="ICU">ICU</option>
                                <option value="Emergency">Emergency</option>
                                <option value="General">General Ward</option>
                                <option value="Remote">Remote</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <AlertTriangle size={20} />
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="Critical">Critical</option>
                                <option value="Urgent">Urgent</option>
                                <option value="Stable">Stable</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="patient-overview">
                    <div className="hospital-section">
                        <div className="section-header">
                            <Building2 size={24} />
                            <h2>Hospital Patients</h2>
                        </div>
                        <div className="ward-grid">
                            {/* ICU Section */}
                            <div className="ward-card icu">
                                <div className="ward-header">
                                    <div className="ward-icon">
                                        <AlertTriangle size={24} />
                                    </div>
                                    <div className="ward-info">
                                        <h3>ICU</h3>
                                        <span className="patient-count">
                                            {groupedPatients.ICU.length} patients
                                        </span>
                                    </div>
                                </div>
                                <div className="ward-patients">
                                    {groupedPatients.ICU.map(patient => (
                                        <PatientCard key={patient.patient_id} patient={patient} />
                                    ))}
                                </div>
                            </div>

                            {/* Emergency Section */}
                            <div className="ward-card emergency">
                                <div className="ward-header">
                                    <div className="ward-icon">
                                        <Ambulance size={24} />
                                    </div>
                                    <div className="ward-info">
                                        <h3>Emergency</h3>
                                        <span className="patient-count">
                                            {groupedPatients.Emergency.length} patients
                                        </span>
                                    </div>
                                </div>
                                <div className="ward-patients">
                                    {groupedPatients.Emergency.map(patient => (
                                        <PatientCard key={patient.patient_id} patient={patient} />
                                    ))}
                                </div>
                            </div>

                            {/* General Ward Section */}
                            <div className="ward-card general">
                                <div className="ward-header">
                                    <div className="ward-icon">
                                        <Bed size={24} />
                                    </div>
                                    <div className="ward-info">
                                        <h3>General Ward</h3>
                                        <span className="patient-count">
                                            {groupedPatients.General.length} patients
                                        </span>
                                    </div>
                                </div>
                                <div className="ward-patients">
                                    {groupedPatients.General.map(patient => (
                                        <PatientCard key={patient.patient_id} patient={patient} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Remote Section */}
                    <div className="remote-section">
                        <div className="section-header">
                            <Home size={24} />
                            <h2>Remote Monitoring</h2>
                        </div>
                        <div className="remote-patients-grid">
                            {groupedPatients.Remote.map(patient => (
                                <RemotePatientCard key={patient.patient_id} patient={patient} />
                            ))}
                        </div>
                    </div>
                </div>

                {selectedPatient && (
                    <div className="patient-details-panel">
                        <div className="panel-header">
                            <h2>
                                <Users size={20} />
                                {selectedPatient.name}
                                <span className={`status-badge ${selectedPatient.status.toLowerCase()}`}>
                                    {selectedPatient.status}
                                </span>
                            </h2>
                            <button className="close-button" onClick={() => setSelectedPatient(null)}>
                                <XCircle size={20} />
                            </button>
                        </div>
                        <div className="panel-content">
                            <div className="details-section">
                                <h3>Patient Information</h3>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <Badge size={16} />
                                        <div>
                                            <span className="info-label">Patient ID</span>
                                            <div>{selectedPatient.patient_id}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <Users size={16} />
                                        <div>
                                            <span className="info-label">Age & Gender</span>
                                            <div>{selectedPatient.age} years, {selectedPatient.gender}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <Phone size={16} />
                                        <div>
                                            <span className="info-label">Contact</span>
                                            <div>{selectedPatient.contact.phone}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <Hospital size={16} />
                                        <div>
                                            <span className="info-label">Location</span>
                                            <div>{selectedPatient.location}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedPatient.vital_signs && (
                                <div className="details-section">
                                    <h3>Current Vitals</h3>
                                    <div className="vitals-grid">
                                        <div className="vital-box">
                                            <Heart size={20} />
                                            <div className="vital-info">
<span className="vital-label">Heart Rate</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.heartbeat} bpm
                                                </span>
                                            </div>
                                        </div>
                                        <div className="vital-box">
                                            <Activity size={20} />
                                            <div className="vital-info">
                                                <span className="vital-label">Blood Pressure</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.blood_pressure_systolic}/
                                                    {selectedPatient.vital_signs.blood_pressure_diastolic} mmHg
                                                </span>
                                            </div>
                                        </div>
                                        <div className="vital-box">
                                            <Thermometer size={20} />
                                            <div className="vital-info">
                                                <span className="vital-label">Temperature</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.temperature.toFixed(1)}°C
                                                </span>
                                            </div>
                                        </div>
                                        <div className="vital-box">
                                            <Droplets size={20} />
                                            <div className="vital-info">
                                                <span className="vital-label">Oxygen Saturation</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.oxygen_saturation}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="vital-box">
                                            <Activity size={20} />
                                            <div className="vital-info">
                                                <span className="vital-label">Blood Glucose</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.blood_glucose} mg/dL
                                                </span>
                                            </div>
                                        </div>
                                        <div className="vital-box">
                                            <Wind size={20} />
                                            <div className="vital-info">
                                                <span className="vital-label">Respiration Rate</span>
                                                <span className="vital-value">
                                                    {selectedPatient.vital_signs.respiration_rate}/min
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {selectedPatient.medical_history && selectedPatient.medical_history.length > 0 && (
                                <div className="details-section">
                                    <h3>Medical History</h3>
                                    <div className="notes-list">
                                        {selectedPatient.medical_history.map((history, index) => (
                                            <div key={index} className="note-item">
                                                <div className="note-content">
                                                    <strong>{history.condition}</strong>
                                                    <div className="note-date">{history.year}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.emergency_contacts && selectedPatient.emergency_contacts.length > 0 && (
                                <div className="details-section">
                                    <h3>Emergency Contacts</h3>
                                    <div className="notes-list">
                                        {selectedPatient.emergency_contacts.map((contact, index) => (
                                            <div key={index} className="note-item">
                                                <div className="note-content">
                                                    <strong>{contact.name}</strong>
                                                    <div>{contact.phone}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocPatients;
                                                