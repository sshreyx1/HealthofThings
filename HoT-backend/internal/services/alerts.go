// internal/services/alerts.go
package services

import (
    "fmt"
    "log"
    "time"
    "github.com/google/uuid"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/db"
)

type AlertService struct {
    dbClient *db.DynamoDBClient
}

func NewAlertService(dbClient *db.DynamoDBClient) *AlertService {
    return &AlertService{
        dbClient: dbClient,
    }
}

func (s *AlertService) GetAllAlerts() ([]db.Alert, error) {
    return s.dbClient.GetAllAlerts()
}

func (s *AlertService) GetPatientAlerts(patientID string) ([]db.Alert, error) {
    return s.dbClient.GetAlertsByPatientID(patientID)
}

func (s *AlertService) UpdateAlertStatus(alertID string, patientID string, status string) error {
    return s.dbClient.UpdateAlertStatus(alertID, patientID, status)
}

func (s *AlertService) ProcessVitalSigns(vitals *db.VitalSigns) error {
    alerts, err := s.checkVitalSignThresholds(vitals)
    if err != nil {
        return err
    }

    for _, alert := range alerts {
        if err := s.dbClient.CreateAlert(alert); err != nil {
            log.Printf("Error creating alert: %v", err)
            continue
        }
    }

    return nil
}

func (s *AlertService) checkVitalSignThresholds(vitals *db.VitalSigns) ([]db.Alert, error) {
    var alerts []db.Alert

    // Check oxygen saturation
    if vitals.VitalSigns.OxygenSaturation < 88 {
        alerts = append(alerts, s.createAlert(
            vitals.PatientID,
            "critical",
            "oxygen_saturation",
            float64(vitals.VitalSigns.OxygenSaturation),
            "%",
            "CRITICAL LOW",
        ))
    } else if vitals.VitalSigns.OxygenSaturation < 92 {
        alerts = append(alerts, s.createAlert(
            vitals.PatientID,
            "warning",
            "oxygen_saturation",
            float64(vitals.VitalSigns.OxygenSaturation),
            "%",
            "WARNING LOW",
        ))
    }

    // Check blood pressure systolic
    if vitals.VitalSigns.BloodPressureSystolic > 180 {
        alerts = append(alerts, s.createAlert(
            vitals.PatientID,
            "critical",
            "blood_pressure_systolic",
            float64(vitals.VitalSigns.BloodPressureSystolic),
            "mmHg",
            "CRITICAL HIGH",
        ))
    } else if vitals.VitalSigns.BloodPressureSystolic > 140 {
        alerts = append(alerts, s.createAlert(
            vitals.PatientID,
            "warning",
            "blood_pressure_systolic",
            float64(vitals.VitalSigns.BloodPressureSystolic),
            "mmHg",
            "WARNING HIGH",
        ))
    }

    return alerts, nil
}

func (s *AlertService) createAlert(patientID, severity, vitalType string, value float64, unit, prefix string) db.Alert {
    return db.Alert{
        PatientID:  patientID,
        Timestamp:  time.Now().Format(time.RFC3339),
        AlertID:    uuid.New().String(),
        MessageID:  uuid.New().String(),
        Severity:   severity,
        Status:     "new",
        Unit:       unit,
        Value:      value,
        VitalType:  vitalType,
        Message:    fmt.Sprintf("%s: %s is %.1f %s", prefix, vitalType, value, unit),
    }
}