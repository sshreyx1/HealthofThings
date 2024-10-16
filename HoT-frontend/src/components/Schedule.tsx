import React, { useState } from 'react';
import './Schedule.css';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Sidebar from './Sidebar';  // Import the Sidebar component

interface Appointment {
  id: number;
  title: string;
  date: Date;
  time: string;
  doctor: string;
  location: string;
}

const Schedule: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // Sample appointments data
  const appointments: Appointment[] = [
    {
      id: 1,
      title: 'Weekly Checkup',
      date: new Date(2024, 9, 22), // October 22, 2024
      time: '09:00 AM',
      doctor: 'Dr. John Doe',
      location: 'General Hospital, Room 101'
    },
    {
      id: 2,
      title: 'Dental Cleaning',
      date: new Date(2024, 9, 24), // October 24, 2024
      time: '02:00 PM',
      doctor: 'Dr. Jane Smith',
      location: 'Smile Dental Clinic'
    },
    // Add more sample appointments as needed
  ];

  const daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }

    return week;
  };

  const weekDates = getWeekDates(currentDate);

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const openAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointment(null);
  };

  return (
    <div className="page-container">
      <Sidebar />
      <div className="schedule-container">
        <div className="calendar-header">
          <button onClick={() => navigateWeek('prev')}><FaChevronLeft /></button>
          <h2>{`${weekDates[0].toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`}</h2>
          <button onClick={() => navigateWeek('next')}><FaChevronRight /></button>
        </div>
        <div className="calendar-grid">
          {daysInWeek.map((day, index) => (
            <div key={day} className="calendar-day">
              <div className="day-header">
                <span>{day}</span>
                <span>{weekDates[index].getDate()}</span>
              </div>
              <div className="appointments">
                {appointments.filter(appt => 
                  appt.date.toDateString() === weekDates[index].toDateString()
                ).map(appt => (
                  <div 
                    key={appt.id} 
                    className="appointment"
                    onClick={() => openAppointmentDetails(appt)}
                  >
                    {appt.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedAppointment && (
          <div className="appointment-popup">
            <div className="appointment-details">
              <h3>{selectedAppointment.title}</h3>
              <p>Date: {selectedAppointment.date.toLocaleDateString()}</p>
              <p>Time: {selectedAppointment.time}</p>
              <p>Doctor: {selectedAppointment.doctor}</p>
              <p>Location: {selectedAppointment.location}</p>
              <button onClick={closeAppointmentDetails}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;