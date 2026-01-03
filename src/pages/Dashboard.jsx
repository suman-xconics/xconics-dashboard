import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, X, Edit } from "lucide-react";
import {
  getInstallationRequisitions,
  updateInstallationRequisition,
} from "../api/installationRequisitionApi";
import "./Dashboard.css";
import { getAggregators } from "../api/aggregatorApi";

/** ---------------------------
 *  Date helpers
 *  --------------------------*/

const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";

    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
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

    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return "N/A";
  }
};

// For <input type="date" />
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch (error) {
    return "";
  }
};

// Display date + time (local) in View modal Timeline.
const formatDateTimeLocalDisplay = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const addHours = (isoDateString, hours) => {
  if (!isoDateString) return null;
  const d = new Date(isoDateString);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getTime() + hours * 60 * 60 * 1000).toISOString();
};

const getEffectivePreferredDateTime = (requestedAt, preferredInstallationDate) => {
  // If requestedAt missing/invalid, fall back to preferred date-time as-is.
  const req = requestedAt ? new Date(requestedAt) : null;
  const pref = preferredInstallationDate ? new Date(preferredInstallationDate) : null;

  const reqValid = req && !isNaN(req.getTime());
  const prefValid = pref && !isNaN(pref.getTime());

  if (!reqValid && !prefValid) return null;
  if (!reqValid && prefValid) return pref.toISOString();

  // Base = requestedAt + 48h.
  const minPreferred = new Date(req.getTime() + 48 * 60 * 60 * 1000);

  // If preferred is already >= requestedAt+48h, show it; else show requestedAt+48h.
  if (prefValid && pref.getTime() >= minPreferred.getTime()) {
    return pref.toISOString();
  }
  return minPreferred.toISOString();
};

/** ---------------------------
 *  Badge helpers
 *  --------------------------*/

const getStatusBadgeStyle = (status) => {
  const styles = {
    NEW: { backgroundColor: "#e3f2fd", color: "#1976d2" },
    PENDING: { backgroundColor: "#e3f2fd", color: "#1976d2" },
    ASSIGNED: { backgroundColor: "#000000", color: "#f57c00" },
    ACCEPTED: { backgroundColor: "#e0f2f1", color: "#00796b" },
    IN_PROGRESS: { backgroundColor: "#fce4ec", color: "#c2185b" },
    COMPLETED: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    CANCELLED: { backgroundColor: "#ffebee", color: "#c62828" },
  };
  return styles[status] || { backgroundColor: "#f5f5f5", color: "#666" };
};

const getPriorityBadge = (priority) => {
  const styles = {
    LOW: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    NORMAL: { backgroundColor: "#e3f2fd", color: "#1976d2" },
    HIGH: { backgroundColor: "#fff3e0", color: "#f57c00" },
    URGENT: { backgroundColor: "#ffebee", color: "#c62828" },
  };
  return styles[priority] || { backgroundColor: "#f5f5f5", color: "#666" };
};

export default function Dashboard() {
  const navigate = useNavigate();

  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequisition, setSelectedRequisition] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    setLoading(true);
    setError(null);

    const params = { limit: 1000 };
    const result = await getInstallationRequisitions(params);

    if (result.success) {
      setRequisitions(result.data);
    } else {
      setError(result.error);
      setRequisitions([]);
    }
    setLoading(false);
  };

  const filteredRequisitions = useMemo(() => {
    let filtered = requisitions;

    if (filter !== "ALL") {
      filtered = filtered.filter((r) => r.status === filter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.requisitionNo?.toLowerCase().includes(q) ||
          r.vehicleNo?.toLowerCase().includes(q) ||
          r.customerName?.toLowerCase().includes(q) ||
          r.customerMobile?.toLowerCase().includes(q) ||
          r.branchId?.toString().toLowerCase().includes(q) ||
          r.branch?.branchCode?.toLowerCase().includes(q) ||
          r.branch?.branchName?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [requisitions, filter, searchTerm]);

  const counts = useMemo(() => {
    return {
      total: requisitions.length,
      pending: requisitions.filter((r) => r.status === "PENDING").length,
      assigned: requisitions.filter((r) => r.status === "ASSIGNED").length,
      accepted: requisitions.filter((r) => r.status === "ACCEPTED").length,
      inProgress: requisitions.filter((r) => r.status === "IN_PROGRESS").length,
      completed: requisitions.filter((r) => r.status === "COMPLETED").length,
      cancelled: requisitions.filter((r) => r.status === "CANCELLED").length,
    };
  }, [requisitions]);

  const handleViewDetails = (requisition) => {
    setSelectedRequisition(requisition);
    setShowViewModal(true);
  };

  const handleEditRequisition = (requisition) => {
    setSelectedRequisition(requisition);
    setShowEditModal(true);
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedRequisition(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedRequisition(null);
  };

  const handleUpdateSuccess = () => {
    fetchRequisitions();
    handleCloseEditModal();
  };

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Installation Requisitions</h2>
          <p className="breadcrumb">Home • Dashboard • Requisitions</p>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <SummaryCard title="Total" value={counts.total} color="blue" onClick={() => setFilter("ALL")} active={filter === "ALL"} />
        <SummaryCard title="Pending" value={counts.pending} color="yellow" onClick={() => setFilter("PENDING")} active={filter === "PENDING"} />
        <SummaryCard title="Assigned" value={counts.assigned} color="orange" onClick={() => setFilter("ASSIGNED")} active={filter === "ASSIGNED"} />
        <SummaryCard title="Accepted" value={counts.accepted} color="teal" onClick={() => setFilter("ACCEPTED")} active={filter === "ACCEPTED"} />
        <SummaryCard title="In Progress" value={counts.inProgress} color="pink" onClick={() => setFilter("IN_PROGRESS")} active={filter === "IN_PROGRESS"} />
        <SummaryCard title="Completed" value={counts.completed} color="green" onClick={() => setFilter("COMPLETED")} active={filter === "COMPLETED"} />
        <SummaryCard title="Cancelled" value={counts.cancelled} color="red" onClick={() => setFilter("CANCELLED")} active={filter === "CANCELLED"} />
      </div>

      {/* SEARCH */}
      <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by requisition no, vehicle no, customer name, branch code, or branch name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
          }}
        />
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <div
          style={{
            margin: "0 1.5rem 1rem 1.5rem",
            padding: "1rem",
            backgroundColor: "#f8d7da",
            color: "#721c24",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {/* REQUISITION TABLE */}
      <div className="ticket-card">
        <table>
          <thead>
            <tr>
              <th>Requisition No</th>
              <th>Branch Code</th>
              <th>Branch Name</th>
              <th>Vehicle No</th>
              <th>Customer Name</th>
              <th>Pincode</th>
              <th>District</th>
              <th>State</th>
              <th>Priority</th>
              <th>Requested At</th>
              <th>Preferred Date</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(14)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredRequisitions.length === 0 ? (
              <tr>
                <td colSpan="14" style={{ textAlign: "center", padding: "2rem" }}>
                  No requisitions found
                </td>
              </tr>
            ) : (
              filteredRequisitions.map((req) => (
                <tr key={req.id}>
                  <td><strong>{req.requisitionNo}</strong></td>
                  <td>{req.branch?.branchCode || "N/A"}</td>
                  <td>{req.branch?.branchName || "N/A"}</td>
                  <td>{req.vehicleNo}</td>
                  <td>{req.customerName}</td>
                  <td>{req.pincode || "N/A"}</td>
                  <td>{req.district || "N/A"}</td>
                  <td>{req.state || "N/A"}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        ...getPriorityBadge(req.priority),
                      }}
                    >
                      {req.priority}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>{formatDate(req.requestedAt)}</td>
                  <td style={{ fontSize: "0.9rem" }}>{formatDate(req.preferredInstallationDate)}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        ...getStatusBadgeStyle(req.status),
                      }}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: req.completedAt != null ? "#e8f5e9" : "#ffebee",
                        color: req.completedAt != null ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {req.completedAt != null ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="icon-btn" onClick={() => handleViewDetails(req)} title="View Details">
                        <Eye size={16} />
                      </button>

                      {!["ASSIGNED", "ACCEPTED", "COMPLETED", "CANCELLED"].includes(req.status) && (
                        <button
                          className="icon-btn"
                          onClick={() => handleEditRequisition(req)}
                          title="Assign Requisition"
                          style={{ color: "#f57c00" }}
                        >
                          <Edit size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MODAL */}
      {showViewModal && selectedRequisition && (
        <RequisitionModal requisition={selectedRequisition} onClose={handleCloseViewModal} />
      )}

      {/* EDIT MODAL */}
      {showEditModal && selectedRequisition && (
        <EditRequisitionModal
          requisition={selectedRequisition}
          onClose={handleCloseEditModal}
          onSuccess={handleUpdateSuccess}
        />
      )}
    </div>
  );
}

function SummaryCard({ title, value, color, onClick, active }) {
  return (
    <div
      className={`summary-card ${color} ${active ? "active" : ""}`}
      onClick={onClick}
      style={{ cursor: "pointer", border: active ? "2px solid #1976d2" : "none" }}
    >
      <h4>{title}</h4>
      <p>{value} Requisitions</p>
    </div>
  );
}

function EditRequisitionModal({ requisition, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    quantity: requisition.quantity || 0,
    preferredInstallationDate: formatDateForInput(requisition.preferredInstallationDate),
    assignedAggregatorId: requisition.assignedAggregatorId || "",
    installationFinishTimeAssigned: formatDateForInput(requisition.installationFinishTimeAssigned),
    status: "ASSIGNED",
  });

  const [aggregators, setAggregators] = useState([]);
  const [loadingAggregators, setLoadingAggregators] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAggregators();
  }, []);

  const fetchAggregators = async () => {
    setLoadingAggregators(true);
    const result = await getAggregators({ limit: 1000 });
    if (result.success) setAggregators(result.data);
    setLoadingAggregators(false);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.quantity || formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";
    if (!formData.preferredInstallationDate) newErrors.preferredInstallationDate = "Preferred installation date is required";
    if (!formData.assignedAggregatorId) newErrors.assignedAggregatorId = "Aggregator is required";
    if (!formData.installationFinishTimeAssigned) newErrors.installationFinishTimeAssigned = "Installation finish time is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
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

    const payload = {
      quantity: parseInt(formData.quantity, 10),
      preferredInstallationDate: formData.preferredInstallationDate,
      assignedAggregatorId: formData.assignedAggregatorId,
      installationFinishTimeAssigned: formData.installationFinishTimeAssigned,
      status: "ASSIGNED",
    };

    const result = await updateInstallationRequisition(requisition.id, payload);

    if (result.success) {
      alert("Requisition assigned successfully!");
      onSuccess();
    } else {
      alert(`Error: ${result.error}`);
    }

    setSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "600px" }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 , color: "#000"}}>Assign Requisition</h2>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              {requisition.requisitionNo}
            </p>
          </div>
<button className="modal-close" onClick={onClose}

>
  <X size={24}
  style={
    {
      color: "#000"
    }
  } />
</button>

        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.quantity ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
                {errors.quantity && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.quantity}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Preferred Installation Date *
                </label>
                <input
                  type="date"
                  name="preferredInstallationDate"
                  value={formData.preferredInstallationDate}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.preferredInstallationDate ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
                {errors.preferredInstallationDate && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.preferredInstallationDate}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Assigned Aggregator *
                </label>
                <select
                  name="assignedAggregatorId"
                  value={formData.assignedAggregatorId}
                  onChange={handleChange}
                  disabled={submitting || loadingAggregators}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.assignedAggregatorId ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">
                    {loadingAggregators ? "Loading..." : "Select Aggregator"}
                  </option>
                  {aggregators.map((agg) => (
                    <option key={agg.id} value={agg.id}>
                      {agg.aggregatorName} ({agg.aggregatorCode})
                    </option>
                  ))}
                </select>
                {errors.assignedAggregatorId && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.assignedAggregatorId}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
                  Installation Finish Time *
                </label>
                <input
                  type="date"
                  name="installationFinishTimeAssigned"
                  value={formData.installationFinishTimeAssigned}
                  onChange={handleChange}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: errors.installationFinishTimeAssigned ? "1px solid #c62828" : "1px solid #ccc",
                    borderRadius: "4px",
                    fontSize: "0.95rem",
                  }}
                />
                {errors.installationFinishTimeAssigned && (
                  <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
                    {errors.installationFinishTimeAssigned}
                  </span>
                )}
              </div>

              <div style={{ padding: "1rem", backgroundColor: "#fff3e0", borderRadius: "4px" }}>
                <p style={{ margin: 0, fontSize: "0.9rem", color: "#f57c00" }}>
                  <strong>Note:</strong> Status will be automatically set to <strong>ASSIGNED</strong> upon submission.
                </p>
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
              disabled={submitting || loadingAggregators}
              style={{
                backgroundColor: "#f57c00",
                color: "white",
                padding: "0.75rem 1.5rem",
                border: "none",
                borderRadius: "4px",
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Assigning..." : "Assign Requisition"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RequisitionModal({ requisition, onClose }) {
  // Effective preferred date-time: ensure preferred >= requestedAt + 48h.
  const effectivePreferred = getEffectivePreferredDateTime(
    requisition.requestedAt,
    requisition.preferredInstallationDate
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0 }}>{requisition.requisitionNo}</h2>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              ID: {requisition.id} | Branch: {requisition.branch?.branchName || "N/A"} ({requisition.branch?.branchCode || "N/A"})
            </p>
          </div>
<button
  type="button"
  className="modal-close-btn"
  onClick={onClose}
  aria-label="Close dialog"
  title="Close"
>
  <X size={20} />
</button>


        </div>

        <div className="modal-body">
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                ...getStatusBadgeStyle(requisition.status),
              }}
            >
              {requisition.status}
            </span>
            <span
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                fontSize: "0.9rem",
                fontWeight: "500",
                ...getPriorityBadge(requisition.priority),
              }}
            >
              {requisition.priority} Priority
            </span>
          </div>

          <div className="modal-section">
            <h4>Branch Information</h4>
            <div className="info-grid">
              <div>
                <label>Branch Code</label>
                <p>{requisition.branch?.branchCode || "N/A"}</p>
              </div>
              <div>
                <label>Branch Name</label>
                <p>{requisition.branch?.branchName || "N/A"}</p>
              </div>
              <div>
                <label>Branch ID</label>
                <p>{requisition.branchId || "N/A"}</p>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h4>Vehicle & Customer Information</h4>
            <div className="info-grid">
              <div>
                <label>Vehicle Number</label>
                <p>{requisition.vehicleNo}</p>
              </div>
              <div>
                <label>Customer Name</label>
                <p>{requisition.customerName}</p>
              </div>
              <div>
                <label>Customer Mobile</label>
                <p>{requisition.customerMobile}</p>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h4>Installation Address</h4>
            <p><strong>Address:</strong> {requisition.installationAddress}</p>
            <div className="info-grid">
              <div>
                <label>State</label>
                <p>{requisition.state}</p>
              </div>
              <div>
                <label>District</label>
                <p>{requisition.district}</p>
              </div>
              <div>
                <label>Pincode</label>
                <p>{requisition.pincode}</p>
              </div>
            </div>
          </div>

          <div className="modal-section">
            <h4>Timeline</h4>
            <div className="info-grid">
              <div>
                <label>Requested At</label>
                <p>{formatDateTime(requisition.requestedAt)}</p>
              </div>

              <div>
                <label>Preferred Date</label>
                <p>{effectivePreferred ? formatDateTimeLocalDisplay(effectivePreferred) : "N/A"}</p>
              </div>

              <div>
                <label>Completed At</label>
                <p>{requisition.completedAt ? formatDateTime(requisition.completedAt) : "Not Completed"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
