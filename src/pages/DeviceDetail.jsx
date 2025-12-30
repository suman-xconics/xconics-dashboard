import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDeviceById } from "../api/deviceApi";
import DeviceHeader from "../components/DeviceHeader";
import "./DeviceDetail.css";

const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

const formatDateTime = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "N/A";
  }
};

const getLocationBadgeStyle = (locationType) => {
  const styles = {
    PRODUCTION_FLOOR: { backgroundColor: "#e3f2fd", color: "#1976d2" },
    WAREHOUSE: { backgroundColor: "#fff3e0", color: "#f57c00" },
    FIELD_ENGINEER: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    VEHICLE: { backgroundColor: "#f3e5f5", color: "#7b1fa2" },
  };
  return styles[locationType] || { backgroundColor: "#f5f5f5", color: "#666" };
};

const getMovementStatusBadge = (status) => {
  const styles = {
    IN_TRANSIT: { backgroundColor: "#fff3e0", color: "#f57c00" },
    DELIVERED: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    RETURNED: { backgroundColor: "#f3e5f5", color: "#7b1fa2" },
    CANCELLED: { backgroundColor: "#ffebee", color: "#c62828" },
  };
  return styles[status] || { backgroundColor: "#f5f5f5", color: "#666" };
};

export default function DeviceDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevice = async () => {
      console.log("Fetching device with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getDeviceById(id);
        console.log("getDeviceById Result:", result);

        if (result.success && result.data) {
          setDevice(result.data);
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
    } else {
      setLoading(false);
      setError("No device ID provided");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="lender-page">
        <DeviceHeader />
        <div className="device-detail-wrapper">
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <div className="spinner"></div>
            <p style={{ marginTop: "1rem", color: "#666" }}>Loading device details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !device) {
    return (
      <div className="lender-page">
        <DeviceHeader />
        <div className="device-detail-wrapper">
          <div className="card" style={{ textAlign: "center", padding: "3rem" }}>
            <h3 style={{ color: "#721c24" }}>Error</h3>
            <p style={{ color: "#721c24", marginTop: "1rem" }}>
              {error || "Device not found"}
            </p>
            <button
              onClick={() => navigate("/devices")}
              style={{ marginTop: "1.5rem" }}
            >
              Back to Devices
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-page">
      <DeviceHeader />

      <div className="device-detail-wrapper">
        <div className="device-detail-top">
          <div>
            <h2>{device.imei}</h2>
            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.25rem" }}>
              Device ID: <strong>{device.id}</strong>
            </p>
          </div>
          <span
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              fontSize: "0.9rem",
              fontWeight: "500",
              ...getLocationBadgeStyle(device.locationType),
            }}
          >
            {device.locationType}
          </span>
        </div>

        <div className="card-grid">
          <div className="card">
            <h4>Device Information</h4>
            <p><b>IMEI:</b> {device.imei}</p>
            <p><b>QR Code:</b> {device.qr}</p>
            <p><b>Created At:</b> {formatDateTime(device.createdAt)}</p>
            <p><b>Updated At:</b> {formatDateTime(device.updatedAt)}</p>
          </div>

          <div className="card">
            <h4>Current Location</h4>
            <p>
              <b>Location Type:</b>{" "}
              <span
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.8rem",
                  marginLeft: "0.5rem",
                  ...getLocationBadgeStyle(device.locationType),
                }}
              >
                {device.locationType}
              </span>
            </p>
            <p>
              <b>Production Floor:</b>{" "}
              {device.locationProductionFloor || "N/A"}
            </p>
            {device.productionWarehouse && (
              <>
                <p>
                  <b>Warehouse Code:</b>{" "}
                  {device.productionWarehouse.warehouseCode}
                </p>
                <p>
                  <b>Warehouse Address:</b>{" "}
                  {device.productionWarehouse.address}
                </p>
                <p>
                  <b>Coordinates:</b>{" "}
                  {device.productionWarehouse.latitude},{" "}
                  {device.productionWarehouse.longitude}
                </p>
              </>
            )}
          </div>

          <div className="card">
            <h4>Installation Details</h4>
            <p>
              <b>Requisition ID:</b>{" "}
              {device.installationRequisitionId ? (
                <span style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>
                  {device.installationRequisitionId}
                </span>
              ) : (
                "Not assigned"
              )}
            </p>
          </div>
        </div>

        {device.deviceMovements && device.deviceMovements.length > 0 && (
          <div className="card">
            <h4>Movement History ({device.deviceMovements.length})</h4>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", marginTop: "1rem" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Movement Type
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      From
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      To
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Date
                    </th>
                    <th style={{ padding: "0.75rem", textAlign: "left" }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {device.deviceMovements.map((movement, index) => (
                    <tr key={movement.id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                      <td style={{ padding: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                          }}
                        >
                          {movement.movementType}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                        {movement.fromEntityWarehouse?.warehouseCode ||
                          movement.fromEntityFieldEngineer?.engineerName ||
                          movement.fromEntityVehicle?.vehicleNo ||
                          "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                        {movement.toEntityWarehouse?.warehouseCode ||
                          movement.toEntityFieldEngineer?.engineerName ||
                          movement.toEntityVehicle?.vehicleNo ||
                          "N/A"}
                      </td>
                      <td style={{ padding: "0.75rem", fontSize: "0.9rem" }}>
                        {formatDate(movement.movementDate)}
                      </td>
                      <td style={{ padding: "0.75rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            ...getMovementStatusBadge(movement.movementStatus),
                          }}
                        >
                          {movement.movementStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {device.deviceMovements && device.deviceMovements.length > 0 && (
          <div className="card">
            <h4>Last Movement Details</h4>
            {(() => {
              const lastMovement = device.deviceMovements[device.deviceMovements.length - 1];
              return (
                <>
                  <p><b>Movement Type:</b> {lastMovement.movementType}</p>
                  <p><b>Status:</b> {lastMovement.movementStatus}</p>
                  <p><b>Movement Date:</b> {formatDate(lastMovement.movementDate)}</p>
                  {lastMovement.dispatchedAt && (
                    <p><b>Dispatched At:</b> {formatDate(lastMovement.dispatchedAt)}</p>
                  )}
                  {lastMovement.receivedAt && (
                    <p><b>Received At:</b> {formatDate(lastMovement.receivedAt)}</p>
                  )}
                  {lastMovement.remarks && (
                    <p><b>Remarks:</b> {lastMovement.remarks}</p>
                  )}
                </>
              );
            })()}
          </div>
        )}

        <div className="actions">
          <button
            className="secondary"
            onClick={() => navigate("/devices")}
          >
            Back to Devices
          </button>

          <button
            onClick={() => navigate(`/devices/edit/${device.id}`)}
          >
            Edit Device
          </button>

          <button
            onClick={() => navigate(`/devices/move/${device.id}`)}
            style={{ backgroundColor: "#7b1fa2" }}
          >
            Move Device
          </button>
        </div>
      </div>
    </div>
  );
}
