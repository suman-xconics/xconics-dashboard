import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import { createAggregator } from "../api/aggregatorApi";
import "./EditLender.css";

/* =====================
   DUMMY DATA FOR PREFILL
   ===================== */
const DUMMY_AGGREGATOR = {
  aggregatorCode: "AGG001",
  aggregatorName: "Swift Services Pvt Ltd",
  contactPersonName: "Amit Sharma",
  contactMobile: "+919876543210",
  contactEmail: "amit.sharma@swiftservices.com",
  officeAddress: "456 Service Lane, Sector 62, Noida",
  state: "Uttar Pradesh",
  district: "Gautam Buddha Nagar",
  serviceCoverage: "North India",
  serviceType: "INSTALLATION",
  tatHours: 48,
  ldApplicable: true,
  ldPercentageCap: 3,
  billingCycle: "WEEKLY",
  paymentTermsDays: 30,
  contractStartDate: "2025-01-01",
  contractEndDate: "2026-12-31",
  bankName: "ICICI Bank",
  bankAccountNo: "987654321012",
  ifscCode: "ICIC0001234",
  gstNumber: "09AABCS1234F1Z5",
  panNumber: "AABCS1234F",
  status: "ACTIVE",
  remarks: "Reliable aggregator with excellent track record",
};

/* =====================
   EMPTY MODEL
   ===================== */
const EMPTY_AGGREGATOR = {
  aggregatorCode: "",
  aggregatorName: "",
  contactPersonName: "",
  contactMobile: "",
  contactEmail: "",
  officeAddress: "",
  state: "",
  district: "",
  serviceCoverage: "",
  serviceType: "INSTALLATION",
  tatHours: 0,
  ldApplicable: false,
  ldPercentageCap: 0,
  billingCycle: "MONTHLY",
  paymentTermsDays: 0,
  contractStartDate: "",
  contractEndDate: "",
  bankName: "",
  bankAccountNo: "",
  ifscCode: "",
  gstNumber: "",
  panNumber: "",
  status: "ACTIVE",
  remarks: "",
};

export default function AddAggregator() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState(EMPTY_AGGREGATOR);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =====================
     FILL DUMMY DATA
     ===================== */
  const fillDummyData = () => {
    setFormData(DUMMY_AGGREGATOR);
  };

  /* =====================
     HANDLE CHANGE
     ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =====================
     HANDLE SUBMIT
     ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert to proper types for API
      const payload = {
        aggregatorCode: formData.aggregatorCode,
        aggregatorName: formData.aggregatorName,
        contactPersonName: formData.contactPersonName,
        contactMobile: formData.contactMobile,
        contactEmail: formData.contactEmail,
        officeAddress: formData.officeAddress,
        state: formData.state,
        district: formData.district,
        serviceCoverage: formData.serviceCoverage,
        serviceType: formData.serviceType,
        tatHours: Number(formData.tatHours),
        ldApplicable: Boolean(formData.ldApplicable),
        ldPercentageCap: Number(formData.ldPercentageCap),
        billingCycle: formData.billingCycle,
        paymentTermsDays: Number(formData.paymentTermsDays),
        contractStartDate: formData.contractStartDate,
        contractEndDate: formData.contractEndDate,
        bankName: formData.bankName,
        bankAccountNo: formData.bankAccountNo,
        ifscCode: formData.ifscCode,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        status: formData.status,
        remarks: formData.remarks,
      };

      console.log("Creating aggregator with payload:", payload);

      const result = await createAggregator(payload);

      if (result.success) {
        console.log("Aggregator created successfully:", result.data);
        alert("Aggregator created successfully!");
        navigate("/aggregators");
      } else {
        setError(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Aggregator Master"
        breadcrumbLabel="Aggregator"
      />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Add Aggregator</h2>
            <button 
              type="button" 
              onClick={fillDummyData}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Fill Dummy Data
            </button>
          </div>

          {error && (
            <div style={{ 
              padding: "1rem", 
              marginBottom: "1rem", 
              backgroundColor: "#f8d7da", 
              color: "#721c24", 
              borderRadius: "4px",
              border: "1px solid #f5c6cb"
            }}>
              {error}
            </div>
          )}

          <form className="edit-form two-column" onSubmit={handleSubmit}>
            <label>
              Aggregator Code*
              <input
                name="aggregatorCode"
                value={formData.aggregatorCode}
                onChange={handleChange}
                placeholder="Enter aggregator code"
                required
                disabled={loading}
              />
            </label>

            <label>
              Aggregator Name*
              <input
                name="aggregatorName"
                value={formData.aggregatorName}
                onChange={handleChange}
                placeholder="Enter aggregator name"
                required
                disabled={loading}
              />
            </label>

            <label>
              Contact Person Name*
              <input
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                required
                disabled={loading}
              />
            </label>

            <label>
              Contact Mobile*
              <input
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                required
                disabled={loading}
              />
            </label>

            <label>
              Contact Email*
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="user@example.com"
                required
                disabled={loading}
              />
            </label>

            <label>
              Office Address*
              <input
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                placeholder="Enter office address"
                required
                disabled={loading}
              />
            </label>

            <label>
              State*
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                required
                disabled={loading}
              />
            </label>

            <label>
              District*
              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                required
                disabled={loading}
              />
            </label>

            <label>
              Service Coverage*
              <input
                name="serviceCoverage"
                value={formData.serviceCoverage}
                onChange={handleChange}
                placeholder="e.g., North India, Pan India"
                required
                disabled={loading}
              />
            </label>

            <label>
              Service Type*
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="INSTALLATION">Installation</option>
                <option value="MAINTENANCE">Maintenance</option>
                <option value="REPAIR">Repair</option>
                <option value="SURVEY">Survey</option>
              </select>
            </label>

            <label>
              TAT Hours*
              <input
                type="number"
                name="tatHours"
                value={formData.tatHours}
                onChange={handleChange}
                min="0"
                placeholder="Turnaround time in hours"
                required
                disabled={loading}
              />
            </label>

            <label>
              Billing Cycle*
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="QUARTERLY">Quarterly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </label>

            {/* INLINE LD APPLICABLE */}
            <div className="ld-inline-field">
              <span className="ld-inline-label">LD Applicable</span>
              <input
                type="checkbox"
                name="ldApplicable"
                checked={formData.ldApplicable}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            <label>
              LD Percentage Cap
              <input
                type="number"
                step="0.01"
                name="ldPercentageCap"
                value={formData.ldPercentageCap}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={!formData.ldApplicable || loading}
              />
            </label>

            <label>
              Payment Terms (Days)*
              <input
                type="number"
                name="paymentTermsDays"
                value={formData.paymentTermsDays}
                onChange={handleChange}
                min="0"
                required
                disabled={loading}
              />
            </label>

            <label>
              Contract Start Date*
              <input
                type="date"
                name="contractStartDate"
                value={formData.contractStartDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>

            <label>
              Contract End Date*
              <input
                type="date"
                name="contractEndDate"
                value={formData.contractEndDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>

            <label>
              Bank Name*
              <input
                name="bankName"
                value={formData.bankName}
                onChange={handleChange}
                placeholder="Enter bank name"
                required
                disabled={loading}
              />
            </label>

            <label>
              Bank Account No*
              <input
                name="bankAccountNo"
                value={formData.bankAccountNo}
                onChange={handleChange}
                placeholder="Enter account number"
                required
                disabled={loading}
              />
            </label>

            <label>
              IFSC Code*
              <input
                name="ifscCode"
                value={formData.ifscCode}
                onChange={handleChange}
                placeholder="ICIC0001234"
                required
                disabled={loading}
              />
            </label>

            <label>
              GST Number*
              <input
                name="gstNumber"
                value={formData.gstNumber}
                onChange={handleChange}
                placeholder="09AABCS1234F1Z5"
                required
                disabled={loading}
              />
            </label>

            <label>
              PAN Number*
              <input
                name="panNumber"
                value={formData.panNumber}
                onChange={handleChange}
                placeholder="AABCS1234F"
                required
                disabled={loading}
              />
            </label>

            <label>
              Status*
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>

            <label>
              Remarks
              <textarea
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks"
                rows="3"
                disabled={loading}
              />
            </label>

            {/* FORM BUTTONS */}
            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate("/aggregators")}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Aggregator"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
