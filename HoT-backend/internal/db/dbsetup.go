// internal/db/dynamodb.go
package db

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "strconv"
    "github.com/aws/aws-sdk-go-v2/aws"
    "github.com/aws/aws-sdk-go-v2/config"
    "github.com/aws/aws-sdk-go-v2/credentials"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb"
    "github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type DynamoDBClient struct {
    client *dynamodb.Client
}

func NewDynamoDBClient(accessKey, secretKey, sessionToken, region string) (*DynamoDBClient, error) {
    log.Printf("Initializing DynamoDB client with region: %s", region)
    
    cfg, err := config.LoadDefaultConfig(context.TODO(),
        config.WithRegion(region),
        config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
            accessKey,
            secretKey,
            sessionToken,
        )),
    )
    if err != nil {
        log.Printf("Error loading AWS config: %v", err)
        return nil, fmt.Errorf("unable to load AWS config: %v", err)
    }

    return &DynamoDBClient{
        client: dynamodb.NewFromConfig(cfg),
    }, nil
}

// Alert Methods
func (d *DynamoDBClient) GetAllAlerts() ([]Alert, error) {
    input := &dynamodb.ScanInput{
        TableName: aws.String("VitalAlert"),
    }

    result, err := d.client.Scan(context.TODO(), input)
    if err != nil {
        log.Printf("Error scanning Alerts table: %v", err)
        return nil, fmt.Errorf("failed to scan Alerts table: %v", err)
    }

    var alerts []Alert
    for _, item := range result.Items {
        alert, err := parseAlertItem(item)
        if err != nil {
            log.Printf("Warning: Error parsing alert item: %v", err)
            continue
        }
        alerts = append(alerts, alert)
    }

    return alerts, nil
}

func (d *DynamoDBClient) GetAlertsByPatientID(patientID string) ([]Alert, error) {
    input := &dynamodb.QueryInput{
        TableName: aws.String("VitalAlert"),
        KeyConditionExpression: aws.String("patient_id = :pid"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":pid": &types.AttributeValueMemberS{Value: patientID},
        },
    }

    result, err := d.client.Query(context.TODO(), input)
    if err != nil {
        return nil, fmt.Errorf("failed to query alerts: %v", err)
    }

    var alerts []Alert
    for _, item := range result.Items {
        alert, err := parseAlertItem(item)
        if err != nil {
            log.Printf("Warning: Error parsing alert item: %v", err)
            continue
        }
        alerts = append(alerts, alert)
    }

    return alerts, nil
}

func (d *DynamoDBClient) CreateAlert(alert Alert) error {
    item := map[string]types.AttributeValue{
        "patient_id":  &types.AttributeValueMemberS{Value: alert.PatientID},
        "timestamp":   &types.AttributeValueMemberS{Value: alert.Timestamp},
        "alert_id":    &types.AttributeValueMemberS{Value: alert.AlertID},
        "message":     &types.AttributeValueMemberS{Value: alert.Message},
        "message_id":  &types.AttributeValueMemberS{Value: alert.MessageID},
        "severity":    &types.AttributeValueMemberS{Value: alert.Severity},
        "status":      &types.AttributeValueMemberS{Value: alert.Status},
        "unit":        &types.AttributeValueMemberS{Value: alert.Unit},
        "vital_type":  &types.AttributeValueMemberS{Value: alert.VitalType},
        "value":       &types.AttributeValueMemberN{Value: fmt.Sprintf("%f", alert.Value)},
    }

    input := &dynamodb.PutItemInput{
        TableName: aws.String("VitalAlert"),
        Item:     item,
    }

    _, err := d.client.PutItem(context.TODO(), input)
    if err != nil {
        return fmt.Errorf("failed to create alert: %v", err)
    }

    return nil
}

// Add this method for updating alert status
func (d *DynamoDBClient) UpdateAlertStatus(alertID string, patientID string, status string) error {
    input := &dynamodb.UpdateItemInput{
        TableName: aws.String("VitalAlert"),
        Key: map[string]types.AttributeValue{
            "alert_id":   &types.AttributeValueMemberS{Value: alertID},
            "patient_id": &types.AttributeValueMemberS{Value: patientID},
        },
        UpdateExpression: aws.String("SET #status = :status"),
        ExpressionAttributeNames: map[string]string{
            "#status": "status",
        },
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":status": &types.AttributeValueMemberS{Value: status},
        },
    }

    _, err := d.client.UpdateItem(context.TODO(), input)
    if err != nil {
        return fmt.Errorf("failed to update alert status: %v", err)
    }

    return nil
}

// Existing Methods
func (d *DynamoDBClient) GetAllPatients() ([]Patient, error) {
    input := &dynamodb.ScanInput{
        TableName: aws.String("PatientRecord"),
    }

    result, err := d.client.Scan(context.TODO(), input)
    if err != nil {
        return nil, fmt.Errorf("failed to scan PatientRecord: %v", err)
    }

    var patients []Patient
    for _, item := range result.Items {
        var patient Patient
        
        // Parse string fields
        stringFields := map[string]*string{
            "patient_id":      &patient.PatientID,
            "name":           &patient.Name,
            "gender":         &patient.Gender,
            "location":       &patient.Location,
            "monitoring_type": &patient.MonitoringType,
        }

        for field, ptr := range stringFields {
            if v, ok := item[field].(*types.AttributeValueMemberS); ok {
                *ptr = v.Value
            }
        }

        // Parse age
        if v, ok := item["age"].(*types.AttributeValueMemberN); ok {
            age, _ := strconv.Atoi(v.Value)
            patient.Age = age
        }

        // Parse contact
        if v, ok := item["contact"].(*types.AttributeValueMemberM); ok {
            if phone, ok := v.Value["phone"].(*types.AttributeValueMemberS); ok {
                patient.Contact.Phone = phone.Value
            }
        }

        // Parse medical history
        if v, ok := item["medical_history"].(*types.AttributeValueMemberS); ok {
            json.Unmarshal([]byte(v.Value), &patient.MedicalHistory)
        }

        // Parse emergency contacts
        if v, ok := item["emergency_contacts"].(*types.AttributeValueMemberS); ok {
            json.Unmarshal([]byte(v.Value), &patient.EmergencyContacts)
        }

        patients = append(patients, patient)
    }

    return patients, nil
}

func (d *DynamoDBClient) GetLatestVitalSigns(patientID string) (*VitalSigns, error) {
    input := &dynamodb.QueryInput{
        TableName:              aws.String("VitalSigns"),
        KeyConditionExpression: aws.String("patient_id = :pid"),
        ExpressionAttributeValues: map[string]types.AttributeValue{
            ":pid": &types.AttributeValueMemberS{Value: patientID},
        },
        ScanIndexForward: aws.Bool(false),
        Limit:           aws.Int32(1),
    }

    result, err := d.client.Query(context.TODO(), input)
    if err != nil {
        return nil, fmt.Errorf("failed to query DynamoDB: %v", err)
    }

    if len(result.Items) == 0 {
        return nil, fmt.Errorf("no vital signs found for patient %s", patientID)
    }

    return parseVitalSigns(result.Items[0])
}

func (d *DynamoDBClient) GetPatientByID(patientID string) (*Patient, error) {
    input := &dynamodb.GetItemInput{
        TableName: aws.String("PatientRecord"),
        Key: map[string]types.AttributeValue{
            "patient_id": &types.AttributeValueMemberS{Value: patientID},
        },
    }

    result, err := d.client.GetItem(context.TODO(), input)
    if err != nil {
        return nil, fmt.Errorf("failed to get patient: %v", err)
    }

    if result.Item == nil {
        return nil, fmt.Errorf("patient not found")
    }

    var patient Patient
    
    // Parse string fields
    stringFields := map[string]*string{
        "patient_id":      &patient.PatientID,
        "name":           &patient.Name,
        "gender":         &patient.Gender,
        "location":       &patient.Location,
        "monitoring_type": &patient.MonitoringType,
    }

    for field, ptr := range stringFields {
        if v, ok := result.Item[field].(*types.AttributeValueMemberS); ok {
            *ptr = v.Value
        }
    }

    // Parse age
    if v, ok := result.Item["age"].(*types.AttributeValueMemberN); ok {
        age, _ := strconv.Atoi(v.Value)
        patient.Age = age
    }

    // Parse other fields as needed

    return &patient, nil
}

// Helper functions
func parseAlertItem(item map[string]types.AttributeValue) (Alert, error) {
    var alert Alert

    stringFields := map[string]*string{
        "patient_id":  &alert.PatientID,
        "timestamp":   &alert.Timestamp,
        "alert_id":    &alert.AlertID,
        "message":     &alert.Message,
        "message_id":  &alert.MessageID,
        "severity":    &alert.Severity,
        "status":      &alert.Status,
        "unit":        &alert.Unit,
        "vital_type":  &alert.VitalType,
    }

    for field, ptr := range stringFields {
        if v, ok := item[field].(*types.AttributeValueMemberS); ok {
            *ptr = v.Value
        }
    }

    if v, ok := item["value"].(*types.AttributeValueMemberN); ok {
        value, err := strconv.ParseFloat(v.Value, 64)
        if err != nil {
            return alert, fmt.Errorf("error parsing value field: %v", err)
        }
        alert.Value = value
    }

    return alert, nil
}

func parseVitalSigns(item map[string]types.AttributeValue) (*VitalSigns, error) {
    vs := &VitalSigns{}

    // Parse string fields
    stringFields := map[string]*string{
        "patient_id":      &vs.PatientID,
        "timestamp":       &vs.Timestamp,
        "category":        &vs.Category,
        "condition":       &vs.Condition,
        "device_id":       &vs.DeviceID,
        "name":            &vs.Name,
        "processing_time": &vs.ProcessingTime,
    }

    for field, ptr := range stringFields {
        if v, ok := item[field].(*types.AttributeValueMemberS); ok {
            *ptr = v.Value
        }
    }

    // Parse vital_signs map
    if vitalMap, ok := item["vital_signs"].(*types.AttributeValueMemberM); ok {
        getValue := func(attr types.AttributeValue) string {
            if n, ok := attr.(*types.AttributeValueMemberN); ok {
                return n.Value
            }
            return "0"
        }

        oxygen, _ := strconv.Atoi(getValue(vitalMap.Value["oxygen_saturation"]))
        systolic, _ := strconv.Atoi(getValue(vitalMap.Value["blood_pressure_systolic"]))
        diastolic, _ := strconv.Atoi(getValue(vitalMap.Value["blood_pressure_diastolic"]))
        heartbeat, _ := strconv.Atoi(getValue(vitalMap.Value["heartbeat"]))
        temp, _ := strconv.ParseFloat(getValue(vitalMap.Value["temperature"]), 64)
        glucose, _ := strconv.Atoi(getValue(vitalMap.Value["blood_glucose"]))
        respiration, _ := strconv.Atoi(getValue(vitalMap.Value["respiration_rate"]))

        vs.VitalSigns = VitalData{
            OxygenSaturation:      oxygen,
            BloodPressureSystolic: systolic,
            BloodPressureDiastolic: diastolic,
            Heartbeat:             heartbeat,
            Temperature:           temp,
            BloodGlucose:          glucose,
            RespirationRate:       respiration,
        }
    }

    return vs, nil
}