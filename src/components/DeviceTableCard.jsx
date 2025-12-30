import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, ArrowUp, ArrowDown, Truck, Trash2 } from "lucide-react";
import { getDevices, deleteDevice } from "../api/deviceApi";
import "./DeviceTableCard.css";

export default function DeviceTableCard() {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchDevices();
  }, [currentPage, searchTerm]);

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
    };

    const result = await getDevices(params);

    if (result.success) {
      setDevices(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setDevices([]);
    }

    setLoading(false);
  };

  const handleDelete = async (id, imei) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete device ${imei}?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const result = await deleteDevice(id);

    if (result.success) {
      alert("Device deleted successfully!");
      fetchDevices();
    } else {
      alert(`Error: ${result.error}`);
    }

    setDeletingId(null);
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

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return devices;

    return [...devices].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [devices, sortConfig]);

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
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

  return (
    <div className="device-table-wrapper">
      <div className="card device-table-card">
        <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
          <input
            type="text"
            placeholder="Search devices by IMEI or QR code..."
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
              <th onClick={() => handleSort("imei")}>
                IMEI <SortIcon column="imei" />
              </th>
              <th onClick={() => handleSort("qr")}>
                QR Code <SortIcon column="qr" />
              </th>
              <th onClick={() => handleSort("locationType")}>
                Location Type <SortIcon column="locationType" />
              </th>
              <th>Production Floor</th>
              <th>Warehouse</th>
              <th>Requisition</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(7)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                  No devices found
                </td>
              </tr>
            ) : (
              sortedData.map((device) => (
                <tr key={device.id}>
                  <td>{device.imei}</td>
                  <td>{device.qr}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        ...getLocationBadgeStyle(device.locationType),
                      }}
                    >
                      {device.locationType}
                    </span>
                  </td>
                  <td>{device.locationProductionFloor || "-"}</td>
                  <td>
                    {device.productionWarehouse?.warehouseCode || "-"}
                  </td>
                  <td>
                    {device.installationRequisitionId ? (
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#666",
                          fontFamily: "monospace",
                        }}
                      >
                        {device.installationRequisitionId.substring(0, 8)}...
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>

                  <td>
                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/devices/view/${device.id}`)}
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/devices/edit/${device.id}`)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      title="Move Device"
                      onClick={() => navigate(`/devices/move/${device.id}`)}
                    >
                      <Truck size={16} />
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(device.id, device.imei)}
                      disabled={deletingId === device.id}
                      title="Delete"
                      style={{ color: "#dc3545" }}
                    >
                      {deletingId === device.id ? (
                        <span className="spinner-small" />
                      ) : (
                        <Trash2 size={16} />
                      )}
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
