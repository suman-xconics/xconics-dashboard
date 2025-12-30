import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { getLenderBranches, updateLenderBranch, deleteLenderBranch } from "../api/lenderBranchApi";
import "./LenderTableCard.css";

export default function LenderBranchTableCard() {
  const navigate = useNavigate();

  /* =====================
     STATE MANAGEMENT
     ===================== */
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  /* =====================
     FILTERS
     ===================== */
  const [lenderIdFilter, setLenderIdFilter] = useState("");

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
     FETCH BRANCHES
     ===================== */
  const fetchBranches = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
      lenderId: lenderIdFilter || undefined,
    };

    const result = await getLenderBranches(params);

    if (result.success) {
      setBranches(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setBranches([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBranches();
  }, [currentPage, searchTerm, lenderIdFilter]);

  /* =====================
     TOGGLE STATUS - CALLS UPDATE API
     ===================== */
  const handleToggle = async (id, currentBranch) => {
    // Optimistic update
    const newStatus = currentBranch.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setBranches((prev) =>
      prev.map((branch) =>
        branch.id === id ? { ...branch, status: newStatus } : branch
      )
    );

    setUpdatingId(id);

    try {
      // Prepare complete payload
      const payload = {
        lenderId: currentBranch.lenderId,
        branchCode: currentBranch.branchCode,
        branchName: currentBranch.branchName,
        branchType: currentBranch.branchType,
        contactPersonName: currentBranch.contactPersonName,
        contactMobile: currentBranch.contactMobile,
        contactEmail: currentBranch.contactEmail,
        address: currentBranch.address,
        state: currentBranch.state,
        district: currentBranch.district,
        pincode: currentBranch.pincode,
        latitude: currentBranch.latitude || 0,
        longitude: currentBranch.longitude || 0,
        locationUpdatedAt: currentBranch.locationUpdatedAt,
        billingApplicable: currentBranch.billingApplicable,
        status: newStatus, // Only change status
        remarks: currentBranch.remarks || "",
      };

      const result = await updateLenderBranch(id, payload);

      if (!result.success) {
        // Revert on failure
        setBranches((prev) =>
          prev.map((branch) =>
            branch.id === id ? { ...branch, status: currentBranch.status } : branch
          )
        );
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setBranches((prev) =>
        prev.map((branch) =>
          branch.id === id ? { ...branch, status: currentBranch.status } : branch
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
  const handleDelete = async (id, branchName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${branchName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const result = await deleteLenderBranch(id);

    if (result.success) {
      alert("Lender branch deleted successfully!");
      fetchBranches();
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
    if (!sortConfig.key) return branches;

    return [...branches].sort((a, b) => {
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
  }, [branches, sortConfig]);

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
    <div className="lender-table-wrapper">
      <div className="card lender-table-card">
        {/* SEARCH */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
          <input
            type="text"
            placeholder="Search branches..."
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
              <th onClick={() => handleSort("branchCode")}>
                Branch Code <SortIcon column="branchCode" />
              </th>
              <th onClick={() => handleSort("branchName")}>
                Branch Name <SortIcon column="branchName" />
              </th>
              <th onClick={() => handleSort("branchType")}>
                Type <SortIcon column="branchType" />
              </th>
              <th>Contact</th>
              <th onClick={() => handleSort("state")}>
                State <SortIcon column="state" />
              </th>
              <th onClick={() => handleSort("district")}>
                District <SortIcon column="district" />
              </th>
              <th>Billing</th>
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
                  No branches found
                </td>
              </tr>
            ) : (
              // DATA ROWS
              sortedData.map((branch) => (
                <tr key={branch.id}>
                  <td>{branch.branchCode}</td>
                  <td>{branch.branchName}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: 
                          branch.branchType === "HO" ? "#e3f2fd" : 
                          branch.branchType === "RO" ? "#fff3e0" : "#f3e5f5",
                        color: 
                          branch.branchType === "HO" ? "#1976d2" : 
                          branch.branchType === "RO" ? "#f57c00" : "#7b1fa2",
                      }}
                    >
                      {branch.branchType}
                    </span>
                  </td>
                  <td>{branch.contactMobile}</td>
                  <td>{branch.state}</td>
                  <td>{branch.district}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: branch.billingApplicable ? "#d4edda" : "#f8d7da",
                        color: branch.billingApplicable ? "#155724" : "#721c24",
                      }}
                    >
                      {branch.billingApplicable ? "Yes" : "No"}
                    </span>
                  </td>

                  {/* STATUS TOGGLE */}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={branch.status === "ACTIVE"}
                        onChange={() => handleToggle(branch.id, branch)}
                        disabled={updatingId === branch.id}
                      />
                      <span className="slider" />
                    </label>
                    {updatingId === branch.id && (
                      <span style={{ fontSize: "0.8rem", color: "#666", marginLeft: "0.5rem" }}>
                        Updating...
                      </span>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td>
                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/lender-branches/view/${branch.id}`)}
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/lender-branches/edit/${branch.id}`)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(branch.id, branch.branchName)}
                      disabled={deletingId === branch.id}
                      title="Delete"
                      style={{ color: "#dc3545" }}
                    >
                      {deletingId === branch.id ? (
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
