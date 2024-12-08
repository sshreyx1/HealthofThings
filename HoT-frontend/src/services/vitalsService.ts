import { VitalSigns, Patient, VitalData } from '../types';

const API_BASE_URL = 'http://localhost:8080';

export class VitalsService {
    static async getAllPatients(): Promise<Patient[]> {
        console.log('VitalsService: Fetching all patients');
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'omit'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as Patient[];
            console.log('VitalsService: Received patients data:', data);
            return data;
        } catch (error) {
            console.error('VitalsService: Error fetching patients:', error);
            throw error;
        }
    }

    static async getVitalSigns(patientId: string): Promise<VitalSigns> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/vitals/${patientId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                credentials: 'omit'
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json() as VitalSigns;
            return data;
        } catch (error) {
            console.error(`Error fetching vital signs for patient ${patientId}:`, error);
            throw error;
        }
    }

    static subscribeToVitalsUpdates(callback: (patientId: string, vitals: VitalData) => void) {
        const fetchAndUpdateVitals = async () => {
            try {
                const patients = await this.getAllPatients();
                for (const patient of patients) {
                    try {
                        const vitals = await this.getVitalSigns(patient.patient_id);
                        callback(patient.patient_id, vitals.vital_signs);
                    } catch (error) {
                        console.error(`Error fetching vitals for patient ${patient.patient_id}:`, error);
                    }
                }
            } catch (error) {
                console.error('Error in vitals update loop:', error);
            }
        };

        // Initial fetch
        fetchAndUpdateVitals();

        // Set up polling interval
        const intervalId = setInterval(fetchAndUpdateVitals, 5000);

        // Return cleanup function
        return () => {
            clearInterval(intervalId);
        };
    }
}