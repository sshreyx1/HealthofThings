// types.ts

export interface Contact {
    phone: string;
}

export interface MedicalHistory {
    condition: string;
    year: number;
    details?: string;
}

export interface EmergencyContact {
    name: string;
    phone: string;
    address?: string;
    relationship?: string;
}

export interface VitalData {
    oxygen_saturation: number;
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    blood_glucose: number;
    respiration_rate: number;
}

export interface VitalSigns {
    patient_id: string;
    timestamp: string;
    vital_signs: VitalData;
    alerts_generated: boolean;
    category: string;
    condition: string;
    device_id: string;
    name: string;
    processing_time: string;
}

export interface Patient {
    patient_id: string;
    name: string;
    age: number;
    gender: string;
    location: string;
    monitoring_type: string;
    status: string;
    contact: Contact;
    medical_history: MedicalHistory[];
    emergency_contacts: EmergencyContact[];
    vital_signs?: VitalData;
}