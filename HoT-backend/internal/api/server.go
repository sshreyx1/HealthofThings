package api

import (
    "encoding/json"
    "log"
    "net/http"
    "time"
    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
    "github.com/rs/cors"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/db"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

type Handlers struct {
    dbClient *db.DynamoDBClient
}

func NewHandlers(dbClient *db.DynamoDBClient) *Handlers {
    return &Handlers{
        dbClient: dbClient,
    }
}

func SetupRouter(dbClient *db.DynamoDBClient) http.Handler {
    r := mux.NewRouter()
    api := r.PathPrefix("/api").Subrouter()

    h := NewHandlers(dbClient)

    corsMiddleware := cors.New(cors.Options{
        AllowedOrigins: []string{"http://localhost:5173"},
        AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders: []string{"Content-Type", "Authorization"},
    })

    api.HandleFunc("/patients", h.GetAllPatients).Methods("GET")
    api.HandleFunc("/patients/{id}", h.GetPatient).Methods("GET")
    api.HandleFunc("/vitals/{patientId}", h.GetVitals).Methods("GET")
    r.HandleFunc("/ws/vitals/{patientId}", h.HandleVitalsWebSocket)

    return corsMiddleware.Handler(r)
}

func (h *Handlers) GetAllPatients(w http.ResponseWriter, r *http.Request) {
    log.Println("Getting all patients")
    patients, err := h.dbClient.GetAllPatients()
    if err != nil {
        log.Printf("Error getting patients: %v", err)
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patients)
}

func (h *Handlers) GetPatient(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["id"]
    
    patient, err := h.dbClient.GetPatientByID(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patient)
}

func (h *Handlers) GetVitals(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]
    
    vitals, err := h.dbClient.GetLatestVitalSigns(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(vitals)
}

func (h *Handlers) HandleVitalsWebSocket(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]
    
    log.Printf("Starting WebSocket connection for patient: %s", patientID)

    // Configure upgrader
    upgrader.CheckOrigin = func(r *http.Request) bool {
        return true // Allow all origins in development
    }

    // Upgrade HTTP connection to WebSocket
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    // Send updates every 5 seconds
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    // Create done channel for cleanup
    done := make(chan bool)
    defer close(done)

    // Handle client disconnection
    go func() {
        for {
            // Read message from client (needed to detect disconnection)
            _, _, err := conn.ReadMessage()
            if err != nil {
                log.Printf("WebSocket read error: %v", err)
                done <- true
                return
            }
        }
    }()

    // Send initial data immediately
    vitals, err := h.dbClient.GetLatestVitalSigns(patientID)
    if err == nil {
        if err := conn.WriteJSON(vitals); err != nil {
            log.Printf("WebSocket initial write error: %v", err)
            return
        }
    }

    for {
        select {
        case <-ticker.C:
            vitals, err := h.dbClient.GetLatestVitalSigns(patientID)
            if err != nil {
                log.Printf("Error getting vitals: %v", err)
                continue
            }

            if err := conn.WriteJSON(vitals); err != nil {
                log.Printf("WebSocket write error: %v", err)
                return
            }

            log.Printf("Sent vital signs update for patient %s", patientID)

        case <-done:
            log.Printf("WebSocket connection closed for patient %s", patientID)
            return

        case <-r.Context().Done():
            log.Printf("Request context cancelled for patient %s", patientID)
            return
        }
    }
}