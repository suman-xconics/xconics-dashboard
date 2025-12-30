import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import { getAggregatorById, updateAggregator } from "../api/aggregatorApi";
import "./EditLender.css";

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

/**
 * Convert ISO date string to YYYY-MM-DD format for date input
 */
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  try {
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

export default function EditAggregator() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_AGGREGATOR);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /* =====================
     FETCH AGGREGATOR DATA
     ===================== */
  useEffect(() => {
    const fetchAggregator = async () => {
      console.log("Fetching aggregator with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getAggregatorById(id);
        console.log("getAggregatorById Result:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          console.log("API Data received:", apiData);

          // Create form data object with all fields explicitly mapped
          const newFormData = {
            aggregatorCode: apiData.aggregatorCode ?? "",
            aggregatorName: apiData.aggregatorName ?? "",
            contactPersonName: apiData.contactPersonName ?? "",
            contactMobile: apiData.contactMobile ?? "",
            contactEmail: apiData.contactEmail ?? "",
            officeAddress: apiData.officeAddress ?? "",
            state: apiData.state ?? "",
            district: apiData.district ?? "",
            serviceCoverage: apiData.serviceCoverage ?? "",
            serviceType: apiData.serviceType ?? "INSTALLATION",
            tatHours: apiData.tatHours ?? 0,
            ldApplicable: apiData.ldApplicable ?? false,
            ldPercentageCap: apiData.ldPercentageCap ?? 0,
            billingCycle: apiData.billingCycle ?? "MONTHLY",
            paymentTermsDays: apiData.paymentTermsDays ?? 0,
            contractStartDate: formatDateForInput(apiData.contractStartDate),
            contractEndDate: formatDateForInput(apiData.contractEndDate),
            bankName: apiData.bankName ?? "",
            bankAccountNo: apiData.bankAccountNo ?? "",
            ifscCode: apiData.ifscCode ?? "",
            gstNumber: apiData.gstNumber ?? "",
            panNumber: apiData.panNumber ?? "",
            status: apiData.status ?? "ACTIVE",
            remarks: apiData.remarks ?? "",
          };

          console.log("Setting form data to:", newFormData);
          setFormData(newFormData);
        } else {
          const errorMsg = result.error || "Failed to fetch aggregator data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchAggregator:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAggregator();
    } else {
      setLoading(false);
      setError("No aggregator ID provided");
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

      console.log("Submitting update with payload:", payload);

      const result = await updateAggregator(id, payload);

      if (result.success) {
        console.log("Aggregator updated successfully:", result.data);
        alert("Aggregator updated successfully!");
        navigate("/aggregators");
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
        <LenderPageHeader
          title="Aggregator Master"
          breadcrumbLabel="Aggregator"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching aggregator data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Aggregator Master"
        breadcrumbLabel="Aggregator"
      />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Edit Aggregator</h2>
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
              Aggregator Code*
              <input
                name="aggregatorCode"
                value={formData.aggregatorCode}
                onChange={handleChange}
                placeholder="Enter aggregator code"
                required
                disabled={submitting}
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
                disabled={submitting}
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
              Office Address*
              <input
                name="officeAddress"
                value={formData.officeAddress}
                onChange={handleChange}
                placeholder="Enter office address"
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
              District*
              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                required
                disabled={submitting}
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
                disabled={submitting}
              />
            </label>

            <label>
              Service Type*
              <select
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                disabled={submitting}
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
                step="0.01"
                name="ldPercentageCap"
                value={formData.ldPercentageCap}
                onChange={handleChange}
                min="0"
                max="100"
                disabled={!formData.ldApplicable || submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                disabled={submitting}
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
                onClick={() => navigate("/aggregators")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="primary" disabled={submitting}>
                {submitting ? "Updating..." : "Update Aggregator"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
