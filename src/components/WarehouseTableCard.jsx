import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { getWarehouses, updateWarehouse, deleteWarehouse } from "../api/warehouseApi";
import "./WarehouseTableCard.css";

export default function WarehouseTableCard() {
  const navigate = useNavigate();

  /* =====================
     STATE MANAGEMENT
     ===================== */
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* =====================
     FILTERS
     ===================== */
  const [warehouseTypeFilter, setWarehouseTypeFilter] = useState("");
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("");

  /* =====================
     PAGINATION
     ===================== */
  const rowsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  /* =====================
     SORTING
     ===================== */
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  /* =====================
     FETCH WAREHOUSES
     ===================== */
  const fetchWarehouses = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
      warehouseType: warehouseTypeFilter || undefined,
      warehouseOwnerType: ownerTypeFilter || undefined,
    };

    const result = await getWarehouses(params);

    if (result.success) {
      setWarehouses(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setWarehouses([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWarehouses();
  }, [currentPage, searchTerm, warehouseTypeFilter, ownerTypeFilter]);

  /* =====================
     TOGGLE STATUS - CALLS UPDATE API
     ===================== */
  const handleToggle = async (id, currentWarehouse) => {
    // Optimistic update
    const newStatus = currentWarehouse.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setWarehouses((prev) =>
      prev.map((wh) =>
        wh.id === id ? { ...wh, status: newStatus } : wh
      )
    );

    setUpdatingId(id);

    try {
      // Prepare complete payload
      const payload = {
        warehouseCode: currentWarehouse.warehouseCode,
        warehouseName: currentWarehouse.warehouseName,
        warehouseType: currentWarehouse.warehouseType,
        ownerType: currentWarehouse.ownerType,
        aggregatorId: currentWarehouse.aggregatorId,
        address: currentWarehouse.address,
        state: currentWarehouse.state,
        district: currentWarehouse.district,
        pincode: currentWarehouse.pincode,
        latitude: currentWarehouse.latitude || 0,
        longitude: currentWarehouse.longitude || 0,
        contactPersonName: currentWarehouse.contactPersonName,
        contactMobile: currentWarehouse.contactMobile,
        emailId: currentWarehouse.emailId,
        status: newStatus, // Only change status
        remarks: currentWarehouse.remarks || "",
      };

      const result = await updateWarehouse(id, payload);

      if (!result.success) {
        // Revert on failure
        setWarehouses((prev) =>
          prev.map((wh) =>
            wh.id === id ? { ...wh, status: currentWarehouse.status } : wh
          )
        );
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setWarehouses((prev) =>
        prev.map((wh) =>
          wh.id === id ? { ...wh, status: currentWarehouse.status } : wh
        )
      );
      alert("An error occurred while updating status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* =====================
     DELETE HANDLER
     ===================== */
  const handleDelete = async (id, warehouseName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${warehouseName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const result = await deleteWarehouse(id);

    if (result.success) {
      alert("Warehouse deleted successfully!");
      fetchWarehouses();
    } else {
      alert(`Error: ${result.error}`);
    }

    setDeletingId(null);
  };

  /* =====================
     SORTING
     ===================== */
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
    if (!sortConfig.key) return warehouses;

    return [...warehouses].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === "boolean") {
        return sortConfig.direction === "asc"
          ? Number(aVal) - Number(bVal)
          : Number(bVal) - Number(aVal);
      }

      return sortConfig.direction === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [warehouses, sortConfig]);

  /* =====================
     SORT ICON
     ===================== */
  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  };

  /* =====================
     SEARCH HANDLER
     ===================== */
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="fe-table-wrapper">
      <div className="card fe-table-card">
        {/* SEARCH AND FILTERS */}
          <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Search warehouses..."
                value={searchTerm}
                onChange={handleSearch}
                style={{
            flex: 2,
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
                }}
              />

              <select
                value={warehouseTypeFilter}
                onChange={(e) => {
            setWarehouseTypeFilter(e.target.value);
            setCurrentPage(1);
                }}
                style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
                }}
              >
                <option value="">All Warehouse Types</option>
                <option value="PRODUCTION">Production</option>
                <option value="LOCAL">Local</option>
                <option value="REGIONAL">Regional</option>
              </select>

              <select
                value={ownerTypeFilter}
                onChange={(e) => {
            setOwnerTypeFilter(e.target.value);
            setCurrentPage(1);
                }}
                style={{
            flex: 1,
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
                }}
              >
                <option value="">All Owner Types</option>
                <option value="XCONICS">Xconics</option>
                <option value="AGGREGATOR">Aggregator</option>
              </select>
            </div>
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

        {/* TABLE */}
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort("warehouseCode")}>
                Warehouse Code <SortIcon column="warehouseCode" />
              </th>
              <th onClick={() => handleSort("warehouseName")}>
                Warehouse Name <SortIcon column="warehouseName" />
              </th>
              <th onClick={() => handleSort("warehouseType")}>
                Type <SortIcon column="warehouseType" />
              </th>
              <th onClick={() => handleSort("ownerType")}>
                Owner <SortIcon column="ownerType" />
              </th>
              <th onClick={() => handleSort("state")}>
                State <SortIcon column="state" />
              </th>
              <th onClick={() => handleSort("district")}>
                District <SortIcon column="district" />
              </th>
              <th>Contact</th>
              <th onClick={() => handleSort("status")}>
                Status <SortIcon column="status" />
              </th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // LOADING SKELETON
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(9)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // NO DATA
              <tr>
                <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                  No warehouses found
                </td>
              </tr>
            ) : (
              // DATA ROWS
              sortedData.map((wh) => (
                <tr key={wh.id}>
                  <td>{wh.warehouseCode}</td>
                  <td>{wh.warehouseName}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: 
                          wh.warehouseType === "PRODUCTION" ? "#e3f2fd" : 
                          wh.warehouseType === "LOCAL" ? "#fff3e0" : "#f3e5f5",
                        color: 
                          wh.warehouseType === "PRODUCTION" ? "#1976d2" : 
                          wh.warehouseType === "LOCAL" ? "#f57c00" : "#7b1fa2",
                      }}
                    >
                      {wh.warehouseType}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: wh.ownerType === "XCONICS" ? "#e8f5e9" : "#fff9c4",
                        color: wh.ownerType === "XCONICS" ? "#2e7d32" : "#f57f17",
                      }}
                    >
                      {wh.ownerType}
                    </span>
                  </td>
                  <td>{wh.state}</td>
                  <td>{wh.district}</td>
                  <td>{wh.contactMobile}</td>

                  {/* STATUS TOGGLE */}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={wh.status === "ACTIVE"}
                        onChange={() => handleToggle(wh.id, wh)}
                        disabled={updatingId === wh.id}
                      />
                      <span className="slider" />
                    </label>
                    {updatingId === wh.id && (
                      <span style={{ fontSize: "0.8rem", color: "#666", marginLeft: "0.5rem" }}>
                        Updating...
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        navigate(`/warehouse/view/${wh.id}`, {
                          state: wh,
                        })
                      }
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/warehouse/edit/${wh.id}`)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(wh.id, wh.warehouseName)}
                      disabled={deletingId === wh.id}
                      title="Delete"
                      style={{ color: "#dc3545" }}
                    >
                      {deletingId === wh.id ? (
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

        {/* PAGINATION */}
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
