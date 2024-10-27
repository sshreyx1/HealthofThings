import React, { useState, useRef, useEffect } from 'react';
import Sidebar from './Sidebar';
import './Schedule.css';
import { Calendar, Clock, MapPin, User, X } from 'lucide-react';

interface Appointment {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  doctor: string;
  type: string;
  notes?: string;
}

interface PopupPosition {
  x: number;
  y: number;
  position: string;
}

const Schedule: React.FC = () => {
  const mockAppointments: Appointment[] = [
    {
      id: 1,
      title: "Annual Check-up",
      date: "2024-10-30",
      time: "09:30",
      location: "Main Hospital - Room 302",
      doctor: "Dr. Sarah Johnson",
      type: "General",
      notes: "Please bring previous test results"
    },
    {
      id: 2,
      title: "Cardiology Follow-up",
      date: "2024-10-31",
      time: "14:15",
      location: "Cardiology Department - Room 205",
      doctor: "Dr. Michael Chen",
      type: "Specialist",
      notes: "Blood pressure monitoring required"
    },
    {
      id: 3,
      title: "Physical Therapy",
      date: "2024-11-02",
      time: "11:00",
      location: "Rehabilitation Center",
      doctor: "Dr. Emily Brooks",
      type: "Therapy",
      notes: "Wear comfortable clothing"
    }
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popupPosition, setPopupPosition] = useState<PopupPosition>({ x: 0, y: 0, position: '' });
  const popupRef = useRef<HTMLDivElement>(null);

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

  const getDayAppointments = (dateString: string) => {
    return mockAppointments.filter(apt => apt.date === dateString);
  };

  const handleDayClick = (date: Date, event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest('.empty')) {
      return;
    }
    
    const cell = event.currentTarget as HTMLElement;
    const rect = cell.getBoundingClientRect();
    const container = document.querySelector('.calendar-container')?.getBoundingClientRect();
    
    if (!container) return;

    const popupHeight = 400;
    const spaceRight = container.right - rect.right;
    const spaceLeft = rect.left - container.left;
    const spaceTop = rect.top - container.top;
    const spaceBottom = container.bottom - rect.bottom;

    let x = 0;
    let y = 0;
    let position = '';

    if (spaceRight >= 320) {
      x = rect.right;
      if (spaceBottom < popupHeight / 2) {
        y = rect.bottom - popupHeight;
        position = 'right-bottom';
      } else {
        y = rect.top;
        position = 'right';
      }
    } else if (spaceLeft >= 320) {
      x = rect.left - 320;
      if (spaceBottom < popupHeight / 2) {
        y = rect.bottom - popupHeight;
        position = 'left-bottom';
      } else {
        y = rect.top;
        position = 'left';
      }
    } else if (spaceTop > popupHeight) {
      x = rect.left;
      y = rect.top - popupHeight;
      position = 'top';
    } else if (spaceBottom > popupHeight) {
      x = rect.left;
      y = rect.bottom;
      position = 'bottom';
    } else {
      x = rect.right;
      y = Math.min(rect.top, container.bottom - popupHeight);
      position = 'right-contained';
    }

    y = Math.max(container.top, Math.min(y, container.bottom - popupHeight));
    
    setPopupPosition({ x, y, position });
    setSelectedDate(date);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    const days = [];
    const startingDay = firstDay.getDay();
    
    // Add days from previous month
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    
    for (let i = startingDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      days.push(
        <div key={`prev-${day}`} className="calendar-day empty">
          <span className="day-number faded">{day}</span>
        </div>
      );
    }
    
    // Add current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const dayAppointments = getDayAppointments(dateString);
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${
            dayAppointments.length > 0 ? 'has-appointment' : ''
          } ${
            selectedDate?.toDateString() === date.toDateString() ? 'selected' : ''
          }`}
          onClick={(e) => handleDayClick(date, e)}
        >
          <span className="day-number">{day}</span>
          <div className="appointment-previews">
            {dayAppointments.map(apt => (
              <div 
                key={apt.id} 
                className={`appointment-preview ${apt.type.toLowerCase()}`}
              >
                <div className="preview-dot"></div>
                <span className="preview-time">{apt.time}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Add days from next month
    const totalDays = 35; // 5 rows × 7 days
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(
        <div key={`next-${i}`} className="calendar-day empty">
          <span className="day-number faded">{i}</span>
        </div>
      );
    }
    
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + direction)));
    setSelectedDate(null);
  };

  return (
    <div className="schedule-page">
      <Sidebar />
      <div className="schedule-content">
        <div className="schedule-header">
          <h1>My Schedule</h1>
        </div>
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={() => navigateMonth(-1)}>&lt;</button>
            <h2>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => navigateMonth(1)}>&gt;</button>
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

        {selectedDate && (
          <div 
            className={`appointments-popup ${popupPosition.position}`}
            ref={popupRef}
            style={{
              top: popupPosition.y,
              left: popupPosition.x
            }}
          >
            <div className="popup-header">
              <h3>Appointments for {selectedDate.toLocaleDateString()}</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedDate(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className="popup-content">
              {getDayAppointments(selectedDate.toISOString().split('T')[0]).map(appointment => (
                <div key={appointment.id} className="appointment-card">
                  <h4>{appointment.title}</h4>
                  <div className="appointment-details">
                    <p><Clock size={16} /> {appointment.time}</p>
                    <p><MapPin size={16} /> {appointment.location}</p>
                    <p><User size={16} /> {appointment.doctor}</p>
                    {appointment.notes && (
                      <p className="appointment-notes">
                        <Calendar size={16} /> {appointment.notes}
                      </p>
                    )}
                  </div>
                  <span className={`appointment-type ${appointment.type.toLowerCase()}`}>
                    {appointment.type}
                  </span>
                </div>
              ))}
              {getDayAppointments(selectedDate.toISOString().split('T')[0]).length === 0 && (
                <p className="no-appointments">No appointments scheduled for this day</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;