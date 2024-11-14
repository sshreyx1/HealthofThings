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

    const handleRoleSelect = (role: string) => {
        setSelectedRole(role);
    };

    const handleProceed = () => {
        if (selectedRole) {
            setShowCredentials(true);
        }
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = (selectedRole === 'doctor' && username === 'doctor' && password === 'password') ||
                       (selectedRole === 'patient' && username === 'patient' && password === 'password');

        if (isValid) {
            localStorage.setItem('authToken', 'dummy_token');
            localStorage.setItem('userRole', selectedRole);
            navigate('/dashboard');
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