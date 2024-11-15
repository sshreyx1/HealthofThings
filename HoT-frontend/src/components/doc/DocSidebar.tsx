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
    LogOut
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
                <h1>HealthofThings</h1>
            </div>

            <nav className="sidebar-nav">
            <Link
                    to="/docalerts"
                    className={`nav-item ${location.pathname === '/docalerts' ? 'active' : ''}`}
                >
                    <Bell size={20} />
                    <span>Alerts & Notifications</span>
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
                    to="/docdiagnosis"
                    className={`nav-item ${location.pathname === '/docdiagnosis' ? 'active' : ''}`}
                >
                    <Activity size={20} />
                    <span>Diagnosis</span>
                </Link>

                <Link
                    to="/doctreatment"
                    className={`nav-item ${location.pathname === '/doctreatment' ? 'active' : ''}`}
                >
                    <Stethoscope size={20} />
                    <span>Treatment</span>
                </Link>

                <Link
                    to="/docanalytics"
                    className={`nav-item ${location.pathname === '/docanalytics' ? 'active' : ''}`}
                >
                    <BarChart2 size={20} />
                    <span>Analytics</span>
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
                <Link to="/docsettings" className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>

                <button className="logout-button" onClick={handleLogout}>
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default DocSidebar;