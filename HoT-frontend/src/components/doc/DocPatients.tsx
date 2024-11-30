import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import { VitalsService } from '../../services/vitalsService';
import {
    AlertTriangle, Heart, Activity,
    Thermometer, Search, Hospital,
    Building2, Bed, Ambulance, User
} from 'lucide-react';
import './DocPatients.css';

interface VitalSigns {
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    oxygen_saturation: number;
}

interface Patient {
    patient_id: string;
    name: string;
    location: 'ICU' | 'Emergency' | 'General' | 'Remote';
    monitoring_type: string;
    status: 'Critical' | 'Stable' | 'Normal' | 'Urgent';
    condition?: string;
    vital_signs?: VitalSigns;
}



const DocPatients: React.FC = () => {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

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

    const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
        <div className={`patient-card ${patient.status.toLowerCase()}`}>
            <div className="patient-info">
                <h4>{patient.name}</h4>
                <p>{patient.condition || patient.monitoring_type}</p>
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
                </div>
            )}
        </div>
    );

    return (
        <div className="doc-patients-page">
            <DocSidebar />
            <div className="doc-patients-content">
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
                </div>
            </div>
        </div>
    );
};

export default DocPatients;