import React, { useState, useRef, useEffect } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    User,
    X,
    Check,
    AlertTriangle,
    Bell,
    Calendar as CalendarIcon,
    ClipboardList,
    UserCog,
    Stethoscope,
    RefreshCw,
    Users,
    ChevronLeft,
    ChevronRight,
    Info,
    XCircle,
    Ban
} from 'lucide-react';
import DocSidebar from './DocSidebar';
import './DocSchedule.css';

type AppointmentType = 'Surgery' | 'Consultation' | 'Follow-up' | 'Emergency' | 'Pending';
type AppointmentStatus = 'Scheduled' | 'Pending' | 'Completed' | 'Cancelled';
type AppointmentPriority = 'Normal' | 'Urgent' | 'Critical';

interface PatientVitals {
    heartRate: number;
    temperature: number;
    bloodPressure: string;
    spO2: number;
}

interface Patient {
    id: string;
    name: string;
    age: number;
    condition?: string;
    vitals?: PatientVitals;
}

interface Appointment {
    id: number;
    title: string;
    date: string;
    time: string;
    location: string;
    patient: Patient;
    type: AppointmentType;
    status: AppointmentStatus;
    priority: AppointmentPriority;
    notes?: string;
    duration: number;
}

interface PopupPosition {
    x: number;
    y: number;
}

interface TypeBadgeProps {
    type: AppointmentType | string;
}

interface PriorityBadgeProps {
    priority: AppointmentPriority | string;
}

const mockAppointments: Appointment[] = [
    {
        id: 1,
        title: "Cardiac Surgery",
        date: "2024-12-05",
        time: "09:30",
        location: "OR 302",
        patient: {
            id: "P001",
            name: "John Doe",
            age: 45,
            condition: "Coronary Artery Disease",
            vitals: {
                heartRate: 92,
                temperature: 38.2,
                bloodPressure: "140/90",
                spO2: 95
            }
        },
        type: "Surgery",
        status: "Scheduled",
        priority: "Critical",
        notes: "Pre-op assessment completed",
        duration: 180
    },
    {
        id: 2,
        title: "Post-Op Follow-up",
        date: "2024-12-12",
        time: "14:15",
        location: "Clinic Room 205",
        patient: {
            id: "P002",
            name: "Jane Smith",
            age: 52,
            condition: "Post Cardiac Surgery",
            vitals: {
                heartRate: 78,
                temperature: 37.1,
                bloodPressure: "130/85",
                spO2: 98
            }
        },
        type: "Follow-up",
        status: "Scheduled",
        priority: "Normal",
        duration: 30
    },
    {
        id: 3,
        title: "Emergency Consultation",
        date: "2024-12-15",
        time: "16:00",
        location: "Emergency Department",
        patient: {
            id: "P003",
            name: "Robert Johnson",
            age: 68,
            condition: "Acute Chest Pain",
            vitals: {
                heartRate: 105,
                temperature: 37.8,
                bloodPressure: "160/95",
                spO2: 94
            }
        },
        type: "Emergency",
        status: "Scheduled",
        priority: "Urgent",
        notes: "Immediate evaluation needed",
        duration: 45
    },
    {
        id: 4,
        title: "New Patient Consultation",
        date: "2024-12-20",
        time: "10:00",
        location: "Clinic Room 103",
        patient: {
            id: "P004",
            name: "Sarah Williams",
            age: 35,
            condition: "Chest Pain Investigation",
            vitals: {
                heartRate: 82,
                temperature: 36.9,
                bloodPressure: "125/80",
                spO2: 98
            }
        },
        type: "Consultation",
        status: "Pending",
        priority: "Normal",
        duration: 45
    }
];

const DocSchedule: React.FC = () => {
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [popupPosition, setPopupPosition] = useState<PopupPosition>({ x: 0, y: 0 });
    const [appointments, setAppointments] = useState<Appointment[]>(
        mockAppointments.filter(apt => apt.status === 'Scheduled')
    );
    const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>(
        mockAppointments.filter(apt => apt.status === 'Pending')
    );
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [showRightPanel, setShowRightPanel] = useState<boolean>(false);
    const [rightPanelContent, setRightPanelContent] = useState<'pending' | 'reschedule' | null>(null);
    const [rescheduleDate, setRescheduleDate] = useState<string>('');
    const [rescheduleTime, setRescheduleTime] = useState<string>('');

    const popupRef = useRef<HTMLDivElement>(null);
    const calendarContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                setSelectedDate(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setAppointments(prevAppointments =>
                prevAppointments.map(apt => {
                    if (!apt.patient.vitals) return apt;
                    return {
                        ...apt,
                        patient: {
                            ...apt.patient,
                            vitals: {
                                ...apt.patient.vitals,
                                heartRate: Math.round(apt.patient.vitals.heartRate + (Math.random() * 6 - 3)),
                                temperature: +(apt.patient.vitals.temperature + (Math.random() * 0.4 - 0.2)).toFixed(1),
                                spO2: Math.round(Math.max(90, Math.min(100, apt.patient.vitals.spO2 + (Math.random() * 2 - 1))))
                            }
                        }
                    };
                })
            );
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const handleDayClick = (date: Date, event: React.MouseEvent<HTMLDivElement>) => {
        const targetElement = event.target as HTMLElement;
        if (targetElement.closest('.empty')) {
            return;
        }

        const cell = event.currentTarget;
        const rect = cell.getBoundingClientRect();
        const container = calendarContainerRef.current?.getBoundingClientRect();

        if (!container) return;

        setShowRightPanel(false);

        let x = rect.right + 16;
        let y = rect.top;

        // Adjust position if popup would go outside container
        if (x + 340 > container.right) {
            x = rect.left - 356; // 340px width + 16px gap
        }

        // Ensure popup stays within vertical bounds
        const maxHeight = 600;
        if (y + maxHeight > container.bottom) {
            y = container.bottom - maxHeight;
        }
        y = Math.max(container.top, y);

        setPopupPosition({ x, y });
        setSelectedDate(date);
    };

    const handleOpenPanel = (panelType: 'pending' | 'reschedule', appointment?: Appointment) => {
        if (appointment) {
            setSelectedAppointment(appointment);
            setRescheduleDate(appointment.date);
            setRescheduleTime(appointment.time);
        }
        setRightPanelContent(panelType);
        setShowRightPanel(true);
        setSelectedDate(null);
    };

    const handleClosePanel = () => {
        setShowRightPanel(false);
        setRightPanelContent(null);
        setSelectedAppointment(null);
    };

    const handleAcceptAppointment = (appointment: Appointment) => {
        const updatedAppointment: Appointment = {
            ...appointment,
            status: 'Scheduled'
        };
        setAppointments(prev => [...prev, updatedAppointment]);
        setPendingAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
        handleClosePanel();
    };

    const handleDeclineAppointment = (appointment: Appointment) => {
        setPendingAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
        handleClosePanel();
    };

    const handleCancelAppointment = (appointment: Appointment) => {
        setAppointments(prev => prev.filter(apt => apt.id !== appointment.id));
        setSelectedDate(null);
    };

    const handleConfirmReschedule = () => {
        if (selectedAppointment && rescheduleDate && rescheduleTime) {
            const updatedAppointment: Appointment = {
                ...selectedAppointment,
                date: rescheduleDate,
                time: rescheduleTime,
                status: 'Scheduled'
            };

            if (selectedAppointment.status === 'Pending') {
                setPendingAppointments(prev =>
                    prev.filter(apt => apt.id !== selectedAppointment.id)
                );
                setAppointments(prev => [...prev, updatedAppointment]);
            } else {
                setAppointments(prev =>
                    prev.map(apt =>
                        apt.id === selectedAppointment.id ? updatedAppointment : apt
                    )
                );
            }

            handleClosePanel();
        }
    };

    const getDayAppointments = (dateString: string): Appointment[] => {
        return appointments.filter(apt => apt.date === dateString);
    };

    const TypeBadge: React.FC<TypeBadgeProps> = ({ type }) => (
        <span className={`type-badge ${type.toLowerCase()}`}>
            {type}
        </span>
    );

    const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => (
        <span className={`priority-badge ${priority.toLowerCase()}`}>
            {priority}
        </span>
    );

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const navigateMonth = (direction: number) => {
        const newDate = new Date(currentDate);
        newDate.setMonth(newDate.getMonth() + direction);
        setCurrentDate(newDate);
        setSelectedDate(null);
    };

    const generateCalendarDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDay = firstDay.getDay();

        const days: JSX.Element[] = [];

        // Add previous month's days
        for (let i = startingDay - 1; i >= 0; i--) {
            const prevMonthDay = new Date(year, month, -i);
            days.push(
                <div key={`prev-${i}`} className="calendar-day empty">
                    <span className="day-number faded">{prevMonthDay.getDate()}</span>
                </div>
            );
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = date.toISOString().split('T')[0];
            const dayAppointments = getDayAppointments(dateString);
            const hasUrgent = dayAppointments.some(apt =>
                apt.priority === 'Urgent' || apt.priority === 'Critical'
            );

            days.push(
                <div
                    key={`current-${day}`}
                    className={`calendar-day 
                        ${dayAppointments.length > 0 ? 'has-appointment' : ''} 
                        ${hasUrgent ? 'has-urgent' : ''} 
                        ${selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''}`
                    }
                    onClick={(e) => handleDayClick(date, e)}
                >
                    <span className="day-number">{day}</span>
                    <div className="appointment-previews">
                        {dayAppointments.slice(0, 3).map(apt => (
                            <div
                                key={apt.id}
                                className={`appointment-preview ${apt.type.toLowerCase()} ${apt.priority.toLowerCase()}`}
                            >
                                <div className="preview-dot"></div>
                                <span className="preview-time">{apt.time}</span>
                                <span className="preview-title">{apt.title}</span>
                            </div>
                        ))}
                        {dayAppointments.length > 3 && (
                            <div className="more-appointments">
                                +{dayAppointments.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Add just enough days from next month to complete the last week
        const remainingDays = (7 - ((days.length) % 7)) % 7;
        for (let i = 1; i <= remainingDays; i++) {
            days.push(
                <div key={`next-${i}`} className="calendar-day empty">
                    <span className="day-number faded">{i}</span>
                </div>
            );
        }

        return days;
    };

    const RightPanel: React.FC = () => {
        if (!showRightPanel || !rightPanelContent) return null;

        return (
            <div className="right-panel">
                <div className="right-panel-header">
                    <h3>
                        {rightPanelContent === 'pending' ? 'Pending Requests' : 'Reschedule Appointment'}
                    </h3>
                    <button className="close-button" onClick={handleClosePanel}>
                        <XCircle size={32} />
                    </button>
                </div>

                <div className="right-panel-content">
                    {rightPanelContent === 'pending' ? (
                        pendingAppointments.length > 0 ? (
                            <div className="pending-appointments-list">
                                {pendingAppointments.map(appointment => (
                                    <div key={appointment.id} className="pending-card">
                                        <div className="pending-card-header">
                                            <div className="pending-card-title">
                                                <h4>{appointment.title}</h4>
                                                <div className="pending-card-badges">
                                                    <TypeBadge type={appointment.type} />
                                                    <PriorityBadge priority={appointment.priority} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pending-card-details">
                                            <div className="detail-row">
                                                <Clock size={16} />
                                                <span>{appointment.date} at {appointment.time}</span>
                                            </div>
                                            <div className="detail-row">
                                                <MapPin size={16} />
                                                <span>{appointment.location}</span>
                                            </div>
                                            <div className="detail-row">
                                                <User size={16} />
                                                <span>{appointment.patient.name}, {appointment.patient.age} yrs</span>
                                            </div>
                                            {appointment.patient.condition && (
                                                <div className="detail-row condition">
                                                    <AlertTriangle size={16} />
                                                    <span>{appointment.patient.condition}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="pending-card-actions">
                                            <button
                                                className="icon-button accept"
                                                title="Accept"
                                                onClick={() => handleAcceptAppointment(appointment)}
                                            >
                                                <Check size={20} />
                                                <span>Accept</span>
                                            </button>
                                            <button
                                                className="icon-button reschedule"
                                                title="Reschedule"
                                                onClick={() => handleOpenPanel('reschedule', appointment)}
                                            >
                                                <RefreshCw size={20} />
                                                <span>Reschedule</span>
                                            </button>
                                            <button
                                                className="icon-button decline"
                                                title="Decline"
                                                onClick={() => handleDeclineAppointment(appointment)}
                                            >
                                                <X size={20} />
                                                <span>Decline</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-pending">
                                <Info size={48} />
                                <p>No pending appointment requests</p>
                            </div>
                        )
                    ) : (
                        <div className="reschedule-form">
                            <div className="form-group">
                                <label htmlFor="date">New Date</label>
                                <input
                                    type="date"
                                    id="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="date-input"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="time">New Time</label>
                                <input
                                    type="time"
                                    id="time"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                    className="time-input"
                                />
                            </div>
                            {selectedAppointment && (
                                <div className="reschedule-summary">
                                    <h4>Appointment Details</h4>
                                    <div className="summary-row">
                                        <span className="label">Patient:</span>
                                        <span>{selectedAppointment.patient.name}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Type:</span>
                                        <TypeBadge type={selectedAppointment.type} />
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Priority:</span>
                                        <PriorityBadge priority={selectedAppointment.priority} />
                                    </div>
                                    <div className="summary-row">
                                        <span className="label">Duration:</span>
                                        <span>{selectedAppointment.duration} mins</span>
                                    </div>
                                </div>
                            )}
                            <div className="action-buttons">
                                <button className="cancel-button" onClick={handleClosePanel}>
                                    <X size={20} />
                                    <span>Cancel</span>
                                </button>
                                <button className="confirm-button" onClick={handleConfirmReschedule}>
                                    <Check size={20} />
                                    <span>Confirm</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="doc-schedule-page">
            <DocSidebar />
            <div className={`doc-schedule-content ${showRightPanel ? 'with-panel' : ''}`}>
                <div className="schedule-header">
                    <div className="header-left">
                        <h1>Schedule</h1>
                        <div className="schedule-stats">
                            <div className="stat-item">
                                <Stethoscope size={20} />
                                <span>
                                    {appointments.filter(apt => apt.type === 'Surgery').length} Surgeries
                                </span>
                            </div>
                            <div className="stat-item">
                                <UserCog size={20} />
                                <span>
                                    {appointments.filter(apt =>
                                        apt.type === 'Consultation' || apt.type === 'Follow-up'
                                    ).length} Appointments
                                </span>
                            </div>
                            <div className="stat-item urgent">
                                <AlertTriangle size={20} />
                                <span>
                                    {pendingAppointments.length} Pending
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="header-actions">
                        <button
                            className={`pending-requests-button ${pendingAppointments.length > 0 ? 'has-pending' : ''}`}
                            onClick={() => handleOpenPanel('pending')}
                        >
                            <ClipboardList size={20} />
                            Pending Requests
                            {pendingAppointments.length > 0 && (
                                <span className="pending-count">
                                    {pendingAppointments.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>

                <div className="calendar-container" ref={calendarContainerRef}>
                    <div className="calendar-header">
                        <button className="month-nav-button" onClick={() => navigateMonth(-1)}>
                            <ChevronLeft size={20} />
                        </button>
                        <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
                        <button className="month-nav-button" onClick={() => navigateMonth(1)}>
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <div className="calendar-weekdays">
                        <div>Sun</div>
                        <div>Mon</div>
                        <div>Tue</div>
                        <div>Wed</div>
                        <div>Thu</div>
                        <div>Fri</div>
                        <div>Sat</div>
                    </div>

                    <div className="calendar-grid">
                        {generateCalendarDays()}
                    </div>
                </div>

                {selectedDate && !showRightPanel && (
                    <div
                        className="appointments-popup"
                        ref={popupRef}
                        style={{
                            top: popupPosition.y,
                            left: popupPosition.x
                        }}
                    >
                        <div className="popup-header">
                            <h3>Schedule for {selectedDate.toLocaleDateString()}</h3>
                            <button
                                className="close-button"
                                onClick={() => setSelectedDate(null)}
                            >
                                <XCircle size={32} />
                            </button>
                        </div>
                        <div className="popup-content">
                            {getDayAppointments(selectedDate.toISOString().split('T')[0])
                                .sort((a, b) => a.time.localeCompare(b.time))
                                .map(appointment => (
                                    <div
                                        key={appointment.id}
                                        className={`appointment-card ${appointment.type.toLowerCase()} ${appointment.priority.toLowerCase()}`}
                                    >
                                        <div className="appointment-header">
                                            <div className="appointment-header-left">
                                                <h4>{appointment.title}</h4>
                                                <TypeBadge type={appointment.type} />
                                            </div>
                                            <PriorityBadge priority={appointment.priority} />
                                        </div>
                                        <div className="appointment-details">
                                            <div className="detail-item">
                                                <Clock size={16} />
                                                <span>{appointment.time} ({appointment.duration} mins)</span>
                                            </div>
                                            <div className="detail-item">
                                                <MapPin size={16} />
                                                <span>{appointment.location}</span>
                                            </div>
                                            <div className="detail-item">
                                                <User size={16} />
                                                <span>{appointment.patient.name}, {appointment.patient.age} yrs</span>
                                            </div>
                                            {appointment.patient.condition && (
                                                <div className="detail-item condition">
                                                    <AlertTriangle size={16} />
                                                    <span>{appointment.patient.condition}</span>
                                                </div>
                                            )}
                                            {appointment.patient.vitals && (
                                                <div className="patient-vitals">
                                                    <div className={`vital-item ${appointment.patient.vitals.heartRate > 100 ? 'warning' : ''}`}
                                                    >
                                                        HR: {Math.round(appointment.patient.vitals.heartRate)} bpm
                                                    </div>
                                                    <div className="vital-item">
                                                        BP: {appointment.patient.vitals.bloodPressure}
                                                    </div>
                                                    <div className={`vital-item ${appointment.patient.vitals.temperature > 38.5 ? 'warning' : ''}`}
                                                    >
                                                        Temp: {appointment.patient.vitals.temperature.toFixed(1)}°C
                                                    </div>
                                                    <div className={`vital-item ${appointment.patient.vitals.spO2 < 95 ? 'warning' : ''}`}
                                                    >
                                                        SpO2: {Math.round(appointment.patient.vitals.spO2)}%
                                                    </div>
                                                </div>
                                            )}
                                            {appointment.notes && (
                                                <div className="detail-item notes">
                                                    <CalendarIcon size={16} />
                                                    <span>{appointment.notes}</span>
                                                </div>
                                            )}
                                            <div className="appointment-actions">
                                                <button
                                                    className="icon-button reschedule"
                                                    title="Reschedule"
                                                    onClick={() => handleOpenPanel('reschedule', appointment)}
                                                >
                                                    <RefreshCw size={20} />
                                                    <span>Reschedule</span>
                                                </button>
                                                <button
                                                    className="icon-button cancel"
                                                    title="Cancel Appointment"
                                                    onClick={() => handleCancelAppointment(appointment)}
                                                >
                                                    <Ban size={20} />
                                                    <span>Cancel</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            {getDayAppointments(selectedDate.toISOString().split('T')[0]).length === 0 && (
                                <p className="no-appointments">No appointments scheduled for this day</p>
                            )}
                        </div>
                    </div>
                )}

                <RightPanel />
            </div>
        </div>
    );
};
export default DocSchedule;