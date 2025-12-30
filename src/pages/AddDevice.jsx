import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import { createDevice } from "../api/deviceApi";
import { getWarehouses } from "../api/warehouseApi";
import "./DeviceForm.css";

const DUMMY_DEVICE = {
  imei: "123456789012345",
  qr: "QR-DEV-001",
  locationType: "PRODUCTION_FLOOR",
  locationProductionFloor: "Floor A - Line 3",
  productionWarehouseId: "",
};

const EMPTY_DEVICE = {
  imei: "",
  qr: "",
  locationType: "PRODUCTION_FLOOR",
  locationProductionFloor: "",
  productionWarehouseId: "",
};

export default function AddDevice() {
  const navigate = useNavigate();

  const [device, setDevice] = useState(EMPTY_DEVICE);
  const [productionWarehouses, setProductionWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(true);
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
      }

      setLoadingWarehouses(false);
    };

    fetchProductionWarehouses();
  }, []);

  const fillDummyData = () => {
    const dummyData = { ...DUMMY_DEVICE };
    if (productionWarehouses.length > 0) {
      dummyData.productionWarehouseId = productionWarehouses[0].id;
    }
    setDevice(dummyData);
    setErrors({});
  };

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
    setDevice((prev) => ({ ...prev, [name]: value }));
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

    setLoading(true);

    const payload = {
      imei: device.imei.trim(),
      qr: device.qr.trim(),
      locationType: device.locationType,
      locationProductionFloor: device.locationProductionFloor.trim(),
      productionWarehouseId: device.productionWarehouseId,
    };

    const result = await createDevice(payload);

    if (result.success) {
      alert("Device created successfully!");
      navigate("/devices");
    } else {
      alert(`Error: ${result.error}`);
    }

    setLoading(false);
  };

  return (
    <div className="lender-form-page">
      <LenderPageHeader title="Device Master" breadcrumbLabel="Device" />

      <div className="edit-lender-page">
        <div className="card device-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Add Device</h2>
            <button 
              type="button" 
              onClick={fillDummyData}
              disabled={loading || loadingWarehouses}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: (loading || loadingWarehouses) ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                opacity: (loading || loadingWarehouses) ? 0.6 : 1
              }}
            >
              Fill Dummy Data
            </button>
          </div>

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
                    disabled={loading}
                    required
                  />
                  {errors.imei && <span className="error">{errors.imei}</span>}
                </label>

                <label>
                  QR Code *
                  <input
                    name="qr"
                    value={device.qr}
                    placeholder="Enter QR Code"
                    onChange={handleChange}
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading || loadingWarehouses}
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
              </div>
            </section>

            <div className="form-actions">
              <button type="button" className="secondary" onClick={() => navigate("/devices")} disabled={loading}>
                Cancel
              </button>
              <button type="submit" className="submit-btn" disabled={loading || loadingWarehouses}>
                {loading ? "Creating..." : "Create Device"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
