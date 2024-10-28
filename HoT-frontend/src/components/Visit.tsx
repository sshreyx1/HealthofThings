import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './Sidebar';
import './Visit.css';
import * as Select from '@radix-ui/react-select';
import {
  Building2, CalendarDays, User, Phone, Calendar, MapPin,
  Clock, Heart, Stethoscope, AlertCircle, ChevronDown, Check,
  FileText, CreditCard, Brain, Bone, Eye, Thermometer,
  Pill, Smile, GraduationCap, Languages, ClipboardList,
  Car, Ambulance, Navigation, Bus
} from 'lucide-react';
import { GoogleMap, useLoadScript, Marker, InfoWindow, Libraries } from '@react-google-maps/api';

// Types
interface Coordinates {
  lat: number;
  lng: number;
}

interface PreviousVisit {
  lastVisit: string;
  conditions: string[];
  department?: string;
}

interface DoctorInfo {
  id: string;
  name: string;
  specialty: string;
  designation: string;
  qualifications: string[];
  experience: number;
  languages: string[];
  availableSlots?: string[];
  previouslyVisited?: PreviousVisit;
  education: string[];
  specialInterests: string[];
  department?: string;
  consultationHours?: {
    days: string;
    hours: string;
  };
}

interface HospitalInfo {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: number;
  coordinates: Coordinates;
  departments: string[];
  doctors: DoctorInfo[];
  accreditation: string[];
  facilities: string[];
  emergencyWaitTime?: number;
  parkingAvailable?: boolean;
  publicTransport: string[];
  operatingHours: {
    emergency: string;
    outpatient: string;
    visiting: string;
  };
}

interface Specialty {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  commonConditions?: string[];
  requiresReferral?: boolean;
}

// Constants
const libraries: Libraries = ["places"];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const singaporeCenter: Coordinates = {
  lat: 1.3521,
  lng: 103.8198
};

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi.business',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

// Specialty Data
const specialties: Specialty[] = [
  {
    id: 'cardiology',
    name: 'Cardiology',
    icon: <Heart className="text-red-500" />,
    description: 'Heart conditions, chest pain, and cardiovascular health',
    commonConditions: ['Heart Disease', 'Hypertension', 'Arrhythmia'],
    requiresReferral: true
  },
  {
    id: 'general',
    name: 'General Practice',
    icon: <Stethoscope className="text-blue-500" />,
    description: 'Regular check-ups and general health concerns',
    commonConditions: ['Health Screening', 'Vaccinations', 'Common Illnesses'],
    requiresReferral: false
  },
  {
    id: 'neurology',
    name: 'Neurology',
    icon: <Brain className="text-purple-500" />,
    description: 'Brain, spine, and nervous system disorders',
    commonConditions: ['Headaches', 'Stroke', 'Epilepsy'],
    requiresReferral: true
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics',
    icon: <Bone className="text-gray-500" />,
    description: 'Bone and joint problems, sports injuries',
    commonConditions: ['Joint Pain', 'Sports Injuries', 'Fractures'],
    requiresReferral: true
  },
  {
    id: 'ophthalmology',
    name: 'Ophthalmology',
    icon: <Eye className="text-cyan-500" />,
    description: 'Eye care and vision problems',
    commonConditions: ['Vision Problems', 'Cataracts', 'Glaucoma'],
    requiresReferral: true
  }
];

// Hospital Data
const hospitals: HospitalInfo[] = [
  {
    id: "sgh",
    name: "Singapore General Hospital",
    address: "Outram Road, Singapore 169608",
    phone: "6222 3322",
    distance: 0,
    coordinates: { lat: 1.2795, lng: 103.8347 },
    departments: ['cardiology', 'neurology', 'orthopedics', 'general', 'ophthalmology'],
    accreditation: [],
    facilities: ['A&E Services', 'Specialist Outpatient Clinics', 'Day Surgery'],
    emergencyWaitTime: 45,
    parkingAvailable: true,
    publicTransport: ['Outram Park MRT (EW16)', 'Bus 33, 63, 75'],
    operatingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Fri: 8:30 AM - 5:30 PM',
      visiting: 'Daily: 12:00 PM - 8:00 PM'
    },
    doctors: [
      {
        id: "sgh-1",
        name: "Dr. Sarah Johnson",
        specialty: "cardiology",
        designation: "Senior Consultant, Department of Cardiology",
        qualifications: ["MBBS", "MRCP (UK)", "FAMS (Cardiology)"],
        experience: 15,
        languages: ["English", "Mandarin"],
        availableSlots: ["2024-10-29", "2024-10-30", "2024-10-31"],
        previouslyVisited: {
          lastVisit: "2024-09-15",
          conditions: ["Annual heart screening", "Hypertension follow-up"]
        },
        education: [
          "National University of Singapore",
          "Royal College of Physicians, UK"
        ],
        specialInterests: [
          "Interventional Cardiology",
          "Cardiac Imaging",
          "Preventive Cardiology"
        ]
      },
      {
        id: "sgh-2",
        name: "Dr. Michael Chen",
        specialty: "neurology",
        designation: "Consultant Neurologist",
        qualifications: ["MBBS", "MRCP (UK)", "FAMS (Neurology)"],
        experience: 12,
        languages: ["English", "Mandarin", "Hokkien"],
        education: [
          "National University of Singapore",
          "Mayo Clinic Fellowship"
        ],
        specialInterests: [
          "Stroke Management",
          "Neuromuscular Disorders",
          "Headache Medicine"
        ]
      },
      {
        id: "sgh-3",
        name: "Dr. Emily Wong",
        specialty: "ophthalmology",
        designation: "Senior Consultant, Eye Centre",
        qualifications: ["MBBS", "FRCOphth (UK)"],
        experience: 18,
        languages: ["English", "Cantonese"],
        education: [
          "University of Hong Kong",
          "Moorfields Eye Hospital, UK"
        ],
        specialInterests: [
          "Cataract Surgery",
          "Glaucoma Management",
          "Diabetic Retinopathy"
        ]
      }
    ]
  },
  {
    id: "ttsh",
    name: "Tan Tock Seng Hospital",
    address: "11 Jalan Tan Tock Seng, Singapore 308433",
    phone: "6256 6011",
    distance: 0,
    coordinates: { lat: 1.3215, lng: 103.8470 },
    departments: ['cardiology', 'orthopedics', 'general', 'ophthalmology'],
    accreditation: [],
    facilities: ['24/7 A&E Services', 'Rehabilitation Centre'],
    emergencyWaitTime: 30,
    parkingAvailable: true,
    publicTransport: ['Novena MRT (NS21)', 'Bus 21, 131, 139'],
    operatingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Fri: 8:00 AM - 5:30 PM',
      visiting: 'Daily: 12:00 PM - 8:00 PM'
    },
    doctors: [
      {
        id: "ttsh-1",
        name: "Dr. James Lee",
        specialty: "orthopedics",
        designation: "Senior Consultant, Orthopedic Surgery",
        qualifications: ["MBBS", "FRCS (Orth)", "FAMS"],
        experience: 20,
        languages: ["English", "Mandarin"],
        education: [
          "National University of Singapore",
          "Royal College of Surgeons"
        ],
        specialInterests: [
          "Joint Replacement",
          "Sports Injuries",
          "Spine Surgery"
        ]
      },
      {
        id: "ttsh-2",
        name: "Dr. Anna Tan",
        specialty: "general",
        designation: "Family Physician",
        qualifications: ["MBBS", "MCFP(S)"],
        experience: 8,
        languages: ["English", "Mandarin", "Malay"],
        education: [
          "National University of Singapore",
          "College of Family Physicians Singapore"
        ],
        specialInterests: [
          "Preventive Medicine",
          "Chronic Disease Management",
          "Women's Health"
        ]
      }
    ]
  },
  {
    id: "nuh",
    name: "National University Hospital",
    address: "5 Lower Kent Ridge Road, Singapore 119074",
    phone: "6779 5555",
    distance: 0,
    coordinates: { lat: 1.2940, lng: 103.7830 },
    departments: ['cardiology', 'neurology', 'ophthalmology', 'general'],
    accreditation: [],
    facilities: ['Emergency Department', 'Children\'s Emergency'],
    emergencyWaitTime: 35,
    parkingAvailable: true,
    publicTransport: ['Kent Ridge MRT (CC24)', 'Bus 95, 96, 97'],
    operatingHours: {
      emergency: '24/7',
      outpatient: 'Mon-Fri: 8:00 AM - 5:30 PM',
      visiting: 'Daily: 12:00 PM - 8:00 PM'
    },
    doctors: [
      {
        id: "nuh-1",
        name: "Dr. David Tan",
        specialty: "cardiology",
        designation: "Consultant Cardiologist",
        qualifications: ["MBBS", "MRCP (UK)", "FAMS"],
        experience: 10,
        languages: ["English", "Mandarin"],
        education: [
          "National University of Singapore",
          "London School of Cardiology"
        ],
        specialInterests: [
          "Heart Failure",
          "Cardiac Rehabilitation",
          "Preventive Cardiology"
        ]
      },
      {
        id: "nuh-2",
        name: "Dr. Rachel Lim",
        specialty: "ophthalmology",
        designation: "Consultant Ophthalmologist",
        qualifications: ["MBBS", "MMed (Ophth)", "FRCS (Edin)"],
        experience: 12,
        languages: ["English", "Mandarin", "Teochew"],
        education: [
          "Yong Loo Lin School of Medicine",
          "Singapore National Eye Centre"
        ],
        specialInterests: [
          "Pediatric Ophthalmology",
          "Strabismus",
          "Refractive Surgery"
        ]
      }
    ]
  }
];

const Visit: React.FC = () => {
  // Google Maps setup with Vite environment variable
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
    libraries
  });

  // State
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<HospitalInfo | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [userLocation, setUserLocation] = useState<Coordinates>(singaporeCenter);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [directionMode, setDirectionMode] = useState<'DRIVING' | 'TRANSIT'>('DRIVING');


  // Generate time slots
  const generateTimeSlots = () => {
    const slots = [];
    const start = 9; // 9 AM
    const end = 17; // 5 PM

    for (let hour = start; hour <= end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }

    return slots;
  };

  // Get today's date
  const [today] = useState(() => {
    const date = new Date();
    return date.toISOString().split('T')[0];
  });

  // Effects
  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setUserLocation(singaporeCenter);
        }
      );
    }
  }, []);

  // Calculate distance function
  const calculateDistance = useCallback((point1: Coordinates, point2: Coordinates): number => {
    const R = 6371;
    const dLat = (point2.lat - point1.lat) * Math.PI / 180;
    const dLon = (point2.lng - point1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Available hospitals calculation
  const availableHospitals = useMemo(() => {
    return hospitals
      .map(hospital => ({
        ...hospital,
        distance: calculateDistance(userLocation, hospital.coordinates)
      }))
      .sort((a, b) => a.distance - b.distance);
  }, [userLocation, calculateDistance]);

  useEffect(() => {
    if (isEmergency) {
      setSelectedSpecialty('');
      setSelectedDoctor(null);
      setAppointmentDate('');

      const nearestAE = availableHospitals.find(hospital =>
        hospital.facilities.some(facility =>
          facility.toLowerCase().includes('a&e') ||
          facility.toLowerCase().includes('emergency')
        )
      );

      if (nearestAE) {
        setSelectedHospital(nearestAE);
      }
    } else {
      setSelectedHospital(null);
    }
  }, [isEmergency, availableHospitals]);

  // Available doctors calculation
  const availableDoctors = useMemo(() => {
    if (!selectedHospital || isEmergency) return [];

    return selectedHospital.doctors
      .filter(doctor => !selectedSpecialty || doctor.specialty === selectedSpecialty)
      .sort((a, b) => {
        if (a.previouslyVisited && !b.previouslyVisited) return -1;
        if (!a.previouslyVisited && b.previouslyVisited) return 1;
        return b.experience - a.experience;
      });
  }, [selectedHospital, selectedSpecialty, isEmergency]);

  // Handlers
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const handleMarkerClick = useCallback((hospitalId: string) => {
    setSelectedMarker(hospitalId);
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (hospital && mapRef) {
      mapRef.panTo(hospital.coordinates);
      mapRef.setZoom(15);
    }
  }, [mapRef]);

  const getDirectionsUrl = useCallback((hospital: HospitalInfo) => {
    const destination = `${hospital.coordinates.lat},${hospital.coordinates.lng}`;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${directionMode.toLowerCase()}`;
  }, [userLocation, directionMode]);

  const handleHospitalSelect = useCallback((hospital: HospitalInfo) => {
    setSelectedHospital(hospital);
    setSelectedDoctor(null);
    if (mapRef) {
      mapRef.panTo(hospital.coordinates);
      mapRef.setZoom(15);
    }
    setSelectedMarker(hospital.id);
  }, [mapRef]);

  const handleDoctorSelect = useCallback((doctor: DoctorInfo) => {
    setSelectedDoctor(doctor);
  }, []);

  const handleAppointmentSubmit = useCallback(() => {
    if (isEmergency) {
      if (!selectedHospital) {
        alert('Please select a hospital with A&E services');
        return;
      }

      alert(`
        Emergency consultation requested at ${selectedHospital.name}
        Current estimated wait time: ${selectedHospital.emergencyWaitTime} minutes
        Please proceed to the A&E department immediately
        Address: ${selectedHospital.address}
        Emergency Contact: ${selectedHospital.phone}
      `);
    } else {
      if (!selectedHospital || !selectedDoctor || !appointmentDate || !appointmentTime) {
        alert('Please fill in all required fields');
        return;
      }

      alert(`
        Appointment booked successfully:
        Hospital: ${selectedHospital.name}
        Doctor: ${selectedDoctor.name}
        Date: ${new Date(appointmentDate).toLocaleDateString('en-SG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
        Time: ${appointmentTime}
      `);
    }
  }, [isEmergency, selectedHospital, selectedDoctor, appointmentDate, appointmentTime]);

  // Map rendering function
  const renderMap = () => {
    if (loadError) return <div className="map-error">Error loading maps</div>;
    if (!isLoaded) return <div className="map-loading">Loading maps...</div>;

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={12}
        center={userLocation}
        options={mapOptions}
        onLoad={handleMapLoad}
      >
        {/* User location marker */}
        <Marker
          position={userLocation}
          icon={{
            url: '/images/user-location.png',
            scaledSize: new google.maps.Size(30, 30)
          }}
          title="Your Location"
        />

        {/* Hospital markers */}
        {availableHospitals
          .filter(hospital => {
            if (!selectedSpecialty) return true;
            return hospital.doctors.some(doctor => doctor.specialty === selectedSpecialty);
          })
          .map(hospital => (
            <Marker
              key={hospital.id}
              position={hospital.coordinates}
              onClick={() => handleMarkerClick(hospital.id)}
              // Remove any default label or title to prevent the small popup
              label=""
            >
              {selectedMarker === hospital.id && (
                // Update the InfoWindow content structure
                <InfoWindow
                  onCloseClick={() => setSelectedMarker(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -40),
                    maxWidth: 360, // Adjusted width
                    disableAutoPan: false
                  }}
                >
                  <div className="marker-info">
                    <div className="marker-header">
                      <h3>{hospital.name}</h3>
                      <button
                        onClick={() => setSelectedMarker(null)}
                        className="close-button"
                      >
                        ×
                      </button>
                    </div>

                    <div className="info-row">
                      <MapPin size={16} />
                      <p>{hospital.address}</p>
                    </div>

                    <div className="info-row">
                      <Car size={16} />
                      <p>{hospital.distance.toFixed(1)} km away</p>
                    </div>

                    {hospital.emergencyWaitTime && (
                      <div className="info-row">
                        <Clock size={16} />
                        <p>~{hospital.emergencyWaitTime} min wait</p>
                      </div>
                    )}
                  </div>
                </InfoWindow>
              )}
            </Marker>
          ))}
      </GoogleMap>
    );
  };

  // Main Render
  return (
    <div className="visit-page">
      <Sidebar />
      <div className="visit-content">
        <h1>Medical Appointment Booking</h1>

        {/* Emergency Toggle */}
        <div
          className={`emergency-alert ${isEmergency ? 'active' : ''}`}
          onClick={() => setIsEmergency(!isEmergency)}
        >
          <AlertCircle className="alert-icon" />
          <div className="alert-content">
            <h3>Need urgent medical attention?</h3>
            <p>{isEmergency
              ? 'Click to switch to regular appointment booking'
              : 'Click for A&E services'}
            </p>
          </div>
        </div>

        {isEmergency ? (
          // Emergency Flow
          <div className="emergency-section">
            <div className="emergency-info-banner">
              <div className="emergency-primary-action">
                <a href="tel:995" className="emergency-call-button">
                  <Ambulance size={24} />
                  <div>
                    <strong>Call 995</strong>
                    <span>For life-threatening emergencies</span>
                  </div>
                </a>
              </div>

              <div className="emergency-info">
                <h2>Nearest A&E Departments</h2>
                <div className="map-container">
                  {renderMap()}
                </div>

                <div className="hospitals-list">
                  {availableHospitals
                    .filter(hospital => !selectedSpecialty || hospital.doctors.some(doctor => doctor.specialty === selectedSpecialty))
                    .map(hospital => (
                      <div
                        key={hospital.id}
                        className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                        onClick={() => handleHospitalSelect(hospital)}
                      >
                        <div className="hospital-main-info">
                          <Building2 className="hospital-icon text-blue-500" />
                          <div className="hospital-details">
                            <h3>{hospital.name}</h3>
                            <p className="hospital-address">{hospital.address}</p>
                            <div className="hospital-meta">
                              <span className="distance">
                                <Car size={16} />
                                {hospital.distance.toFixed(1)} km away
                              </span>
                              {hospital.emergencyWaitTime && (
                                <span className="wait-time">
                                  <Clock size={16} />
                                  ~{hospital.emergencyWaitTime} min wait
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="hospital-actions">
                          <button
                            type="button"
                            className="action-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `tel:${hospital.phone}`;
                            }}
                          >
                            <Phone size={16} />
                            Call Hospital
                          </button>
                          <button
                            type="button"
                            className="action-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(getDirectionsUrl(hospital), '_blank');
                            }}
                          >
                            <Navigation size={16} />
                            Get Directions
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Regular Appointment Flow
          <div className="appointment-section">
            {/* Specialty Selection */}
            <div className="visit-card">
              <div className="card-header">
                <h2>Select Medical Specialty</h2>
                <Stethoscope />
              </div>
              <div className="card-content">
                <Select.Root
                  value={selectedSpecialty}
                  onValueChange={value => {
                    setSelectedSpecialty(value);
                    setSelectedDoctor(null);
                    if (selectedHospital && !selectedHospital.doctors.some(d => d.specialty === value)) {
                      setSelectedHospital(null);
                    }
                  }}
                >
                  <Select.Trigger className="select-trigger">
                    <Select.Value placeholder="Choose specialty..." />
                    <Select.Icon>
                      <ChevronDown className="select-icon" />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content className="select-content">
                      <Select.ScrollUpButton className="select-scroll-button">
                        <ChevronDown size={16} className="rotate-180" />
                      </Select.ScrollUpButton>
                      <Select.Viewport className="select-viewport">
                        {specialties.map((specialty) => (
                          <Select.Item
                            key={specialty.id}
                            value={specialty.id}
                            className="select-item"
                          >
                            <Select.ItemText>
                              <div className="select-item-content">
                                {specialty.icon}
                                <span>{specialty.name}</span>
                              </div>
                            </Select.ItemText>
                            <Select.ItemIndicator className="select-item-indicator">
                              <Check size={16} />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>
                      <Select.ScrollDownButton className="select-scroll-button">
                        <ChevronDown size={16} />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                {selectedSpecialty && (
                  <div className="specialty-info">
                    <p className="specialty-description">
                      {specialties.find(s => s.id === selectedSpecialty)?.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital Selection */}
            <div className="visit-card">
              <div className="card-header">
                <h2>Select Hospital</h2>
                <Building2 />
              </div>
              <div className="card-content">
                <div className="map-container">
                  {renderMap()}
                </div>

                <div className="hospitals-list">
                  {availableHospitals
                    .filter(hospital => {
                      if (!selectedSpecialty) return true;
                      return hospital.doctors.some(doctor => doctor.specialty === selectedSpecialty);
                    })
                    .map(hospital => (
                      <div
                        key={hospital.id}
                        className={`hospital-card ${selectedHospital?.id === hospital.id ? 'selected' : ''}`}
                        onClick={() => handleHospitalSelect(hospital)}
                      >
                        <div className="hospital-main-info">
                          <Building2 className="hospital-icon" />
                          <div className="hospital-details">
                            <h3>{hospital.name}</h3>
                            <p className="hospital-address">{hospital.address}</p>
                            <div className="hospital-meta">
                              <span className="distance">
                                <MapPin size={16} />
                                {hospital.distance.toFixed(1)} km away
                              </span>
                              <span className="operating-hours">
                                <Clock size={16} />
                                {hospital.operatingHours.outpatient}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="hospital-transport">
                          <div className="transport-item">
                            <h4>Public Transport</h4>
                            <div className="transport-tags">
                              {hospital.publicTransport.map((transport, index) => (
                                <span key={index} className="transport-tag">
                                  {transport.toLowerCase().includes('mrt') ? (
                                    <Car size={16} />
                                  ) : (
                                    <Bus size={16} />
                                  )}
                                  {transport}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Doctor Selection */}
            {selectedHospital && (
              <div className="visit-card">
                <div className="card-header">
                  <h2>Select Doctor</h2>
                  <User />
                </div>
                <div className="card-content">
                  <div className="doctors-list">
                    {availableDoctors.map(doctor => (
                      <div
                        key={doctor.id}
                        className={`doctor-card ${selectedDoctor?.id === doctor.id ? 'selected' : ''} 
                 ${doctor.previouslyVisited ? 'previously-visited' : ''}`}
                        onClick={() => handleDoctorSelect(doctor)}
                      >
                        <div className="doctor-header">
                          <div className="doctor-primary-info">
                            <div className="doctor-name-section">
                              <h3>{doctor.name}</h3>
                              <p className="doctor-specialty">
                                {specialties.find(s => s.id === doctor.specialty)?.name}
                              </p>
                              <p className="doctor-designation">{doctor.designation}</p>
                            </div>
                          </div>

                          {/* Move experience info next to name */}
                          <div className="doctor-meta-info">
                            {doctor.previouslyVisited && (
                              <span className="previous-visit-badge">
                                Previously Consulted
                              </span>
                            )}
                            <div className="doctor-experience">
                              <Clock size={16} />
                              <span>{doctor.experience} years experience</span>
                            </div>
                          </div>

                          <div className="doctor-credentials">
                            <div className="credential-section">
                              <GraduationCap size={16} />
                              <div className="credentials-list">
                                {doctor.qualifications.map((qual, index) => (
                                  <span key={index} className="credential-tag">{qual}</span>
                                ))}
                              </div>
                            </div>

                            <div className="credential-section">
                              <Languages size={16} />
                              <div className="languages-list">
                                {doctor.languages.map((lang, index) => (
                                  <span key={index} className="language-tag">{lang}</span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {doctor.previouslyVisited && (
                            <div className="previous-visit-info">
                              <div className="visit-header">
                                <Calendar size={16} />
                                <span>Previous Consultation</span>
                              </div>
                              <div className="visit-details">
                                <p className="visit-date">
                                  Last visit: {doctor.previouslyVisited.lastVisit}
                                </p>
                                <div className="conditions-list">
                                  {doctor.previouslyVisited.conditions.map((condition, index) => (
                                    <span key={index} className="condition-tag">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Booking */}
            {selectedDoctor && (
              <div className="visit-card booking-card">
                <div className="card-header">
                  <h2>Schedule Appointment</h2>
                  <Calendar />
                </div>
                <div className="card-content">
                  <div className="booking-inputs">
                    <div className="date-selection">
                      <label>Select Appointment Date</label>
                      <input
                        type="date"
                        value={appointmentDate}
                        min={today}
                        onChange={(e) => setAppointmentDate(e.target.value)}
                        className="date-input"
                      />
                    </div>

                    <div className="time-selection">
                      <label>Select Appointment Time</label>
                      <select
                        className="time-input"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        required
                      >
                        <option value="">Choose a time...</option>
                        {generateTimeSlots().map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="summary-row">
                      <Building2 size={16} />
                      <div>
                        <label>Hospital</label>
                        <p>{selectedHospital?.name}</p>
                        <span className="summary-detail">
                          {selectedHospital?.address}
                        </span>
                      </div>
                    </div>

                    <div className="summary-row">
                      <User size={16} />
                      <div>
                        <label>Doctor</label>
                        <p>{selectedDoctor.name}</p>
                        <span className="summary-detail">
                          {specialties.find(s => s.id === selectedDoctor.specialty)?.name}
                        </span>
                      </div>
                    </div>

                    {appointmentDate && appointmentTime && (
                      <div className="summary-row">
                        <Calendar size={16} />
                        <div>
                          <label>Appointment Schedule</label>
                          <p>
                            {new Date(appointmentDate).toLocaleDateString('en-SG', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                          <span className="summary-detail">
                            Time: {appointmentTime}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="book-button"
                    onClick={handleAppointmentSubmit}
                    disabled={!appointmentDate || !appointmentTime}
                  >
                    Confirm Appointment
                  </button>
                </div>
              </div>
            )}

            {/* Document Requirements Section */}
            <div className="info-sections">
              <div className="info-section">
                <h2>Required Documents</h2>
                <div className="documents-grid">
                  <div className="document-category">
                    <h3>Basic Documents</h3>
                    <ul className="document-list">
                      <li>
                        <FileText size={16} />
                        <span>NRIC/FIN/Passport</span>
                      </li>
                      <li>
                        <FileText size={16} />
                        <span>Appointment Card (for follow-ups)</span>
                      </li>
                    </ul>
                  </div>
                  <div className="document-category">
                    <h3>Medical Documents</h3>
                    <ul className="document-list">
                      <li>
                        <FileText size={16} />
                        <span>Previous Medical Reports</span>
                      </li>
                      <li>
                        <FileText size={16} />
                        <span>Current Medications List</span>
                      </li>
                      {selectedSpecialty && specialties.find(s => s.id === selectedSpecialty)?.requiresReferral && (
                        <li>
                          <FileText size={16} />
                          <span>Referral Letter</span>
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="document-category">
                    <h3>Payment Documents</h3>
                    <ul className="document-list">
                      <li>
                        <CreditCard size={16} />
                        <span>Insurance Card</span>
                      </li>
                      <li>
                        <CreditCard size={16} />
                        <span>CHAS/Pioneer/Merdeka Card (if applicable)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="info-section">
                <h2>Payment & Insurance</h2>
                <div className="payment-grid">
                  <div className="payment-category">
                    <h3>Government Schemes</h3>
                    <ul className="payment-list">
                      <li>
                        <CreditCard size={16} />
                        <div>
                          <span>MediSave</span>
                          <p>Use your MediSave for approved treatments</p>
                        </div>
                      </li>
                      <li>
                        <CreditCard size={16} />
                        <div>
                          <span>MediShield Life</span>
                          <p>Basic health insurance coverage</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="payment-category">
                    <h3>Payment Methods</h3>
                    <ul className="payment-list">
                      <li>
                        <CreditCard size={16} />
                        <span>NETS / PayNow</span>
                      </li>
                      <li>
                        <CreditCard size={16} />
                        <span>Credit/Debit Cards</span>
                      </li>
                      <li>
                        <CreditCard size={16} />
                        <span>Cash</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Visit;