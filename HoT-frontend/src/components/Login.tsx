import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseMedical, Ambulance } from 'lucide-react';
import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import './Login.css';
import xraydoc from '../assets/xraydoc.png';
import doc1 from '../assets/doc.png';
import docPatient from '../assets/docnpatient.png';
import doc3 from '../assets/3doc.png';
import doc from '../assets/1doc.png';
import docPatient1 from '../assets/docnpatient1.png';
import doc2 from '../assets/2doc.png';

const Login = () => {
    const [selectedRole, setSelectedRole] = useState('');
    const [showCredentials, setShowCredentials] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    // Define valid credentials
    const validPatients = {
        'P001': 'password',
        'P004': 'password',
        'P006': 'password',
        'P007': 'password'
    };

    const validDoctors = {
        'DR001': 'password'
    };

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
        setUsername(''); // Clear username when switching roles
        setPassword(''); // Clear password when switching roles
    };

    const handleProceed = () => {
        if (selectedRole) {
            setShowCredentials(true);
        }
    };

    const validateCredentials = (username: string, password: string, role: string) => {
        if (role === 'doctor') {
            return validDoctors[username] === password;
        } else if (role === 'patient') {
            return validPatients[username] === password;
        }
        return false;
    };

    const validateUserRole = (username: string, role: string) => {
        if (role === 'doctor') {
            return username.startsWith('DR');
        } else if (role === 'patient') {
            return username.startsWith('P');
        }
        return false;
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();

        // First check if the user is trying to log in through the correct role
        if (!validateUserRole(username, selectedRole)) {
            alert(`Invalid ${selectedRole} ID format. Please use the correct format (${selectedRole === 'doctor' ? 'DR***' : 'P***'})`);
            return;
        }

        // Then check credentials
        if (validateCredentials(username, password, selectedRole)) {
            localStorage.setItem('authToken', 'dummy_token');
            localStorage.setItem('userRole', selectedRole);
            localStorage.setItem('userId', username);
            
            if (selectedRole === 'doctor') {
                navigate('/docdashboard');
            } else {
                navigate('/dashboard');
            }
        } else {
            alert('Invalid credentials');
        }
    };

    return (
        <div className="login-page">
            <div className="login-content">
                <div className="login-left">
                    <h1>Welcome to<br />HealthofThings!</h1>
                    <p>Providing quality healthcare services - Please select your role to continue</p>
                    
                    {!showCredentials ? (
                        <>
                            <div className="role-selection">
                                <div 
                                    className={`role-option ${selectedRole === 'doctor' ? 'selected' : ''}`}
                                    onClick={() => handleRoleSelect('doctor')}
                                >
                                    <BriefcaseMedical size={24} className="role-icon" />
                                    <span>Doctor</span>
                                </div>
                                <div 
                                    className={`role-option ${selectedRole === 'patient' ? 'selected' : ''}`}
                                    onClick={() => handleRoleSelect('patient')}
                                >
                                    <Ambulance size={24} className="role-icon" />
                                    <span>Patient</span>
                                </div>
                            </div>
                            <button 
                                className="proceed-btn"
                                onClick={handleProceed}
                                disabled={!selectedRole}
                            >
                                Next
                            </button>
                        </>
                    ) : (
                        <form onSubmit={handleLogin} className="login-form">
                            <div className="form-group">
                                <label>Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder={selectedRole === 'doctor' ? "Enter Doctor ID (DR***)" : "Enter Patient ID (P***)"}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" className="proceed-btn">
                                Login
                            </button>
                            <button 
                                type="button" 
                                className="back-btn"
                                onClick={() => {
                                    setShowCredentials(false);
                                    setUsername('');
                                    setPassword('');
                                }}
                            >
                                Back to Role Selection
                            </button>
                        </form>
                    )}
                </div>
                <div className="login-right">
                    <Carousel
                        autoPlay
                        infiniteLoop
                        interval={3000}
                        showArrows={false}
                        showStatus={false}
                        showThumbs={false}
                        showIndicators={false}
                        className="carousel-container"
                        swipeable={false}
                        stopOnHover={false}
                        emulateTouch={false}
                        axis="horizontal"
                        transitionTime={1000}
                    >
                        <div className="image-container"><img src={xraydoc} alt="Medical 1" /></div>
                        <div className="image-container"><img src={doc1} alt="Medical 2" /></div>
                        <div className="image-container"><img src={docPatient} alt="Medical 3" /></div>
                        <div className="image-container"><img src={doc3} alt="Medical 4" /></div>
                        <div className="image-container"><img src={doc} alt="Medical 5" /></div>
                        <div className="image-container"><img src={docPatient1} alt="Medical 6" /></div>
                        <div className="image-container"><img src={doc2} alt="Medical 7" /></div>
                    </Carousel>
                </div>
            </div>
        </div>
    );
};

export default Login;
