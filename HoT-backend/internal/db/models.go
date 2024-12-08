package db

// VitalSigns represents the structure of vital signs data
type VitalSigns struct {
    PatientID   string    `json:"patient_id"`
    Timestamp   string    `json:"timestamp"`
    VitalSigns  VitalData `json:"vital_signs"`
    AlertsGenerated bool   `json:"alerts_generated"`
    Category     string   `json:"category"`
    Condition    string   `json:"condition"`
    DeviceID     string   `json:"device_id"`
    Name         string   `json:"name"`
    ProcessingTime string `json:"processing_time"`
}

// VitalData represents the nested vital signs structure
type VitalData struct {
    OxygenSaturation      int     `json:"oxygen_saturation"`
    BloodPressureSystolic int     `json:"blood_pressure_systolic"`
    BloodPressureDiastolic int    `json:"blood_pressure_diastolic"`
    Heartbeat             int     `json:"heartbeat"`
    Temperature           float64 `json:"temperature"`
    BloodGlucose         int     `json:"blood_glucose"`
    RespirationRate      int     `json:"respiration_rate"`
}

// NestedValue represents DynamoDB nested numeric value
type NestedValue struct {
    N string `json:"N"`
}

// RawVitalSigns represents the raw DynamoDB format
type RawVitalSigns struct {
    OxygenSaturation      NestedValue `json:"oxygen_saturation"`
    BloodPressureSystolic NestedValue `json:"blood_pressure_systolic"`
    BloodPressureDiastolic NestedValue `json:"blood_pressure_diastolic"`
    Heartbeat             NestedValue `json:"heartbeat"`
    Temperature           NestedValue `json:"temperature"`
    BloodGlucose         NestedValue `json:"blood_glucose"`
    RespirationRate      NestedValue `json:"respiration_rate"`
}

// Patient represents the structure for patient data
type Patient struct {
    PatientID         string            `json:"patient_id"`
    Name             string            `json:"name"`
    Age              int               `json:"age"`
    Gender           string            `json:"gender"`
    Location         string            `json:"location"`
    MonitoringType   string            `json:"monitoring_type"`
    Status           string            `json:"status"`
    Contact          Contact           `json:"contact"`
    MedicalHistory   []MedicalHistory  `json:"medical_history"`
    EmergencyContacts []EmergencyContact `json:"emergency_contacts"`
    VitalSigns       *VitalData        `json:"vital_signs,omitempty"`
}

type Contact struct {
    Phone string `json:"phone"`
}

type EmergencyContact struct {
    Name  string `json:"name"`
    Phone string `json:"phone"`
}

type MedicalHistory struct {
    Condition string `json:"condition"`
    Year     int    `json:"year"`
}

type Alert struct {
    PatientID  string  `json:"patient_id" dynamodbav:"patient_id"`
    Timestamp  string  `json:"timestamp" dynamodbav:"timestamp"`
    AlertID    string  `json:"alert_id" dynamodbav:"alert_id"`
    Message    string  `json:"message" dynamodbav:"message"`
    MessageID  string  `json:"message_id" dynamodbav:"message_id"`
    Severity   string  `json:"severity" dynamodbav:"severity"`
    Status     string  `json:"status" dynamodbav:"status"`
    Unit       string  `json:"unit" dynamodbav:"unit"`
    Value      float64 `json:"value" dynamodbav:"value"`
    VitalType  string  `json:"vital_type" dynamodbav:"vital_type"`
}