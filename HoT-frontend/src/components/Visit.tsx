import React, { useState } from 'react';
import Sidebar from './Sidebar';
import './Visit.css';
import { 
  CreditCard, 
  Building2, 
  CalendarDays, 
  DollarSign, 
  FileText, 
  User, 
  Heart, 
  Shield, 
  CheckCircle, 
  Clock,
  AlertCircle
} from 'lucide-react';

interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  coverageType: string;
  copay: number;
}

interface VisitDetails {
  date: string;
  doctor: string;
  department: string;
  type: string;
  cost: number;
  insuranceCoverage: number;
  status: string;
}

const Visit: React.FC = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('credit-card');

  const insuranceInfo: InsuranceInfo = {
    provider: "HealthGuard Insurance",
    policyNumber: "HG-123456789",
    coverageType: "Premium Health Plan",
    copay: 30
  };

  const visitDetails: VisitDetails = {
    date: "2024-10-30",
    doctor: "Dr. Sarah Johnson",
    department: "Cardiology",
    type: "Follow-up Consultation",
    cost: 250,
    insuranceCoverage: 200,
    status: "Pending Payment"
  };

  const handlePayment = () => {
    // Payment processing logic would go here
    alert('Processing payment...');
  };

  return (
    <div className="visit-page">
      <Sidebar />
      <div className="visit-content">
        <h1>Visit Payment</h1>

        <div className="visit-grid">
          {/* Visit Summary Card */}
          <div className="visit-card summary-card">
            <div className="card-header">
              <h2>Visit Summary</h2>
              <span className={`visit-status ${visitDetails.status.toLowerCase().replace(' ', '-')}`}>
                {visitDetails.status}
              </span>
            </div>
            <div className="visit-details">
              <div className="detail-row">
                <CalendarDays size={20} />
                <div>
                  <label>Date</label>
                  <p>{new Date(visitDetails.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              <div className="detail-row">
                <User size={20} />
                <div>
                  <label>Doctor</label>
                  <p>{visitDetails.doctor}</p>
                </div>
              </div>
              <div className="detail-row">
                <Building2 size={20} />
                <div>
                  <label>Department</label>
                  <p>{visitDetails.department}</p>
                </div>
              </div>
              <div className="detail-row">
                <FileText size={20} />
                <div>
                  <label>Visit Type</label>
                  <p>{visitDetails.type}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Insurance Information Card */}
          <div className="visit-card insurance-card">
            <div className="card-header">
              <h2>Insurance Information</h2>
              <Shield size={20} />
            </div>
            <div className="insurance-details">
              <div className="detail-row">
                <Building2 size={20} />
                <div>
                  <label>Provider</label>
                  <p>{insuranceInfo.provider}</p>
                </div>
              </div>
              <div className="detail-row">
                <FileText size={20} />
                <div>
                  <label>Policy Number</label>
                  <p>{insuranceInfo.policyNumber}</p>
                </div>
              </div>
              <div className="detail-row">
                <Heart size={20} />
                <div>
                  <label>Coverage Type</label>
                  <p>{insuranceInfo.coverageType}</p>
                </div>
              </div>
              <div className="detail-row">
                <DollarSign size={20} />
                <div>
                  <label>Copay Amount</label>
                  <p>${insuranceInfo.copay.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="visit-card payment-card">
            <div className="card-header">
              <h2>Payment Details</h2>
              <CreditCard size={20} />
            </div>
            <div className="payment-details">
              <div className="cost-breakdown">
                <div className="cost-row">
                  <span>Visit Cost</span>
                  <span>${visitDetails.cost.toFixed(2)}</span>
                </div>
                <div className="cost-row insurance-coverage">
                  <span>Insurance Coverage</span>
                  <span>-${visitDetails.insuranceCoverage.toFixed(2)}</span>
                </div>
                <div className="cost-row copay">
                  <span>Copay</span>
                  <span>${insuranceInfo.copay.toFixed(2)}</span>
                </div>
                <div className="cost-row total">
                  <span>Total Due</span>
                  <span>${(visitDetails.cost - visitDetails.insuranceCoverage + insuranceInfo.copay).toFixed(2)}</span>
                </div>
              </div>

              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="payment-options">
                  <label className={`payment-option ${selectedPaymentMethod === 'credit-card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="credit-card"
                      checked={selectedPaymentMethod === 'credit-card'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <CreditCard size={20} />
                    <span>Credit Card</span>
                    <CheckCircle className="check-icon" size={16} />
                  </label>

                  <label className={`payment-option ${selectedPaymentMethod === 'bank-transfer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment-method"
                      value="bank-transfer"
                      checked={selectedPaymentMethod === 'bank-transfer'}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    />
                    <Building2 size={20} />
                    <span>Bank Transfer</span>
                    <CheckCircle className="check-icon" size={16} />
                  </label>
                </div>
              </div>

              <div className="payment-notice">
                <AlertCircle size={16} />
                <p>Payment is required before the visit. Insurance coverage amounts are estimated.</p>
              </div>

              <button className="pay-button" onClick={handlePayment}>
                Pay ${(visitDetails.cost - visitDetails.insuranceCoverage + insuranceInfo.copay).toFixed(2)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Visit;