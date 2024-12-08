package handlers

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/services"
)

type PatientHandler struct {
    patientService *services.PatientService
}

func NewPatientHandler(patientService *services.PatientService) *PatientHandler {
    return &PatientHandler{
        patientService: patientService,
    }
}

func (h *PatientHandler) GetAllPatients(w http.ResponseWriter, r *http.Request) {
    patients, err := h.patientService.GetAllPatients()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patients)
}

func (h *PatientHandler) GetPatientByID(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["id"]

    patient, err := h.patientService.GetPatientByID(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patient)
}

func (h *PatientHandler) GetPatientVitals(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["id"]

    vitals, err := h.patientService.GetPatientVitals(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(vitals)
}