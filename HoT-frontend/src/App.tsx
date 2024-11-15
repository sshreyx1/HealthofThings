import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Schedule from './components/Schedule';
import Diagnosis from './components/Diagnosis';
import Treatment from './components/Treatment';
import Visit from './components/Visit';
import Chatbot from './components/Chatbot';
import DocPatients from './components/doc/DocPatients';
import DocSchedule from './components/doc/DocSchedule';
import DocAlerts from './components/doc/DocAlerts';
import DocConsultation from './components/doc/DocConsultation';
import DocDashboard from './components/doc/DocDashboard';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/diagnosis" element={<Diagnosis />} />
                    <Route path="/treatment" element={<Treatment />} />
                    <Route path="/visit" element={<Visit />} />
                    <Route path="/chatbot" element={<Chatbot />} />

                    <Route path="/docpatients" element={<DocPatients />} />
                    <Route path="/docschedule" element={<DocSchedule />} />
                    <Route path="/docalerts" element={<DocAlerts />} />
                    <Route path="/docconsult" element={<DocConsultation />} />
                    <Route path="/docdashboard" element={<DocDashboard />} />
                    {/* Add other protected routes here */}
                </Route>

                {/* Redirect any unknown routes to the login page */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;