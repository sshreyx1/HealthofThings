import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import './DocPatients.css';
import {
    AlertTriangle, Bell, Calendar, Activity,
    Clock, CheckCircle, MessageSquare, Users,
    ChevronRight, Filter, BarChart2, Heart,
    Thermometer, Droplet, RefreshCw, Search,
    Home, Building2, Bed, Ambulance, User,
    Phone, Mail, MapPin, Badge, Hospital,
    XCircle, AlertCircle
} from 'lucide-react';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    contactNumber: string;
    email: string;
    address: string;
    admissionDate: string;
    location: 'Remote' | 'ICU' | 'Emergency' | 'General';
    status: 'Stable' | 'Critical' | 'Recovering' | 'Under Observation' | 'Normal' | 'Urgent';
    condition: string;
    diagnosis: string;
    lastCheckin?: string;
    vitals: {
        heartRate: number;
        bloodPressure: string;
        temperature: number;
        spO2: number;
        lastUpdated: string;
    };
    alerts: {
        id: string;
        type: 'critical' | 'warning' | 'info';
        message: string;
        timestamp: string;
    }[];
    medications: {
        name: string;
        dosage: string;
        frequency: string;
        startDate: string;
        endDate?: string;
    }[];
    notes: {
        date: string;
        doctor: string;
        content: string;
    }[];
}

interface HospitalPatients {
    icu: Patient[];
    emergency: Patient[];
    general: Patient[];
}

const DocPatients: React.FC = () => {
    const initialHospitalPatients: HospitalPatients = {
        icu: [
            {
                id: 'P001',
                name: 'John Doe',
                age: 45,
                gender: 'Male',
                contactNumber: '+1-234-567-8900',
                email: 'john.doe@email.com',
                address: '123 Health Street',
                admissionDate: '2024-10-15',
                location: 'ICU',
                status: 'Critical',
                condition: 'Post-Surgery',
                diagnosis: 'Post-Cardiac Surgery',
                vitals: {
                    heartRate: 98,
                    bloodPressure: '140/90',
                    temperature: 38.2,
                    spO2: 96,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [
                    {
                        id: 'A001',
                        type: 'critical',
                        message: 'High temperature detected',
                        timestamp: new Date().toISOString()
                    }
                ],
                medications: [
                    {
                        name: 'Morphine',
                        dosage: '5mg',
                        frequency: 'Every 4 hours',
                        startDate: '2024-10-15'
                    },
                    {
                        name: 'Amoxicillin',
                        dosage: '500mg',
                        frequency: 'Three times daily',
                        startDate: '2024-10-15'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-15',
                        doctor: 'Dr. Smith',
                        content: 'Patient stable post-surgery. Monitoring vitals closely.'
                    },
                    {
                        date: '2024-10-15',
                        doctor: 'Dr. Johnson',
                        content: 'Pain management protocol initiated.'
                    }
                ]
            },
            {
                id: 'P002',
                name: 'Mary Smith',
                age: 52,
                gender: 'Female',
                contactNumber: '+1-234-567-8901',
                email: 'mary.smith@email.com',
                address: '456 Medical Avenue',
                admissionDate: '2024-10-14',
                location: 'ICU',
                status: 'Critical',
                condition: 'Respiratory Failure',
                diagnosis: 'Severe Respiratory Failure',
                vitals: {
                    heartRate: 115,
                    bloodPressure: '130/85',
                    temperature: 37.8,
                    spO2: 98,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [
                    {
                        id: 'A002',
                        type: 'warning',
                        message: 'Elevated heart rate',
                        timestamp: new Date().toISOString()
                    }
                ],
                medications: [
                    {
                        name: 'Methylprednisolone',
                        dosage: '125mg',
                        frequency: 'Every 6 hours',
                        startDate: '2024-10-14'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-14',
                        doctor: 'Dr. Anderson',
                        content: 'Patient admitted with severe respiratory distress. Started on steroids.'
                    }
                ]
            },
            {
                id: 'P009',
                name: 'James Wilson',
                age: 63,
                gender: 'Male',
                contactNumber: '+1-234-567-8910',
                email: 'james.wilson@email.com',
                address: '789 Care Lane',
                admissionDate: '2024-10-15',
                location: 'ICU',
                status: 'Critical',
                condition: 'Severe Trauma',
                diagnosis: 'Multiple Trauma Post-MVA',
                vitals: {
                    heartRate: 110,
                    bloodPressure: '145/95',
                    temperature: 38.0,
                    spO2: 94,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [
                    {
                        id: 'A009',
                        type: 'critical',
                        message: 'Blood pressure elevated',
                        timestamp: new Date().toISOString()
                    }
                ],
                medications: [
                    {
                        name: 'Fentanyl',
                        dosage: '50mcg',
                        frequency: 'Every 2 hours',
                        startDate: '2024-10-15'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-15',
                        doctor: 'Dr. Roberts',
                        content: 'Multiple fractures stabilized. Continuing intensive monitoring.'
                    }
                ]
            }
        ],
        emergency: [
            {
                id: 'P003',
                name: 'Robert Brown',
                age: 60,
                gender: 'Male',
                contactNumber: '+1-234-567-8902',
                email: 'robert.brown@email.com',
                address: '789 Health Drive',
                admissionDate: '2024-10-15',
                location: 'Emergency',
                status: 'Urgent',
                condition: 'Chest Pain',
                diagnosis: 'Acute Chest Pain',
                vitals: {
                    heartRate: 102,
                    bloodPressure: '150/95',
                    temperature: 37.5,
                    spO2: 97,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [
                    {
                        id: 'A003',
                        type: 'warning',
                        message: 'Elevated blood pressure',
                        timestamp: new Date().toISOString()
                    }
                ],
                medications: [
                    {
                        name: 'Nitroglycerin',
                        dosage: '0.4mg',
                        frequency: 'As needed',
                        startDate: '2024-10-15'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-15',
                        doctor: 'Dr. Martinez',
                        content: 'ECG shows no acute changes. Monitoring for cardiac events.'
                    }
                ]
            },
            {
                id: 'P010',
                name: 'Sarah Parker',
                age: 28,
                gender: 'Female',
                contactNumber: '+1-234-567-8911',
                email: 'sarah.parker@email.com',
                address: '321 Emergency Road',
                admissionDate: '2024-10-15',
                location: 'Emergency',
                status: 'Urgent',
                condition: 'Severe Allergic Reaction',
                diagnosis: 'Anaphylaxis',
                vitals: {
                    heartRate: 105,
                    bloodPressure: '110/70',
                    temperature: 37.2,
                    spO2: 96,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [
                    {
                        id: 'A010',
                        type: 'warning',
                        message: 'Monitor respiratory status',
                        timestamp: new Date().toISOString()
                    }
                ],
                medications: [
                    {
                        name: 'Epinephrine',
                        dosage: '0.3mg',
                        frequency: 'Once',
                        startDate: '2024-10-15'
                    },
                    {
                        name: 'Diphenhydramine',
                        dosage: '50mg',
                        frequency: 'Every 6 hours',
                        startDate: '2024-10-15'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-15',
                        doctor: 'Dr. White',
                        content: 'Responded well to epinephrine. Monitoring for rebound reaction.'
                    }
                ]
            }
        ],
        general: [
            {
                id: 'P006',
                name: 'Emma Davis',
                age: 35,
                gender: 'Female',
                contactNumber: '+1-234-567-8903',
                email: 'emma.davis@email.com',
                address: '321 Medical Street',
                admissionDate: '2024-10-13',
                location: 'General',
                status: 'Stable',
                condition: 'Post-Op Recovery',
                diagnosis: 'Post-Operative Care',
                vitals: {
                    heartRate: 76,
                    bloodPressure: '120/80',
                    temperature: 37.0,
                    spO2: 98,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [],
                medications: [
                    {
                        name: 'Acetaminophen',
                        dosage: '1000mg',
                        frequency: 'Every 6 hours',
                        startDate: '2024-10-13'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-13',
                        doctor: 'Dr. Thompson',
                        content: 'Recovery progressing as expected. Pain well controlled.'
                    }
                ]
            },
            {
                id: 'P011',
                name: 'Michael Chen',
                age: 42,
                gender: 'Male',
                contactNumber: '+1-234-567-8912',
                email: 'michael.chen@email.com',
                address: '567 Recovery Lane',
                admissionDate: '2024-10-14',
                location: 'General',
                status: 'Stable',
                condition: 'Pneumonia',
                diagnosis: 'Community Acquired Pneumonia',
                vitals: {
                    heartRate: 82,
                    bloodPressure: '125/82',
                    temperature: 37.4,
                    spO2: 97,
                    lastUpdated: new Date().toISOString()
                },
                alerts: [],
                medications: [
                    {
                        name: 'Azithromycin',
                        dosage: '500mg',
                        frequency: 'Daily',
                        startDate: '2024-10-14'
                    }
                ],
                notes: [
                    {
                        date: '2024-10-14',
                        doctor: 'Dr. Lee',
                        content: 'Responding well to antibiotics. Oxygen levels stable.'
                    }
                ]
            }
        ]
    };

    const initialRemotePatients: Patient[] = [
        {
            id: 'R001',
            name: 'Alice Johnson',
            age: 48,
            gender: 'Female',
            contactNumber: '+1-234-567-8904',
            email: 'alice.johnson@email.com',
            address: '654 Health Avenue',
            admissionDate: '2024-10-12',
            location: 'Remote',
            status: 'Normal',
            condition: 'Hypertension',
            diagnosis: 'Controlled Hypertension',
            lastCheckin: '2024-10-15T09:30:00',
            vitals: {
                heartRate: 78,
                bloodPressure: '130/85',
                temperature: 37.1,
                spO2: 98,
                lastUpdated: new Date().toISOString()
            },
            alerts: [],
            medications: [
                {
                    name: 'Lisinopril',
                    dosage: '10mg',
                    frequency: 'Daily',
                    startDate: '2024-10-12'
                }
            ],
            notes: [
                {
                    date: '2024-10-12',
                    doctor: 'Dr. Garcia',
                    content: 'Blood pressure well controlled with current medication.'
                }
            ]
        },
        {
            id: 'R002',
            name: 'Thomas Walker',
            age: 55,
            gender: 'Male',
            contactNumber: '+1-234-567-8913',
            email: 'thomas.walker@email.com',
            address: '890 Remote Road',
            admissionDate: '2024-10-13',
            location: 'Remote',
            status: 'Stable',
            condition: 'Diabetes',
            diagnosis: 'Type 2 Diabetes',
            lastCheckin: '2024-10-15T10:15:00',
            vitals: {
                heartRate: 75,
                bloodPressure: '128/82',
                temperature: 36.9,
                spO2: 99,
                lastUpdated: new Date().toISOString()
            },
            alerts: [],
            medications: [
                {
                    name: 'Metformin',
                    dosage: '1000mg',
                    frequency: 'Twice daily',
                    startDate: '2024-10-13'
                }
            ],
            notes: [
                {
                    date: '2024-10-13',
                    doctor: 'Dr. Brown',
                    content: 'Blood sugar levels stable. Continue current management plan.'
                }
            ]
        },
        {
            id: 'R003',
            name: 'Linda Martinez',
            age: 62,
            gender: 'Female',
            contactNumber: '+1-234-567-8914',
            email: 'linda.martinez@email.com',
            address: '432 Home Care Way',
            admissionDate: '2024-10-14',
            location: 'Remote',
            status: 'Stable',
            condition: 'Heart Disease',
            diagnosis: 'Chronic Heart Failure',
            lastCheckin: '2024-10-15T08:45:00',
            vitals: {
                heartRate: 82,
                bloodPressure: '135/85',
                temperature: 37.0,
                spO2: 97,
                lastUpdated: new Date().toISOString()
            },
            alerts: [
                {
                    id: 'R003A1',
                    type: 'info',
                    message: 'Daily weight check reminder',
                    timestamp: new Date().toISOString()
                }
            ],
            medications: [
                {
                    name: 'Furosemide',
                    dosage: '40mg',
                    frequency: 'Daily',
                    startDate: '2024-10-14'
                },
                {
                    name: 'Carvedilol',
                    dosage: '12.5mg',
                    frequency: 'Twice daily',
                    startDate: '2024-10-14'
                }
            ],
            notes: [
                {
                    date: '2024-10-14',
                    doctor: 'Dr. Adams',
                    content: 'Patient stable on current heart failure regimen. Continue monitoring fluid status.'
                }
            ]
        }
    ];

    const [hospitalPatients, setHospitalPatients] = useState<HospitalPatients>(initialHospitalPatients);
    const [remotePatients, setRemotePatients] = useState<Patient[]>(initialRemotePatients);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLocation, setSelectedLocation] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        const interval = setInterval(() => {
            setHospitalPatients(prev => ({
                ...prev,
                icu: prev.icu.map(patient => ({
                    ...patient,
                    vitals: {
                        ...patient.vitals,
                        heartRate: Math.max(60, Math.min(120, patient.vitals.heartRate + (Math.random() * 6 - 3))),
                        spO2: Math.max(90, Math.min(100, patient.vitals.spO2 + (Math.random() * 2 - 1))),
                        temperature: Math.max(36, Math.min(40, patient.vitals.temperature + (Math.random() * 0.4 - 0.2))),
                        lastUpdated: new Date().toISOString()
                    }
                }))
            }));

            setRemotePatients(prev =>
                prev.map(patient => ({
                    ...patient,
                    vitals: {
                        ...patient.vitals,
                        heartRate: Math.max(60, Math.min(120, patient.vitals.heartRate + (Math.random() * 6 - 3))),
                        temperature: Math.max(36, Math.min(40, patient.vitals.temperature + (Math.random() * 0.4 - 0.2))),
                        lastUpdated: new Date().toISOString()
                    }
                }))
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const filteredHospitalPatients = {
        icu: hospitalPatients.icu.filter(patient =>
            (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedLocation === 'all' || patient.location === selectedLocation) &&
            (selectedStatus === 'all' || patient.status === selectedStatus)
        ),
        emergency: hospitalPatients.emergency.filter(patient =>
            (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedLocation === 'all' || patient.location === selectedLocation) &&
            (selectedStatus === 'all' || patient.status === selectedStatus)
        ),
        general: hospitalPatients.general.filter(patient =>
            (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                patient.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedLocation === 'all' || patient.location === selectedLocation) &&
            (selectedStatus === 'all' || patient.status === selectedStatus)
        )
    };

    const filteredRemotePatients = remotePatients.filter(patient =>
        (patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedLocation === 'all' || patient.location === selectedLocation) &&
        (selectedStatus === 'all' || patient.status === selectedStatus)
    );

    return (
        <div className="doc-patients-page">
            <DocSidebar />
            <div className={`doc-patients-content ${selectedPatient ? 'with-details' : ''}`}>
                <div className="dashboard-header">
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
                                    <option value="Normal">Normal</option>
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
                                <div className="ward-card icu">
                                    <div className="ward-header">
                                        <div className="ward-icon">
                                            <AlertTriangle size={24} />
                                        </div>
                                        <div className="ward-info">
                                            <h3>ICU</h3>
                                            <span className="patient-count">{filteredHospitalPatients.icu.length} patients</span>
                                        </div>
                                    </div>
                                    <div className="ward-patients">
                                        {filteredHospitalPatients.icu.map((patient: Patient) => (
                                            <div
                                                key={patient.id}
                                                className={`patient-card critical ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <div className="patient-info">
                                                    <h4>{patient.name}</h4>
                                                    <p>{patient.condition}</p>
                                                </div>
                                                <div className="remote-vitals">
                                                    <div className="vital-item">
                                                        <Heart size={16} />
                                                        <span>{Math.round(patient.vitals.heartRate)} bpm</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Activity size={16} />
                                                        <span>{patient.vitals.bloodPressure}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Thermometer size={16} />
                                                        <span>{patient.vitals.temperature.toFixed(1)}°C</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="ward-card emergency">
                                    <div className="ward-header">
                                        <div className="ward-icon">
                                            <Ambulance size={24} />
                                        </div>
                                        <div className="ward-info">
                                            <h3>Emergency</h3>
                                            <span className="patient-count">{filteredHospitalPatients.emergency.length} patients</span>
                                        </div>
                                    </div>
                                    <div className="ward-patients">
                                        {filteredHospitalPatients.emergency.map((patient: Patient) => (
                                            <div
                                                key={patient.id}
                                                className={`patient-card urgent ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <div className="patient-info">
                                                    <h4>{patient.name}</h4>
                                                    <p>{patient.condition}</p>
                                                </div>
                                                <div className="remote-vitals">
                                                    <div className="vital-item">
                                                        <Heart size={16} />
                                                        <span>{Math.round(patient.vitals.heartRate)} bpm</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Activity size={16} />
                                                        <span>{patient.vitals.bloodPressure}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Thermometer size={16} />
                                                        <span>{patient.vitals.temperature.toFixed(1)}°C</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="ward-card general">
                                    <div className="ward-header">
                                        <div className="ward-icon">
                                            <Bed size={24} />
                                        </div>
                                        <div className="ward-info">
                                            <h3>General Ward</h3>
                                            <span className="patient-count">{filteredHospitalPatients.general.length} patients</span>
                                        </div>
                                    </div>
                                    <div className="ward-patients">
                                        {filteredHospitalPatients.general.map((patient: Patient) => (
                                            <div
                                                key={patient.id}
                                                className={`patient-card stable ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
                                                onClick={() => setSelectedPatient(patient)}
                                            >
                                                <div className="patient-info">
                                                    <h4>{patient.name}</h4>
                                                    <p>{patient.condition}</p>
                                                </div>
                                                <div className="remote-vitals">
                                                    <div className="vital-item">
                                                        <Heart size={16} />
                                                        <span>{Math.round(patient.vitals.heartRate)} bpm</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Activity size={16} />
                                                        <span>{patient.vitals.bloodPressure}</span>
                                                    </div>
                                                    <div className="vital-item">
                                                        <Thermometer size={16} />
                                                        <span>{patient.vitals.temperature.toFixed(1)}°C</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="remote-section">
                            <div className="section-header">
                                <Home size={24} />
                                <h2>Remote Monitoring</h2>
                            </div>
                            <div className="remote-patients-grid">
                                {filteredRemotePatients.map((patient: Patient) => (
                                    <div
                                        key={patient.id}
                                        className={`remote-patient-card ${patient.status.toLowerCase()} ${selectedPatient?.id === patient.id ? 'selected' : ''}`}
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
                                            <p className="condition">{patient.condition}</p>
                                            <div className="remote-vitals">
                                                <div className="vital-item">
                                                    <Heart size={16} />
                                                    <span>{Math.round(patient.vitals.heartRate)} bpm</span>
                                                </div>
                                                <div className="vital-item">
                                                    <Activity size={16} />
                                                    <span>{patient.vitals.bloodPressure}</span>
                                                </div>
                                                <div className="vital-item">
                                                    <Thermometer size={16} />
                                                    <span>{patient.vitals.temperature.toFixed(1)}°C</span>
                                                </div>
                                            </div>
                                            <div className="last-checkin">
                                                <Clock size={14} />
                                                Last check-in: {new Date(patient.lastCheckin!).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                                            <div>{selectedPatient.id}</div>
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
                                            <div>{selectedPatient.contactNumber}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <Mail size={16} />
                                        <div>
                                            <span className="info-label">Email</span>
                                            <div>{selectedPatient.email}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <MapPin size={16} />
                                        <div>
                                            <span className="info-label">Address</span>
                                            <div>{selectedPatient.address}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <Calendar size={16} />
                                        <div>
                                            <span className="info-label">Admission Date</span>
                                            <div>{new Date(selectedPatient.admissionDate).toLocaleDateString()}</div>
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

                            <div className="details-section">
                                <h3>Current Vitals</h3>
                                <div className="vitals-grid">
                                    <div className="vital-box">
                                        <Heart size={20} />
                                        <div className="vital-info">
                                            <span className="vital-label">Heart Rate</span>
                                            <span className="vital-value">{Math.round(selectedPatient.vitals.heartRate)} bpm</span>
                                        </div>
                                    </div>
                                    <div className="vital-box">
                                        <Activity size={20} />
                                        <div className="vital-info">
                                            <span className="vital-label">Blood Pressure</span>
                                            <span className="vital-value">{selectedPatient.vitals.bloodPressure}</span>
                                        </div>
                                    </div>
                                    <div className="vital-box">
                                        <Thermometer size={20} />
                                        <div className="vital-info">
                                            <span className="vital-label">Temperature</span>
                                            <span className="vital-value">{selectedPatient.vitals.temperature.toFixed(1)}°C</span>
                                        </div>
                                    </div>
                                    <div className="vital-box">
                                        <Droplet size={20} />
                                        <div className="vital-info">
                                            <span className="vital-label">SpO2</span>
                                            <span className="vital-value">{Math.round(selectedPatient.vitals.spO2)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedPatient.alerts.length > 0 && (
                                <div className="details-section">
                                    <h3>Active Alerts</h3>
                                    <div className="alerts-list">
                                        {selectedPatient.alerts.map(alert => (
                                            <div key={alert.id} className={`alert-item ${alert.type}`}>
                                                {alert.type === 'critical' ? (
                                                    <AlertTriangle size={16} />
                                                ) : alert.type === 'warning' ? (
                                                    <AlertCircle size={16} />
                                                ) : (
                                                    <Bell size={16} />
                                                )}
                                                <div className="alert-content">
                                                    <p>{alert.message}</p>
                                                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.medications.length > 0 && (
                                <div className="details-section">
                                    <h3>Medications</h3>
                                    <div className="medications-list">
                                        {selectedPatient.medications.map((medication, index) => (
                                            <div key={index} className="medication-item">
                                                <div className="medication-header">
                                                    <h4>{medication.name}</h4>
                                                    <div className="medication-dates">
                                                        {new Date(medication.startDate).toLocaleDateString()}
                                                        {medication.endDate && ` - ${new Date(medication.endDate).toLocaleDateString()}`}
                                                    </div>
                                                </div>
                                                <div className="medication-details">
                                                    <span>Dosage: {medication.dosage}</span>
                                                    <span>Frequency: {medication.frequency}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedPatient.notes.length > 0 && (
                                <div className="details-section">
                                    <h3>Medical Notes</h3>
                                    <div className="notes-list">
                                        {selectedPatient.notes.map((note, index) => (
                                            <div key={index} className="note-item">
                                                <div className="note-header">
                                                    <span className="note-doctor">{note.doctor}</span>
                                                    <span className="note-date">
                                                        {new Date(note.date).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="note-content">{note.content}</p>
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