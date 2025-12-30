import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import "./EditLender.css";
import { getLenderById, updateLender } from "../api/lenderApi";

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

/**
 * Convert ISO date string to YYYY-MM-DD format for date input
 */
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  try {
    // Handle both ISO string and already formatted dates
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", isoDateString, error);
    return "";
  }
};

export default function EditLender() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_LENDER);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* =====================
     FETCH LENDER DATA
     ===================== */
  useEffect(() => {
    const fetchLender = async () => {
      console.log("Fetching lender with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getLenderById(id);
        console.log("getLenderById Result:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          console.log("API Data received:", apiData);

          // Create form data object with all fields explicitly mapped
          const newFormData = {
            lenderCode: apiData.lenderCode ?? "",
            lenderName: apiData.lenderName ?? "",
            lenderType: apiData.lenderType ?? "NBFC",
            contactPersonName: apiData.contactPersonName ?? "",
            contactMobile: apiData.contactMobile ?? "",
            contactEmail: apiData.contactEmail ?? "",
            registeredAddress: apiData.registeredAddress ?? "",
            state: apiData.state ?? "",
            region: apiData.region ?? "",
            gstNumber: apiData.gstNumber ?? "",
            panNumber: apiData.panNumber ?? "",
            billingCycle: apiData.billingCycle ?? "WEEKLY",
            paymentTermsDays: apiData.paymentTermsDays ?? 0,
            ldApplicable: apiData.ldApplicable ?? false,
            ldPercentageCap: apiData.ldPercentageCap ?? 0,
            pilotStartDate: formatDateForInput(apiData.pilotStartDate),
            pilotEndDate: formatDateForInput(apiData.pilotEndDate),
            agreementStartDate: formatDateForInput(apiData.agreementStartDate),
            agreementEndDate: formatDateForInput(apiData.agreementEndDate),
            status: apiData.status ?? "ACTIVE",
            remarks: apiData.remarks ?? "",
          };

          console.log("Setting form data to:", newFormData);
          setFormData(newFormData);
        } else {
          const errorMsg = result.error || "Failed to fetch lender data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchLender:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchLender();
    } else {
      setLoading(false);
      setError("No lender ID provided");
    }
  }, [id]);

  /* =====================
     HANDLE CHANGE
     ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log(`Field changed: ${name} = ${type === "checkbox" ? checked : value}`);

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
    setSubmitting(true);
    setError(null);

    try {
      // Convert to proper types for API
      const payload = {
        lenderCode: formData.lenderCode,
        lenderName: formData.lenderName,
        lenderType: formData.lenderType,
        contactPersonName: formData.contactPersonName,
        contactMobile: formData.contactMobile,
        contactEmail: formData.contactEmail,
        registeredAddress: formData.registeredAddress,
        state: formData.state,
        region: formData.region,
        gstNumber: formData.gstNumber,
        panNumber: formData.panNumber,
        billingCycle: formData.billingCycle,
        paymentTermsDays: Number(formData.paymentTermsDays),
        ldApplicable: Boolean(formData.ldApplicable),
        ldPercentageCap: Number(formData.ldPercentageCap),
        pilotStartDate: formData.pilotStartDate,
        pilotEndDate: formData.pilotEndDate,
        agreementStartDate: formData.agreementStartDate,
        agreementEndDate: formData.agreementEndDate,
        status: formData.status,
        remarks: formData.remarks,
      };

      console.log("Submitting update with payload:", payload);

      const result = await updateLender(id, payload);

      if (result.success) {
        console.log("Lender updated successfully:", result.data);
        alert("Lender updated successfully!");
        navigate("/lenders");
      } else {
        setError(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error during update:", err);
      setError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching lender data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Edit Lender</h2>
            <div style={{ fontSize: "0.9rem", color: "#666", padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
              ID: <strong>{id}</strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                border: "1px solid #f5c6cb",
              }}
            >
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </label>

            <label>
              Lender Type*
              <select
                name="lenderType"
                value={formData.lenderType}
                onChange={handleChange}
                required
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </label>

            <label>
              Billing Cycle*
              <select
                name="billingCycle"
                value={formData.billingCycle}
                onChange={handleChange}
                required
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={!formData.ldApplicable || submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
              />
            </label>

            <label>
              Status*
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                disabled={submitting}
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
                disabled={submitting}
              />
            </label>

            {/* FORM BUTTONS */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/lenders")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                {submitting ? "Updating..." : "Update Lender"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
