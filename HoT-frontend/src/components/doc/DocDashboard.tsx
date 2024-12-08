import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import './DocDashboard.css';
import {
    AlertTriangle, Bell, Calendar, Activity,
    Clock, CheckCircle, MessageSquare, Users,
    ChevronRight, Filter, BarChart2, Heart,
    Stethoscope, UserPlus, FileText, Phone,
    Video, Mail, X, ArrowUpRight, RefreshCw,
    MessageCircle, ClipboardList
} from 'lucide-react';

const DocDashboard = () => {
    // Critical Alerts State
    const [criticalAlerts, setCriticalAlerts] = useState([
        {
            id: 1,
            patientId: "P001",
            patientName: "John Doe",
            type: "vital",
            message: "Heart rate elevated (150 bpm) - Requires immediate attention",
            timestamp: "2024-10-15T10:30:00",
            severity: "critical",
            vitalType: "heart_rate"
        },
        {
            id: 2,
            patientId: "P003",
            patientName: "Robert Johnson",
            type: "vital",
            message: "Blood pressure: 180/110 mmHg - Hypertensive crisis",
            timestamp: "2024-10-15T10:15:00",
            severity: "critical",
            vitalType: "blood_pressure"
        },
        {
            id: 3,
            patientId: "P007",
            patientName: "Mary Smith",
            type: "lab",
            message: "Critical potassium levels (6.8 mmol/L)",
            timestamp: "2024-10-15T09:45:00",
            severity: "critical",
            resultType: "lab_result"
        }
    ]);

    // Appointments State
    const [appointments] = useState([
        {
            id: 1,
            patientName: "Jane Smith",
            time: "09:00 AM",
            type: "in-person",
            category: "Follow-up",
            status: "confirmed",
            duration: "30min",
            notes: "Post-surgery check"
        },
        {
            id: 2,
            patientName: "Michael Brown",
            time: "10:30 AM",
            type: "virtual",
            category: "New Consultation",
            status: "pending",
            duration: "45min",
            notes: "First time visit - Chest pain"
        },
        {
            id: 3,
            patientName: "Sarah Williams",
            time: "02:00 PM",
            type: "in-person",
            category: "Review",
            status: "confirmed",
            duration: "30min",
            notes: "Medication review"
        }
    ]);

    // Tasks State
    const [tasks] = useState([
        {
            id: 1,
            title: "Review Lab Results",
            patientName: "Emma Davis",
            priority: "High",
            dueDate: "2024-10-15",
            type: "lab_review",
            description: "CBC and Metabolic Panel results pending review"
        },
        {
            id: 2,
            title: "Update Treatment Plan",
            patientName: "John Doe",
            priority: "Medium",
            dueDate: "2024-10-15",
            type: "treatment_plan",
            description: "Adjust medication dosage based on recent vital trends"
        },
        {
            id: 3,
            title: "Sign Medical Certificate",
            patientName: "Alice Johnson",
            priority: "Low",
            dueDate: "2024-10-15",
            type: "documentation",
            description: "Return to work certificate needed"
        }
    ]);

    // Patient Statistics State
    const [patientStats, setPatientStats] = useState({
        total: 25,
        critical: 3,
        stable: 18,
        monitoring: 4,
        newAdmissions: 2,
        pendingDischarge: 3
    });

    // Recent Activities State
    const [recentActivities] = useState([
        {
            id: 1,
            type: "admission",
            patientName: "George Wilson",
            description: "New admission - Acute appendicitis",
            timestamp: "10:15 AM",
            priority: "high"
        },
        {
            id: 2,
            type: "lab_result",
            patientName: "Sarah Connor",
            description: "New lab results available",
            timestamp: "09:30 AM",
            priority: "medium"
        },
        {
            id: 3,
            type: "note",
            patientName: "James Moore",
            description: "Treatment plan updated",
            timestamp: "09:00 AM",
            priority: "low"
        }
    ]);

    // Messages State
    const [messages] = useState([
        {
            id: 1,
            sender: "Dr. Sarah Johnson",
            content: "Patient in Room 302 needs consultation",
            timestamp: "10:30 AM",
            type: "colleague",
            urgent: true
        },
        {
            id: 2,
            sender: "Nurse Station B",
            content: "New vital signs recorded for Patient ID: P007",
            timestamp: "10:15 AM",
            type: "staff",
            urgent: false
        },
        {
            id: 3,
            sender: "Laboratory",
            content: "Urgent lab results ready for review",
            timestamp: "09:45 AM",
            type: "system",
            urgent: true
        }
    ]);

    // Announcements State
    const [announcements] = useState([
        {
            id: 1,
            title: "New COVID-19 Protocol",
            content: "Updated guidelines for patient screening",
            timestamp: "2024-10-15",
            priority: "high"
        },
        {
            id: 2,
            title: "System Maintenance",
            content: "Scheduled downtime on Sunday 2 AM",
            timestamp: "2024-10-14",
            priority: "medium"
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

    return (
        <div className="doc-dashboard-page">
            <DocSidebar />
            <div className="doc-dashboard-content">
                <div className="dashboard-header">
                    <div className="header-top">
                        <div className="header-title-group">
                            <h1>Dashboard</h1>
                            <span className="last-updated">
                                <Clock size={14} />
                                Last updated: {new Date().toLocaleTimeString()}
                            </span>
                        </div>
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
                                <div className="stat-value">{patientStats.total}</div>
                                <div className="stat-detail">
                                    <span className="stat-label">New: </span>
                                    <span className="stat-number">+{patientStats.newAdmissions}</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card critical">
                            <div className="card-header">
                                <div className="card-title">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    Critical Care
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="stat-value text-red-500">{patientStats.critical}</div>
                                <div className="stat-detail">
                                    <span className="stat-label">Requires attention</span>
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
                                <div className="stat-value text-green-500">{patientStats.stable}</div>
                                <div className="stat-detail">
                                    <span className="stat-label">Discharge: </span>
                                    <span className="stat-number">{patientStats.pendingDischarge}</span>
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
                                <div className="stat-value text-blue-500">{patientStats.monitoring}</div>
                                <div className="stat-detail">
                                    <span className="stat-label">Under observation</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="dashboard-grid">

                    {/* Critical Alerts Section */}
                    <div className="dashboard-card col-span-2">
                        <div className="card-header">
                            <div className="card-title-group">
                                <div className="card-title">
                                    <AlertTriangle className="text-red-500" />
                                    Critical Alerts
                                </div>
                                <span className="alert-count">{criticalAlerts.length} active</span>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="alerts-list">
                                {criticalAlerts.map(alert => (
                                    <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                                        <div className="alert-icon">
                                            <AlertTriangle size={20} />
                                        </div>
                                        <div className="alert-content">
                                            <h4>{alert.patientName}</h4>
                                            <p>{alert.message}</p>
                                            <div className="alert-footer">
                                                <span className="alert-time">
                                                    <Clock size={14} />
                                                    {new Date(alert.timestamp).toLocaleTimeString()}
                                                </span>
                                                <span className="alert-type">{alert.type}</span>
                                            </div>
                                        </div>
                                        <button className="alert-action">
                                            View Details
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Today's Schedule Section */}
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
                                    <div key={appointment.id} className={`appointment-item status-${appointment.status}`}>
                                        <div className="appointment-time">
                                            <Clock size={14} />
                                            {appointment.time}
                                            <span className="appointment-duration">({appointment.duration})</span>
                                        </div>
                                        <div className="appointment-info">
                                            <div className="appointment-header">
                                                <h4>{appointment.patientName}</h4> 
                                            </div>
                                            <div className="appointment-details">
                                                <span className={`appointment-status status-${appointment.status}`}>
                                                    {appointment.status}
                                                </span>
                                            </div>
                                            <p className="appointment-notes">{appointment.notes}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activities Section */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Activity />
                                Recent Activities
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="activities-list">
                                {recentActivities.map(activity => (
                                    <div key={activity.id} className={`activity-item priority-${activity.priority}`}>
                                        <div className="activity-icon">
                                            {activity.type === 'admission' && <UserPlus size={16} />}
                                            {activity.type === 'lab_result' && <FileText size={16} />}
                                            {activity.type === 'note' && <ClipboardList size={16} />}
                                        </div>
                                        <div className="activity-content">
                                            <h4>{activity.patientName}</h4>
                                            <p>{activity.description}</p>
                                            <span className="activity-time">
                                                <Clock size={14} />
                                                {activity.timestamp}
                                            </span>
                                        </div>
                                        <button className="activity-action">
                                            <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Tasks Section */}
                    <div className="dashboard-card col-span-2">
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
                                            <div className="task-header">
                                                <h4>{task.title}</h4>
                                                <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="task-description">{task.description}</p>
                                            <div className="task-footer">
                                                <span className="task-patient">{task.patientName}</span>
                                                <span className="task-due">
                                                    <Clock size={14} />
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="task-actions">
                                            <button className="task-complete" title="Mark as complete">
                                                <CheckCircle size={20} />
                                            </button>
                                            <button className="task-edit" title="Edit task">
                                                <FileText size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Messages & Communication Section */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title-group">
                                <div className="card-title">
                                    <MessageSquare />
                                    Messages
                                </div>
                                <button className="compose-button">
                                    <MessageCircle size={16} />
                                    New Message
                                </button>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="messages-list">
                                {messages.map(message => (
                                    <div key={message.id} className={`message-item ${message.urgent ? 'urgent' : ''}`}>
                                        <div className="message-header">
                                            <h4>{message.sender}</h4>
                                            <span className={`message-type type-${message.type}`}>
                                                {message.type}
                                            </span>
                                        </div>
                                        <p className="message-content">{message.content}</p>
                                        <div className="message-footer">
                                            <span className="message-time">
                                                <Clock size={14} />
                                                {message.timestamp}
                                            </span>
                                            <div className="message-actions">
                                                <button className="action-button" title="Reply">
                                                    <Mail size={14} />
                                                </button>
                                                <button className="action-button" title="Mark as read">
                                                    <CheckCircle size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Announcements Section */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <div className="card-title">
                                <Bell />
                                Announcements
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="announcements-list">
                                {announcements.map(announcement => (
                                    <div key={announcement.id} className={`announcement-item priority-${announcement.priority}`}>
                                        <div className="announcement-header">
                                            <h4>{announcement.title}</h4>
                                            <span className="announcement-date">
                                                {new Date(announcement.timestamp).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="announcement-content">{announcement.content}</p>
                                        <button className="announcement-action">
                                            Read More
                                            <ChevronRight size={16} />
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