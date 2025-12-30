import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import { 
  getLenderBranchById, 
  createLenderBranch, 
  updateLenderBranch,
  BRANCH_TYPES,
  STATUSES 
} from "../api/lenderBranchApi";
import { getLenders } from "../api/lenderApi";
import "./EditLender.css";

/* =====================
   DUMMY DATA FOR PREFILL
   ===================== */
const DUMMY_BRANCH = {
  lenderId: "",
  branchCode: "HDFC-MUM-001",
  branchName: "HDFC Mumbai Central Branch",
  branchType: "HO",
  contactPersonName: "Rajesh Kumar",
  contactMobile: "+919876543210",
  contactEmail: "rajesh.kumar@hdfc.com",
  address: "123, MG Road, Mumbai Central",
  state: "Maharashtra",
  district: "Mumbai",
  pincode: "400008",
  latitude: 18.9688,
  longitude: 72.8205,
  locationUpdatedAt: new Date().toISOString().split('T')[0],
  billingApplicable: true,
  status: "ACTIVE",
  remarks: "Main branch handling corporate loans",
};

/* =====================
   EMPTY MODEL
   ===================== */
const EMPTY_BRANCH = {
  lenderId: "",
  branchCode: "",
  branchName: "",
  branchType: "HO",
  contactPersonName: "",
  contactMobile: "",
  contactEmail: "",
  address: "",
  state: "",
  district: "",
  pincode: "",
  latitude: 0,
  longitude: 0,
  locationUpdatedAt: new Date().toISOString().split('T')[0],
  billingApplicable: false,
  status: "ACTIVE",
  remarks: "",
};

/**
 * Format date for input (YYYY-MM-DD)
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
    return "";
  }
};

export default function EditLenderBranch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState(EMPTY_BRANCH);
  const [lenders, setLenders] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [loadingLenders, setLoadingLenders] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  /* =====================
     FETCH LENDERS
     ===================== */
  useEffect(() => {
    const fetchLenders = async () => {
      setLoadingLenders(true);
      const result = await getLenders({ limit: 1000 });
      
      if (result.success) {
        setLenders(result.data);
      } else {
        console.error("Failed to fetch lenders:", result.error);
        alert("Warning: Failed to load lenders. Please refresh the page.");
      }
      
      setLoadingLenders(false);
    };

    fetchLenders();
  }, []);

  /* =====================
     FETCH BRANCH DATA (EDIT MODE)
     ===================== */
  useEffect(() => {
    if (!isEdit) return;

    const fetchBranch = async () => {
      console.log("Fetching lender branch with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getLenderBranchById(id);
        console.log("getLenderBranchById Result:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          console.log("API Data received:", apiData);

          // Map API data to form state
          const newFormData = {
            lenderId: apiData.lenderId ?? "",
            branchCode: apiData.branchCode ?? "",
            branchName: apiData.branchName ?? "",
            branchType: apiData.branchType ?? "BO",
            contactPersonName: apiData.contactPersonName ?? "",
            contactMobile: apiData.contactMobile ?? "",
            contactEmail: apiData.contactEmail ?? "",
            address: apiData.address ?? "",
            state: apiData.state ?? "",
            district: apiData.district ?? "",
            pincode: apiData.pincode ?? "",
            latitude: apiData.latitude ?? 0,
            longitude: apiData.longitude ?? 0,
            locationUpdatedAt: formatDateForInput(apiData.locationUpdatedAt),
            billingApplicable: apiData.billingApplicable ?? false,
            status: apiData.status ?? "ACTIVE",
            remarks: apiData.remarks ?? "",
          };

          console.log("Setting form data to:", newFormData);
          setFormData(newFormData);
        } else {
          const errorMsg = result.error || "Failed to fetch lender branch data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchBranch:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [id, isEdit]);

  /* =====================
     FILL DUMMY DATA
     ===================== */
  const fillDummyData = () => {
    const dummyData = { ...DUMMY_BRANCH };
    
    // Set lender to first available lender
    if (lenders.length > 0) {
      dummyData.lenderId = lenders[0].id;
    }
    
    setFormData(dummyData);
    setErrors({});
    console.log("Filled dummy data:", dummyData);
  };

  /* =====================
     VALIDATION
     ===================== */
  const validate = () => {
    const newErrors = {};

    if (!formData.lenderId) {
      newErrors.lenderId = "Lender is required";
    }

    if (!formData.branchCode.trim()) {
      newErrors.branchCode = "Branch Code is required";
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch Name is required";
    }

    if (!formData.branchType) {
      newErrors.branchType = "Branch Type is required";
    }

    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = "Contact Person Name is required";
    }

    if (!formData.contactMobile.trim()) {
      newErrors.contactMobile = "Contact Mobile is required";
    } else if (formData.contactMobile.length < 10) {
      newErrors.contactMobile = "Mobile number must be at least 10 digits";
    }

    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = "Contact Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Invalid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    if (!formData.locationUpdatedAt) {
      newErrors.locationUpdatedAt = "Location Updated At is required";
    }

    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      console.log("Validation errors:", newErrors);
    }
    
    return Object.keys(newErrors).length === 0;
  };

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

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  /* =====================
     HANDLE SUBMIT
     ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert("Please fix all validation errors");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Prepare payload with proper types
      const payload = {
        lenderId: formData.lenderId,
        branchCode: formData.branchCode.trim(),
        branchName: formData.branchName.trim(),
        branchType: formData.branchType,
        contactPersonName: formData.contactPersonName.trim(),
        contactMobile: formData.contactMobile.trim(),
        contactEmail: formData.contactEmail.trim(),
        address: formData.address.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        pincode: formData.pincode.trim(),
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        locationUpdatedAt: formData.locationUpdatedAt,
        billingApplicable: formData.billingApplicable,
        status: formData.status,
        remarks: formData.remarks.trim(),
      };

      console.log(`${isEdit ? "Updating" : "Creating"} lender branch with payload:`, payload);

      const result = isEdit 
        ? await updateLenderBranch(id, payload)
        : await createLenderBranch(payload);

      if (result.success) {
        console.log(`Lender branch ${isEdit ? "updated" : "created"} successfully:`, result.data);
        alert(`Lender branch ${isEdit ? "updated" : "created"} successfully!`);
        navigate("/lender-branches");
      } else {
        setError(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
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
          title="Lender Branch"
          breadcrumbLabel="Lender Branch"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching lender branch data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Lender Branch"
        breadcrumbLabel="Lender Branch"
      />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          {/* HEADER WITH DUMMY DATA BUTTON */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>
              {isEdit ? "Edit Lender Branch" : "Add Lender Branch"}
            </h2>
            {!isEdit && (
              <button 
                type="button" 
                onClick={fillDummyData}
                disabled={submitting || loadingLenders}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: (submitting || loadingLenders) ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: (submitting || loadingLenders) ? 0.6 : 1
                }}
              >
                Fill Dummy Data
              </button>
            )}
            {isEdit && (
              <div style={{ fontSize: "0.9rem", color: "#666", padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
                ID: <strong>{id}</strong>
              </div>
            )}
          </div>

          {/* ERROR ALERT */}
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

          {/* FORM */}
          <form className="edit-form two-column" onSubmit={handleSubmit}>
            {/* Lender */}
            <label>
              Lender *
              <select
                name="lenderId"
                value={formData.lenderId}
                onChange={handleChange}
                disabled={submitting || loadingLenders}
                required
              >
                <option value="">
                  {loadingLenders ? "Loading lenders..." : "Select Lender"}
                </option>
                {lenders.map((lender) => (
                  <option key={lender.id} value={lender.id}>
                    {lender.lenderName} ({lender.lenderCode})
                  </option>
                ))}
              </select>
              {errors.lenderId && (
                <span className="error">{errors.lenderId}</span>
              )}
            </label>

            {/* Branch Code */}
            <label>
              Branch Code *
              <input
                name="branchCode"
                value={formData.branchCode}
                onChange={handleChange}
                placeholder="Enter branch code"
                disabled={submitting || (isEdit)} // Read-only in edit mode
                required
              />
              {errors.branchCode && (
                <span className="error">{errors.branchCode}</span>
              )}
            </label>

            {/* Branch Name */}
            <label>
              Branch Name *
              <input
                name="branchName"
                value={formData.branchName}
                onChange={handleChange}
                placeholder="Enter branch name"
                disabled={submitting}
                required
              />
              {errors.branchName && (
                <span className="error">{errors.branchName}</span>
              )}
            </label>

            {/* Branch Type */}
            <label>
              Branch Type *
              <select
                name="branchType"
                value={formData.branchType}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="">Select Type</option>
                <option value="HO">Head Office (HO)</option>
                <option value="RO">Regional Office (RO)</option>
                <option value="BO">Branch Office (BO)</option>
              </select>
              {errors.branchType && (
                <span className="error">{errors.branchType}</span>
              )}
            </label>

            {/* Contact Person Name */}
            <label>
              Contact Person Name *
              <input
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                disabled={submitting}
                required
              />
              {errors.contactPersonName && (
                <span className="error">{errors.contactPersonName}</span>
              )}
            </label>

            {/* Contact Mobile */}
            <label>
              Contact Mobile *
              <input
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                disabled={submitting}
                required
              />
              {errors.contactMobile && (
                <span className="error">{errors.contactMobile}</span>
              )}
            </label>

            {/* Contact Email */}
            <label>
              Contact Email *
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="contact@branch.com"
                disabled={submitting}
                required
              />
              {errors.contactEmail && (
                <span className="error">{errors.contactEmail}</span>
              )}
            </label>

            {/* Address */}
            <label>
              Address *
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                disabled={submitting}
                required
              />
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}
            </label>

            {/* State */}
            <label>
              State *
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                disabled={submitting}
                required
              />
              {errors.state && (
                <span className="error">{errors.state}</span>
              )}
            </label>

            {/* District */}
            <label>
              District *
              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                disabled={submitting}
                required
              />
              {errors.district && (
                <span className="error">{errors.district}</span>
              )}
            </label>

            {/* Pincode */}
            <label>
              Pincode *
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                disabled={submitting}
                required
              />
              {errors.pincode && (
                <span className="error">{errors.pincode}</span>
              )}
            </label>

            {/* Latitude */}
            <label>
              Latitude
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="18.9688"
                disabled={submitting}
                min="-90"
                max="90"
              />
            </label>

            {/* Longitude */}
            <label>
              Longitude
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="72.8205"
                disabled={submitting}
                min="-180"
                max="180"
              />
            </label>

            {/* Location Updated At */}
            <label>
              Location Updated At *
              <input
                type="date"
                name="locationUpdatedAt"
                value={formData.locationUpdatedAt}
                onChange={handleChange}
                disabled={submitting}
                required
              />
              {errors.locationUpdatedAt && (
                <span className="error">{errors.locationUpdatedAt}</span>
              )}
            </label>

            {/* Billing Applicable */}
            <div className="ld-inline-field">
              <span className="ld-inline-label">Billing Applicable</span>
              <input
                type="checkbox"
                name="billingApplicable"
                checked={formData.billingApplicable}
                onChange={handleChange}
                disabled={submitting}
              />
            </div>

            {/* Status */}
            <label>
              Status *
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={submitting}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>

            {/* Remarks */}
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

            {/* ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/lender-branches")}
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="primary"
                disabled={submitting || loadingLenders}
              >
                {submitting ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update" : "Create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
