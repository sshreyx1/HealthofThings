package services

import (
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/db"
)

type PatientService struct {
    dbClient *db.DynamoDBClient
}

func NewPatientService(dbClient *db.DynamoDBClient) *PatientService {
    return &PatientService{
        dbClient: dbClient,
    }
}

func (s *PatientService) GetAllPatients() ([]db.Patient, error) {
    return s.dbClient.GetAllPatients()
}

func (s *PatientService) GetPatientByID(patientID string) (*db.Patient, error) {
    return s.dbClient.GetPatientByID(patientID)
}

func (s *PatientService) GetPatientVitals(patientID string) (*db.VitalSigns, error) {
    return s.dbClient.GetLatestVitalSigns(patientID)
}