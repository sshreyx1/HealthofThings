// File: src/types/patient.ts

export interface VitalSigns {
    oxygen_saturation: number;
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    blood_glucose: number;
    respiration_rate: number;
}

export interface Contact {
    phone: string;
}

export interface EmergencyContact {
    name: string;
    phone: string;
}

export interface MedicalHistory {
    condition: string;
    year: number;
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
    vital_signs?: VitalSigns;
}