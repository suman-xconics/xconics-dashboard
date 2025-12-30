import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import WarehouseHeader from "../components/WarehouseHeader";
import { createWarehouse, WAREHOUSE_TYPES, OWNER_TYPES, STATUSES } from "../api/warehouseApi";
import { getAggregators } from "../api/aggregatorApi";
import "./CreateWarehouse.css";

/* =====================
   DUMMY DATA FOR PREFILL
   ===================== */
const DUMMY_WAREHOUSE = {
  warehouseCode: "WH001",
  warehouseName: "Central Production Warehouse",
  warehouseType: "PRODUCTION",
  ownerType: "XCONICS",
  aggregatorId: "",
  address: "Plot 123, Industrial Area, Sector 18, Gurugram",
  state: "Haryana",
  district: "Gurugram",
  pincode: "122001",
  latitude: 28.4595,
  longitude: 77.0266,
  contactPersonName: "Ramesh Kumar",
  contactMobile: "+919876543210",
  emailId: "ramesh.kumar@warehouse.com",
  status: "ACTIVE",
  remarks: "Main production warehouse with 10000 sq ft space",
};

/* =====================
   EMPTY MODEL
   ===================== */
const EMPTY_WAREHOUSE = {
  warehouseCode: "",
  warehouseName: "",
  warehouseType: "PRODUCTION",
  ownerType: "XCONICS",
  aggregatorId: "",
  address: "",
  state: "",
  district: "",
  pincode: "",
  latitude: 0,
  longitude: 0,
  contactPersonName: "",
  contactMobile: "",
  emailId: "",
  status: "ACTIVE",
  remarks: "",
};

export default function CreateWarehouse() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(EMPTY_WAREHOUSE);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAggregators, setLoadingAggregators] = useState(true);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  /* =====================
     FETCH AGGREGATORS ON MOUNT
     ===================== */
  useEffect(() => {
    const fetchAggregators = async () => {
      console.log("Fetching aggregators...");
      setLoadingAggregators(true);
      
      try {
        const result = await getAggregators({ limit: 1000 });
        console.log("Aggregators fetch result:", result);
        
        if (result.success) {
          setAggregators(result.data);
          console.log(`Loaded ${result.data.length} aggregators`);
        } else {
          console.error("Failed to fetch aggregators:", result.error);
          alert("Warning: Failed to load aggregators. Please refresh the page.");
        }
      } catch (err) {
        console.error("Exception fetching aggregators:", err);
        alert("Error loading aggregators. Please refresh the page.");
      } finally {
        setLoadingAggregators(false);
      }
    };

    fetchAggregators();
  }, []);

  /* =====================
     FILL DUMMY DATA
     ===================== */
  const fillDummyData = () => {
    const dummyData = { ...DUMMY_WAREHOUSE };
    
    // If owner type is AGGREGATOR and aggregators are loaded, select first one
    if (dummyData.ownerType === "AGGREGATOR" && aggregators.length > 0) {
      dummyData.aggregatorId = aggregators[0].id;
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

    if (!formData.warehouseCode.trim()) {
      newErrors.warehouseCode = "Warehouse Code is required";
    }

    if (!formData.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse Name is required";
    }

    if (!formData.warehouseType) {
      newErrors.warehouseType = "Select Warehouse Type";
    }

    if (!formData.ownerType) {
      newErrors.ownerType = "Select Owner Type";
    }

    // Aggregator ID is required if owner type is AGGREGATOR
    if (formData.ownerType === "AGGREGATOR" && !formData.aggregatorId) {
      newErrors.aggregatorId = "Aggregator is required for aggregator-owned warehouse";
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

    if (!formData.contactPersonName.trim()) {
      newErrors.contactPersonName = "Contact person name is required";
    }

    if (!formData.contactMobile.trim()) {
      newErrors.contactMobile = "Contact mobile is required";
    } else if (formData.contactMobile.length < 10) {
      newErrors.contactMobile = "Mobile number must be at least 10 digits";
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.emailId)) {
      newErrors.emailId = "Invalid email address";
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
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // Clear aggregatorId if owner type changes to XCONICS
    if (name === "ownerType" && value === "XCONICS") {
      setFormData((prev) => ({ ...prev, aggregatorId: "" }));
    }
  };

  /* =====================
     HANDLE SUBMIT
     ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare payload with proper types
      const payload = {
        warehouseCode: formData.warehouseCode.trim(),
        warehouseName: formData.warehouseName.trim(),
        warehouseType: formData.warehouseType,
        ownerType: formData.ownerType,
        aggregatorId: formData.ownerType === "AGGREGATOR" ? formData.aggregatorId : null,
        address: formData.address.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        pincode: formData.pincode.trim(),
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        contactPersonName: formData.contactPersonName.trim(),
        contactMobile: formData.contactMobile.trim(),
        emailId: formData.emailId.trim(),
        status: formData.status,
        remarks: formData.remarks.trim(),
      };

      console.log("Creating warehouse with payload:", payload);

      const result = await createWarehouse(payload);

      if (result.success) {
        console.log("Warehouse created successfully:", result.data);
        alert("Warehouse created successfully!");
        navigate("/warehouse");
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
    <div className="warehouse-page">
      <WarehouseHeader title="Create Warehouse" breadcrumbLabel="Warehouse" />

      <div className="warehouse-container">
        {/* HEADER WITH DUMMY DATA BUTTON */}
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "1.5rem" 
        }}>
          <h2 style={{ margin: 0 }}>Create Warehouse</h2>
          <button 
            type="button" 
            onClick={fillDummyData}
            disabled={loading}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: "0.9rem",
              opacity: loading ? 0.6 : 1
            }}
          >
            Fill Dummy Data
          </button>
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
        <form className="warehouse-form" onSubmit={handleSubmit}>
          <div className="form-grid two-column">
            {/* Warehouse Code */}
            <div>
              <label>Warehouse Code *</label>
              <input
                name="warehouseCode"
                value={formData.warehouseCode}
                onChange={handleChange}
                placeholder="Enter warehouse code (e.g., WH001)"
                disabled={loading}
              />
              {errors.warehouseCode && (
                <span className="error">{errors.warehouseCode}</span>
              )}
            </div>

            {/* Warehouse Name */}
            <div>
              <label>Warehouse Name *</label>
              <input
                name="warehouseName"
                value={formData.warehouseName}
                onChange={handleChange}
                placeholder="Enter warehouse name"
                disabled={loading}
              />
              {errors.warehouseName && (
                <span className="error">{errors.warehouseName}</span>
              )}
            </div>

            {/* Warehouse Type */}
            <div>
              <label>Warehouse Type *</label>
              <select
                name="warehouseType"
                value={formData.warehouseType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Type</option>
                <option value="PRODUCTION">Production</option>
                <option value="LOCAL">Local</option>
                <option value="REGIONAL">Regional</option>
              </select>
              {errors.warehouseType && (
                <span className="error">{errors.warehouseType}</span>
              )}
            </div>

            {/* Owner Type */}
            <div>
              <label>Owner Type *</label>
              <select
                name="ownerType"
                value={formData.ownerType}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Select Owner</option>
                <option value="XCONICS">Xconics</option>
                <option value="AGGREGATOR">Aggregator</option>
              </select>
              {errors.ownerType && (
                <span className="error">{errors.ownerType}</span>
              )}
            </div>

            {/* Aggregator */}
            <div className="full">
              <label>
                Aggregator {formData.ownerType === "AGGREGATOR" && "*"}
              </label>
              <select
                name="aggregatorId"
                value={formData.aggregatorId}
                onChange={handleChange}
                disabled={
                  loading || 
                  loadingAggregators || 
                  formData.ownerType === "XCONICS"
                }
              >
                <option value="">
                  {loadingAggregators 
                    ? "Loading aggregators..." 
                    : formData.ownerType === "XCONICS" 
                      ? "Not applicable for Xconics owned" 
                      : "Select Aggregator"}
                </option>
                {aggregators.map((agg) => (
                  <option key={agg.id} value={agg.id}>
                    {agg.aggregatorName} ({agg.aggregatorCode})
                  </option>
                ))}
              </select>
              {errors.aggregatorId && (
                <span className="error">{errors.aggregatorId}</span>
              )}
              {formData.ownerType === "AGGREGATOR" && aggregators.length === 0 && !loadingAggregators && (
                <span className="error">No aggregators available. Please create one first.</span>
              )}
            </div>

            {/* Address */}
            <div className="full">
              <label>Address *</label>
              <textarea
                rows="2"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                disabled={loading}
              />
              {errors.address && (
                <span className="error">{errors.address}</span>
              )}
            </div>

            {/* State */}
            <div>
              <label>State *</label>
              <input
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Enter state"
                disabled={loading}
              />
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

            {/* District */}
            <div>
              <label>District *</label>
              <input
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter district"
                disabled={loading}
              />
              {errors.district && (
                <span className="error">{errors.district}</span>
              )}
            </div>

            {/* Pincode */}
            <div>
              <label>Pincode *</label>
              <input
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                disabled={loading}
              />
              {errors.pincode && (
                <span className="error">{errors.pincode}</span>
              )}
            </div>

            {/* Latitude */}
            <div>
              <label>Latitude</label>
              <input
                type="number"
                step="0.000001"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                placeholder="28.4595"
                disabled={loading}
              />
            </div>

            {/* Longitude */}
            <div>
              <label>Longitude</label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                placeholder="77.0266"
                disabled={loading}
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label>Contact Person *</label>
              <input
                name="contactPersonName"
                value={formData.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                disabled={loading}
              />
              {errors.contactPersonName && (
                <span className="error">{errors.contactPersonName}</span>
              )}
            </div>

            {/* Contact Mobile */}
            <div>
              <label>Contact Mobile *</label>
              <input
                name="contactMobile"
                value={formData.contactMobile}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                disabled={loading}
              />
              {errors.contactMobile && (
                <span className="error">{errors.contactMobile}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label>Email *</label>
              <input
                type="email"
                name="emailId"
                value={formData.emailId}
                onChange={handleChange}
                placeholder="warehouse@example.com"
                disabled={loading}
              />
              {errors.emailId && (
                <span className="error">{errors.emailId}</span>
              )}
            </div>

            {/* Status */}
            <div>
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>

            {/* Remarks */}
            <div className="full">
              <label>Remarks</label>
              <textarea
                rows="3"
                name="remarks"
                value={formData.remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks"
                disabled={loading}
              />
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="actions">
            <button
              type="button"
              className="secondary"
              onClick={() => navigate("/warehouse")}
              disabled={loading}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              disabled={loading || loadingAggregators}
              style={{
                opacity: (loading || loadingAggregators) ? 0.6 : 1,
                cursor: (loading || loadingAggregators) ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating..." : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
