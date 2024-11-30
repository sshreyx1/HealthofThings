import { VitalSigns, Patient } from '../types';

const API_BASE_URL = 'http://localhost:8080';  // Changed from 5173 to 8080

export class VitalsService {
    private static ws: WebSocket | null = null;
    private static vitalsUpdateCallbacks: ((patientId: string, vitals: VitalSigns) => void)[] = [];
    private static reconnectAttempts = 0;
    private static maxReconnectAttempts = 5;
    private static reconnectDelay = 5000;

    static async getAllPatients(): Promise<Patient[]> {
        console.log('VitalsService: Fetching all patients');
        try {
            const response = await fetch(`${API_BASE_URL}/api/patients`);
            console.log('VitalsService: API Response status:', response.status);
            
            if (!response.ok) {
                console.error('VitalsService: API error response:', response.statusText);
                throw new Error('Failed to fetch patients');
            }
            
            const data = await response.json();
            console.log('VitalsService: Received patients data:', data);
            return data;
        } catch (error) {
            console.error('VitalsService: Error fetching patients:', error);
            throw error;
        }
    }

    static initializeWebSocket() {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('VitalsService: WebSocket already connected');
            return;
        }

        console.log('VitalsService: Initializing WebSocket');
        const wsUrl = API_BASE_URL.replace('http://', 'ws://') + '/ws/vitals';
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
            console.log('VitalsService: WebSocket connected');
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
        };

        this.ws.onmessage = (event) => {
            console.log('VitalsService: Received WebSocket message:', event.data);
            try {
                const data = JSON.parse(event.data);
                console.log('VitalsService: Parsed WebSocket data:', data);
                
                if (data.patient_id && data.vital_signs) {
                    this.vitalsUpdateCallbacks.forEach(callback => 
                        callback(data.patient_id, data.vital_signs)
                    );
                }
            } catch (error) {
                console.error('VitalsService: Error parsing WebSocket message:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('VitalsService: WebSocket closed', event.code, event.reason);
            this.ws = null;

            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                console.log(`VitalsService: Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                setTimeout(() => this.initializeWebSocket(), this.reconnectDelay);
            } else {
                console.error('VitalsService: Max reconnection attempts reached');
            }
        };

        this.ws.onerror = (error) => {
            console.error('VitalsService: WebSocket error:', error);
        };
    }

    static subscribeToVitalsUpdates(callback: (patientId: string, vitals: VitalSigns) => void) {
        console.log('VitalsService: New subscription to vitals updates');
        this.vitalsUpdateCallbacks.push(callback);
        this.initializeWebSocket();

        // Start periodic data refresh
        const refreshInterval = setInterval(async () => {
            try {
                const patients = await this.getAllPatients();
                patients.forEach(patient => {
                    if (patient.vital_signs) {
                        callback(patient.patient_id, patient.vital_signs);
                    }
                });
            } catch (error) {
                console.error('Error refreshing patient data:', error);
            }
        }, 5000); // Refresh every 5 seconds

        // Return cleanup function
        return () => {
            console.log('VitalsService: Removing subscription');
            this.vitalsUpdateCallbacks = this.vitalsUpdateCallbacks.filter(cb => cb !== callback);
            clearInterval(refreshInterval);
        };
    }
}