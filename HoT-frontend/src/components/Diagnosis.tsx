import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Diagnosis.css';
import { 
  Heart, 
  Thermometer,
  Activity,
  Wind,
  Droplets,
  Cookie,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  AlertTriangle,
  X,
  Download,
  Calendar,
  ZoomIn,
  ZoomOut,
  Bell
} from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Area, ComposedChart } from 'recharts';

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
    event?: string;
  }>;
  historicalComparison?: {
    lastWeek: number;
    lastMonth: number;
  };
}

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  suggestedAction?: string;
  vitalId: string;
}

const Diagnosis = () => {
  const [selectedVital, setSelectedVital] = useState<VitalSign | null>(null);
  const [timeRange, setTimeRange] = useState('1W');
  const [comparisonMode, setComparisonMode] = useState<'none' | 'target' | 'historical'>('none');
  const [showAlerts, setShowAlerts] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(1);

  const generateData = (baseValue: number, range: number) => {
    return Array.from({ length: 24 }, (_, i) => ({
      time: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      value: baseValue + Math.sin(i / 4) * range + (Math.random() - 0.5) * range * 0.5,
      event: i % 8 === 0 ? 'Measurement taken' : undefined
    }));
  };

  const [vitalSigns] = useState<VitalSign[]>([
    {
      id: 'heartRate',
      name: 'Heart Rate',
      value: 75,
      unit: 'bpm',
      status: 'normal',
      trend: 'stable',
      normal_range: { min: 60, max: 100 },
      target: 70,
      timestamp: new Date().toISOString(),
      data: generateData(75, 15),
      historicalComparison: {
        lastWeek: 72,
        lastMonth: 74
      }
    },
    {
      id: 'temperature',
      name: 'Temperature',
      value: 37.2,
      unit: '°C',
      status: 'normal',
      trend: 'stable',
      normal_range: { min: 36.5, max: 37.5 },
      target: 37.0,
      timestamp: new Date().toISOString(),
      data: generateData(37, 0.5),
      historicalComparison: {
        lastWeek: 37.1,
        lastMonth: 37.0
      }
    },
    {
      id: 'oxygenSaturation',
      name: 'Oxygen Saturation',
      value: 98,
      unit: '%',
      status: 'normal',
      trend: 'stable',
      normal_range: { min: 95, max: 100 },
      target: 98,
      timestamp: new Date().toISOString(),
      data: generateData(97, 3),
      historicalComparison: {
        lastWeek: 97,
        lastMonth: 98
      }
    },
    {
      id: 'respiratoryRate',
      name: 'Respiratory Rate',
      value: 16,
      unit: 'bpm',
      status: 'normal',
      trend: 'stable',
      normal_range: { min: 12, max: 20 },
      target: 16,
      timestamp: new Date().toISOString(),
      data: generateData(16, 4),
      historicalComparison: {
        lastWeek: 15,
        lastMonth: 16
      }
    },
    {
      id: 'bloodPressure',
      name: 'Blood Pressure',
      value: 120,
      unit: 'mmHg',
      status: 'warning',
      trend: 'up',
      normal_range: { min: 90, max: 120 },
      target: 115,
      timestamp: new Date().toISOString(),
      data: generateData(115, 15),
      historicalComparison: {
        lastWeek: 118,
        lastMonth: 115
      }
    },
    {
      id: 'bloodGlucose',
      name: 'Blood Glucose',
      value: 95,
      unit: 'mg/dL',
      status: 'normal',
      trend: 'stable',
      normal_range: { min: 70, max: 140 },
      target: 100,
      timestamp: new Date().toISOString(),
      data: generateData(95, 20),
      historicalComparison: {
        lastWeek: 92,
        lastMonth: 94
      }
    }
  ]);

  const [alerts] = useState<Alert[]>([
    {
      id: 'alert1',
      type: 'warning',
      title: 'Elevated Blood Glucose',
      message: 'Blood Glucose levels consistently high post-meal over the past 3 days.',
      timestamp: new Date().toISOString(),
      suggestedAction: 'Schedule consultation with your endocrinologist',
      vitalId: 'bloodGlucose'
    },
    {
      id: 'alert2',
      type: 'critical',
      title: 'Low Oxygen Saturation',
      message: 'Oxygen Saturation dropped below 90% at 2:00 AM.',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      suggestedAction: 'Immediate medical attention recommended',
      vitalId: 'oxygenSaturation'
    }
  ]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel(prev => direction === 'in' ? prev * 1.2 : prev / 1.2);
  };

  const handleDownload = (format: 'csv' | 'pdf') => {
    console.log(`Downloading data in ${format} format`);
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
    return icons[name as keyof typeof icons];
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="diagnosis-tooltip">
          <p className="diagnosis-tooltip-label">{new Date(label).toLocaleString()}</p>
          <p className="diagnosis-tooltip-value">
            {`${payload[0].value.toFixed(2)} ${selectedVital?.unit}`}
          </p>
          {payload[0].payload.event && (
            <p className="diagnosis-tooltip-event">{payload[0].payload.event}</p>
          )}
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
            
            <button 
              className="diagnosis-action-btn" 
              onClick={() => handleDownload('csv')}
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>

        {showAlerts && alerts.length > 0 && (
          <div className="diagnosis-alerts">
            <h2>Alerts & Insights</h2>
            <div className="diagnosis-alerts-grid">
              {alerts.map(alert => (
                <div key={alert.id} className={`diagnosis-alert-card ${alert.type}`}>
                  <div className="diagnosis-alert-header">
                    <AlertTriangle size={20} />
                    <h3>{alert.title}</h3>
                  </div>
                  <p>{alert.message}</p>
                  {alert.suggestedAction && (
                    <div className="diagnosis-suggested-action">
                      <strong>Suggested Action:</strong>
                      <p>{alert.suggestedAction}</p>
                    </div>
                  )}
                  <div className="diagnosis-alert-footer">
                    <span className="diagnosis-timestamp">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                    <button 
                      className="diagnosis-view-details"
                      onClick={() => {
                        const relatedVital = vitalSigns.find(v => v.id === alert.vitalId);
                        setSelectedVital(relatedVital || null);
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
              {['1D', '1W', '1M', '3M', 'Custom'].map(range => (
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
            {vitalSigns.map(vital => (
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
                    <span className="diagnosis-vital-value">{vital.value}</span>
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
                      {selectedVital.value} {selectedVital.unit}
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
                  
                  {selectedVital.historicalComparison && (
                    <div className="diagnosis-stat-card">
                      <h4>Historical Comparison</h4>
                      <div className="diagnosis-comparison-stats">
                        <div>
                          <span>Last Week:</span>
                          <span className="diagnosis-comparison-value">
                            {selectedVital.historicalComparison.lastWeek} {selectedVital.unit}
                          </span>
                        </div>
                        <div>
                          <span>Last Month:</span>
                          <span className="diagnosis-comparison-value">
                            {selectedVital.historicalComparison.lastMonth} {selectedVital.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="diagnosis-stat-card">
                    <h4>Target Value</h4>
                    <div className="diagnosis-stat-value">
                      {selectedVital.target} {selectedVital.unit}
                    </div>
                    <div className="diagnosis-target-difference">
                      {selectedVital.value > selectedVital.target! ? 'Above' : 'Below'} target by{' '}
                      {Math.abs(selectedVital.value - selectedVital.target!).toFixed(1)} {selectedVital.unit}
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

                <div className="diagnosis-downloads">
                  <button 
                    className="diagnosis-download-btn" 
                    onClick={() => handleDownload('csv')}
                  >
                    <Download size={16} />
                    Export as CSV
                  </button>
                  <button 
                    className="diagnosis-download-btn" 
                    onClick={() => handleDownload('pdf')}
                  >
                    <Download size={16} />
                    Export as PDF
                  </button>
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