import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { getFieldEngineers, updateFieldEngineer, deleteFieldEngineer } from "../api/fieldEngineerApi";
import "./FieldEngineerTableCard.css";

export default function FieldEngineerTableCard() {
  const navigate = useNavigate();

  /* =====================
     STATE MANAGEMENT
     ===================== */
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* =====================
     FILTERS
     ===================== */
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [aggregatorIdFilter, setAggregatorIdFilter] = useState("");

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
     FETCH FIELD ENGINEERS
     ===================== */
  const fetchEngineers = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
      employmentType: employmentTypeFilter || undefined,
      aggregatorId: aggregatorIdFilter || undefined,
    };

    const result = await getFieldEngineers(params);

    if (result.success) {
      setEngineers(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setEngineers([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEngineers();
  }, [currentPage, searchTerm, employmentTypeFilter, aggregatorIdFilter]);

  /* =====================
     TOGGLE STATUS - CALLS UPDATE API
     ===================== */
  const handleToggle = async (id, currentEngineer) => {
    // Optimistic update
    const newStatus = currentEngineer.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setEngineers((prev) =>
      prev.map((eng) =>
        eng.id === id ? { ...eng, status: newStatus } : eng
      )
    );

    setUpdatingId(id);

    try {
      // Prepare complete payload
      const payload = {
        engineerCode: currentEngineer.engineerCode,
        engineerName: currentEngineer.engineerName,
        mobileNo: currentEngineer.mobileNo,
        emailId: currentEngineer.emailId,
        aggregatorId: currentEngineer.aggregatorId,
        branchCode: currentEngineer.branchCode,
        employmentType: currentEngineer.employmentType,
        state: currentEngineer.state,
        district: currentEngineer.district,
        baseLocation: currentEngineer.baseLocation,
        skillSet: currentEngineer.skillSet || [],
        assignedDeviceCount: currentEngineer.assignedDeviceCount || 0,
        status: newStatus, // Only change status
        joiningDate: currentEngineer.joiningDate,
        lastWorkingDate: currentEngineer.lastWorkingDate,
        idProofType: currentEngineer.idProofType,
        idProofNumber: currentEngineer.idProofNumber,
        currentLatitude: currentEngineer.currentLatitude || 0,
        currentLongitude: currentEngineer.currentLongitude || 0,
        locationUpdatedAt: currentEngineer.locationUpdatedAt,
        remarks: currentEngineer.remarks || "",
      };

      const result = await updateFieldEngineer(id, payload);

      if (!result.success) {
        // Revert on failure
        setEngineers((prev) =>
          prev.map((eng) =>
            eng.id === id ? { ...eng, status: currentEngineer.status } : eng
          )
        );
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setEngineers((prev) =>
        prev.map((eng) =>
          eng.id === id ? { ...eng, status: currentEngineer.status } : eng
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
  const handleDelete = async (id, engineerName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${engineerName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const result = await deleteFieldEngineer(id);

    if (result.success) {
      alert("Field engineer deleted successfully!");
      fetchEngineers();
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
    if (!sortConfig.key) return engineers;

    return [...engineers].sort((a, b) => {
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
  }, [engineers, sortConfig]);

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
          <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="Search field engineers..."
                value={searchTerm}
                onChange={handleSearch}
                style={{
            width: "50%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
                }}
              />

              <select
                value={employmentTypeFilter}
                onChange={(e) => {
            setEmploymentTypeFilter(e.target.value);
            setCurrentPage(1);
                }}
                style={{
            width: "50%",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.9rem",
                }}
              >
                <option value="">All Employment Types</option>
                <option value="XCONICS">Xconics</option>
                <option value="AGGREGATOR">Aggregator</option>
              </select>
            </div>
          </div>

          {/* ERROR MESSAGE */}
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
              <th onClick={() => handleSort("engineerCode")}>
                Engineer Code <SortIcon column="engineerCode" />
              </th>
              <th onClick={() => handleSort("engineerName")}>
                Engineer Name <SortIcon column="engineerName" />
              </th>
              <th onClick={() => handleSort("mobileNo")}>
                Mobile No <SortIcon column="mobileNo" />
              </th>
              <th>Email</th>
              <th onClick={() => handleSort("employmentType")}>
                Employment Type <SortIcon column="employmentType" />
              </th>
              <th onClick={() => handleSort("state")}>
                State <SortIcon column="state" />
              </th>
              <th>Base Location</th>
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
                  No field engineers found
                </td>
              </tr>
            ) : (
              // DATA ROWS
              sortedData.map((eng) => (
                <tr key={eng.id}>
                  <td>{eng.engineerCode}</td>
                  <td>{eng.engineerName}</td>
                  <td>{eng.mobileNo}</td>
                  <td>{eng.emailId}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: eng.employmentType === "XCONICS" ? "#e3f2fd" : "#fff3e0",
                        color: eng.employmentType === "XCONICS" ? "#1976d2" : "#f57c00",
                      }}
                    >
                      {eng.employmentType}
                    </span>
                  </td>
                  <td>{eng.state}</td>
                  <td>{eng.baseLocation}</td>

                  {/* STATUS TOGGLE */}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={eng.status === "ACTIVE"}
                        onChange={() => handleToggle(eng.id, eng)}
                        disabled={updatingId === eng.id}
                      />
                      <span className="slider" />
                    </label>
                    {updatingId === eng.id && (
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
                        navigate(`/engineers/view/${eng.id}`, {
                          state: eng,
                        })
                      }
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/engineers/edit/${eng.id}`)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(eng.id, eng.engineerName)}
                      disabled={deletingId === eng.id}
                      title="Delete"
                      style={{ color: "#dc3545" }}
                    >
                      {deletingId === eng.id ? (
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
