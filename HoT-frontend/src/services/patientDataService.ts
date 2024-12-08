// src/services/patientVitalsService.ts
import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:8080/api';

export const usePatientVitals = (patientId: string) => {
    const [vitals, setVitals] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch vitals
                const vitalsResponse = await fetch(`${API_BASE_URL}/vitals/${patientId}`);
                if (!vitalsResponse.ok) throw new Error('Failed to fetch vitals');
                const vitalsData = await vitalsResponse.json();
                setVitals(vitalsData);

                // Fetch alerts
                const alertsResponse = await fetch(`${API_BASE_URL}/alerts/${patientId}`);
                if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
                const alertsData = await alertsResponse.json();
                setAlerts(alertsData);

                setError(null);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching patient data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (patientId) {
            fetchData();

            // Set up WebSocket connection for real-time vitals updates
            const ws = new WebSocket(`ws://localhost:8080/ws/vitals/${patientId}`);
            
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    setVitals(data);
                } catch (err) {
                    console.error('WebSocket error:', err);
                }
            };

            return () => ws.close();
        }
    }, [patientId]);

    return { vitals, alerts, loading, error };
};