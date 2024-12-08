package db

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/joho/godotenv"
)

// DynamoDBClient wraps the DynamoDB client and provides methods for database operations
type DynamoDBClient struct {
	client *dynamodb.Client
}

// VitalSigns represents the structure of vital signs data
type VitalSigns struct {
	PatientID      string  `json:"patient_id"`
	Timestamp      string  `json:"timestamp"`
	DeviceID       string  `json:"device_id"`
	HeartRate      int     `json:"heart_rate"`
	BloodPressure  string  `json:"blood_pressure"`
	Temperature    float64 `json:"temperature"`
	OxygenSat      int     `json:"oxygen_saturation"`
}

// NewDynamoDBClient creates a new DynamoDB client
func NewDynamoDBClient(region string) (*DynamoDBClient, error) {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			os.Getenv("AWS_ACCESS_KEY_ID"),
			os.Getenv("AWS_SECRET_ACCESS_KEY"),
			os.Getenv("AWS_SESSION_TOKEN"),
		)),
	)
	if err != nil {
		return nil, fmt.Errorf("unable to load AWS config: %v", err)
	}

	client := dynamodb.NewFromConfig(cfg)
	return &DynamoDBClient{client: client}, nil
}

// GetLatestVitalSigns retrieves the most recent vital signs for a given patient
func (d *DynamoDBClient) GetLatestVitalSigns(patientID string) (*VitalSigns, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String("VitalSigns"),
		KeyConditionExpression: aws.String("patient_id = :pid"),
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pid": &types.AttributeValueMemberS{Value: patientID},
		},
		ScanIndexForward: aws.Bool(false), // Sort in descending order (newest first)
		Limit:           aws.Int32(1),     // Get only the latest record
	}

	result, err := d.client.Query(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to query DynamoDB: %v", err)
	}

	if len(result.Items) == 0 {
		return nil, fmt.Errorf("no vital signs found for patient %s", patientID)
	}

	return parseVitalSigns(result.Items[0], patientID)
}

// GetVitalSignsInRange retrieves vital signs for a patient within a time range
func (d *DynamoDBClient) GetVitalSignsInRange(patientID, startTime, endTime string) ([]VitalSigns, error) {
	input := &dynamodb.QueryInput{
		TableName:              aws.String("VitalSigns"),
		KeyConditionExpression: aws.String("patient_id = :pid AND #ts BETWEEN :start AND :end"),
		ExpressionAttributeNames: map[string]string{
			"#ts": "timestamp",
		},
		ExpressionAttributeValues: map[string]types.AttributeValue{
			":pid":   &types.AttributeValueMemberS{Value: patientID},
			":start": &types.AttributeValueMemberS{Value: startTime},
			":end":   &types.AttributeValueMemberS{Value: endTime},
		},
	}

	result, err := d.client.Query(context.TODO(), input)
	if err != nil {
		return nil, fmt.Errorf("failed to query DynamoDB: %v", err)
	}

	vitalSignsList := make([]VitalSigns, 0, len(result.Items))
	for _, item := range result.Items {
		vitalSigns, err := parseVitalSigns(item, patientID)
		if err != nil {
			return nil, err
		}
		vitalSignsList = append(vitalSignsList, *vitalSigns)
	}

	return vitalSignsList, nil
}

// Helper function to parse DynamoDB items into VitalSigns struct
func parseVitalSigns(item map[string]types.AttributeValue, patientID string) (*VitalSigns, error) {
	vitalSigns := &VitalSigns{
		PatientID: patientID,
	}

	if v, ok := item["timestamp"].(*types.AttributeValueMemberS); ok {
		vitalSigns.Timestamp = v.Value
	}

	if v, ok := item["device_id"].(*types.AttributeValueMemberS); ok {
		vitalSigns.DeviceID = v.Value
	}

	if v, ok := item["heart_rate"].(*types.AttributeValueMemberN); ok {
		fmt.Sscanf(v.Value, "%d", &vitalSigns.HeartRate)
	}

	if v, ok := item["blood_pressure"].(*types.AttributeValueMemberS); ok {
		vitalSigns.BloodPressure = v.Value
	}

	if v, ok := item["temperature"].(*types.AttributeValueMemberN); ok {
		fmt.Sscanf(v.Value, "%f", &vitalSigns.Temperature)
	}

	if v, ok := item["oxygen_saturation"].(*types.AttributeValueMemberN); ok {
		fmt.Sscanf(v.Value, "%d", &vitalSigns.OxygenSat)
	}

	return vitalSigns, nil
}