import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Dashboard.css';
import {
    Heart, Thermometer, Activity, Wind,
    Droplets, Cookie, Calendar, Clock,
    Bell, CheckCircle, AlertTriangle,
    Pill, ChevronRight, Plus, MessageSquare,
    Monitor, Mail
} from 'lucide-react';

interface VitalSign {
    current: number;
    min: number;
    max: number;
    unit: string;
}

interface BloodPressure {
    current: { systolic: number; diastolic: number };
    min: { systolic: number; diastolic: number };
    max: { systolic: number; diastolic: number };
    unit: string;
}

interface Alert {
    id: number;
    type: 'critical' | 'warning';
    message: string;
    timestamp: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vitals, setVitals] = useState<any>(null);
    const patientId = localStorage.getItem('userId');

    // Hardcoded data for other sections
    const [medications] = useState([
        {
            id: 1,
            name: "Lisinopril",
            dosage: "10mg",
            frequency: "Once daily",
            nextDose: "2024-11-16T09:00:00",
            remaining: 10,
            total: 30
        },
        {
            id: 2,
            name: "Metformin",
            dosage: "500mg",
            frequency: "Twice daily",
            nextDose: "2024-11-16T14:00:00",
            remaining: 15,
            total: 60
        }
    ]);

    const [appointments] = useState([
        {
            id: 1,
            doctor: "Dr. Sarah Johnson",
            specialty: "Cardiologist",
            date: "2024-11-20",
            time: "10:00 AM",
            type: "in-person",
            location: "Heart Care Center",
            status: "confirmed"
        }
    ]);

    const [activities] = useState([
        {
            id: 1,
            type: "test_result",
            title: "Blood Glucose Test",
            result: "100 mg/dL",
            status: "Normal",
            date: "2024-11-15"
        }
    ]);

    const [tasks] = useState([
        {
            id: 1,
            title: "Upload Blood Test Report",
            dueDate: "2024-11-18",
            priority: "high",
            status: "pending"
        }
    ]);

    useEffect(() => {
        if (!patientId) {
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const vitalsResponse = await fetch(`http://localhost:8080/api/vitals/${patientId}`);
                if (!vitalsResponse.ok) throw new Error('Failed to fetch vitals');
                const vitalsData = await vitalsResponse.json();
                setVitals(vitalsData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();

        // WebSocket connection for real-time updates
        const ws = new WebSocket(`ws://localhost:8080/ws/vitals/${patientId}`);
        
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setVitals(data);
            } catch (err) {
                console.error('WebSocket error:', err);
            }
        };

        return () => ws.close();
    }, [patientId, navigate]);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!vitals) return <div>No vital signs data available</div>;

    const getVitalStatus = (value: number, min: number, max: number): string => {
        if (value <= min || value >= max) return 'critical';
        if (value <= min + 5 || value >= max - 5) return 'warning';
        return 'normal';
    };

    return (
        <div className="patient-dashboard-page">
            <Sidebar />
            <div className="patient-dashboard-content">
                <div className="patient-dashboard-header">
                    <h1>My Health Dashboard</h1>
                    <span className="patient-last-updated">
                        <Clock size={14} />
                        Last updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>

                {/* Vitals Overview Grid */}
                <div className="patient-vitals-grid">
                    {/* Heart Rate */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Heart size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Heart Rate</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.heartbeat}</span>
                                <span className="patient-vital-unit">bpm</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 60-100 bpm
                            </div>
                        </div>
                    </div>

                    {/* Temperature */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Thermometer size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Temperature</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.temperature}</span>
                                <span className="patient-vital-unit">°C</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 36.5-37.5 °C
                            </div>
                        </div>
                    </div>

                    {/* Oxygen Saturation */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Activity size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Oxygen Saturation</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.oxygen_saturation}</span>
                                <span className="patient-vital-unit">%</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 95-100 %
                            </div>
                        </div>
                    </div>

                    {/* Respiratory Rate */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Wind size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Respiratory Rate</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.respiration_rate}</span>
                                <span className="patient-vital-unit">bpm</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 12-20 bpm
                            </div>
                        </div>
                    </div>

                    {/* Blood Pressure */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Droplets size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Blood Pressure</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.blood_pressure_systolic}/{vitals.vital_signs.blood_pressure_diastolic}</span>
                                <span className="patient-vital-unit">mmHg</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 90/60-120/80 mmHg
                            </div>
                        </div>
                    </div>

                    {/* Blood Glucose */}
                    <div className="patient-vital-card">
                        <div className="patient-vital-icon">
                            <Cookie size={24} />
                        </div>
                        <div className="patient-vital-info">
                            <h3>Blood Glucose</h3>
                            <div className="patient-vital-value">
                                <span>{vitals.vital_signs.blood_glucose}</span>
                                <span className="patient-vital-unit">mg/dL</span>
                            </div>
                            <div className="patient-vital-range">
                                Normal range: 70-140 mg/dL
                            </div>
                        </div>
                    </div>
                </div>

                {/* Rest of dashboard content with hardcoded data */}
                <div className="patient-dashboard-grid">
                    {/* Medications Section */}
                    <div className="patient-dashboard-card">
                        <div className="patient-card-header">
                            <div className="patient-card-title">
                                <Pill />
                                Medications
                            </div>
                        </div>
                        <div className="patient-card-content">
                            <div className="patient-medications-list">
                                {medications.map(med => (
                                    <div key={med.id} className="patient-medication-item">
                                        <div className="patient-medication-info">
                                            <h4>{med.name}</h4>
                                            <p>{med.dosage} - {med.frequency}</p>
                                            <div className="patient-medication-progress">
                                                <div
                                                    className="patient-progress-bar"
                                                    style={{ width: `${(med.remaining / med.total) * 100}%` }}
                                                />
                                            </div>
                                            <span className="patient-medication-remaining">
                                                {med.remaining} doses remaining
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Appointments Section */}
                    <div className="patient-dashboard-card">
                        <div className="patient-card-header">
                            <div className="patient-card-title">
                                <Calendar />
                                Upcoming Appointments
                            </div>
                        </div>
                        <div className="patient-card-content">
                            <div className="patient-appointments-list">
                                {appointments.map(apt => (
                                    <div key={apt.id} className={`patient-appointment-item status-${apt.status}`}>
                                        <div className="patient-appointment-header">
                                            <h4>{apt.doctor}</h4>
                                            <span className="patient-appointment-specialty">{apt.specialty}</span>
                                        </div>
                                        <div className="patient-appointment-details">
                                            <div className="patient-appointment-time">
                                                <Calendar size={14} />
                                                {apt.date} {apt.time}
                                            </div>
                                            <div className="patient-appointment-location">
                                                {apt.type === 'virtual' ? <Monitor size={14} /> : <MessageSquare size={14} />}
                                                {apt.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Activities Section */}
                    <div className="patient-dashboard-card">
                        <div className="patient-card-header">
                            <div className="patient-card-title">
                                <Activity />
                                Recent Activities
                            </div>
                        </div>
                        <div className="patient-card-content">
                            <div className="patient-activities-list">
                                {activities.map(activity => (
                                    <div key={activity.id} className="patient-activity-item">
                                        <div className="patient-activity-content">
                                            <h4>{activity.title}</h4>
                                            <div className="patient-test-result">
                                                <span className="patient-result-value">{activity.result}</span>
                                                <span className={`patient-result-status patient-status-${activity.status.toLowerCase()}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                            <div className="patient-activity-footer">
                                                <span className="patient-activity-date">
                                                    {activity.date}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="patient-dashboard-card">
                        <div className="patient-card-header">
                            <div className="patient-card-title">
                                <CheckCircle />
                                Tasks
                            </div>
                        </div>
                        <div className="patient-card-content">
                            <div className="patient-tasks-list">
                                {tasks.map(task => (
                                    <div key={task.id} className={`patient-task-item priority-${task.priority}`}>
                                        <div className="patient-task-content">
                                            <h4>{task.title}</h4>
                                            <div className="patient-task-details">
                                                <span className="patient-task-due">
                                                    Due: {task.dueDate}
                                                </span>
                                                <span className={`patient-task-priority ${task.priority}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
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

export default Dashboard;