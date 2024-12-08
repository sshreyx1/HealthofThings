import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import {
    AlertTriangle, AlertCircle, Bell, Calendar,
    MessageSquare, XCircle, CheckCircle, Clock,
    Users, Filter, Plus, Search
} from 'lucide-react';
import './DocAlerts.css';
import { alertService } from '../../services/alertService';

interface Alert {
    patient_id: string;
    timestamp: string;
    alert_id: string;
    message: string;
    message_id: string;
    severity: 'warning' | 'critical';
    status: string;
    unit: string;
    value: number;
    vital_type: string;
    isRead?: boolean;
}

interface Category {
    id: string;
    label: string;
    icon: React.ReactNode;
}

const categories: Category[] = [
    { id: 'all', label: 'All Alerts', icon: <Bell size={16} /> },
    { id: 'critical', label: 'Critical', icon: <AlertTriangle size={16} /> },
    { id: 'warning', label: 'Warnings', icon: <AlertCircle size={16} /> },
    { id: 'oxygen_saturation', label: 'Oxygen Saturation', icon: <AlertCircle size={16} /> },
    { id: 'blood_pressure', label: 'Blood Pressure', icon: <AlertCircle size={16} /> }
];

const DocAlert: React.FC = () => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAlerts();
        
        const ws = new WebSocket('ws://localhost:8080/ws/alerts');
        
        ws.onopen = () => {
            console.log('WebSocket connected');
        };
        
        ws.onmessage = (event) => {
            try {
                const newAlerts = JSON.parse(event.data);
                setAlerts(prevAlerts => {
                    const existingIds = new Set(prevAlerts.map(a => a.alert_id));
                    const uniqueNewAlerts = newAlerts.filter((alert: Alert) => 
                        !existingIds.has(alert.alert_id)
                    );
                    return [...prevAlerts, ...uniqueNewAlerts].map(alert => ({
                        ...alert,
                        isRead: prevAlerts.find(a => a.alert_id === alert.alert_id)?.isRead || false
                    }));
                });
            } catch (error) {
                console.error('Error processing WebSocket message:', error);
            }
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            setError('Failed to connect to real-time alerts');
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    const fetchAlerts = async () => {
        try {
            const data = await alertService.getAlerts();
            setAlerts(data.map((alert: Alert) => ({ ...alert, isRead: false })));
            setError(null);
        } catch (err) {
            console.error('Error fetching alerts:', err);
            setError('Failed to fetch alerts');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (alertId: string, patientId: string) => {
        try {
            const response = await fetch(`http://localhost:8080/api/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'read',
                    patient_id: patientId
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update alert');
            }

            setAlerts(alerts.map(alert =>
                alert.alert_id === alertId ? { ...alert, isRead: true, status: 'read' } : alert
            ));
        } catch (err) {
            console.error('Error updating alert:', err);
        }
    };

    const deleteAlert = (alertId: string) => {
        setAlerts(alerts.filter(alert => alert.alert_id !== alertId));
    };

    const getIcon = (severity: string) => {
        switch (severity) {
            case 'critical':
                return <AlertTriangle className="docalert-icon-critical" size={24} />;
            case 'warning':
                return <AlertCircle className="docalert-icon-warning" size={24} />;
            default:
                return <Bell className="docalert-icon" size={24} />;
        }
    };

    const filteredAlerts = alerts
        .filter(alert => {
            const matchesCategory = selectedCategory === 'all' || 
                                  alert.severity === selectedCategory ||
                                  alert.vital_type.includes(selectedCategory);
            const matchesSearch = alert.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                alert.message.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const unreadCount = alerts.filter(a => !a.isRead).length;

    if (loading) {
        return <div className="flex h-screen items-center justify-center">Loading alerts...</div>;
    }

    if (error) {
        return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
    }

    return (
        <div className="docalert-page">
            <DocSidebar />
            <div className="docalert-content">
                <div className="docalert-main">
                    <div className="docalert-header">
                        <div className="docalert-title-section">
                            <h1 className="docalert-title">Alerts & Notifications</h1>
                        </div>
                        <div className="docalert-controls">
                            <div className="docalert-unread-count">
                                {unreadCount} unread alerts
                            </div>
                        </div>
                    </div>

                    <div className="docalert-layout">
                        <aside className="docalert-sidebar">
                            <div className="docalert-filter-section">
                                <h2 className="docalert-filter-title">Filters</h2>
                                <div className="docalert-search-box">
                                    <Search size={16} className="docalert-search-icon" />
                                    <input
                                        type="text"
                                        placeholder="Search alerts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="docalert-search-input"
                                    />
                                </div>
                                <div className="docalert-category-filters">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            className={`docalert-category-button ${selectedCategory === category.id ? 'active' : ''}`}
                                        >
                                            {category.icon}
                                            <span>{category.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </aside>

                        <div className="docalert-list">
                            {filteredAlerts.map(alert => (
                                <div
                                    key={alert.alert_id}
                                    className={`docalert-card ${!alert.isRead ? 'unread' : ''} ${alert.severity}`}
                                >
                                    <div className="docalert-card-content">
                                        {getIcon(alert.severity)}
                                        <div className="docalert-card-main">
                                            <div className="docalert-card-header">
                                                <div className="docalert-card-title-group">
                                                    <h3 className="docalert-card-title">
                                                        {`${alert.severity.toUpperCase()}: ${alert.vital_type.replace(/_/g, ' ')}`}
                                                    </h3>
                                                    <p className="docalert-card-patient">
                                                        <Users size={16} />
                                                        {alert.patient_id}
                                                    </p>
                                                </div>
                                                <div className="docalert-card-actions">
                                                    <button
                                                        onClick={() => markAsRead(alert.alert_id, alert.patient_id)}
                                                        className="docalert-action-button docalert-read-button"
                                                        title="Mark as read"
                                                    >
                                                        <CheckCircle size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAlert(alert.alert_id)}
                                                        className="docalert-action-button docalert-delete-button"
                                                        title="Delete alert"
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
        </div>
    );
};

export default DocAlert;
