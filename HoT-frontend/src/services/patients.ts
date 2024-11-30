import { API_BASE_URL } from '../config';
import { Patient, VitalSigns } from '../types';

export const PatientService = {
    async getAllPatients(): Promise<Patient[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients`);
            if (!response.ok) {
                throw new Error('Failed to fetch patients');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching patients:', error);
            throw error;
        }
    },

    async getPatientByID(patientID: string): Promise<Patient> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/${patientID}`);
            if (!response.ok) {
                throw new Error('Failed to fetch patient');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching patient:', error);
            throw error;
        }
    },

    async getPatientVitals(patientID: string): Promise<VitalSigns> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients/${patientID}/vitals`);
            if (!response.ok) {
                throw new Error('Failed to fetch patient vitals');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching patient vitals:', error);
            throw error;
        }
    }
};