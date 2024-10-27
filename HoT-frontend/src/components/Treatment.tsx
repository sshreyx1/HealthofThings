import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Treatment.css';
import { 
  Calendar, 
  Search, 
  Filter,
  FileText, 
  User, 
  Tag,
  Clock,
  Activity,
  Download,
  ChevronDown,
  Pill,
  X
} from 'lucide-react';

interface Treatment {
  id: number;
  date: string;
  category: string;
  doctor: string;
  description: string;
  medications: Medication[];
  report?: string;
  followUp?: string;
  status: 'Completed' | 'Ongoing' | 'Scheduled';
  documents?: Document[];
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface Document {
  name: string;
  type: string;
  url: string;
}

const Treatment: React.FC = () => {
  // Mock data
  const mockTreatments: Treatment[] = [
    {
      id: 1,
      date: "2024-10-15",
      category: "Cardiology",
      doctor: "Dr. Michael Chen",
      description: "Routine cardiac evaluation and stress test. Patient shows improved cardiovascular performance compared to last visit.",
      medications: [
        {
          name: "Aspirin",
          dosage: "81mg",
          frequency: "Once daily",
          duration: "Ongoing"
        },
        {
          name: "Metoprolol",
          dosage: "25mg",
          frequency: "Twice daily",
          duration: "3 months"
        }
      ],
      report: "Cardiac_Report_Oct2024.pdf",
      followUp: "2024-12-15",
      status: "Completed",
      documents: [
        {
          name: "ECG Report",
          type: "PDF",
          url: "/reports/ecg-oct2024.pdf"
        },
        {
          name: "Stress Test Results",
          type: "PDF",
          url: "/reports/stress-test-oct2024.pdf"
        }
      ]
    },
    {
      id: 2,
      date: "2024-10-30",
      category: "General",
      doctor: "Dr. Sarah Johnson",
      description: "Annual check-up. Patient reports occasional headaches and fatigue. Blood work ordered.",
      medications: [
        {
          name: "Vitamin D3",
          dosage: "2000 IU",
          frequency: "Once daily",
          duration: "3 months"
        }
      ],
      status: "Ongoing",
      followUp: "2024-11-15",
      documents: [
        {
          name: "Blood Work Request",
          type: "PDF",
          url: "/reports/blood-work-request.pdf"
        }
      ]
    }
  ];

  const [treatments] = useState<Treatment[]>(mockTreatments);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', 'Cardiology', 'General', 'Orthopedics', 'Neurology'];

  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || treatment.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="treatment-page">
      <Sidebar />
      <div className="treatment-content">
        <div className="treatment-header-container">
          <h1>Treatment History</h1>
          <div className="treatment-subheader">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search treatments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filter">
              <Filter size={20} />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="treatments-container">
          <div className="treatments-list">
            {filteredTreatments.map(treatment => (
              <div
                key={treatment.id}
                className={`treatment-card ${selectedTreatment?.id === treatment.id ? 'selected' : ''}`}
                onClick={() => setSelectedTreatment(treatment)}
              >
                <div className="treatment-card-header">
                  <div className="treatment-card-date">
                    <Calendar size={16} />
                    <span>{formatDate(treatment.date)}</span>
                  </div>
                  <span className={`treatment-status ${treatment.status.toLowerCase()}`}>
                    {treatment.status}
                  </span>
                </div>
                <div className="treatment-card-body">
                  <h3>{treatment.category}</h3>
                  <p className="treatment-doctor">
                    <User size={16} />
                    {treatment.doctor}
                  </p>
                  <p className="treatment-description">{treatment.description}</p>
                </div>
                <div className="treatment-card-footer">
                  <span className="medication-count">
                    <Pill size={16} />
                    {treatment.medications.length} Medications
                  </span>
                  {treatment.documents && (
                    <span className="document-count">
                      <FileText size={16} />
                      {treatment.documents.length} Documents
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {selectedTreatment && (
            <div className="treatment-details">
              <div className="details-header">
                <h2>Treatment Details</h2>
                <div className="details-header-controls">
                  <span className={`treatment-status ${selectedTreatment.status.toLowerCase()}`}>
                    {selectedTreatment.status}
                  </span>
                  <button 
                    className="close-button"
                    onClick={() => setSelectedTreatment(null)}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="details-section">
                <div className="detail-item">
                  <Calendar size={16} />
                  <div>
                    <h4>Date</h4>
                    <p>{formatDate(selectedTreatment.date)}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <Tag size={16} />
                  <div>
                    <h4>Category</h4>
                    <p>{selectedTreatment.category}</p>
                  </div>
                </div>
                <div className="detail-item">
                  <User size={16} />
                  <div>
                    <h4>Doctor</h4>
                    <p>{selectedTreatment.doctor}</p>
                  </div>
                </div>
                {selectedTreatment.followUp && (
                  <div className="detail-item">
                    <Clock size={16} />
                    <div>
                      <h4>Follow-up</h4>
                      <p>{formatDate(selectedTreatment.followUp)}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="details-section">
                <h3>Medical Description</h3>
                <p className="treatment-description">{selectedTreatment.description}</p>
              </div>

              <div className="details-section">
                <h3>Medications</h3>
                <div className="medications-list">
                  {selectedTreatment.medications.map((medication, index) => (
                    <div key={index} className="medication-item">
                      <div className="medication-header">
                        <Pill size={16} />
                        <h4>{medication.name}</h4>
                        <span className="medication-duration">{medication.duration}</span>
                      </div>
                      <div className="medication-details">
                        <span>Dosage: {medication.dosage}</span>
                        <span>Frequency: {medication.frequency}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedTreatment.documents && (
                <div className="details-section">
                  <h3>Documents</h3>
                  <div className="documents-list">
                    {selectedTreatment.documents.map((document, index) => (
                      <div key={index} className="document-item">
                        <div className="document-info">
                          <FileText size={16} />
                          <span>{document.name}</span>
                          <span className="document-type">{document.type}</span>
                        </div>
                        <button className="download-button">
                          <Download size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Treatment;