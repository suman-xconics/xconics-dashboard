import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import WarehouseHeader from "../components/WarehouseHeader";
import { getWarehouseById, updateWarehouse } from "../api/warehouseApi";
import { getAggregators } from "../api/aggregatorApi";
import "./CreateWarehouse.css";

/**
 * Format date for display
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

export default function EditWarehouse() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [warehouse, setWarehouse] = useState(EMPTY_WAREHOUSE);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAggregators, setLoadingAggregators] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  /* =====================
     FETCH AGGREGATORS
     ===================== */
  useEffect(() => {
    const fetchAggregators = async () => {
      setLoadingAggregators(true);
      const result = await getAggregators({ limit: 1000 });
      
      if (result.success) {
        setAggregators(result.data);
      } else {
        console.error("Failed to fetch aggregators:", result.error);
      }
      
      setLoadingAggregators(false);
    };

    fetchAggregators();
  }, []);

  /* =====================
     FETCH WAREHOUSE DATA
     ===================== */
  useEffect(() => {
    const fetchWarehouse = async () => {
      console.log("Fetching warehouse with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getWarehouseById(id);
        console.log("getWarehouseById Result:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          console.log("API Data received:", apiData);

          // Map API data to form state
          const newFormData = {
            warehouseCode: apiData.warehouseCode ?? "",
            warehouseName: apiData.warehouseName ?? "",
            warehouseType: apiData.warehouseType ?? "PRODUCTION",
            ownerType: apiData.ownerType ?? "XCONICS",
            aggregatorId: apiData.aggregatorId ?? "",
            address: apiData.address ?? "",
            state: apiData.state ?? "",
            district: apiData.district ?? "",
            pincode: apiData.pincode ?? "",
            latitude: apiData.latitude ?? 0,
            longitude: apiData.longitude ?? 0,
            contactPersonName: apiData.contactPersonName ?? "",
            contactMobile: apiData.contactMobile ?? "",
            emailId: apiData.emailId ?? "",
            status: apiData.status ?? "ACTIVE",
            remarks: apiData.remarks ?? "",
          };

          console.log("Setting form data to:", newFormData);
          setWarehouse(newFormData);
        } else {
          const errorMsg = result.error || "Failed to fetch warehouse data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchWarehouse:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouse();
    } else {
      setLoading(false);
      setError("No warehouse ID provided");
    }
  }, [id]);

  /* =====================
     VALIDATION
     ===================== */
  const validate = () => {
    const newErrors = {};

    if (!warehouse.warehouseCode.trim()) {
      newErrors.warehouseCode = "Warehouse Code is required";
    }

    if (!warehouse.warehouseName.trim()) {
      newErrors.warehouseName = "Warehouse Name is required";
    }

    if (!warehouse.warehouseType) {
      newErrors.warehouseType = "Select Warehouse Type";
    }

    if (!warehouse.ownerType) {
      newErrors.ownerType = "Select Owner Type";
    }

    if (warehouse.ownerType === "AGGREGATOR" && !warehouse.aggregatorId) {
      newErrors.aggregatorId = "Aggregator is required for aggregator-owned warehouse";
    }

    if (!warehouse.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!warehouse.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!warehouse.district.trim()) {
      newErrors.district = "District is required";
    }

    if (!warehouse.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    if (!warehouse.contactPersonName.trim()) {
      newErrors.contactPersonName = "Contact person name is required";
    }

    if (!warehouse.contactMobile.trim()) {
      newErrors.contactMobile = "Contact mobile is required";
    } else if (warehouse.contactMobile.length < 10) {
      newErrors.contactMobile = "Mobile number must be at least 10 digits";
    }

    if (!warehouse.emailId.trim()) {
      newErrors.emailId = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(warehouse.emailId)) {
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
    
    console.log(`Field changed: ${name} = ${value}`);

    setWarehouse((prev) => ({
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
      setWarehouse((prev) => ({ ...prev, aggregatorId: "" }));
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
        warehouseCode: warehouse.warehouseCode.trim(),
        warehouseName: warehouse.warehouseName.trim(),
        warehouseType: warehouse.warehouseType,
        ownerType: warehouse.ownerType,
        aggregatorId: warehouse.ownerType === "AGGREGATOR" ? warehouse.aggregatorId : null,
        address: warehouse.address.trim(),
        state: warehouse.state.trim(),
        district: warehouse.district.trim(),
        pincode: warehouse.pincode.trim(),
        latitude: Number(warehouse.latitude) || 0,
        longitude: Number(warehouse.longitude) || 0,
        contactPersonName: warehouse.contactPersonName.trim(),
        contactMobile: warehouse.contactMobile.trim(),
        emailId: warehouse.emailId.trim(),
        status: warehouse.status,
        remarks: warehouse.remarks.trim(),
      };

      console.log("Updating warehouse with payload:", payload);

      const result = await updateWarehouse(id, payload);

      if (result.success) {
        console.log("Warehouse updated successfully:", result.data);
        alert("Warehouse updated successfully!");
        navigate("/warehouse");
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
      <div className="warehouse-page">
        <WarehouseHeader title="Edit Warehouse" breadcrumbLabel="Warehouse" />
        <div className="warehouse-container">
          <div className="card">
            <h2>Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching warehouse data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warehouse-page">
      <WarehouseHeader title="Edit Warehouse" breadcrumbLabel="Warehouse" />

      <div className="warehouse-container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ margin: 0 }}>Edit Warehouse</h2>
          <div style={{ fontSize: "0.9rem", color: "#666", padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
            ID: <strong>{id}</strong>
          </div>
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

        <form className="warehouse-form" onSubmit={handleSubmit}>
          <div className="form-grid two-column">
            {/* Warehouse Code */}
            <div>
              <label>Warehouse Code (Read-only)</label>
              <input
                name="warehouseCode"
                value={warehouse.warehouseCode}
                readOnly
                disabled
                style={{ backgroundColor: "#f5f5f5" }}
              />
            </div>

            {/* Warehouse Name */}
            <div>
              <label>Warehouse Name *</label>
              <input
                name="warehouseName"
                value={warehouse.warehouseName}
                onChange={handleChange}
                placeholder="Enter warehouse name"
                disabled={submitting}
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
                value={warehouse.warehouseType}
                onChange={handleChange}
                disabled={submitting}
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
                value={warehouse.ownerType}
                onChange={handleChange}
                disabled={submitting}
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
                Aggregator {warehouse.ownerType === "AGGREGATOR" && "*"}
              </label>
              <select
                name="aggregatorId"
                value={warehouse.aggregatorId}
                onChange={handleChange}
                disabled={
                  submitting || 
                  loadingAggregators || 
                  warehouse.ownerType === "XCONICS"
                }
              >
                <option value="">
                  {warehouse.ownerType === "XCONICS" 
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
            </div>

            {/* Address */}
            <div className="full">
              <label>Address *</label>
              <textarea
                rows="2"
                name="address"
                value={warehouse.address}
                onChange={handleChange}
                placeholder="Enter complete address"
                disabled={submitting}
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
                value={warehouse.state}
                onChange={handleChange}
                placeholder="Enter state"
                disabled={submitting}
              />
              {errors.state && <span className="error">{errors.state}</span>}
            </div>

            {/* District */}
            <div>
              <label>District *</label>
              <input
                name="district"
                value={warehouse.district}
                onChange={handleChange}
                placeholder="Enter district"
                disabled={submitting}
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
                value={warehouse.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                disabled={submitting}
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
                value={warehouse.latitude}
                onChange={handleChange}
                placeholder="28.4595"
                disabled={submitting}
              />
            </div>

            {/* Longitude */}
            <div>
              <label>Longitude</label>
              <input
                type="number"
                step="0.000001"
                name="longitude"
                value={warehouse.longitude}
                onChange={handleChange}
                placeholder="77.0266"
                disabled={submitting}
              />
            </div>

            {/* Contact Person */}
            <div>
              <label>Contact Person *</label>
              <input
                name="contactPersonName"
                value={warehouse.contactPersonName}
                onChange={handleChange}
                placeholder="Enter contact person name"
                disabled={submitting}
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
                value={warehouse.contactMobile}
                onChange={handleChange}
                placeholder="+91XXXXXXXXXX"
                disabled={submitting}
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
                value={warehouse.emailId}
                onChange={handleChange}
                placeholder="warehouse@example.com"
                disabled={submitting}
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
                value={warehouse.status}
                onChange={handleChange}
                disabled={submitting}
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
                value={warehouse.remarks}
                onChange={handleChange}
                placeholder="Enter any additional remarks"
                disabled={submitting}
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="actions">
            <button
              type="button"
              onClick={() => navigate("/warehouse")}
              disabled={submitting}
            >
              Cancel
            </button>

            <button 
              type="submit" 
              className="primary"
              disabled={submitting || loadingAggregators}
            >
              {submitting ? "Updating..." : "Update Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
