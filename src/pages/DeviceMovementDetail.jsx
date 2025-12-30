import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDeviceMovementById } from "../api/deviceMovementApi";
import LenderPageHeader from "../components/LenderPageHeader";
import "./DeviceMovement.css";

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

const getMovementTypeBadge = (type) => {
  const styles = {
    PROD_TO_WH: { backgroundColor: "#e3f2fd", color: "#1976d2" },
    WH_TO_ENGINEER: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    ENGINEER_TO_WH: { backgroundColor: "#fff3e0", color: "#f57c00" },
    ENGINEER_TO_VEHICLE: { backgroundColor: "#f3e5f5", color: "#7b1fa2" },
    VEHICLE_TO_ENGINEER: { backgroundColor: "#fce4ec", color: "#c2185b" },
    WH_TO_VEHICLE: { backgroundColor: "#e0f2f1", color: "#00796b" },
    VEHICLE_TO_WH: { backgroundColor: "#fff9c4", color: "#f57f17" },
  };
  return styles[type] || { backgroundColor: "#f5f5f5", color: "#666" };
};

const getMovementStatusBadge = (status) => {
  const styles = {
    IN_TRANSIT: { backgroundColor: "#fff3e0", color: "#f57c00", label: "In Transit" },
    DELIVERED: { backgroundColor: "#e8f5e9", color: "#2e7d32", label: "Delivered" },
    RETURNED: { backgroundColor: "#f3e5f5", color: "#7b1fa2", label: "Returned" },
    CANCELLED: { backgroundColor: "#ffebee", color: "#c62828", label: "Cancelled" },
  };
  return styles[status] || { backgroundColor: "#f5f5f5", color: "#666", label: status };
};

const getFromEntity = (movement) => {
  if (movement.fromEntityWarehouse) {
    return {
      type: "Warehouse",
      code: movement.fromEntityWarehouse.warehouseCode,
      id: movement.fromEntityWarehouseId,
    };
  }
  if (movement.fromEntityFieldEngineer) {
    return {
      type: "Field Engineer",
      code: movement.fromEntityFieldEngineer.engineerCode,
      id: movement.fromEntityFieldEngineerId,
    };
  }
  if (movement.fromEntityVehicle) {
    return {
      type: "Vehicle",
      code: movement.fromEntityVehicle.vehicleNo,
      id: movement.fromEntityVehicleId,
    };
  }
  return { type: "Unknown", code: "N/A", id: null };
};

const getToEntity = (movement) => {
  if (movement.toEntityWarehouse) {
    return {
      type: "Warehouse",
      code: movement.toEntityWarehouse.warehouseCode,
      id: movement.toEntityWarehouseId,
    };
  }
  if (movement.toEntityFieldEngineer) {
    return {
      type: "Field Engineer",
      code: movement.toEntityFieldEngineer.engineerCode,
      id: movement.toEntityFieldEngineerId,
    };
  }
  if (movement.toEntityVehicle) {
    return {
      type: "Vehicle",
      code: movement.toEntityVehicle.vehicleNo,
      id: movement.toEntityVehicleId,
    };
  }
  return { type: "Unknown", code: "N/A", id: null };
};

export default function DeviceMovementDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [movement, setMovement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovement = async () => {
      console.log("Fetching device movement with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getDeviceMovementById(id);
        console.log("getDeviceMovementById Result:", result);

        if (result.success && result.data) {
          setMovement(result.data);
        } else {
          const errorMsg = result.error || "Failed to fetch device movement data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchMovement:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchMovement();
    } else {
      setLoading(false);
      setError("No movement ID provided");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="lender-page">
        <LenderPageHeader
          title="Movement Detail"
          breadcrumbLabel="Device > Movement > View"
        />
        <div className="card movement-detail" style={{ textAlign: "center", padding: "3rem" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "1rem", color: "#666" }}>Loading movement details...</p>
        </div>
      </div>
    );
  }

  if (error || !movement) {
    return (
      <div className="lender-page">
        <LenderPageHeader
          title="Movement Detail"
          breadcrumbLabel="Device > Movement > View"
        />
        <div className="card movement-detail" style={{ textAlign: "center", padding: "3rem" }}>
          <h3 style={{ color: "#721c24" }}>Error</h3>
          <p style={{ color: "#721c24", marginTop: "1rem" }}>
            {error || "Movement not found"}
          </p>
          <button
            onClick={() => navigate("/device-movement")}
            style={{ marginTop: "1.5rem" }}
          >
            Back to Movements
          </button>
        </div>
      </div>
    );
  }

  const fromEntity = getFromEntity(movement);
  const toEntity = getToEntity(movement);
  const statusBadge = getMovementStatusBadge(movement.movementStatus);

  return (
    <div className="lender-page">
      <LenderPageHeader
        title="Movement Detail"
        breadcrumbLabel="Device > Movement > View"
      />

      <div className="movement-detail-wrapper">
        {/* HEADER */}
        <div className="card" style={{ marginBottom: "1.5rem", padding: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: "1.5rem" }}>
                Movement: {movement.movementType}
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
                Movement ID: <strong>{movement.id}</strong>
              </p>
            </div>
            <span
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                ...statusBadge,
              }}
            >
              {statusBadge.label}
            </span>
          </div>
        </div>

        <div className="card-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
          {/* DEVICE INFORMATION */}
          <div className="card">
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
              Device Information
            </h4>
            <p><b>IMEI:</b> <span style={{ fontFamily: "monospace", fontSize: "0.95rem" }}>{movement.device?.imei || "N/A"}</span></p>
            <p><b>QR Code:</b> {movement.device?.qr || "N/A"}</p>
            <p><b>Device ID:</b> <span style={{ fontSize: "0.85rem", fontFamily: "monospace" }}>{movement.deviceId}</span></p>
          </div>

          {/* MOVEMENT TYPE */}
          <div className="card">
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
              Movement Type
            </h4>
            <p>
              <span
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  ...getMovementTypeBadge(movement.movementType),
                }}
              >
                {movement.movementType}
              </span>
            </p>
            <p style={{ marginTop: "1rem" }}><b>Entity Types:</b></p>
            <p style={{ fontSize: "0.9rem" }}>From: {movement.fromEntityType}</p>
            <p style={{ fontSize: "0.9rem" }}>To: {movement.toEntityType}</p>
          </div>

          {/* FROM ENTITY */}
          <div className="card">
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
              From Entity
            </h4>
            <p><b>Type:</b> {fromEntity.type}</p>
            <p><b>Code:</b> {fromEntity.code}</p>
            {fromEntity.id && (
              <p style={{ fontSize: "0.85rem", color: "#666" }}>
                <b>ID:</b> {fromEntity.id.substring(0, 8)}...
              </p>
            )}
          </div>

          {/* TO ENTITY */}
          <div className="card">
            <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
              To Entity
            </h4>
            <p><b>Type:</b> {toEntity.type}</p>
            <p><b>Code:</b> {toEntity.code}</p>
            {toEntity.id && (
              <p style={{ fontSize: "0.85rem", color: "#666" }}>
                <b>ID:</b> {toEntity.id.substring(0, 8)}...
              </p>
            )}
          </div>
        </div>

        {/* TIMELINE */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
            Movement Timeline
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <div>
              <p><b>Movement Date:</b></p>
              <p style={{ fontSize: "0.95rem", color: "#666" }}>{formatDateTime(movement.movementDate)}</p>
            </div>
            <div>
              <p><b>Dispatched At:</b></p>
              <p style={{ fontSize: "0.95rem", color: "#666" }}>{formatDateTime(movement.dispatchedAt)}</p>
            </div>
            <div>
              <p><b>Received At:</b></p>
              <p style={{ fontSize: "0.95rem", color: "#666" }}>{formatDateTime(movement.receivedAt)}</p>
            </div>
          </div>
        </div>

        {/* ADDITIONAL DETAILS */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
            Additional Details
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <div>
              <p><b>Handover Proof:</b></p>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>{movement.handoverProof || "Not provided"}</p>
            </div>
            <div>
              <p><b>Created By:</b></p>
              <p style={{ fontSize: "0.9rem", color: "#666" }}>
                {movement.createdById ? movement.createdById.substring(0, 8) + "..." : "N/A"}
              </p>
            </div>
          </div>
          {movement.remarks && (
            <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "#f9f9f9", borderRadius: "4px" }}>
              <p style={{ margin: 0 }}><b>Remarks:</b></p>
              <p style={{ margin: "0.5rem 0 0 0", fontSize: "0.95rem", color: "#555" }}>{movement.remarks}</p>
            </div>
          )}
        </div>

        {/* TIMESTAMPS */}
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <h4 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.1rem", borderBottom: "2px solid #e0e0e0", paddingBottom: "0.5rem" }}>
            Record Information
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem" }}>
            <p><b>Created At:</b> {formatDateTime(movement.createdAt)}</p>
            <p><b>Updated At:</b> {formatDateTime(movement.updatedAt)}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            className="secondary"
            onClick={() => navigate("/device-movement")}
          >
            Back to Movements
          </button>
          <button
            onClick={() => navigate(`/devices/view/${movement.deviceId}`)}
            style={{ backgroundColor: "#1976d2" }}
          >
            View Device
          </button>
        </div>
      </div>
    </div>
  );
}
