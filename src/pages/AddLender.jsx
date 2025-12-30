import { useNavigate } from "react-router-dom";
import { useState } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import "./EditLender.css";
import { createLender } from "../api/lenderApi";

/* =====================
   DEFAULT DUMMY DATA FOR PREFILL
   ===================== */
const DUMMY_LENDER = {
  lenderCode: "LEND001",
  lenderName: "ABC Finance Ltd",
  lenderType: "NBFC",
  contactPersonName: "Rajesh Kumar",
  contactMobile: "+919876543210",
  contactEmail: "rajesh.kumar@abcfinance.com",
  registeredAddress: "123 Finance Tower, Connaught Place, New Delhi",
  state: "Delhi",
  region: "North",
  gstNumber: "07AABCU9603R1Z5",
  panNumber: "AABCU9603R",
  billingCycle: "WEEKLY",
  paymentTermsDays: 15,
  ldApplicable: true,
  ldPercentageCap: 5,
  pilotStartDate: "2025-01-01",
  pilotEndDate: "2025-03-31",
  agreementStartDate: "2025-04-01",
  agreementEndDate: "2026-03-31",
  status: "ACTIVE",
  remarks: "Premium tier lender with excellent payment history",
};

/* =====================
   EMPTY MODEL
   ===================== */
const EMPTY_LENDER = {
  lenderCode: "",
  lenderName: "",
  lenderType: "NBFC",
  contactPersonName: "",
  contactMobile: "",
  contactEmail: "",
  registeredAddress: "",
  state: "",
  region: "",
  gstNumber: "",
  panNumber: "",
  billingCycle: "WEEKLY",
  paymentTermsDays: 0,
  ldApplicable: false,
  ldPercentageCap: 0,
  pilotStartDate: "",
  pilotEndDate: "",
  agreementStartDate: "",
  agreementEndDate: "",
  status: "ACTIVE",
  remarks: "",
};

export default function AddLender() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_LENDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /* =====================
     FILL DUMMY DATA
     ===================== */
  const fillDummyData = () => {
    setFormData(DUMMY_LENDER);
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
      // Convert paymentTermsDays and ldPercentageCap to numbers
      const payload = {
        ...formData,
        paymentTermsDays: Number(formData.paymentTermsDays),
        ldPercentageCap: Number(formData.ldPercentageCap),
      };

      const result = await createLender(payload);

      if (result.success) {
        console.log("Lender created successfully:", result.data);
        alert("Lender created successfully!");
        navigate("/lenders");
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
      <LenderPageHeader />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Add Lender</h2>
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
              Lender Code*
              <input
                name="lenderCode"
                value={formData.lenderCode}
                onChange={handleChange}
                placeholder="Enter lender code"
                required
                disabled={loading}
              />
            </label>

            <label>
              Lender Name*
              <input
                name="lenderName"
                value={formData.lenderName}
                onChange={handleChange}
                placeholder="Enter lender name"
                required
                disabled={loading}
              />
            </label>

            <label>
              Lender Type*
              <select
                name="lenderType"
                value={formData.lenderType}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="NBFC">NBFC</option>
                <option value="Bank">Bank</option>
              </select>
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
              Registered Address*
              <input
                name="registeredAddress"
                value={formData.registeredAddress}
                onChange={handleChange}
                placeholder="Enter registered address"
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
              Region*
              <input
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="Enter region"
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
                placeholder="07AABCU9603R1Z5"
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
                placeholder="AABCU9603R"
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
                name="ldPercentageCap"
                value={formData.ldPercentageCap}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                disabled={!formData.ldApplicable || loading}
              />
            </label>

            <label>
              Pilot Start Date*
              <input
                type="date"
                name="pilotStartDate"
                value={formData.pilotStartDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>

            <label>
              Pilot End Date*
              <input
                type="date"
                name="pilotEndDate"
                value={formData.pilotEndDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>

            <label>
              Agreement Start Date*
              <input
                type="date"
                name="agreementStartDate"
                value={formData.agreementStartDate}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </label>

            <label>
              Agreement End Date*
              <input
                type="date"
                name="agreementEndDate"
                value={formData.agreementEndDate}
                onChange={handleChange}
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
                onClick={() => navigate("/lenders")}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Lender"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
