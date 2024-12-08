// cmd/main.go
package main

import (
    "context"
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

func main() {
    // Initialize logger
    log.SetFlags(log.Ldate | log.Ltime | log.Lshortfile)
    
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Fatalf("Error loading .env file: %v", err)
    }

    // Get AWS credentials from environment variables
    accessKey := os.Getenv("AWS_ACCESS_KEY_ID")
    secretKey := os.Getenv("AWS_SECRET_ACCESS_KEY")
    sessionToken := os.Getenv("AWS_SESSION_TOKEN")
    region := os.Getenv("AWS_REGION")

    if accessKey == "" || secretKey == "" {
        log.Fatal("AWS credentials not found in environment variables")
    }

    // Create DynamoDB client
    dbClient, err := db.NewDynamoDBClient(accessKey, secretKey, sessionToken, region)
    if err != nil {
        log.Fatalf("Failed to create DynamoDB client: %v", err)
    }

    // Create server instance
    server := api.NewServer(dbClient)

    // Configure HTTP server
    httpServer := &http.Server{
        Addr:         ":8080",
        Handler:      server,
        ReadTimeout:  15 * time.Second,
        WriteTimeout: 15 * time.Second,
        IdleTimeout:  60 * time.Second,
    }

    // Start server in a goroutine
    go func() {
        log.Printf("Starting server on %s", httpServer.Addr)
        if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatalf("Server error: %v", err)
        }
    }()

    // Wait for interrupt signal to gracefully shutdown the server
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    log.Println("Shutting down server...")

    // Create a deadline for server shutdown
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := httpServer.Shutdown(ctx); err != nil {
        log.Fatalf("Server forced to shutdown: %v", err)
    }

    log.Println("Server stopped gracefully")
}