import React from 'react';
import './DocSidebar.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Layout,
    Users,
    Calendar,
    Activity,
    Stethoscope,
    BarChart2,
    MessageSquare,
    Bell,
    Settings,
    LogOut,
    HeartPulse
} from 'lucide-react';

const DocSidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="doc-sidebar">
            <div className="sidebar-header">
                <HeartPulse size={24} className="heart-icon" />
                <h1>HealthofThings</h1>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/docalerts"
                    className={`nav-item ${location.pathname === '/docalerts' ? 'active' : ''}`}
                >
                    <Bell size={20} />
                    <span>Alerts</span>
                </Link>
                <Link
                    to="/docdashboard"
                    className={`nav-item ${location.pathname === '/docdashboard' ? 'active' : ''}`}
                >
                    <Layout size={20} />
                    <span>Dashboard</span>
                </Link>

                <Link
                    to="/docpatients"
                    className={`nav-item ${location.pathname === '/docpatients' ? 'active' : ''}`}
                >
                    <Users size={20} />
                    <span>Patients</span>
                </Link>

                <Link
                    to="/docschedule"
                    className={`nav-item ${location.pathname === '/docschedule' ? 'active' : ''}`}
                >
                    <Calendar size={20} />
                    <span>Schedule</span>
                </Link>

                <Link
                    to="/docconsult"
                    className={`nav-item ${location.pathname === '/docchat' ? 'active' : ''}`}
                >
                    <MessageSquare size={20} />
                    <span>Consultation</span>
                </Link>
            </nav>

            <div className="sidebar-footer">
                <div className="logout-container">
                    <button className="logout-button" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DocSidebar;