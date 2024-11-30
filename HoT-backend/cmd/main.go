package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "net/http"
    "os"
    "os/signal"
    "syscall"
    "time"

    "github.com/joho/godotenv"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/api"
    "github.com/sshreyx1/HealthofThings/HoT-backend/internal/db"
)

func testDynamoDBConnection(dbClient *db.DynamoDBClient) {
    // Configure logging
    log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
    logFile, err := os.OpenFile("dynamodb_test.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Printf("Error opening log file: %v", err)
    } else {
        defer logFile.Close()
        log.SetOutput(logFile)
    }

    // Test Patient Data
    log.Println("\n=== Testing patient data retrieval ===")
    patients, err := dbClient.GetAllPatients()
    if err != nil {
        log.Printf("ERROR - Failed to get all patients: %v", err)
    } else {
        log.Printf("Successfully retrieved %d patients", len(patients))
        
        // Print detailed information about each patient
        for i, p := range patients {
            log.Printf("\nPatient %d Details:", i+1)
            patientJSON, _ := json.MarshalIndent(p, "", "  ")
            log.Printf("Raw Patient Data:\n%s", string(patientJSON))
        }

        // Print first patient's details as sample
        if len(patients) > 0 {
            p := patients[0]
            log.Printf("\nSample Patient Data:")
            log.Printf("ID: %s", p.PatientID)
            log.Printf("Name: %s", p.Name)
            log.Printf("Age: %d", p.Age)
            log.Printf("Gender: %s", p.Gender)
            log.Printf("Location: %s", p.Location)
            log.Printf("Monitoring Type: %s", p.MonitoringType)
            log.Printf("Status: %s", p.Status)
            
            if p.Contact.Phone != "" {
                log.Printf("Contact Phone: %s", p.Contact.Phone)
            }
            
            if len(p.MedicalHistory) > 0 {
                log.Printf("Medical History:")
                for _, history := range p.MedicalHistory {
                    log.Printf("  - %s (%d)", history.Condition, history.Year)
                }
            }
            
            if len(p.EmergencyContacts) > 0 {
                log.Printf("Emergency Contacts:")
                for _, contact := range p.EmergencyContacts {
                    log.Printf("  - %s: %s", contact.Name, contact.Phone)
                }
            }
        }
    }

    // Test Vital Signs Data
    log.Println("\n=== Testing vital signs retrieval ===")
    patientID := "P006" // Test patient ID
    vitalSigns, err := dbClient.GetLatestVitalSigns(patientID)
    if err != nil {
        log.Printf("ERROR - Failed to get vital signs: %v", err)
    } else {
        log.Printf("\nLatest Vital Signs for Patient %s:", patientID)
        vitalsJSON, _ := json.MarshalIndent(vitalSigns, "", "  ")
        log.Printf("Raw Vital Signs Data:\n%s", string(vitalsJSON))
        
        log.Printf("Timestamp: %s", vitalSigns.Timestamp)
        log.Printf("Blood Pressure: %d/%d mmHg",
            vitalSigns.VitalSigns.BloodPressureSystolic,
            vitalSigns.VitalSigns.BloodPressureDiastolic)
        log.Printf("Heart Rate: %d bpm", vitalSigns.VitalSigns.Heartbeat)
        log.Printf("Temperature: %.1f°C", vitalSigns.VitalSigns.Temperature)
        log.Printf("Oxygen Saturation: %d%%", vitalSigns.VitalSigns.OxygenSaturation)
        log.Printf("Respiration Rate: %d/min", vitalSigns.VitalSigns.RespirationRate)
        log.Printf("Blood Glucose: %d mg/dL", vitalSigns.VitalSigns.BloodGlucose)
    }

    // Test getting specific patient
    log.Println("\n=== Testing specific patient retrieval ===")
    patientData, err := dbClient.GetPatientByID(patientID)
    if err != nil {
        log.Printf("ERROR - Failed to get patient details: %v", err)
    } else {
        log.Printf("\nDetailed Patient Data for %s:", patientID)
        patientJSON, _ := json.MarshalIndent(patientData, "", "  ")
        log.Printf("Raw Patient Data:\n%s", string(patientJSON))

        log.Printf("Name: %s", patientData.Name)
        log.Printf("Age: %d", patientData.Age)
        log.Printf("Gender: %s", patientData.Gender)
        log.Printf("Location: %s", patientData.Location)
        log.Printf("Monitoring Type: %s", patientData.MonitoringType)
        log.Printf("Status: %s", patientData.Status)
        
        if patientData.Contact.Phone != "" {
            log.Printf("Contact Phone: %s", patientData.Contact.Phone)
        }
        
        if len(patientData.MedicalHistory) > 0 {
            log.Printf("Medical History:")
            for _, history := range patientData.MedicalHistory {
                log.Printf("  - %s (%d)", history.Condition, history.Year)
            }
        }
        
        if len(patientData.EmergencyContacts) > 0 {
            log.Printf("Emergency Contacts:")
            for _, contact := range patientData.EmergencyContacts {
                log.Printf("  - %s: %s", contact.Name, contact.Phone)
            }
        }
    }
}

func main() {
    // Initialize logger
    log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
    logFile, err := os.OpenFile("server.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
    if err != nil {
        log.Printf("Error opening log file: %v", err)
    } else {
        defer logFile.Close()
        log.SetOutput(logFile)
    }

    log.Println("=== Starting Health of Things Backend Server ===")

    // Load environment variables
    log.Println("Loading environment variables...")
    err = godotenv.Load()
    if err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    // Get AWS credentials
    accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
    secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
    sessionToken := os.Getenv("AWS_SESSION_TOKEN")
    region := os.Getenv("AWS_REGION")

    log.Printf("AWS Configuration - Region: %s", region)
    if accessKey == "" || secretKey == "" {
        log.Fatal("ERROR: AWS credentials not found in environment variables")
    }

    // Create DynamoDB client
    log.Println("Initializing DynamoDB client...")
    dbClient, err := db.NewDynamoDBClient(accessKey, secretKey, sessionToken, region)
    if err != nil {
        log.Fatalf("Failed to create DynamoDB client: %v", err)
    }
    log.Println("DynamoDB client initialized successfully")

    // Test DynamoDB connection and data retrieval
    log.Println("Testing DynamoDB connection...")
    testDynamoDBConnection(dbClient)

    // Setup router with DB client
    log.Println("Setting up HTTP router...")
    router := api.SetupRouter(dbClient)

    // Server configuration
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }
    serverAddr := fmt.Sprintf(":%s", port)

    server := &http.Server{
        Addr:         serverAddr,
        Handler:      router,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Server startup
    go func() {
        log.Printf("Starting server on %s", server.Addr)
        if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    // Graceful shutdown handling
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := server.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server stopped gracefully")
}