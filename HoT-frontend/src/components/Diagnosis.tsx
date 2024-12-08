import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './Diagnosis.css';
import {
    Heart, Thermometer, Activity, Wind,
    Droplets, Cookie, Clock, TrendingUp,
    TrendingDown, Minus, ChevronRight, AlertTriangle,
    X, Bell
} from 'lucide-react';
import {
    LineChart, Line, ResponsiveContainer, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, Area, ComposedChart
} from 'recharts';

const VITAL_THRESHOLDS = {
  heartRate: {
      min: 60,    // Below 60 is bradycardia
      max: 100,   // Above 100 is tachycardia
      warning_buffer: 5,  // Warning if within 5 of min/max
      unit: 'bpm',
      target: 80
  },
  temperature: {
      min: 36.1,  // Below 36.1°C is hypothermia
      max: 37.8,  // Above 37.8°C is fever
      warning_buffer: 0.2,  // Warning if within 0.2 of min/max
      unit: '°C',
      target: 36.8
  },
  oxygenSaturation: {
      min: 95,    // Below 95% requires attention
      max: 100,   // Cannot exceed 100%
      warning_buffer: 2,  // Warning if within 2 of min
      unit: '%',
      target: 98
  },
  respiratoryRate: {
      min: 12,    // Below 12 breaths/min is concerning
      max: 20,    // Above 20 breaths/min is concerning
      warning_buffer: 2,  // Warning if within 2 of min/max
      unit: 'bpm',
      target: 16
  },
  bloodPressureSystolic: {
      min: 90,    // Below 90 is hypotension
      max: 130,   // Above 130 is hypertension
      warning_buffer: 10,  // Warning if within 10 of min/max
      unit: 'mmHg',
      target: 115
  },
  bloodGlucose: {
      min: 70,    // Below 70 mg/dL is hypoglycemia
      max: 140,   // Above 140 mg/dL is hyperglycemia
      warning_buffer: 10,  // Warning if within 10 of min/max
      unit: 'mg/dL',
      target: 100
  }
};
interface VitalSign {
    id: string;
    name: string;
    value: number;
    unit: string;
    status: 'normal' | 'warning' | 'critical';
    trend: 'up' | 'down' | 'stable';
    normal_range: { min: number; max: number };
    target?: number;
    timestamp: string;
    data: Array<{
        time: string;
        value: number;
    }>;
}

interface Alert {
    alert_id: string;
    severity: 'warning' | 'critical';
    message: string;
    timestamp: string;
    vital_type: string;
}

const Diagnosis: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [vitals, setVitals] = useState<any>(null);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const patientId = localStorage.getItem('userId');

    const [selectedVital, setSelectedVital] = useState<VitalSign | null>(null);
    const [timeRange, setTimeRange] = useState('1D');
    const [comparisonMode, setComparisonMode] = useState<'none' | 'target' | 'historical'>('none');
    const [showAlerts, setShowAlerts] = useState(true);
    const [historicalData, setHistoricalData] = useState<Record<string, Array<{ time: string; value: number }>>>({});

    // Generate 30-minute time series data
    const generateTimeSeriesData = (baseValue: number, range: number) => {
        const now = new Date();
        return Array.from({ length: 30 }, (_, i) => ({
            time: new Date(now.getTime() - (29 - i) * 60000).toISOString(),
            value: baseValue + Math.sin(i / 5) * range + (Math.random() - 0.5) * range * 0.5,
        }));
    };

    useEffect(() => {
      if (!patientId) {
          navigate('/login');
          return;
      }
  
      // Initialize historical data for each vital sign
      const initializeHistoricalData = (vitalValue: number, vitalId: string) => {
          const now = new Date();
          const initialData = Array.from({ length: 30 }, (_, i) => ({
              time: new Date(now.getTime() - (29 - i) * 60000).toISOString(),
              value: vitalValue
          }));
          return initialData;
      };
  
      const fetchData = async () => {
          try {
              // Fetch initial vitals
              const vitalsResponse = await fetch(`http://localhost:8080/api/vitals/${patientId}`);
              if (!vitalsResponse.ok) throw new Error('Failed to fetch vitals');
              const vitalsData = await vitalsResponse.json();
              setVitals(vitalsData);
  
              // Initialize historical data
              const initialHistoricalData: Record<string, Array<{ time: string; value: number }>> = {
                  heartRate: initializeHistoricalData(vitalsData.vital_signs.heartbeat, 'heartRate'),
                  temperature: initializeHistoricalData(vitalsData.vital_signs.temperature, 'temperature'),
                  oxygenSaturation: initializeHistoricalData(vitalsData.vital_signs.oxygen_saturation, 'oxygenSaturation'),
                  respiratoryRate: initializeHistoricalData(vitalsData.vital_signs.respiration_rate, 'respiratoryRate'),
                  bloodPressure: initializeHistoricalData(vitalsData.vital_signs.blood_pressure_systolic, 'bloodPressure'),
                  bloodGlucose: initializeHistoricalData(vitalsData.vital_signs.blood_glucose, 'bloodGlucose')
              };
              setHistoricalData(initialHistoricalData);
  
              // Fetch alerts (limit to 4)
              const alertsResponse = await fetch(`http://localhost:8080/api/alerts/${patientId}`);
              if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
              const alertsData = await alertsResponse.json();
              setAlerts(alertsData.slice(0, 4)); // Limit to 4 alerts
  
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
              const newData = JSON.parse(event.data);
              setVitals(newData);
  
              // Update historical data
              setHistoricalData(prevData => {
                  const now = new Date().toISOString();
                  const newHistoricalData = { ...prevData };
  
                  // Update each vital sign's historical data
                  Object.entries(newData.vital_signs).forEach(([key, value]) => {
                      const vitalId = key.replace(/_/g, '') as keyof typeof newHistoricalData;
                      if (newHistoricalData[vitalId]) {
                          // Remove oldest data point and add new one
                          newHistoricalData[vitalId] = [
                              ...newHistoricalData[vitalId].slice(1),
                              { time: now, value: value as number }
                          ];
                      }
                  });
  
                  return newHistoricalData;
              });
          } catch (err) {
              console.error('WebSocket error:', err);
          }
      };
  
      return () => ws.close();
  }, [patientId, navigate]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!vitals) return <div>No vital signs data available</div>;

    const getVitalStatus = (value: number, min: number, max: number): 'normal' | 'warning' | 'critical' => {
        if (value <= min || value >= max) return 'critical';
        if (value <= min + 5 || value >= max - 5) return 'warning';
        return 'normal';
    };

    const getTrend = (value: number, min: number, max: number): 'up' | 'down' | 'stable' => {
        const midpoint = (max + min) / 2;
        if (value > midpoint + 10) return 'up';
        if (value < midpoint - 10) return 'down';
        return 'stable';
    };

    const getVitalIcon = (name: string) => {
        const icons = {
            'Heart Rate': <Heart size={24} />,
            'Temperature': <Thermometer size={24} />,
            'Oxygen Saturation': <Activity size={24} />,
            'Respiratory Rate': <Wind size={24} />,
            'Blood Pressure': <Droplets size={24} />,
            'Blood Glucose': <Cookie size={24} />
        };
        return icons[name as keyof typeof icons] || <Activity size={24} />;
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'up':
                return <TrendingUp size={16} className="trend-icon up" />;
            case 'down':
                return <TrendingDown size={16} className="trend-icon down" />;
            default:
                return <Minus size={16} className="trend-icon stable" />;
        }
    };

    // Transform vitals data for display
    const vitalSigns: VitalSign[] = [
        {
            id: 'heartRate',
            name: 'Heart Rate',
            value: vitals.vital_signs.heartbeat,
            unit: 'bpm',
            status: getVitalStatus(vitals.vital_signs.heartbeat, 60, 100),
            trend: getTrend(vitals.vital_signs.heartbeat, 60, 100),
            normal_range: { min: 60, max: 100 },
            target: 75,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.heartbeat, 10)
        },
        {
            id: 'temperature',
            name: 'Temperature',
            value: vitals.vital_signs.temperature,
            unit: '°C',
            status: getVitalStatus(vitals.vital_signs.temperature, 36.5, 37.5),
            trend: getTrend(vitals.vital_signs.temperature, 36.5, 37.5),
            normal_range: { min: 36.5, max: 37.5 },
            target: 37,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.temperature, 0.5)
        },
        {
            id: 'oxygenSaturation',
            name: 'Oxygen Saturation',
            value: vitals.vital_signs.oxygen_saturation,
            unit: '%',
            status: getVitalStatus(vitals.vital_signs.oxygen_saturation, 95, 100),
            trend: getTrend(vitals.vital_signs.oxygen_saturation, 95, 100),
            normal_range: { min: 95, max: 100 },
            target: 98,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.oxygen_saturation, 2)
        },
        {
            id: 'respiratoryRate',
            name: 'Respiratory Rate',
            value: vitals.vital_signs.respiration_rate,
            unit: 'bpm',
            status: getVitalStatus(vitals.vital_signs.respiration_rate, 12, 20),
            trend: getTrend(vitals.vital_signs.respiration_rate, 12, 20),
            normal_range: { min: 12, max: 20 },
            target: 16,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.respiration_rate, 4)
        },
        {
            id: 'bloodPressure',
            name: 'Blood Pressure',
            value: vitals.vital_signs.blood_pressure_systolic,
            unit: 'mmHg',
            status: getVitalStatus(vitals.vital_signs.blood_pressure_systolic, 90, 120),
            trend: getTrend(vitals.vital_signs.blood_pressure_systolic, 90, 120),
            normal_range: { min: 90, max: 120 },
            target: 115,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.blood_pressure_systolic, 15)
        },
        {
            id: 'bloodGlucose',
            name: 'Blood Glucose',
            value: vitals.vital_signs.blood_glucose,
            unit: 'mg/dL',
            status: getVitalStatus(vitals.vital_signs.blood_glucose, 70, 140),
            trend: getTrend(vitals.vital_signs.blood_glucose, 70, 140),
            normal_range: { min: 70, max: 140 },
            target: 100,
            timestamp: vitals.timestamp,
            data: generateTimeSeriesData(vitals.vital_signs.blood_glucose, 20)
        }
    ];

    const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="diagnosis-tooltip">
                    <p className="diagnosis-tooltip-label">{new Date(label).toLocaleTimeString()}</p>
                    <p className="diagnosis-tooltip-value">
                        {`${payload[0].value.toFixed(2)} ${selectedVital?.unit}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="diagnosis-container">
            <Sidebar />
            <div className="diagnosis-main">
                <div className="diagnosis-header">
                    <div className="diagnosis-header-left">
                        <h1>Vital Signs & Insights</h1>
                    </div>
                    
                    <div className="diagnosis-actions">
                        <span className="diagnosis-timestamp">
                            <Clock size={14} />
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>

                        <button
                            className="diagnosis-action-btn"
                            onClick={() => setShowAlerts(!showAlerts)}
                            style={{ position: 'relative' }}
                        >
                            <Bell size={20} />
                            {alerts.length > 0 && (
                                <span className="diagnosis-alert-badge">{alerts.length}</span>
                            )}
                        </button>
                    </div>
                </div>

                {showAlerts && alerts.length > 0 && (
                    <div className="diagnosis-alerts">
                        <h2>Alerts & Insights</h2>
                        <div className="diagnosis-alerts-grid">
                            {alerts.map((alert) => (
                                <div key={alert.alert_id} className={`diagnosis-alert-card ${alert.severity}`}>
                                    <div className="diagnosis-alert-header">
                                        <AlertTriangle size={20} />
                                        <h3>{alert.message}</h3>
                                    </div>
                                    <div className="diagnosis-alert-footer">
                                        <span className="diagnosis-timestamp">
                                            {new Date(alert.timestamp).toLocaleTimeString()}
                                        </span>
                                        <button
                                            className="diagnosis-view-details"
                                            onClick={() => {
                                                const relatedVital = vitalSigns.find(v => v.id === alert.vital_type);
                                                if (relatedVital) {
                                                    setSelectedVital(relatedVital);
                                                }
                                            }}
                                        >
                                            View Details
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="diagnosis-content">
                    <div className="diagnosis-controls">
                        <div className="diagnosis-time-range">
                            {['30M', '1H', '1D', '1W', 'Custom'].map(range => (
                                <button
                                    key={range}
                                    className={`diagnosis-time-btn ${timeRange === range ? 'active' : ''}`}
                                    onClick={() => setTimeRange(range)}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>

                        <div className="diagnosis-comparison">
                            <select
                                value={comparisonMode}
                                onChange={(e) => setComparisonMode(e.target.value as 'none' | 'target' | 'historical')}
                            >
                                <option value="none">No Comparison</option>
                                <option value="target">Compare to Target</option>
                                <option value="historical">Compare to Historical</option>
                            </select>
                        </div>
                    </div>

                    <div className="diagnosis-vitals-grid">
                        {vitalSigns.map((vital) => (
                            <div
                                key={vital.id}
                                className={`diagnosis-vital-card ${vital.status} ${
                                    selectedVital?.id === vital.id ? 'selected' : ''
                                }`}
                                onClick={() => setSelectedVital(vital)}
                            >
                                <div className="diagnosis-vital-icon">
                                    {getVitalIcon(vital.name)}
                                </div>
                                <div className="diagnosis-vital-info">
                                    <div className="diagnosis-vital-header">
                                        <h3>{vital.name}</h3>
                                        {getTrendIcon(vital.trend)}
                                    </div>
                                    <div className="diagnosis-vital-reading">
                                        <span className="diagnosis-vital-value">
                                            {vital.value.toFixed(1)}
                                        </span>
                                        <span className="diagnosis-vital-unit">{vital.unit}</span>
                                    </div>
                                    <div className="diagnosis-vital-chart">
                                        <ResponsiveContainer width="100%" height={40}>
                                            <LineChart data={vital.data}>
                                                <Line
                                                    type="monotone"
                                                    dataKey="value"
                                                    stroke="#3b82f6"
                                                    dot={false}
                                                    strokeWidth={1.5}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="diagnosis-vital-range">
                                        Normal range: {vital.normal_range.min}-{vital.normal_range.max} {vital.unit}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedVital && (
                        <div className="diagnosis-detail-card">
                            <div className="diagnosis-detail-header">
                                <div className="diagnosis-detail-title">
                                    {getVitalIcon(selectedVital.name)}
                                    <h2>{selectedVital.name} Detailed View</h2>
                                </div>
                                <div className="diagnosis-detail-actions">
                                    <button
                                        className="diagnosis-action-btn"
                                        onClick={() => setSelectedVital(null)}
                                    >
                                        <X size={20} />
                                    </button>
                                </div>
                            </div>

                            <div className="diagnosis-detail-content">
                                <div className="diagnosis-detail-chart">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <ComposedChart data={selectedVital.data} className="diagnosis-chart">
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="time"
                                                tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                                            />
                                            <YAxis domain={['auto', 'auto']} />
                                            <Tooltip content={<CustomTooltip />} />
                                            
                                            <Area
                                                dataKey="value"
                                                fill="#3b82f6"
                                                fillOpacity={0.1}
                                                stroke="none"
                                            />
                                            
                                            <ReferenceLine
                                                y={selectedVital.normal_range.min}
                                                stroke="#666"
                                                strokeDasharray="3 3"
                                                label="Min Normal"
                                            />
                                            <ReferenceLine
                                                y={selectedVital.normal_range.max}
                                                stroke="#666"
                                                strokeDasharray="3 3"
                                                label="Max Normal"
                                            />
                                            
                                            <Line
                                                type="monotone"
                                                dataKey="value"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                dot={false}
                                                activeDot={{ r: 8 }}
                                            />
                                            
                                            {comparisonMode === 'target' && selectedVital.target && (
                                                <ReferenceLine
                                                    y={selectedVital.target}
                                                    stroke="#22c55e"
                                                    strokeDasharray="3 3"
                                                    label={{ value: 'Target', position: 'right' }}
                                                />
                                            )}
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="diagnosis-stats-grid">
                                    <div className="diagnosis-stat-card">
                                        <h4>Current Reading</h4>
                                        <div className="diagnosis-stat-value">
                                            {selectedVital.value.toFixed(1)} {selectedVital.unit}
                                        </div>
                                        <div className={`diagnosis-stat-status ${selectedVital.status}`}>
                                            {selectedVital.status.toUpperCase()}
                                        </div>
                                    </div>

                                    <div className="diagnosis-stat-card">
                                        <h4>Normal Range</h4>
                                        <div className="diagnosis-stat-value">
                                            {selectedVital.normal_range.min} - {selectedVital.normal_range.max} {selectedVital.unit}
                                        </div>
                                    </div>

                                    <div className="diagnosis-stat-card">
                                        <h4>Target Value</h4>
                                        <div className="diagnosis-stat-value">
                                            {selectedVital.target} {selectedVital.unit}
                                        </div>
                                        <div className="diagnosis-target-difference">
                                            {selectedVital.value > selectedVital.target ? 'Above' : 'Below'} target by{' '}
                                            {Math.abs(selectedVital.value - selectedVital.target).toFixed(1)} {selectedVital.unit}
                                        </div>
                                    </div>

                                    <div className="diagnosis-stat-card">
                                        <h4>Trend Analysis</h4>
                                        <div className="diagnosis-trend-info">
                                            <div className={`diagnosis-trend-indicator ${selectedVital.trend}`}>
                                                {getTrendIcon(selectedVital.trend)}
                                                <span className="diagnosis-trend-text">
                                                    {selectedVital.trend.charAt(0).toUpperCase() + selectedVital.trend.slice(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="diagnosis-stat-card">
                                        <h4>Last Updated</h4>
                                        <div className="diagnosis-timestamp-info">
                                            <Clock size={16} />
                                            <span>{new Date(selectedVital.timestamp).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Diagnosis;