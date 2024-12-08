package api

import (
    "encoding/json"
    "log"
    "net/http"
    "sync"
    "time"

    "github.com/gorilla/mux"
    "github.com/gorilla/websocket"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/db"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/api/middleware"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/services"
)

var upgrader = websocket.Upgrader{
    CheckOrigin: func(r *http.Request) bool {
        return true // Be more restrictive in production
    },
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
}
type Server struct {
    router       *mux.Router
    dbClient     *db.DynamoDBClient
    alertService *services.AlertService
    clients      map[*websocket.Conn]bool
    clientsMux   sync.RWMutex
}


func NewServer(dbClient *db.DynamoDBClient) *Server {
    server := &Server{
        router:       mux.NewRouter(),
        dbClient:     dbClient,
        alertService: services.NewAlertService(dbClient),
        clients:      make(map[*websocket.Conn]bool),
    }
    server.setupRoutes()
    return server
}


func (s *Server) setupRoutes() {
    // Apply CORS middleware
    s.router.Use(middleware.CORS)

    // API routes
    api := s.router.PathPrefix("/api").Subrouter()
    
    // Patient routes
    api.HandleFunc("/patients", s.GetAllPatients).Methods("GET", "OPTIONS")
    api.HandleFunc("/patients/{id}", s.GetPatient).Methods("GET", "OPTIONS")
    api.HandleFunc("/vitals/{patientId}", s.GetVitals).Methods("GET", "OPTIONS")
    
    // Alert routes
    api.HandleFunc("/alerts", s.GetAllAlerts).Methods("GET", "OPTIONS")
    api.HandleFunc("/alerts/{patientId}", s.GetPatientAlerts).Methods("GET", "OPTIONS")
    api.HandleFunc("/alerts/{alertId}", s.UpdateAlertStatus).Methods("PUT", "OPTIONS")

    // WebSocket routes
    s.router.HandleFunc("/ws/alerts", s.handleAlertWebSocket)
    s.router.HandleFunc("/ws/vitals/{patientId}", s.HandleVitalsWebSocket)
}

// Alert handlers
func (s *Server) GetAllAlerts(w http.ResponseWriter, r *http.Request) {
    alerts, err := s.alertService.GetAllAlerts()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(alerts)
}

func (s *Server) GetPatientAlerts(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]

    alerts, err := s.alertService.GetPatientAlerts(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(alerts)
}

func (s *Server) UpdateAlertStatus(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    alertID := vars["alertId"]

    var update struct {
        Status    string `json:"status"`
        PatientID string `json:"patient_id"`
    }

    if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    err := s.alertService.UpdateAlertStatus(alertID, update.PatientID, update.Status)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.WriteHeader(http.StatusOK)
}

// WebSocket handlers
func (s *Server) handleAlertWebSocket(w http.ResponseWriter, r *http.Request) {
    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }

    // Register client
    s.clientsMux.Lock()
    s.clients[conn] = true
    s.clientsMux.Unlock()

    defer func() {
        s.clientsMux.Lock()
        delete(s.clients, conn)
        s.clientsMux.Unlock()
        conn.Close()
    }()

    // Send initial alerts
    alerts, err := s.alertService.GetAllAlerts()
    if err == nil {
        if err := conn.WriteJSON(alerts); err != nil {
            log.Printf("Error sending initial alerts: %v", err)
            return
        }
    }

    // Keep connection alive and handle periodic updates
    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            alerts, err := s.alertService.GetAllAlerts()
            if err != nil {
                log.Printf("Error fetching alerts: %v", err)
                continue
            }

            if err := conn.WriteJSON(alerts); err != nil {
                log.Printf("Error sending alerts update: %v", err)
                return
            }
        case <-r.Context().Done():
            return
        }
    }
}

// Existing handlers
func (s *Server) GetAllPatients(w http.ResponseWriter, r *http.Request) {
    patients, err := s.dbClient.GetAllPatients()
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patients)
}

func (s *Server) GetPatient(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["id"]
    
    patient, err := s.dbClient.GetPatientByID(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(patient)
}

func (s *Server) GetVitals(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]
    
    vitals, err := s.dbClient.GetLatestVitalSigns(patientID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(vitals)
}

func (s *Server) HandleVitalsWebSocket(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    patientID := vars["patientId"]

    conn, err := upgrader.Upgrade(w, r, nil)
    if err != nil {
        log.Printf("WebSocket upgrade failed: %v", err)
        return
    }
    defer conn.Close()

    // Send initial data
    vitals, err := s.dbClient.GetLatestVitalSigns(patientID)
    if err == nil {
        if err := conn.WriteJSON(vitals); err != nil {
            log.Printf("Error sending initial vitals: %v", err)
            return
        }
    }

    ticker := time.NewTicker(5 * time.Second)
    defer ticker.Stop()

    for {
        select {
        case <-ticker.C:
            vitals, err := s.dbClient.GetLatestVitalSigns(patientID)
            if err != nil {
                log.Printf("Error fetching vitals: %v", err)
                continue
            }

            // Process vitals for alerts
            if err := s.alertService.ProcessVitalSigns(vitals); err != nil {
                log.Printf("Error processing vitals: %v", err)
            }

            if err := conn.WriteJSON(vitals); err != nil {
                log.Printf("Error sending vitals update: %v", err)
                return
            }
        case <-r.Context().Done():
            return
        }
    }
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    s.router.ServeHTTP(w, r)
}