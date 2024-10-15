package main

import (
    "github.com/gin-gonic/gin"
    "net/http"
    "log"
    "os"
    "time"
	"fmt"
)

// Simulated sensor data
func getSensorData(c *gin.Context) {
    // Simulate some sensor data
    sensorData := gin.H{
        "heart_rate":    78,
        "temperature":   98.6,
        "blood_pressure": "120/80",
    }

    // Return the simulated sensor data as JSON
    c.JSON(http.StatusOK, sensorData)
}

func main() {
    // Create a Gin router with default middleware (logger and recovery)
    r := gin.New()

    // Logging to a file
    f, err := os.Create("gin.log")
    if err != nil {
        log.Fatalf("Failed to create log file: %v", err)
    }
    defer f.Close() // Ensure the file is closed when main exits

    // Set Gin's default logger to write to the log file
    gin.DefaultWriter = f

    // Use the built-in logger middleware with custom format
    r.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
        // Custom log format
        return fmt.Sprintf("[%s] - %s \"%s %s %s %d %s \"%s\" %s\"\n",
            param.TimeStamp.Format(time.RFC1123),
            param.ClientIP,
            param.Method,
            param.Path,
            param.Request.Proto,
            param.StatusCode,
            param.Latency,
            param.Request.UserAgent(),
            param.ErrorMessage,
        )
    }))

    // Use the built-in recovery middleware to recover from panics
    r.Use(gin.Recovery())

    // Define a route to get simulated sensor data
    r.GET("/sensor-data", getSensorData)

    // Start the server on port 8080
    if err := r.Run(":8080"); err != nil {
        log.Fatalf("Failed to run server: %v", err)
    }
}