// Medical History type
export interface MedicalHistory {
    condition: string;
    details: string;
    year: number;
}

// Contact Information type
export interface ContactInfo {
    phone: string;
    address?: string;
}

// Emergency Contact type
export interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}

// Vital Signs type
export interface VitalSigns {
    oxygen_saturation: number;
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    respiration_rate: number;
}



// API Response types
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: string;
}

// WebSocket Message types
export interface VitalSignsUpdate {
    patient_id: string;
    vital_signs: VitalSigns;
    timestamp: string;
}

export interface VitalSigns {
    blood_pressure_systolic: number;
    blood_pressure_diastolic: number;
    heartbeat: number;
    temperature: number;
    oxygen_saturation: number;
}

export interface PatientDetails {
    patient_id: string;
    name: string;
    age: number;
    gender: string;
    contact: string;
    email: string;
    address: string;
    admission_date: string;
    location: string;
    vital_signs: VitalSigns & {
        spo2: number;
    };
    alerts?: Array<{
        id: string;
        type: 'critical' | 'warning' | 'info';
        message: string;
        timestamp: string;
    }>;
    status: 'Critical' | 'Stable' | 'Normal' | 'Urgent';
}





export interface VitalSigns {
    heartRate: number;
    bloodPressure: string;
    temperature: number;
    spO2: number;
    lastUpdated: string;
}

export interface Alert {
    id: string;
    type: 'critical' | 'warning' | 'info';
    message: string;
    timestamp: string;
}

export interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    endDate?: string;
}

export interface Note {
    date: string;
    doctor: string;
    content: string;
}

export interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    contactNumber: string;
    email: string;
    address: string;
    admissionDate: string;
    location: 'Remote' | 'ICU' | 'Emergency' | 'General';
    status: 'Stable' | 'Critical' | 'Recovering' | 'Under Observation' | 'Normal' | 'Urgent';
    condition: string;
    diagnosis: string;
    lastCheckin?: string;
    vitals: VitalSigns;
    alerts: Alert[];
    medications: Medication[];
    notes: Note[];
}

export interface HospitalPatients {
    icu: Patient[];
    emergency: Patient[];
    general: Patient[];
}