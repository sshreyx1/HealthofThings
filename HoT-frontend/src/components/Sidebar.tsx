import React from 'react';
import './Sidebar.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard,
    Stethoscope,
    Calendar,
    Hospital,
    Bot,
    LogOut,
    HeartPulse,
    Activity,
    MessageSquare
} from 'lucide-react';

const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <HeartPulse size={24} className="heart-icon" />
                <h1>HealthofThings</h1>
            </div>

            <nav className="sidebar-nav">
                <Link
                    to="/dashboard"
                    className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                >
                    <LayoutDashboard size={20} />
                    <span>Dashboard</span>
                </Link>

                <Link
                    to="/diagnosis"
                    className={`nav-item ${location.pathname === '/diagnosis' ? 'active' : ''}`}
                >
                    <Activity size={20} />
                    <span>Vitals</span>
                </Link>

                <Link
                    to="/treatment"
                    className={`nav-item ${location.pathname === '/treatment' ? 'active' : ''}`}
                >
                    <Stethoscope size={20} />
                    <span>Treatment</span>
                </Link>

                <Link
                    to="/schedule"
                    className={`nav-item ${location.pathname === '/schedule' ? 'active' : ''}`}
                >
                    <Calendar size={20} />
                    <span>Schedule</span>
                </Link>

                <Link
                    to="/visit"
                    className={`nav-item ${location.pathname === '/visit' ? 'active' : ''}`}
                >
                    <Hospital size={20} />
                    <span>Healthcare Visit</span>
                </Link>

                <Link
                    to="/consult"
                    className={`nav-item ${location.pathname === '/docchat' ? 'active' : ''}`}
                >
                    <MessageSquare size={20} />
                    <span>Consultation</span>
                </Link>

                <Link
                    to="/chatbot"
                    className={`nav-item ${location.pathname === '/chatbot' ? 'active' : ''}`}
                >
                    <Bot size={20} />
                    <span>Chatbot</span>
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

export default Sidebar;