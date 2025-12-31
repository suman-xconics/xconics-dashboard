import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowUp, ArrowDown, Plus, X } from "lucide-react";
import { 
  getDeviceMovements, 
  createDeviceMovement,
  MOVEMENT_TYPES,
  ENTITY_TYPES,
  MOVEMENT_STATUSES 
} from "../api/deviceMovementApi";
import { getWarehouses } from "../api/warehouseApi";
import { getFieldEngineers } from "../api/fieldEngineerApi";
import { getInstallationRequisitions } from "../api/installationRequisitionApi";
import { getDevices } from "../api/deviceApi";
import "./DeviceMovementTableCard.css";

const formatDate = (isoDateString) => {
  if (!isoDateString) return "-";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "-";
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "-";
  }
};

const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split('T')[0];
  } catch (error) {
    return "";
  }
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

const getFrom = (row) => {
  if (row.fromEntityWarehouse) return row.fromEntityWarehouse.warehouseCode;
  if (row.fromEntityFieldEngineer) return row.fromEntityFieldEngineer.engineerCode;
  if (row.fromEntityVehicle) return row.fromEntityVehicle.vehicleNo;
  return "-";
};

const getTo = (row) => {
  if (row.toEntityWarehouse) return row.toEntityWarehouse.warehouseCode;
  if (row.toEntityFieldEngineer) return row.toEntityFieldEngineer.engineerCode;
  if (row.toEntityVehicle) return row.toEntityVehicle.vehicleNo;
  return "-";
};

export default function DeviceMovementTableCard() {
  const navigate = useNavigate();

  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchMovements();
  }, [currentPage, searchTerm]);

  const fetchMovements = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
    };

    const result = await getDeviceMovements(params);

    if (result.success) {
      setMovements(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setMovements([]);
    }

    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key, direction: "asc" };
    });
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchMovements();
  };

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  return (
    <div className="device-movement-table-wrapper">
      <div className="card device-movement-table-card">
        <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0", display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="text"
            placeholder="Search by IMEI or movement details..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              flex: 1,
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.9rem",
            }}
          />
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}
          >
            <Plus size={18} />
            Add Movement
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "#f8d7da",
              color: "#721c24",
              borderRadius: "4px",
              margin: "1rem",
            }}
          >
            {error}
          </div>
        )}

        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("device.imei")}>
                IMEI <SortIcon column="device.imei" />
              </th>
              <th>QR Code</th>
              <th onClick={() => handleSort("movementType")}>
                Movement Type <SortIcon column="movementType" />
              </th>
              <th>From</th>
              <th>To</th>
              <th onClick={() => handleSort("movementStatus")}>
                Status <SortIcon column="movementStatus" />
              </th>
              <th onClick={() => handleSort("movementDate")}>
                Movement Date <SortIcon column="movementDate" />
              </th>
              <th>Dispatched At</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(9)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : movements.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                  No device movements found
                </td>
              </tr>
            ) : (
              movements.map((movement) => (
                <tr key={movement.id}>
                  <td>
                    <span style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                      {movement.device?.imei || "-"}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: "0.85rem", color: "#666" }}>
                      {movement.device?.qr || "-"}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        ...getMovementTypeBadge(movement.movementType),
                      }}
                    >
                      {movement.movementType}
                    </span>
                  </td>
                  <td>{getFrom(movement)}</td>
                  <td>{getTo(movement)}</td>
                  <td>
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
                  <td style={{ fontSize: "0.85rem" }}>
                    {formatDate(movement.movementDate)}
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>
                    {formatDate(movement.dispatchedAt)}
                  </td>
                  <td>
                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/device-movement/view/${movement.id}`)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="pagination">
          <button
            disabled={currentPage === 1 || loading}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              className={currentPage === i + 1 ? "active" : ""}
              onClick={() => setCurrentPage(i + 1)}
              disabled={loading}
            >
              {i + 1}
            </button>
          ))}

          <button
            disabled={currentPage === totalPages || loading}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {showCreateModal && (
        <CreateDeviceMovementModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
}

/* ================= CREATE MODAL ================= */
function CreateDeviceMovementModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    deviceId: "",
    movementType: "",
    fromEntityType: "",
    fromEntityWarehouseId: "",
    fromEntityFieldEngineerId: "",
    fromEntityVehicleId: "",
    toEntityType: "",
    toEntityWarehouseId: "",
    toEntityFieldEngineerId: "",
    toEntityVehicleId: "",
    movementDate: formatDateForInput(new Date()),
    dispatchedAt: "",
    receivedAt: "",
    movementStatus: "IN_TRANSIT",
    handoverProof: "",
    remarks: "",
  });

  const [devices, setDevices] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  
  const [loadingDevices, setLoadingDevices] = useState(false);
  const [loadingWarehouses, setLoadingWarehouses] = useState(false);
  const [loadingEngineers, setLoadingEngineers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchDevices();
    fetchWarehouses();
    fetchEngineers();
    fetchVehicles();
  }, []);

  const fetchDevices = async () => {
    setLoadingDevices(true);
    const result = await getDevices({ limit: 1000 });
    if (result.success) {
      setDevices(result.data);
    }
    setLoadingDevices(false);
  };

  const fetchWarehouses = async () => {
    setLoadingWarehouses(true);
    const result = await getWarehouses({ limit: 1000 });
    if (result.success) {
      setWarehouses(result.data);
    }
    setLoadingWarehouses(false);
  };

  const fetchEngineers = async () => {
    setLoadingEngineers(true);
    const result = await getFieldEngineers({ limit: 1000 });
    if (result.success) {
      setEngineers(result.data);
    }
    setLoadingEngineers(false);
  };

  const fetchVehicles = async () => {
    setLoadingVehicles(true);
    const result = await getInstallationRequisitions({ limit: 1000 });
    if (result.success) {
      setVehicles(result.data);
    }
    setLoadingVehicles(false);
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.deviceId) newErrors.deviceId = "Device is required";
    if (!formData.movementType) newErrors.movementType = "Movement type is required";
    if (!formData.fromEntityType) newErrors.fromEntityType = "From entity type is required";
    if (!formData.toEntityType) newErrors.toEntityType = "To entity type is required";
    if (!formData.movementDate) newErrors.movementDate = "Movement date is required";
    
    // Validate from entity
    if (formData.fromEntityType === "WAREHOUSE" && !formData.fromEntityWarehouseId) {
      newErrors.fromEntityWarehouseId = "From warehouse is required";
    }
    if (formData.fromEntityType === "ENGINEER" && !formData.fromEntityFieldEngineerId) {
      newErrors.fromEntityFieldEngineerId = "From engineer is required";
    }
    if (formData.fromEntityType === "VEHICLE" && !formData.fromEntityVehicleId) {
      newErrors.fromEntityVehicleId = "From vehicle is required";
    }
    
    // Validate to entity
    if (formData.toEntityType === "WAREHOUSE" && !formData.toEntityWarehouseId) {
      newErrors.toEntityWarehouseId = "To warehouse is required";
    }
    if (formData.toEntityType === "ENGINEER" && !formData.toEntityFieldEngineerId) {
      newErrors.toEntityFieldEngineerId = "To engineer is required";
    }
    if (formData.toEntityType === "VEHICLE" && !formData.toEntityVehicleId) {
      newErrors.toEntityVehicleId = "To vehicle is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Reset entity IDs when entity type changes
      if (name === "fromEntityType") {
        updated.fromEntityWarehouseId = "";
        updated.fromEntityFieldEngineerId = "";
        updated.fromEntityVehicleId = "";
      }
      if (name === "toEntityType") {
        updated.toEntityWarehouseId = "";
        updated.toEntityFieldEngineerId = "";
        updated.toEntityVehicleId = "";
      }
      
      return updated;
    });
    
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

    // Build payload - only include non-empty fields
    const payload = {
      deviceId: formData.deviceId,
      movementType: formData.movementType,
      fromEntityType: formData.fromEntityType,
      toEntityType: formData.toEntityType,
      movementDate: formData.movementDate,
      movementStatus: formData.movementStatus,
    };

    // Add from entity ID based on type
    if (formData.fromEntityType === "WAREHOUSE" && formData.fromEntityWarehouseId) {
      payload.fromEntityWarehouseId = formData.fromEntityWarehouseId;
    }
    if (formData.fromEntityType === "ENGINEER" && formData.fromEntityFieldEngineerId) {
      payload.fromEntityFieldEngineerId = formData.fromEntityFieldEngineerId;
    }
    if (formData.fromEntityType === "VEHICLE" && formData.fromEntityVehicleId) {
      payload.fromEntityVehicleId = formData.fromEntityVehicleId;
    }

    // Add to entity ID based on type
    if (formData.toEntityType === "WAREHOUSE" && formData.toEntityWarehouseId) {
      payload.toEntityWarehouseId = formData.toEntityWarehouseId;
    }
    if (formData.toEntityType === "ENGINEER" && formData.toEntityFieldEngineerId) {
      payload.toEntityFieldEngineerId = formData.toEntityFieldEngineerId;
    }
    if (formData.toEntityType === "VEHICLE" && formData.toEntityVehicleId) {
      payload.toEntityVehicleId = formData.toEntityVehicleId;
    }

    // Add optional fields
    if (formData.dispatchedAt) payload.dispatchedAt = formData.dispatchedAt;
    if (formData.receivedAt) payload.receivedAt = formData.receivedAt;
    if (formData.handoverProof) payload.handoverProof = formData.handoverProof;
    if (formData.remarks) payload.remarks = formData.remarks;

    const result = await createDeviceMovement(payload);

    if (result.success) {
      alert("Device movement created successfully!");
      onSuccess();
    } else {
      alert(`Error: ${result.error}`);
    }

    setSubmitting(false);
  };

  const renderEntitySelect = (prefix, entityType, value, label) => {
    if (entityType === "WAREHOUSE") {
      return (
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            {label} *
          </label>
          <select
            name={`${prefix}EntityWarehouseId`}
            value={value}
            onChange={handleChange}
            disabled={submitting || loadingWarehouses}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: errors[`${prefix}EntityWarehouseId`] ? "1px solid #c62828" : "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
          >
            <option value="">{loadingWarehouses ? "Loading..." : "Select Warehouse"}</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.warehouseName} ({wh.warehouseCode})
              </option>
            ))}
          </select>
          {errors[`${prefix}EntityWarehouseId`] && (
            <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
              {errors[`${prefix}EntityWarehouseId`]}
            </span>
          )}
        </div>
      );
    }

    if (entityType === "ENGINEER") {
      return (
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            {label} *
          </label>
          <select
            name={`${prefix}EntityFieldEngineerId`}
            value={value}
            onChange={handleChange}
            disabled={submitting || loadingEngineers}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: errors[`${prefix}EntityFieldEngineerId`] ? "1px solid #c62828" : "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
          >
            <option value="">{loadingEngineers ? "Loading..." : "Select Engineer"}</option>
            {engineers.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.engineerName} ({eng.engineerCode})
              </option>
            ))}
          </select>
          {errors[`${prefix}EntityFieldEngineerId`] && (
            <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
              {errors[`${prefix}EntityFieldEngineerId`]}
            </span>
          )}
        </div>
      );
    }

    if (entityType === "VEHICLE") {
      return (
        <div>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            {label} *
          </label>
          <select
            name={`${prefix}EntityVehicleId`}
            value={value}
            onChange={handleChange}
            disabled={submitting || loadingVehicles}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: errors[`${prefix}EntityVehicleId`] ? "1px solid #c62828" : "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.95rem",
            }}
          >
            <option value="">{loadingVehicles ? "Loading..." : "Select Vehicle"}</option>
            {vehicles.map((veh) => (
              <option key={veh.id} value={veh.id}>
                {veh.vehicleNo} - {veh.customerName}
              </option>
            ))}
          </select>
          {errors[`${prefix}EntityVehicleId`] && (
            <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
              {errors[`${prefix}EntityVehicleId`]}
            </span>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <div className="modal-header">
          <h2 style={{ margin: 0 }}>Create Device Movement</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
              {/* Device Selection */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Device (IMEI) *
                </label>
                <select
                  name="deviceId"
                  value={formData.deviceId}
                  onChange={handleChange}
                  disabled={submitting || loadingDevices}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.deviceId ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">{loadingDevices ? "Loading..." : "Select Device"}</option>
                  {devices.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.imei} ({dev.qr})
                    </option>
                  ))}
                </select>
                {errors.deviceId && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.deviceId}
                  </span>
                )}
              </div>

              {/* Movement Type */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Movement Type *
                </label>
                <select
                  name="movementType"
                  value={formData.movementType}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.movementType ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">Select Movement Type</option>
                  {Object.values(MOVEMENT_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {errors.movementType && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.movementType}
                  </span>
                )}
              </div>

              {/* Movement Status */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Movement Status *
                </label>
                <select
                  name="movementStatus"
                  value={formData.movementStatus}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  {Object.values(MOVEMENT_STATUSES).map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>

              {/* From Entity Type */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  From Entity Type *
                </label>
                <select
                  name="fromEntityType"
                  value={formData.fromEntityType}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.fromEntityType ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">Select From Entity Type</option>
                  {Object.values(ENTITY_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {errors.fromEntityType && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.fromEntityType}
                  </span>
                )}
              </div>

              {/* To Entity Type */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  To Entity Type *
                </label>
                <select
                  name="toEntityType"
                  value={formData.toEntityType}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.toEntityType ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">Select To Entity Type</option>
                  {Object.values(ENTITY_TYPES).map((type) => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
                {errors.toEntityType && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.toEntityType}
                  </span>
                )}
              </div>

              {/* From Entity Selection */}
              {formData.fromEntityType && (
                <div style={{ gridColumn: "1 / -1" }}>
                  {renderEntitySelect(
                    "from",
                    formData.fromEntityType,
                    formData.fromEntityType === "WAREHOUSE" ? formData.fromEntityWarehouseId :
                    formData.fromEntityType === "ENGINEER" ? formData.fromEntityFieldEngineerId :
                    formData.fromEntityVehicleId,
                    "From Entity"
                  )}
                </div>
              )}

              {/* To Entity Selection */}
              {formData.toEntityType && (
                <div style={{ gridColumn: "1 / -1" }}>
                  {renderEntitySelect(
                    "to",
                    formData.toEntityType,
                    formData.toEntityType === "WAREHOUSE" ? formData.toEntityWarehouseId :
                    formData.toEntityType === "ENGINEER" ? formData.toEntityFieldEngineerId :
                    formData.toEntityVehicleId,
                    "To Entity"
                  )}
                </div>
              )}

              {/* Movement Date */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Movement Date *
                </label>
                <input
                  type="date"
                  name="movementDate"
                  value={formData.movementDate}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.movementDate ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
                {errors.movementDate && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.movementDate}
                  </span>
                )}
              </div>

              {/* Dispatched At */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Dispatched At
                </label>
                <input
                  type="date"
                  name="dispatchedAt"
                  value={formData.dispatchedAt}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Received At */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Received At
                </label>
                <input
                  type="date"
                  name="receivedAt"
                  value={formData.receivedAt}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Handover Proof */}
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Handover Proof
                </label>
                <input
                  type="text"
                  name="handoverProof"
                  value={formData.handoverProof}
                  onChange={handleChange}
                  disabled={submitting}
                  placeholder="Enter handover proof details"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
              </div>

              {/* Remarks */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={submitting}
                  rows={3}
                  placeholder="Enter any remarks..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary" 
              disabled={submitting}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Creating..." : "Create Movement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
