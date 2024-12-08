package handlers

import (
    "encoding/json"
    "net/http"
    "github.com/gorilla/mux"
    "your-project/internal/db"
)

type AlertHandler struct {
    dbClient *db.DynamoDBClient
}

func (h *AlertHandler) GetPatientAlerts(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]

    alerts, err := h.dbClient.GetAlerts(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(alerts)
}