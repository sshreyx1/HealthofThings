// src/services/alertService.ts
const API_BASE_URL = 'http://localhost:8080/api';

export const alertService = {
    async getAlerts() {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching alerts:', error);
            throw error;
        }
    },

    async updateAlertStatus(alertId: string, patientId: string, status: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/alerts/${alertId}`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ status, patient_id: patientId })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error updating alert:', error);
            throw error;
        }
    }
};