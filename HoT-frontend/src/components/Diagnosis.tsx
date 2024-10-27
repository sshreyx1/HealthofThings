import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Diagnosis.css';
import { 
  Heart, 
  Thermometer,
  Activity,
  Droplet,
  AlertTriangle,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Bell,
  Filter,
  Waves,
  X
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

// Helper function for random data generation
const generateRandomData = (count: number, min: number, max: number) => {
  return Array.from({ length: count }, () => ({
    time: new Date().toLocaleTimeString(),
    value: Math.floor(Math.random() * (max - min + 1) + min),
  }));
};

interface VitalSign {
  id: string;
  name: string;
  value: number;
  unit: string;
  normal_range: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  timestamp: string;
  data: any[];
}

interface HealthAlert {
  id: string;
  type: 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

const Diagnosis: React.FC = () => {
  const mockVitalSigns: VitalSign[] = [
    {
      id: "1",
      name: "Heart Rate",
      value: 75,
      unit: "bpm",
      normal_range: "60-100",
      status: "normal",
      trend: "stable",
      timestamp: new Date().toISOString(),
      data: generateRandomData(10, 60, 100)
    },
    {
      id: "2",
      name: "Blood Pressure",
      value: 128,
      unit: "mmHg",
      normal_range: "90-140",
      status: "normal",
      trend: "up",
      timestamp: new Date().toISOString(),
      data: generateRandomData(10, 80, 140)
    },
    {
      id: "3",
      name: "Temperature",
      value: 37.2,
      unit: "°C",
      normal_range: "36.5-37.5",
      status: "normal",
      trend: "stable",
      timestamp: new Date().toISOString(),
      data: generateRandomData(10, 36, 38)
    },
    {
      id: "4",
      name: "Oxygen Saturation",
      value: 96,
      unit: "%",
      normal_range: "95-100",
      status: "normal",
      trend: "stable",
      timestamp: new Date().toISOString(),
      data: generateRandomData(10, 95, 100)
    },
    {
      id: "5",
      name: "ECG",
      value: 98,
      unit: "ms",
      normal_range: "80-120",
      status: "normal",
      trend: "stable",
      timestamp: new Date().toISOString(),
      data: generateRandomData(100, -1, 1)
    }
  ];

  const mockAlerts: HealthAlert[] = [
    {
      id: "1",
      type: "critical",
      message: "Heart rate elevated above normal range",
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: "2",
      type: "warning",
      message: "Blood pressure trending higher than usual",
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: "3",
      type: "warning",
      message: "Previous: Oxygen levels fluctuating",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: true
    }
  ];

  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>(mockVitalSigns);
  const [alerts, setAlerts] = useState<HealthAlert[]>(mockAlerts);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [selectedVital, setSelectedVital] = useState<VitalSign | null>(null);

  useEffect(() => {
    const hasUnacknowledgedAlerts = alerts.some(alert => !alert.acknowledged);
    if (hasUnacknowledgedAlerts) {
      document.title = '🚨 New Alerts - Patient Diagnosis';
    } else {
      document.title = 'Patient Diagnosis';
    }
  }, [alerts]);

  const getVitalIcon = (name: string) => {
    switch (name) {
      case "Heart Rate":
        return <Heart size={20} />;
      case "Blood Pressure":
        return <Activity size={20} />;
      case "Temperature":
        return <Thermometer size={20} />;
      case "Oxygen Saturation":
        return <Droplet size={20} />;
      case "ECG":
        return <Waves size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp size={16} className="trend-icon up" />;
      case "down":
        return <TrendingDown size={16} className="trend-icon down" />;
      default:
        return <Minus size={16} className="trend-icon stable" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const refreshData = () => {
    setVitalSigns(vitalSigns.map(vital => ({
      ...vital,
      data: vital.name === "ECG" ? 
        generateRandomData(100, -1, 1) : 
        generateRandomData(10, 
          parseInt(vital.normal_range.split('-')[0]), 
          parseInt(vital.normal_range.split('-')[1])
        )
    })));
  };

  return (
    <div className="diagnosis-page">
      <Sidebar />
      <div className="diagnosis-content">
        <div className="diagnosis-header-container">
          <h1>Patient Diagnosis</h1>
          
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="alerts-banner">
              <AlertTriangle size={20} />
              <span>{alerts.filter(a => !a.acknowledged).length} Active Alerts Require Attention</span>
            </div>
          )}

          <div className="diagnosis-controls">
            <div className="time-range-filter">
              <Clock size={20} />
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
            </div>
            <button className="refresh-button" onClick={refreshData}>
              <RefreshCw size={20} />
              Refresh Data
            </button>
          </div>
        </div>

        <div className="diagnosis-grid">
          {alerts.filter(a => !a.acknowledged).length > 0 && (
            <div className="active-alerts-container">
              <div className="section-header">
                <h2>Active Alerts</h2>
                <span className="alert-count">
                  {alerts.filter(a => !a.acknowledged).length} unacknowledged
                </span>
              </div>
              <div className="alerts-list">
                {alerts
                  .filter(alert => !alert.acknowledged)
                  .map(alert => (
                    <div key={alert.id} className={`alert-card ${alert.type}`}>
                      <div className="alert-icon">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="alert-content">
                        <p className="alert-message">{alert.message}</p>
                        <span className="alert-timestamp">{formatTimestamp(alert.timestamp)}</span>
                      </div>
                      <button 
                        className="acknowledge-button"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="vital-signs-container">
            <div className="section-header">
              <h2>Vital Signs</h2>
              <span className="last-updated">
                Last updated: {formatTimestamp(new Date().toISOString())}
              </span>
            </div>
            <div className="vital-signs-grid">
              {vitalSigns.map(vital => (
                <div 
                  key={vital.id} 
                  className={`vital-sign-card ${vital.status} ${selectedVital?.id === vital.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVital(vital)}
                >
                  <div className="vital-sign-header">
                    {getVitalIcon(vital.name)}
                    <h3>{vital.name}</h3>
                    {getTrendIcon(vital.trend)}
                  </div>
                  <div className="vital-sign-value">
                    <span className="value">{vital.value}</span>
                    <span className="unit">{vital.unit}</span>
                  </div>
                  <div className="vital-sign-chart">
                    <ResponsiveContainer width="100%" height={60}>
                      <LineChart data={vital.data}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2196f3" 
                          dot={false} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="vital-sign-footer">
                    <span className="normal-range">Normal: {vital.normal_range}</span>
                    <span className="timestamp">{formatTimestamp(vital.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedVital && (
            <div className="detailed-view-container">
              <div className="section-header">
                <h2>{selectedVital.name} Detailed View</h2>
                <button className="close-button" onClick={() => setSelectedVital(null)}>
                  <X size={20} />
                </button>
              </div>
              <div className="detailed-chart">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={selectedVital.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={selectedVital.name === "ECG" ? [-1.5, 1.5] : ['auto', 'auto']} />
                    <Tooltip />
                    <Line 
                      type={selectedVital.name === "ECG" ? "monotone" : "monotone"}
                      dataKey="value" 
                      stroke="#2196f3" 
                      dot={selectedVital.name !== "ECG"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {alerts.filter(a => a.acknowledged).length > 0 && (
            <div className="alerts-container">
              <div className="section-header">
                <h2>Previous Alerts</h2>
                <span className="alert-count acknowledged">
                  {alerts.filter(a => a.acknowledged).length} resolved
                </span>
              </div>
              <div className="alerts-list">
                {alerts
                  .filter(alert => alert.acknowledged)
                  .map(alert => (
                    <div key={alert.id} className={`alert-card ${alert.type} acknowledged`}>
                      <div className="alert-icon">
                        <AlertTriangle size={20} />
                      </div>
                      <div className="alert-content">
                        <p className="alert-message">{alert.message}</p>
                        <span className="alert-timestamp">{formatTimestamp(alert.timestamp)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Diagnosis;