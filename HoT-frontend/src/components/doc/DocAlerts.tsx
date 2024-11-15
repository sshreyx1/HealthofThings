import React, { useState } from 'react';
import DocSidebar from './DocSidebar';
import './DocAlerts.css';
import {
    AlertTriangle, AlertCircle, Bell, Calendar,
    MessageSquare, XCircle, CheckCircle, Clock, 
    Users, Filter, RefreshCw, Plus
} from 'lucide-react';

const DocAlert = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [alerts, setAlerts] = useState([
        // High Priority
        {
            id: 1,
            category: 'high-priority',
            type: 'critical',
            title: 'Critical Vital Signs',
            patient: 'John Doe',
            message: 'Blood pressure exceeding normal range (180/100)',
            timestamp: '2024-10-15T10:30:00',
            isRead: false,
        },
        {
            id: 5,
            category: 'high-priority',
            type: 'critical',
            title: 'Low SpO2 Levels',
            patient: 'Michael Brown',
            message: 'Oxygen saturation dropped to 89%',
            timestamp: '2024-10-15T10:15:00',
            isRead: false,
        },
        {
            id: 9,
            category: 'high-priority',
            type: 'critical',
            title: 'Irregular ECG Reading',
            patient: 'Thomas Miller',
            message: 'Significant arrhythmia detected in latest ECG',
            timestamp: '2024-10-15T07:30:00',
            isRead: false,
        },
        // Appointments
        {
            id: 3,
            category: 'appointments',
            type: 'appointment',
            title: 'New Appointment Request',
            patient: 'Robert Johnson',
            message: 'Requested appointment for October 20th, 2024 at 2:00 PM',
            timestamp: '2024-10-15T09:00:00',
            isRead: false,
        },
        {
            id: 7,
            category: 'appointments',
            type: 'appointment',
            title: 'Follow-up Request',
            patient: 'David Wilson',
            message: 'Requesting post-surgery follow-up appointment',
            timestamp: '2024-10-15T08:45:00',
            isRead: false,
        },
        // Medication
        {
            id: 8,
            category: 'medication',
            type: 'message',
            title: 'Prescription Renewal',
            patient: 'Lisa Anderson',
            message: 'Request for blood pressure medication renewal',
            timestamp: '2024-10-15T08:00:00',
            isRead: false,
        },
        {
            id: 2,
            category: 'monitoring',
            type: 'warning',
            title: 'Abnormal Heart Rate',
            patient: 'Jane Smith',
            message: 'Heart rate elevated above threshold (115 bpm)',
            timestamp: '2024-10-15T09:45:00',
            isRead: false,
        },
        {
            id: 6,
            category: 'monitoring',
            type: 'warning',
            title: 'Elevated Temperature',
            patient: 'Emily Davis',
            message: 'Body temperature at 38.9°C',
            timestamp: '2024-10-15T09:30:00',
            isRead: false,
        },
        // Patient Messages
        {
            id: 4,
            category: 'messages',
            type: 'message',
            title: 'Patient Query',
            patient: 'Sarah Williams',
            message: 'Question about medication side effects',
            timestamp: '2024-10-15T08:30:00',
            isRead: true,
        },
    ]);

    const markAsRead = (alertId: number) => {
        setAlerts(alerts.map(alert => 
            alert.id === alertId ? { ...alert, isRead: true } : alert
        ));
    };

    const deleteAlert = (alertId: number) => {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'critical':
                return <AlertTriangle className="docalert-icon-critical" size={24} />;
            case 'warning':
                return <AlertCircle className="docalert-icon-warning" size={24} />;
            case 'appointment':
                return <Calendar className="docalert-icon-appointment" size={24} />;
            case 'message':
                return <MessageSquare className="docalert-icon-message" size={24} />;
            default:
                return <Bell className="docalert-icon" size={24} />;
        }
    };

    const filteredAlerts = selectedCategory === 'all' 
        ? alerts 
        : alerts.filter(alert => alert.category === selectedCategory);

    return (
        <div className="docalert-page">
            <DocSidebar />
            <div className="docalert-content">
                <div className="docalert-main">
                    <div className="docalert-header">
                        <h1 className="docalert-title">Alerts & Notifications</h1>
                        <div className="docalert-controls">
                            <div className="docalert-filter">
                                <Filter size={20} />
                                <select 
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="docalert-select"
                                >
                                    <option value="all">All Alerts</option>
                                    <option value="high-priority">High Priority</option>
                                    <option value="appointments">Appointments</option>
                                    <option value="medication">Medication</option>
                                    <option value="monitoring">Monitoring</option>
                                    <option value="messages">Messages</option>
                                </select>
                            </div>
                            <div className="docalert-unread-count">
                                {alerts.filter(a => !a.isRead).length} unread
                            </div>
                        </div>
                    </div>

                    <div className="docalert-list">
                        {filteredAlerts.map(alert => (
                            <div
                                key={alert.id}
                                className={`docalert-card ${!alert.isRead ? 'unread' : 'read'} ${alert.type}`}
                            >
                                <div className="docalert-card-content">
                                    {getIcon(alert.type)}
                                    <div className="docalert-card-main">
                                        <div className="docalert-card-header">
                                            <div>
                                                <h3 className="docalert-card-title">{alert.title}</h3>
                                                <p className="docalert-card-patient">
                                                    <Users size={16} />
                                                    {alert.patient}
                                                </p>
                                            </div>
                                            <div className="docalert-card-actions">
                                                <button
                                                    onClick={() => markAsRead(alert.id)}
                                                    className="docalert-action-button docalert-read-button"
                                                >
                                                    <CheckCircle size={20} />
                                                </button>
                                                <button
                                                    onClick={() => deleteAlert(alert.id)}
                                                    className="docalert-action-button docalert-delete-button"
                                                >
                                                    <XCircle size={20} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="docalert-card-message">{alert.message}</p>
                                        <div className="docalert-card-timestamp">
                                            <Clock size={14} />
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocAlert;