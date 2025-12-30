import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import { getDeviceById, updateDevice } from "../api/deviceApi";
import { getWarehouses } from "../api/warehouseApi";
import "./DeviceForm.css";

const EMPTY_DEVICE = {
  imei: "",
  qr: "",
  locationType: "PRODUCTION_FLOOR",
  locationProductionFloor: "",
  productionWarehouseId: "",
  installationRequisitionId: "",
};

export default function EditDevice() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [device, setDevice] = useState(EMPTY_DEVICE);
  const [productionWarehouses, setProductionWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchProductionWarehouses = async () => {
      setLoadingWarehouses(true);

      const result = await getWarehouses({ 
        limit: 1000,
        warehouseType: "PRODUCTION"
      });

      if (result.success) {
        const productionOnly = result.data.filter(
          wh => wh.warehouseType === "PRODUCTION"
        );
        setProductionWarehouses(productionOnly);
      } else {
        console.error("Failed to fetch warehouses:", result.error);
        alert("Warning: Failed to load warehouses. Please refresh the page.");
      }

      setLoadingWarehouses(false);
    };

    fetchProductionWarehouses();
  }, []);

  useEffect(() => {
    const fetchDevice = async () => {
      console.log("Fetching device with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getDeviceById(id);
        console.log("getDeviceById Result:", result);

        if (result.success && result.data) {
          const apiData = result.data;
          console.log("API Data received:", apiData);

          const newFormData = {
            imei: apiData.imei || "",
            qr: apiData.qr || "",
            locationType: apiData.locationType || "PRODUCTION_FLOOR",
            locationProductionFloor: apiData.locationProductionFloor || "",
            productionWarehouseId: apiData.productionWarehouseId || "",
            installationRequisitionId: apiData.installationRequisitionId || "",
          };

          console.log("Setting form data to:", newFormData);
          setDevice(newFormData);
        } else {
          const errorMsg = result.error || "Failed to fetch device data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchDevice:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDevice();
    }
  }, [id]);

  const validate = () => {
    const newErrors = {};

    if (!device.imei.trim()) newErrors.imei = "IMEI is required";
    if (!device.qr.trim()) newErrors.qr = "QR Code is required";
    if (!device.locationType) newErrors.locationType = "Location Type is required";
    if (!device.locationProductionFloor.trim()) newErrors.locationProductionFloor = "Production Floor Location is required";
    if (!device.productionWarehouseId) newErrors.productionWarehouseId = "Production Warehouse is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setDevice((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      alert("Please fix all validation errors");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        imei: device.imei.trim(),
        qr: device.qr.trim(),
        locationType: device.locationType,
        locationProductionFloor: device.locationProductionFloor.trim(),
        productionWarehouseId: device.productionWarehouseId,
        installationRequisitionId: device.installationRequisitionId || null,
      };

      console.log("Updating device with payload:", payload);

      const result = await updateDevice(id, payload);

      if (result.success) {
        console.log("Device updated successfully:", result.data);
        alert("Device updated successfully!");
        navigate("/devices");
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
          title="Device Master"
          breadcrumbLabel="Device > Edit"
        />
        <div className="edit-lender-page">
          <div className="card device-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching device data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Device Master"
        breadcrumbLabel="Device > Edit"
      />

      <div className="edit-lender-page">
        <div className="card device-card full-width">
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "1.5rem" 
          }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Edit Device</h2>
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

          <form className="device-form" onSubmit={handleSubmit}>
            <section>
              <h3>Device Information</h3>
              <div className="device-grid">
                <label>
                  IMEI *
                  <input
                    name="imei"
                    value={device.imei}
                    placeholder="Enter IMEI"
                    onChange={handleChange}
                    disabled={submitting}
                    readOnly
                    style={{ backgroundColor: "#f5f5f5", cursor: "not-allowed" }}
                    title="IMEI cannot be changed"
                  />
                  {errors.imei && <span className="error">{errors.imei}</span>}
                  <small style={{ fontSize: "0.8rem", color: "#666" }}>
                    IMEI is read-only and cannot be modified
                  </small>
                </label>

                <label>
                  QR Code *
                  <input
                    name="qr"
                    value={device.qr}
                    placeholder="Enter QR Code"
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {errors.qr && <span className="error">{errors.qr}</span>}
                </label>

                <label>
                  Location Type *
                  <select
                    name="locationType"
                    value={device.locationType}
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  >
                    <option value="">Select Location Type</option>
                    <option value="PRODUCTION_FLOOR">Production Floor</option>
                    <option value="WAREHOUSE">Warehouse</option>
                    <option value="FIELD_ENGINEER">Field Engineer</option>
                    <option value="VEHICLE">Vehicle</option>
                  </select>
                  {errors.locationType && <span className="error">{errors.locationType}</span>}
                </label>

                <label>
                  Production Floor Location *
                  <input
                    name="locationProductionFloor"
                    value={device.locationProductionFloor}
                    placeholder="e.g., Floor A - Line 3"
                    onChange={handleChange}
                    disabled={submitting}
                    required
                  />
                  {errors.locationProductionFloor && <span className="error">{errors.locationProductionFloor}</span>}
                </label>

                <label>
                  Production Warehouse *
                  <select
                    name="productionWarehouseId"
                    value={device.productionWarehouseId}
                    onChange={handleChange}
                    disabled={submitting || loadingWarehouses}
                    required
                  >
                    <option value="">
                      {loadingWarehouses ? "Loading..." : "Select Warehouse"}
                    </option>
                    {productionWarehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.warehouseName} ({warehouse.warehouseCode})
                      </option>
                    ))}
                  </select>
                  {errors.productionWarehouseId && <span className="error">{errors.productionWarehouseId}</span>}
                </label>

                <label>
                  Installation Requisition ID
                  <input
                    name="installationRequisitionId"
                    value={device.installationRequisitionId}
                    placeholder="Enter requisition ID (optional)"
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            <div className="form-actions">
              <button 
                type="button" 
                className="secondary" 
                onClick={() => navigate("/devices")} 
                disabled={submitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn" 
                disabled={submitting || loadingWarehouses}
              >
                {submitting ? "Updating..." : "Update Device"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
