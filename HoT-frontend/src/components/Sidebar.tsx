import React from 'react';
import './Sidebar.css';
import { FaTachometerAlt, FaDiagnoses, FaStethoscope, FaCalendarCheck, FaHospitalAlt, FaRobot, FaSignOutAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Remove the auth token and username from local storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        
        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className="sidebar-container">
            <ul className="sidebar-menu">
                <li className="sidebar-item">
                    <Link to="/dashboard" className="sidebar-link">
                        <FaTachometerAlt className="sidebar-icon" /> Dashboard
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link to="/diagnosis" className="sidebar-link">
                        <FaDiagnoses className="sidebar-icon" /> Diagnosis
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link to="/treatment" className="sidebar-link">
                        <FaStethoscope className="sidebar-icon" /> Treatment
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link to="/schedule" className="sidebar-link">
                        <FaCalendarCheck className="sidebar-icon" /> Schedule
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link to="/visit" className="sidebar-link">
                        <FaHospitalAlt className="sidebar-icon" /> Healthcare Visit
                    </Link>
                </li>
                <li className="sidebar-item">
                    <Link to="/chatbot" className="sidebar-link">
                        <FaRobot className="sidebar-icon" /> Symptoms Chatbot
                    </Link>
                </li>
            </ul>
            <button className="logout-button" onClick={handleLogout}>
                <FaSignOutAlt className="sidebar-icon" /> Log Out
            </button>
        </div>
    );
};

export default Sidebar;