import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Eye, ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { getAggregators, deleteAggregator, updateAggregator } from "../api/aggregatorApi";
import "../components/LenderTable.css";

export default function AggregatorTableCard() {
  const navigate = useNavigate();

  /* =====================
     STATE MANAGEMENT
     ===================== */
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

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
     FETCH AGGREGATORS
     ===================== */
  const fetchAggregators = async () => {
    setLoading(true);
    setError(null);

    const offset = (currentPage - 1) * rowsPerPage;
    const params = {
      search: searchTerm || undefined,
      offset,
      limit: rowsPerPage,
    };

    const result = await getAggregators(params);

    if (result.success) {
      setAggregators(result.data);
      setTotalPages(result.maxPage);
    } else {
      setError(result.error);
      setAggregators([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAggregators();
  }, [currentPage, searchTerm]);

  /* =====================
     TOGGLE STATUS - CALLS UPDATE API
     ===================== */
  const toggleStatus = async (id, currentAggregator) => {
    // Optimistic update - update UI immediately
    const newStatus = currentAggregator.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    
    setAggregators((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    setUpdatingId(id);

    try {
      // Prepare payload with all required fields
      const payload = {
        aggregatorCode: currentAggregator.aggregatorCode,
        aggregatorName: currentAggregator.aggregatorName,
        contactPersonName: currentAggregator.contactPersonName,
        contactMobile: currentAggregator.contactMobile,
        contactEmail: currentAggregator.contactEmail,
        officeAddress: currentAggregator.officeAddress,
        state: currentAggregator.state,
        district: currentAggregator.district,
        serviceCoverage: currentAggregator.serviceCoverage,
        serviceType: currentAggregator.serviceType,
        tatHours: currentAggregator.tatHours,
        ldApplicable: currentAggregator.ldApplicable,
        ldPercentageCap: currentAggregator.ldPercentageCap,
        billingCycle: currentAggregator.billingCycle,
        paymentTermsDays: currentAggregator.paymentTermsDays,
        contractStartDate: currentAggregator.contractStartDate,
        contractEndDate: currentAggregator.contractEndDate,
        bankName: currentAggregator.bankName,
        bankAccountNo: currentAggregator.bankAccountNo,
        ifscCode: currentAggregator.ifscCode,
        gstNumber: currentAggregator.gstNumber,
        panNumber: currentAggregator.panNumber,
        status: newStatus, // Only change the status
        remarks: currentAggregator.remarks,
      };

      const result = await updateAggregator(id, payload);

      if (result.success) {
        console.log("Status updated successfully");
        // Optionally show a success toast
      } else {
        // Revert on failure
        setAggregators((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: currentAggregator.status } : item
          )
        );
        alert(`Failed to update status: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating status:", err);
      // Revert on error
      setAggregators((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: currentAggregator.status } : item
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
  const handleDelete = async (id, aggregatorName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${aggregatorName}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(id);

    const result = await deleteAggregator(id);

    if (result.success) {
      alert("Aggregator deleted successfully!");
      fetchAggregators();
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
    if (!sortConfig.key) return aggregators;

    return [...aggregators].sort((a, b) => {
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
  }, [aggregators, sortConfig]);

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
        {/* SEARCH BAR */}
        <div style={{ padding: "1rem", borderBottom: "1px solid #e0e0e0" }}>
          <input
            type="text"
            placeholder="Search aggregators..."
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
              <th onClick={() => handleSort("id")}>
                ID <SortIcon column="id" />
              </th>
              <th onClick={() => handleSort("aggregatorCode")}>
                Code <SortIcon column="aggregatorCode" />
              </th>
              <th onClick={() => handleSort("aggregatorName")}>
                Aggregator Name <SortIcon column="aggregatorName" />
              </th>
              <th onClick={() => handleSort("contactPersonName")}>
                Contact Person <SortIcon column="contactPersonName" />
              </th>
              <th>Mobile</th>
              <th onClick={() => handleSort("state")}>
                State <SortIcon column="state" />
              </th>
              <th>District</th>
              <th onClick={() => handleSort("serviceType")}>
                Service Type <SortIcon column="serviceType" />
              </th>
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
                  {[...Array(10)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              // NO DATA
              <tr>
                <td colSpan="10" style={{ textAlign: "center", padding: "2rem" }}>
                  No aggregators found
                </td>
              </tr>
            ) : (
              // DATA ROWS
              sortedData.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td>{row.aggregatorCode}</td>
                  <td>{row.aggregatorName}</td>
                  <td>{row.contactPersonName}</td>
                  <td>{row.contactMobile}</td>
                  <td>{row.state}</td>
                  <td>{row.district}</td>
                  <td>{row.serviceType}</td>

                  {/* STATUS TOGGLE */}
                  <td>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={row.status === "ACTIVE"}
                        onChange={() => toggleStatus(row.id, row)}
                        disabled={updatingId === row.id}
                      />
                      <span className="slider" />
                    </label>
                    {updatingId === row.id && (
                      <span style={{ fontSize: "0.8rem", color: "#666", marginLeft: "0.5rem" }}>
                        Updating...
                      </span>
                    )}
                  </td>

                  {/* ACTION */}
                  <td>
                    <button
                      className="icon-btn"
                      onClick={() =>
                        navigate(`/aggregators/view/${row.id}`, { state: row })
                      }
                      title="View"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="icon-btn"
                      onClick={() => navigate(`/aggregators/edit/${row.id}`)}
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      className="icon-btn delete-btn"
                      onClick={() => handleDelete(row.id, row.aggregatorName)}
                      disabled={deletingId === row.id}
                      title="Delete"
                    >
                      {deletingId === row.id ? (
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
