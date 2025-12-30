import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowUp, ArrowDown } from "lucide-react";
import { getDeviceMovements } from "../api/deviceMovementApi";
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
        <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
          <input
            type="text"
            placeholder="Search by IMEI or movement details..."
            value={searchTerm}
            onChange={handleSearch}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.9rem",
            }}
          />
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
    </div>
  );
}
