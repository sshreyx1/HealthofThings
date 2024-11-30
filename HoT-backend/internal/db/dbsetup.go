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

    log.Println("AWS configuration loaded successfully")
    return &DynamoDBClient{
        client: dynamodb.NewFromConfig(cfg),
    }, nil
}

func (d *DynamoDBClient) GetAllPatients() ([]Patient, error) {
    log.Println("Starting GetAllPatients operation")

    input := &dynamodb.ScanInput{
        TableName: aws.String("PatientRecord"),
    }

    log.Printf("Scanning PatientRecord table...")
    result, err := d.client.Scan(context.TODO(), input)
    if err != nil {
        log.Printf("Error scanning PatientRecord table: %v", err)
        return nil, fmt.Errorf("failed to scan PatientRecord: %v", err)
    }

    log.Printf("Found %d items in PatientRecord table", len(result.Items))

    var patients []Patient
    for i, item := range result.Items {
        log.Printf("Processing patient %d of %d", i+1, len(result.Items))
        
        // Log raw DynamoDB item for troubleshooting
        itemJSON, _ := json.MarshalIndent(item, "", "  ")
        log.Printf("Raw DynamoDB item:\n%s", string(itemJSON))

        var patient Patient

        // Parse basic string fields
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
                log.Printf("Parsed %s: %s", field, v.Value)
            } else {
                log.Printf("Warning: Field %s not found or not a string", field)
            }
        }

        // Parse age
        if v, ok := item["age"].(*types.AttributeValueMemberN); ok {
            age, err := strconv.Atoi(v.Value)
            if err != nil {
                log.Printf("Error parsing age: %v", err)
            } else {
                patient.Age = age
                log.Printf("Parsed age: %d", age)
            }
        } else {
            log.Printf("Warning: Age field not found or not a number")
        }

        // Parse contact
        if v, ok := item["contact"].(*types.AttributeValueMemberM); ok {
            if phone, ok := v.Value["phone"].(*types.AttributeValueMemberS); ok {
                patient.Contact.Phone = phone.Value
                log.Printf("Parsed contact phone: %s", phone.Value)
            }
        } else {
            log.Printf("Warning: Contact field not found or not a map")
        }

        // Parse medical history
        if v, ok := item["medical_history"].(*types.AttributeValueMemberS); ok {
            var history []MedicalHistory
            if err := json.Unmarshal([]byte(v.Value), &history); err != nil {
                log.Printf("Error parsing medical history: %v", err)
            } else {
                patient.MedicalHistory = history
                log.Printf("Parsed medical history with %d conditions", len(history))
            }
        } else {
            log.Printf("Warning: Medical history field not found or not a string")
        }

        // Parse emergency contacts
        if v, ok := item["emergency_contacts"].(*types.AttributeValueMemberS); ok {
            var contacts []EmergencyContact
            if err := json.Unmarshal([]byte(v.Value), &contacts); err != nil {
                log.Printf("Error parsing emergency contacts: %v", err)
            } else {
                patient.EmergencyContacts = contacts
                log.Printf("Parsed %d emergency contacts", len(contacts))
            }
        } else {
            log.Printf("Warning: Emergency contacts field not found or not a string")
        }

        // Set status based on monitoring_type
        switch patient.MonitoringType {
        case "icu":
            patient.Status = "Critical"
        case "emergency":
            patient.Status = "Urgent"
        case "hospital":
            patient.Status = "Stable"
        case "remote":
            patient.Status = "Normal"
        }
        log.Printf("Set patient status to: %s", patient.Status)

        // Get vital signs
        vitals, err := d.GetLatestVitalSigns(patient.PatientID)
        if err != nil {
            log.Printf("Warning: No vital signs found for patient %s: %v", patient.PatientID, err)
        } else {
            patient.VitalSigns = &vitals.VitalSigns
            log.Printf("Added vital signs for patient %s", patient.PatientID)
        }

        patients = append(patients, patient)
        log.Printf("Successfully processed patient: %s - %s", patient.PatientID, patient.Name)
    }

    log.Printf("Successfully retrieved and processed %d patients", len(patients))
    return patients, nil
}

func (d *DynamoDBClient) GetPatientByID(patientID string) (*Patient, error) {
    log.Printf("Getting patient by ID: %s", patientID)

    input := &dynamodb.GetItemInput{
        TableName: aws.String("PatientRecord"),
        Key: map[string]types.AttributeValue{
            "patient_id": &types.AttributeValueMemberS{Value: patientID},
        },
    }

    result, err := d.client.GetItem(context.TODO(), input)
    if err != nil {
        log.Printf("Error getting patient %s: %v", patientID, err)
        return nil, fmt.Errorf("failed to get patient: %v", err)
    }

    if result.Item == nil {
        log.Printf("No patient found with ID: %s", patientID)
        return nil, fmt.Errorf("patient not found")
    }

    // Log raw DynamoDB item for troubleshooting
    itemJSON, _ := json.MarshalIndent(result.Item, "", "  ")
    log.Printf("Raw DynamoDB item for patient %s:\n%s", patientID, string(itemJSON))

    var patient Patient

    // Parse basic string fields
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
            log.Printf("Parsed %s: %s", field, v.Value)
        } else {
            log.Printf("Warning: Field %s not found or not a string", field)
        }
    }

    // Parse age
    if v, ok := result.Item["age"].(*types.AttributeValueMemberN); ok {
        age, err := strconv.Atoi(v.Value)
        if err != nil {
            log.Printf("Error parsing age: %v", err)
        } else {
            patient.Age = age
            log.Printf("Parsed age: %d", age)
        }
    } else {
        log.Printf("Warning: Age field not found or not a number")
    }

    // Parse contact
    if v, ok := result.Item["contact"].(*types.AttributeValueMemberM); ok {
        if phone, ok := v.Value["phone"].(*types.AttributeValueMemberS); ok {
            patient.Contact.Phone = phone.Value
            log.Printf("Parsed contact phone: %s", phone.Value)
        }
    } else {
        log.Printf("Warning: Contact field not found or not a map")
    }

    // Parse medical history
    if v, ok := result.Item["medical_history"].(*types.AttributeValueMemberS); ok {
        var history []MedicalHistory
        if err := json.Unmarshal([]byte(v.Value), &history); err != nil {
            log.Printf("Error parsing medical history: %v", err)
        } else {
            patient.MedicalHistory = history
            log.Printf("Parsed medical history with %d conditions", len(history))
        }
    } else {
        log.Printf("Warning: Medical history field not found or not a string")
    }

    // Parse emergency contacts
    if v, ok := result.Item["emergency_contacts"].(*types.AttributeValueMemberS); ok {
        var contacts []EmergencyContact
        if err := json.Unmarshal([]byte(v.Value), &contacts); err != nil {
            log.Printf("Error parsing emergency contacts: %v", err)
        } else {
            patient.EmergencyContacts = contacts
            log.Printf("Parsed %d emergency contacts", len(contacts))
        }
    } else {
        log.Printf("Warning: Emergency contacts field not found or not a string")
    }

    // Set status based on monitoring_type
    switch patient.MonitoringType {
    case "icu":
        patient.Status = "Critical"
    case "emergency":
        patient.Status = "Urgent"
    case "hospital":
        patient.Status = "Stable"
    case "remote":
        patient.Status = "Normal"
    }
    log.Printf("Set patient status to: %s", patient.Status)

    // Get vital signs
    vitals, err := d.GetLatestVitalSigns(patientID)
    if err != nil {
        log.Printf("Warning: No vital signs found: %v", err)
    } else {
        patient.VitalSigns = &vitals.VitalSigns
        log.Printf("Added vital signs data")
    }

    log.Printf("Successfully retrieved patient: %s - %s", patient.PatientID, patient.Name)
    return &patient, nil
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

    // Print the query input for debugging
    log.Printf("Query Input: %+v\n", input)

    result, err := d.client.Query(context.TODO(), input)
    if err != nil {
        log.Printf("Error querying DynamoDB: %v", err)
        return nil, fmt.Errorf("failed to query DynamoDB: %v", err)
    }

    if len(result.Items) == 0 {
        log.Printf("No vital signs found for patient %s", patientID)
        return nil, fmt.Errorf("no vital signs found for patient %s", patientID)
    }

    // Print complete raw item for debugging
    log.Printf("Complete Raw DynamoDB Item:")
    for k, v := range result.Items[0] {
        log.Printf("Key: %s, Value: %+v\n", k, v)
    }

    return parseVitalSigns(result.Items[0])
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
            log.Printf("Found %s: %s\n", field, v.Value)
        }
    }

    // Parse alerts_generated
    if v, ok := item["alerts_generated"].(*types.AttributeValueMemberBOOL); ok {
        vs.AlertsGenerated = v.Value
        log.Printf("Found alerts_generated: %v\n", v.Value)
    }

    // Parse vital_signs as a map
    if vitalMap, ok := item["vital_signs"].(*types.AttributeValueMemberM); ok {
        log.Printf("Found vital_signs as map\n")

        // Helper function to get numeric value
        getValue := func(attr types.AttributeValue) string {
            if n, ok := attr.(*types.AttributeValueMemberN); ok {
                return n.Value
            }
            return "0"
        }

        // Extract each vital sign
        oxygen, _ := strconv.Atoi(getValue(vitalMap.Value["oxygen_saturation"]))
        systolic, _ := strconv.Atoi(getValue(vitalMap.Value["blood_pressure_systolic"]))
        diastolic, _ := strconv.Atoi(getValue(vitalMap.Value["blood_pressure_diastolic"]))
        heartbeat, _ := strconv.Atoi(getValue(vitalMap.Value["heartbeat"]))
        temp, _ := strconv.ParseFloat(getValue(vitalMap.Value["temperature"]), 64)
        glucose, _ := strconv.Atoi(getValue(vitalMap.Value["blood_glucose"]))
        respiration, _ := strconv.Atoi(getValue(vitalMap.Value["respiration_rate"]))

        // Debug print values
        log.Printf("Parsed vital signs values:")
        log.Printf("- Oxygen: %d", oxygen)
        log.Printf("- Systolic: %d", systolic)
        log.Printf("- Diastolic: %d", diastolic)
        log.Printf("- Heartbeat: %d", heartbeat)
        log.Printf("- Temperature: %.1f", temp)
        log.Printf("- Glucose: %d", glucose)
        log.Printf("- Respiration: %d", respiration)

        vs.VitalSigns = VitalData{
            OxygenSaturation:      oxygen,
            BloodPressureSystolic: systolic,
            BloodPressureDiastolic: diastolic,
            Heartbeat:             heartbeat,
            Temperature:           temp,
            BloodGlucose:         glucose,
            RespirationRate:      respiration,
        }
    } else {
        log.Printf("vital_signs not found as map type: %T", item["vital_signs"])
    }

    return vs, nil
}
