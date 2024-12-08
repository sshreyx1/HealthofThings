import React, { useState, useEffect } from 'react';
import DocSidebar from './DocSidebar';
import { 
    Users, AlertTriangle, CheckCircle, Activity,
    Clock, ChevronRight, AlertCircle, Hospital,
    Building2, Home, Ambulance, Stethoscope,
    ArrowUp, ArrowDown, Bell
} from 'lucide-react';
import './DocDashboard.css';

const DocDashboard = () => {
    const [patientStats, setPatientStats] = useState({
        icu: 0,
        emergency: 0,
        hospital: 0,
        remote: 0
    });
    const [alertSummary, setAlertSummary] = useState({
        critical: 0,
        warning: 0,
        total: 0,
        trend: '+5',
        recentAlerts: 0,
        acknowledgedAlerts: 0
    });
    const [criticalAlerts, setCriticalAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPatientStats();
        fetchAlertStats();
        
        const ws = new WebSocket('ws://localhost:8080/ws/alerts');
        ws.onmessage = (event) => {
            const alerts = JSON.parse(event.data);
            processAlerts(alerts);
        };

        return () => ws.close();
    }, []);

    const fetchPatientStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/patients');
            if (!response.ok) throw new Error('Failed to fetch patients');
            const patients = await response.json();
            
            const stats = patients.reduce((acc, patient) => {
                switch (patient.monitoring_type) {
                    case 'icu':
                        acc.icu++;
                        break;
                    case 'emergency':
                        acc.emergency++;
                        break;
                    case 'hospital':
                        acc.hospital++;
                        break;
                    case 'remote':
                        acc.remote++;
                        break;
                }
                return acc;
            }, { icu: 0, emergency: 0, hospital: 0, remote: 0 });

            setPatientStats(stats);
        } catch (error) {
            console.error('Error fetching patient stats:', error);
        }
    };

    const fetchAlertStats = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/alerts');
            if (!response.ok) throw new Error('Failed to fetch alerts');
            const alerts = await response.json();
            processAlerts(alerts);
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    const processAlerts = (alerts) => {
        // Calculate alert summary
        const summary = {
            critical: alerts.filter(a => a.severity === 'critical').length,
            warning: alerts.filter(a => a.severity === 'warning').length,
            total: alerts.length,
            trend: '+1', // This would be calculated based on historical data
            recentAlerts: alerts.filter(a => {
                const alertTime = new Date(a.timestamp);
                return (new Date() - alertTime) < (1000 * 60 * 60); // Last hour
            }).length,
            acknowledgedAlerts: alerts.filter(a => a.status === 'acknowledged').length
        };

        setAlertSummary(summary);

        // Get critical alerts for display
        const criticalAlerts = alerts
            .filter(alert => alert.severity === 'critical')
            .map(alert => ({
                id: alert.alert_id,
                patient: alert.patient_id,
                message: alert.message,
                time: new Date(alert.timestamp).toLocaleTimeString(),
                type: alert.vital_type
            }))
            .slice(0, 5);

        setCriticalAlerts(criticalAlerts);
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="doc-dashboard-page">
            <DocSidebar />
            <div className="doc-dashboard-content">
                {/* Header */}
                <div className="dashboard-header">
                    <div className="header-top">
                        <div className="header-title-group">
                            <h1>Dashboard</h1>
                            <div className="last-updated">
                                <Clock size={16} />
                                Last updated: {new Date().toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Patient Monitoring Stats */}
                <div className="stats-grid">
                    <div className="dashboard-card">
                        <div className="card-content">
                            <div className="stat-label">ICU</div>
                            <div className="stat-value text-red-500">{patientStats.icu}</div>
                            <div className="stat-detail">
                                <Hospital size={16} className="text-red-500" />
                                Critical Care Unit
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-content">
                            <div className="stat-label">A&E</div>
                            <div className="stat-value text-orange-500">{patientStats.emergency}</div>
                            <div className="stat-detail">
                                <Ambulance size={16} className="text-orange-500" />
                                Emergency Department
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-content">
                            <div className="stat-label">Hospital Ward</div>
                            <div className="stat-value text-blue-500">{patientStats.hospital}</div>
                            <div className="stat-detail">
                                <Building2 size={16} className="text-blue-500" />
                                General Ward
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-card">
                        <div className="card-content">
                            <div className="stat-label">Remote Monitoring</div>
                            <div className="stat-value text-green-500">{patientStats.remote}</div>
                            <div className="stat-detail">
                                <Home size={16} className="text-green-500" />
                                Home Care
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alert Summary Banner */}
                <div className="alert-summary-container">
                    <div className="alert-summary-header">
                        <h2><Bell size={20} /> Alert Overview</h2>
                        <span className="trend-indicator">
                            <ArrowUp size={16} />
                            {alertSummary.trend} from yesterday
                        </span>
                    </div>
                    <div className="alert-summary-banner">
                        <div className="summary-item critical">
                            <AlertTriangle size={20} />
                            <div className="summary-content">
                                <span className="summary-value">{alertSummary.critical}</span>
                                <span className="summary-label">Critical Alerts</span>
                            </div>
                        </div>
                        <div className="summary-item warning">
                            <AlertCircle size={20} />
                            <div className="summary-content">
                                <span className="summary-value">{alertSummary.warning}</span>
                                <span className="summary-label">Warning Alerts</span>
                            </div>
                        </div>
                        <div className="summary-item recent">
                            <Clock size={20} />
                            <div className="summary-content">
                                <span className="summary-value">{alertSummary.recentAlerts}</span>
                                <span className="summary-label">Last Hour</span>
                            </div>
                        </div>
                        <div className="summary-item acknowledged">
                            <CheckCircle size={20} />
                            <div className="summary-content">
                                <span className="summary-value">{alertSummary.acknowledgedAlerts}</span>
                                <span className="summary-label">Acknowledged</span>
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
                                <div className="stat-number">{criticalAlerts.length} active</div>
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="alerts-list">
                                {criticalAlerts.map((alert) => (
                                    <div key={alert.id} className="alert-item severity-critical">
                                        <AlertTriangle className="alert-icon" />
                                        <div className="alert-content">
                                            <h4>{alert.patient}</h4>
                                            <p>{alert.message}</p>
                                            <div className="alert-footer">
                                                <div className="alert-time">
                                                    <Clock size={14} />
                                                    {alert.time}
                                                </div>
                                                <span className="alert-type">{alert.type}</span>
                                            </div>
                                        </div>
                                        <button className="alert-action">
                                            View Details <ChevronRight size={16} />
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
                                <Clock />
                                Today's Schedule
                            </div>
                        </div>
                        <div className="card-content">
                            <div className="appointments-list">
                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <Clock size={14} />
                                        09:00 AM (30min)
                                    </div>
                                    <div className="appointment-header">
                                        <h4>Jane Smith</h4>
                                        <span className="appointment-status status-confirmed">confirmed</span>
                                    </div>
                                    <p className="appointment-notes">Post-surgery check</p>
                                </div>

                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <Clock size={14} />
                                        10:30 AM (45min)
                                    </div>
                                    <div className="appointment-header">
                                        <h4>Michael Brown</h4>
                                        <span className="appointment-status status-pending">pending</span>
                                    </div>
                                    <p className="appointment-notes">First time visit - Chest pain</p>
                                </div>

                                <div className="appointment-item">
                                    <div className="appointment-time">
                                        <Clock size={14} />
                                        02:00 PM (60min)
                                    </div>
                                    <div className="appointment-header">
                                        <h4>Sarah Johnson</h4>
                                        <span className="appointment-status status-confirmed">confirmed</span>
                                    </div>
                                    <p className="appointment-notes">Follow-up consultation</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocDashboard;