import React, { useState, useEffect } from 'react';
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

interface VitalsData {
  heartRate: VitalSign;
  temperature: VitalSign;
  oxygenSaturation: VitalSign;
  respiratoryRate: VitalSign;
  bloodPressure: BloodPressure;
  bloodGlucose: VitalSign;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  remaining: number;
  total: number;
}

interface Appointment {
  id: number;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  type: 'virtual' | 'in-person';
  location: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface Alert {
  id: number;
  type: 'critical' | 'warning';
  message: string;
  timestamp: string;
}

interface Activity {
  id: number;
  type: 'test_result' | 'doctor_note';
  title: string;
  result?: string;
  status?: 'Normal' | 'Abnormal';
  description?: string;
  doctor?: string;
  date: string;
}

interface Task {
  id: number;
  title: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'completed';
}

interface PatientStats {
  total: number;
  critical: number;
  stable: number;
  monitoring: number;
  newAdmissions: number;
  pendingDischarge: number;
}

const PatientDashboard = () => {
  // Vital Signs Data
  const [vitals] = useState<VitalsData>({
    heartRate: { current: 75, min: 60, max: 100, unit: 'bpm' },
    temperature: { current: 37.2, min: 36.5, max: 37.5, unit: '°C' },
    oxygenSaturation: { current: 98, min: 95, max: 100, unit: '%' },
    respiratoryRate: { current: 16, min: 12, max: 20, unit: 'bpm' },
    bloodPressure: {
      current: { systolic: 128, diastolic: 85 },
      min: { systolic: 90, diastolic: 60 },
      max: { systolic: 130, diastolic: 90 },
      unit: 'mmHg'
    },
    bloodGlucose: { current: 95, min: 70, max: 140, unit: 'mg/dL' }
  });

  // Patient Statistics State
  const [patientStats, setPatientStats] = useState<PatientStats>({
    total: 25,
    critical: 3,
    stable: 18,
    monitoring: 4,
    newAdmissions: 2,
    pendingDischarge: 3
  });

  // Medications State
  const [medications] = useState<Medication[]>([
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
    },
    {
      id: 3,
      name: "Aspirin",
      dosage: "81mg",
      frequency: "Once daily",
      nextDose: "2024-11-16T08:00:00",
      remaining: 25,
      total: 30
    }
  ]);

  // Appointments State
  const [appointments] = useState<Appointment[]>([
    {
      id: 1,
      doctor: "Dr. Sarah Johnson",
      specialty: "Cardiologist",
      date: "2024-11-20",
      time: "10:00 AM",
      type: "in-person",
      location: "Heart Care Center",
      status: "confirmed"
    },
    {
      id: 2,
      doctor: "Dr. Michael Chen",
      specialty: "Endocrinologist",
      date: "2024-11-25",
      time: "2:30 PM",
      type: "virtual",
      location: "Video Consultation",
      status: "pending"
    }
  ]);

  // Alerts State
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: "critical",
      message: "Blood Pressure: Elevated (140/95 mmHg)",
      timestamp: "2024-11-16T10:30:00"
    },
    {
      id: 2,
      type: "warning",
      message: "Medication Refill: Lisinopril (10 days remaining)",
      timestamp: "2024-11-16T09:15:00"
    }
  ]);

  // Activities State
  const [activities] = useState<Activity[]>([
    {
      id: 1,
      type: "test_result",
      title: "Blood Glucose Test",
      result: "100 mg/dL",
      status: "Normal",
      date: "2024-11-15"
    },
    {
      id: 2,
      type: "doctor_note",
      title: "Follow-up Note",
      description: "BP trending higher, continue monitoring",
      doctor: "Dr. Sarah Johnson",
      date: "2024-11-14"
    }
  ]);

  // Tasks State
  const [tasks] = useState<Task[]>([
    {
      id: 1,
      title: "Upload Blood Test Report",
      dueDate: "2024-11-18",
      priority: "high",
      status: "pending"
    },
    {
      id: 2,
      title: "Complete Health Survey",
      dueDate: "2024-11-20",
      priority: "medium",
      status: "pending"
    }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPatientStats(prev => ({
        ...prev,
        monitoring: prev.monitoring + (Math.random() > 0.5 ? 1 : -1)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getVitalStatus = (vital: VitalSign, value: number): string => {
    if (value <= vital.min || value >= vital.max) return 'critical';
    if (value <= vital.min + 5 || value >= vital.max - 5) return 'warning';
    return 'normal';
  };

  const getBloodPressureStatus = (bp: BloodPressure): string => {
    const { current, min, max } = bp;
    if (current.systolic <= min.systolic || current.systolic >= max.systolic ||
      current.diastolic <= min.diastolic || current.diastolic >= max.diastolic) {
      return 'critical';
    }
    return 'normal';
  };

  const formatBloodPressure = (systolic: number, diastolic: number): string => {
    return `${systolic}/${diastolic}`;
  };

  const handleMarkTaskComplete = (taskId: number) => {
    // Implementation for marking task complete
  };

  const handleTakeMedication = (medId: number) => {
    // Implementation for marking medication as taken
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
          <div className={`patient-vital-card ${getVitalStatus(vitals.heartRate, vitals.heartRate.current)}`}>
            <div className="patient-vital-icon">
              <Heart size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Heart Rate</h3>
              <div className="patient-vital-value">
                <span>{vitals.heartRate.current}</span>
                <span className="patient-vital-unit">{vitals.heartRate.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {vitals.heartRate.min}-{vitals.heartRate.max} {vitals.heartRate.unit}
              </div>
            </div>
          </div>

          <div className={`patient-vital-card ${getVitalStatus(vitals.temperature, vitals.temperature.current)}`}>
            <div className="patient-vital-icon">
              <Thermometer size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Temperature</h3>
              <div className="patient-vital-value">
                <span>{vitals.temperature.current}</span>
                <span className="patient-vital-unit">{vitals.temperature.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {vitals.temperature.min}-{vitals.temperature.max} {vitals.temperature.unit}
              </div>
            </div>
          </div>

          <div className={`patient-vital-card ${getVitalStatus(vitals.oxygenSaturation, vitals.oxygenSaturation.current)}`}>
            <div className="patient-vital-icon">
              <Activity size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Oxygen Saturation</h3>
              <div className="patient-vital-value">
                <span>{vitals.oxygenSaturation.current}</span>
                <span className="patient-vital-unit">{vitals.oxygenSaturation.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {vitals.oxygenSaturation.min}-{vitals.oxygenSaturation.max} {vitals.oxygenSaturation.unit}
              </div>
            </div>
          </div>

          <div className={`patient-vital-card ${getVitalStatus(vitals.respiratoryRate, vitals.respiratoryRate.current)}`}>
            <div className="patient-vital-icon">
              <Wind size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Respiratory Rate</h3>
              <div className="patient-vital-value">
                <span>{vitals.respiratoryRate.current}</span>
                <span className="patient-vital-unit">{vitals.respiratoryRate.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {vitals.respiratoryRate.min}-{vitals.respiratoryRate.max} {vitals.respiratoryRate.unit}
              </div>
            </div>
          </div>

          <div className={`patient-vital-card ${getBloodPressureStatus(vitals.bloodPressure)}`}>
            <div className="patient-vital-icon">
              <Droplets size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Blood Pressure</h3>
              <div className="patient-vital-value">
                <span>
                  {formatBloodPressure(
                    vitals.bloodPressure.current.systolic,
                    vitals.bloodPressure.current.diastolic
                  )}
                </span>
                <span className="patient-vital-unit">{vitals.bloodPressure.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {formatBloodPressure(
                  vitals.bloodPressure.min.systolic,
                  vitals.bloodPressure.min.diastolic
                )} - {formatBloodPressure(
                  vitals.bloodPressure.max.systolic,
                  vitals.bloodPressure.max.diastolic
                )} {vitals.bloodPressure.unit}
              </div>
            </div>
          </div>

          <div className={`patient-vital-card ${getVitalStatus(vitals.bloodGlucose, vitals.bloodGlucose.current)}`}>
            <div className="patient-vital-icon">
              <Cookie size={24} />
            </div>
            <div className="patient-vital-info">
              <h3>Blood Glucose</h3>
              <div className="patient-vital-value">
                <span>{vitals.bloodGlucose.current}</span>
                <span className="patient-vital-unit">{vitals.bloodGlucose.unit}</span>
              </div>
              <div className="patient-vital-range">
                Normal range: {vitals.bloodGlucose.min}-{vitals.bloodGlucose.max} {vitals.bloodGlucose.unit}
              </div>
            </div>
          </div>
        </div>

        <div className="patient-dashboard-grid">
          {/* Critical Alerts Section */}
          <div className="patient-dashboard-card patient-col-span-2">
            <div className="patient-card-header">
              <div className="patient-card-title">
                <AlertTriangle className="patient-text-red-500" />
                Critical Alerts
              </div>
            </div>
            <div className="patient-card-content">
              <div className="patient-alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`patient-alert-item ${alert.type}`}>
                    <AlertTriangle size={20} />
                    <div className="patient-alert-content">
                      <p>{alert.message}</p>
                      <span className="patient-alert-time">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Medication Reminders */}
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
                    <button
                      className="patient-take-medication-btn"
                      onClick={() => handleTakeMedication(med.id)}
                    >
                      Mark as Taken
                    </button>
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
                        {new Date(apt.date).toLocaleDateString()}
                      </div>
                      <div className="patient-appointment-location">
                        {apt.type === 'virtual' ? <Monitor size={14} /> : <MessageSquare size={14} />}
                        {apt.location}
                      </div>
                    </div>
                    <div className="patient-appointment-actions">
                      <button className="patient-reschedule-btn">Reschedule</button>
                      <button className="patient-cancel-btn">Cancel</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activities Section */}
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
                      {activity.type === 'test_result' && activity.status && (
                        <div className="patient-test-result">
                          <span className="patient-result-value">{activity.result}</span>
                          <span className={`patient-result-status patient-status-${activity.status.toLowerCase()}`}>
                            {activity.status}
                          </span>
                        </div>
                      )}
                      {activity.type === 'doctor_note' && (
                        <p className="patient-doctor-note">{activity.description}</p>
                      )}
                      <div className="patient-activity-footer">
                        <span className="patient-activity-date">
                          {new Date(activity.date).toLocaleDateString()}
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
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                        <span className={`patient-task-priority ${task.priority}`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <button
                      className="patient-complete-task-btn"
                      onClick={() => handleMarkTaskComplete(task.id)}
                    >
                      <CheckCircle size={16} />
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

export default PatientDashboard;