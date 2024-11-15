import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import './DocDashboard.css';
import { 
    AlertTriangle, Bell, Calendar, Activity,
    Clock, CheckCircle, MessageSquare, Users,
    ChevronRight, Filter, BarChart2, Heart,
    Thermometer, Droplet, RefreshCw, Search
} from 'lucide-react';

const DocDashboard = () => {
    const [criticalAlerts, setCriticalAlerts] = useState([
        {
            id: 1,
            patientId: "P001",
            patientName: "John Doe",
            type: "vital",
            message: "Heart rate exceeding normal range (150 bpm)",
            timestamp: "2024-10-15T10:30:00",
            severity: "high"
        },
        {
            id: 2,
            patientId: "P003",
            patientName: "Robert Johnson",
            type: "vital",
            message: "Low oxygen saturation (89%)",
            timestamp: "2024-10-15T10:15:00",
            severity: "high"
        }
    ]);

    const [appointments] = useState([
        {
            id: 1,
            patientName: "Jane Smith",
            time: "09:00 AM",
            type: "Follow-up",
            status: "Upcoming"
        },
        {
            id: 2,
            patientName: "Michael Brown",
            time: "10:30 AM",
            type: "New Consultation",
            status: "Upcoming"
        },
        {
            id: 3,
            patientName: "Sarah Williams",
            time: "02:00 PM",
            type: "Review",
            status: "Upcoming"
        }
    ]);

    const [tasks] = useState([
        {
            id: 1,
            title: "Review Lab Results",
            patientName: "Emma Davis",
            priority: "High",
            dueDate: "2024-10-15"
        },
        {
            id: 2,
            title: "Update Treatment Plan",
            patientName: "John Doe",
            priority: "Medium",
            dueDate: "2024-10-15"
        }
    ]);

    const [patientStats, setPatientStats] = useState({
        total: 25,
        critical: 3,
        stable: 18,
        monitoring: 4
    });

    const [recentMessages] = useState([
        {
            id: 1,
            patientName: "Alice Johnson",
            message: "When should I take the new medication?",
            timestamp: "10:30 AM"
        },
        {
            id: 2,
            patientName: "Bob Wilson",
            message: "My blood pressure readings attached",
            timestamp: "09:45 AM"
        }
    ]);

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setPatientStats(prev => ({
                ...prev,
                monitoring: prev.monitoring + (Math.random() > 0.5 ? 1 : -1)
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const [vitalsData] = useState({
        labels: ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM'],
        datasets: {
            heartRate: [72, 75, 78, 74],
            temperature: [36.8, 37.1, 36.9, 37.0],
            spO2: [98, 97, 98, 99]
        }
    });

    return (
        <div className="doc-dashboard-page">
            <DocSidebar />
            <div className="doc-dashboard-content">
                <div className="dashboard-header">
                    <div className="header-top">
                        <h1>Dashboard</h1>
                        <button className="refresh-button">
                            <RefreshCw size={20} />
                            Refresh Data
                        </button>
                    </div>

                    <div className="stats-grid">
                        <div className="dashboard-card">
                            <div className="card-header">
                                <div className="card-title">
                                    <Users size={20} />
                                    Total Patients
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="text-2xl font-bold">{patientStats.total}</div>
                            </div>
                        </div>

                        <div className="dashboard-card critical">
                            <div className="card-header">
                                <div className="card-title">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    Critical
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="text-2xl font-bold text-red-500">
                                    {patientStats.critical}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card stable">
                            <div className="card-header">
                                <div className="card-title">
                                    <CheckCircle size={20} className="text-green-500" />
                                    Stable
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="text-2xl font-bold text-green-500">
                                    {patientStats.stable}
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card monitoring">
                            <div className="card-header">
                                <div className="card-title">
                                    <Activity size={20} className="text-blue-500" />
                                    Monitoring
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="text-2xl font-bold text-blue-500">
                                    {patientStats.monitoring}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    <div className="dashboard-card col-span-2">
                        <div className="card-header">
                            <div className="card-title-group">
                                <div className="card-title">
                                    <AlertTriangle className="text-red-500" />
                                    Critical Alerts
                                </div>
                                <span className="text-sm text-red-500 font-normal">
                                    {criticalAlerts.length} active alerts
                                </span>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="alerts-list">
                                {criticalAlerts.map(alert => (
                                    <div key={alert.id} className="alert-item">
                                        <div className="alert-icon">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div className="alert-content">
                                            <h4>{alert.patientName}</h4>
                                            <p>{alert.message}</p>
                                            <span className="alert-time">
                                                <Clock size={14} />
                                                {new Date(alert.timestamp).toLocaleTimeString()}
                                            </span>
                                        </div>
                                        <button className="alert-action">
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Calendar />
                                Today's Schedule
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="appointments-list">
                                {appointments.map(appointment => (
                                    <div key={appointment.id} className="appointment-item">
                                        <div className="appointment-time">
                                            <Clock size={14} />
                                            {appointment.time}
                                        </div>
                                        <div className="appointment-info">
                                            <h4>{appointment.patientName}</h4>
                                            <span className="appointment-type">
                                                {appointment.type}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title">
                                <MessageSquare />
                                Recent Messages
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="messages-list">
                                {recentMessages.map(message => (
                                    <div key={message.id} className="message-item">
                                        <h4>{message.patientName}</h4>
                                        <p>{message.message}</p>
                                        <span className="message-time">
                                            <Clock size={14} />
                                            {message.timestamp}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card col-span-2">
                        <div className="card-header">
                            <div className="card-title-group">
                                <div className="card-title">
                                    <BarChart2 />
                                    Vitals Overview
                                </div>
                                <div className="flex items-center gap-2">
                                    <Filter size={16} />
                                    <select className="vitals-select">
                                        <option>Last 24 Hours</option>
                                        <option>Last Week</option>
                                        <option>Last Month</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="vitals-grid">
                                <div className="vital-card">
                                    <Heart className="text-red-500" />
                                    <div className="vital-info">
                                        <span className="vital-label">Avg Heart Rate</span>
                                        <span className="vital-value">
                                            {Math.round(vitalsData.datasets.heartRate.reduce((a, b) => a + b) / vitalsData.datasets.heartRate.length)} bpm
                                        </span>
                                    </div>
                                </div>
                                <div className="vital-card">
                                    <Thermometer className="text-orange-500" />
                                    <div className="vital-info">
                                        <span className="vital-label">Avg Temperature</span>
                                        <span className="vital-value">
                                            {(vitalsData.datasets.temperature.reduce((a, b) => a + b) / vitalsData.datasets.temperature.length).toFixed(1)}°C
                                        </span>
                                    </div>
                                </div>
                                <div className="vital-card">
                                    <Droplet className="text-blue-500" />
                                    <div className="vital-info">
                                        <span className="vital-label">Avg SpO2</span>
                                        <span className="vital-value">
                                            {Math.round(vitalsData.datasets.spO2.reduce((a, b) => a + b) / vitalsData.datasets.spO2.length)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title">
                                <CheckCircle />
                                Tasks
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="tasks-list">
                                {tasks.map(task => (
                                    <div key={task.id} className={`task-item priority-${task.priority.toLowerCase()}`}>
                                        <div className="task-content">
                                            <h4>{task.title}</h4>
                                            <p>{task.patientName}</p>
                                            <span className="task-due">
                                                <Clock size={14} />
                                                Due: {new Date(task.dueDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button className="task-complete">
                                            <CheckCircle size={20} />
                                        </button>
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

export default DocDashboard;