import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, X, Edit, Plus, Trash2 } from "lucide-react";
import {
  getSupportTickets,
  getSupportTicketById,
  updateSupportTicket,
  createSupportTicket,
  deleteSupportTicket,
} from "../api/supportTicketApi";
import {  getAggregators,  } from "../api/aggregatorApi";
import "./Dashboard.css";

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

const getAadhaarStatusBadge = (status) => {
  const styles = {
    VERIFIED: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    NOT_VERIFIED: { backgroundColor: "#fff3e0", color: "#f57c00" },
  };
  return styles[status] || { backgroundColor: "#f5f5f5", color: "#666" };
};

const getChecklistBadge = (status) => {
  const styles = {
    PASS: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    FAIL: { backgroundColor: "#ffebee", color: "#c62828" },
  };
  return styles[status] || { backgroundColor: "#f5f5f5", color: "#666" };
};

export default function SupportTicketsDashboard() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalMode, setModalMode] = useState("view");

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    const params = { limit: 1000 };
    const result = await getSupportTickets(params);

    if (result.success) {
      setTickets(result.data);
    } else {
      setError(result.error);
      setTickets([]);
    }
    setLoading(false);
  };

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    if (filter !== "ALL") {
      filtered = filtered.filter((t) => t.status === filter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.ticketNo?.toLowerCase().includes(q) ||
          t.issueDetail?.toLowerCase().includes(q) ||
          t.supportAddress?.toLowerCase().includes(q) ||
          t.installationRequisition?.vehicleNo?.toLowerCase().includes(q) ||
          t.installationRequisition?.customerName?.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [tickets, filter, searchTerm]);

  const counts = useMemo(() => {
    return {
      total: tickets.length,
      new: tickets.filter((t) => t.status === "NEW").length,
      assigned: tickets.filter((t) => t.status === "ASSIGNED").length,
      inProgress: tickets.filter((t) => t.status === "IN_PROGRESS").length,
      completed: tickets.filter((t) => t.status === "COMPLETED").length,
      cancelled: tickets.filter((t) => t.status === "CANCELLED").length,
    };
  }, [tickets]);

  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setModalMode("view");
    setShowViewModal(true);
  };

  const handleEditTicket = (ticket) => {
    setSelectedTicket(ticket);
    setModalMode("edit");
    setShowEditModal(true);
  };

  const handleCreateTicket = () => {
    setSelectedTicket(null);
    setModalMode("create");
    setShowCreateModal(true);
  };

  const handleDeleteTicket = async (ticket) => {
    if (!window.confirm(`Are you sure you want to delete ticket ${ticket.ticketNo}?`)) {
      return;
    }

    const result = await deleteSupportTicket(ticket.id);
    if (result.success) {
      alert("Ticket deleted successfully!");
      fetchTickets();
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleStatusUpdate = async (ticketId, newStatus) => {
    const result = await updateSupportTicket(ticketId, { status: newStatus });
    if (result.success) {
      fetchTickets();
    } else {
      alert(`Error updating status: ${result.error}`);
    }
  };

  const handleCloseModals = () => {
    setShowViewModal(false);
    setShowCreateModal(false);
    setShowEditModal(false);
    setSelectedTicket(null);
    setModalMode("view");
  };

  const handleSuccess = () => {
    fetchTickets();
    handleCloseModals();
  };

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Support Tickets</h2>
          <p className="breadcrumb">Home • Dashboard • Support Tickets</p>
        </div>
        <button 
          className="primary" 
          onClick={handleCreateTicket}
          style={{
            backgroundColor: "#1976d2",
            color: "white",
            padding: "0.75rem 1.5rem",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <Plus size={20} />
          Create Ticket
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <SummaryCard title="Total" value={counts.total} color="blue" onClick={() => setFilter("ALL")} active={filter === "ALL"} />
        <SummaryCard title="New" value={counts.new} color="blue" onClick={() => setFilter("NEW")} active={filter === "NEW"} />
        <SummaryCard title="Assigned" value={counts.assigned} color="orange" onClick={() => setFilter("ASSIGNED")} active={filter === "ASSIGNED"} />
        <SummaryCard title="In Progress" value={counts.inProgress} color="pink" onClick={() => setFilter("IN_PROGRESS")} active={filter === "IN_PROGRESS"} />
        <SummaryCard title="Completed" value={counts.completed} color="green" onClick={() => setFilter("COMPLETED")} active={filter === "COMPLETED"} />
        <SummaryCard title="Cancelled" value={counts.cancelled} color="red" onClick={() => setFilter("CANCELLED")} active={filter === "CANCELLED"} />
      </div>

      {/* SEARCH */}
      <div style={{ padding: "0 1.5rem", marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search by ticket no, issue detail, address, vehicle no, customer name..."
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

      {/* TICKET TABLE */}
      <div className="ticket-card">
        <table>
          <thead>
            <tr>
              <th>Ticket No</th>
              <th>Issue Detail</th>
              <th>Address</th>
              <th>Vehicle No</th>
              <th>Customer</th>
              <th>State/District</th>
              <th>Requested</th>
              <th>Preferred Date</th>
              <th>Aadhaar</th>
              <th>Status</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index}>
                  {[...Array(12)].map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton-line" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan="12" style={{ textAlign: "center", padding: "2rem" }}>
                  No support tickets found
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td><strong>{ticket.ticketNo}</strong></td>
                  <td style={{ maxWidth: "200px" }}>{ticket.issueDetail}</td>
                  <td style={{ maxWidth: "150px" }}>{ticket.supportAddress}</td>
                  <td>{ticket.installationRequisition?.vehicleNo || "N/A"}</td>
                  <td>{ticket.installationRequisition?.customerName || "N/A"}</td>
                  <td>
                    {ticket.state}/{ticket.district}
                  </td>
                  <td style={{ fontSize: "0.9rem" }}>{formatDate(ticket.requestedAt)}</td>
                  <td style={{ fontSize: "0.9rem" }}>{formatDate(ticket.preferredSupportDate)}</td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                        ...getAadhaarStatusBadge(ticket.aadhaarVerificationStatus),
                      }}
                    >
                      {ticket.aadhaarVerificationStatus?.substring(0, 3) || "N/A"}
                    </span>
                  </td>
                  <td>
                    <select
                      value={ticket.status}
                      onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        backgroundColor: "white",
                        fontSize: "0.8rem",
                        minWidth: "100px",
                      }}
                    >
                      <option value="NEW">NEW</option>
                      <option value="ASSIGNED">ASSIGNED</option>
                      <option value="IN_PROGRESS">IN_PROGRESS</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        backgroundColor: ticket.completedAt != null ? "#e8f5e9" : "#ffebee",
                        color: ticket.completedAt != null ? "#2e7d32" : "#c62828",
                      }}
                    >
                      {ticket.completedAt ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="icon-btn" onClick={() => handleViewDetails(ticket)} title="View Details">
                        <Eye size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleEditTicket(ticket)}
                        title="Edit"
                        style={{ color: "#f57c00" }}
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => handleDeleteTicket(ticket)}
                        title="Delete"
                        style={{ color: "#c62828" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      {(showViewModal || showCreateModal || showEditModal) && (
        <TicketFormModal
          ticket={selectedTicket}
          mode={modalMode}
          onClose={handleCloseModals}
          onSuccess={handleSuccess}
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
      <p>{value} Tickets</p>
    </div>
  );
}

function TicketFormModal({ ticket, mode, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    installationRequisitionId: "",
    ticketNo: "",
    issueDetail: "",
    supportAddress: "",
    state: "",
    district: "",
    pincode: "",
    requestedBy: "",
    requestedAt: formatDateForInput(new Date()),
    preferredSupportDate: "",
    assignedAggregatorId: "",
    tatHours: 24,
    supportFinishTimeAssigned: "",
    status: "NEW",
    aadhaarVerificationStatus: "NOT_VERIFIED",
    gsmChecklist: "PASS",
    gpsChecklist: "PASS",
    mainPowerChecklist: "PASS",
    batteryBackupStatus: "OK",
    xconicsValidation: false,
    remarks: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingTicket, setLoadingTicket] = useState(false);
  
  // Aggregator states
  const [aggregators, setAggregators] = useState([]);
  const [loadingAggregators, setLoadingAggregators] = useState(false);
  const [aggregatorError, setAggregatorError] = useState(null);

  // Fetch aggregators on modal mount
  useEffect(() => {
    const fetchAggregators = async () => {
      setLoadingAggregators(true);
      setAggregatorError(null);
      
      try {
        const result = await getAggregators({ limit: 1000 });
        
        if (result.success) {
          setAggregators(result.data);
        } else {
          setAggregatorError(result.error);
          setAggregators([]);
        }
      } catch (error) {
        setAggregatorError("Failed to fetch aggregators");
        setAggregators([]);
      } finally {
        setLoadingAggregators(false);
      }
    };

    fetchAggregators();
  }, []);

  useEffect(() => {
    if (mode === "edit" && ticket) {
      setFormData({
        installationRequisitionId: ticket.installationRequisitionId || "",
        ticketNo: ticket.ticketNo || "",
        issueDetail: ticket.issueDetail || "",
        supportAddress: ticket.supportAddress || "",
        state: ticket.state || "",
        district: ticket.district || "",
        pincode: ticket.pincode || "",
        requestedBy: ticket.requestedBy || "",
        requestedAt: formatDateForInput(ticket.requestedAt),
        preferredSupportDate: formatDateForInput(ticket.preferredSupportDate),
        assignedAggregatorId: ticket.assignedAggregatorId || "",
        tatHours: ticket.tatHours || 24,
        supportFinishTimeAssigned: formatDateForInput(ticket.supportFinishTimeAssigned),
        status: ticket.status || "NEW",
        aadhaarVerificationStatus: ticket.aadhaarVerificationStatus || "NOT_VERIFIED",
        gsmChecklist: ticket.gsmChecklist || "PASS",
        gpsChecklist: ticket.gpsChecklist || "PASS",
        mainPowerChecklist: ticket.mainPowerChecklist || "PASS",
        batteryBackupStatus: ticket.batteryBackupStatus || "OK",
        xconicsValidation: ticket.xconicsValidation || false,
        remarks: ticket.remarks || "",
      });
    } else if (mode === "create") {
      setFormData({
        installationRequisitionId: "",
        ticketNo: "",
        issueDetail: "",
        supportAddress: "",
        state: "",
        district: "",
        pincode: "",
        requestedBy: "",
        requestedAt: formatDateForInput(new Date()),
        preferredSupportDate: "",
        assignedAggregatorId: "",
        tatHours: 24,
        supportFinishTimeAssigned: "",
        status: "NEW",
        aadhaarVerificationStatus: "NOT_VERIFIED",
        gsmChecklist: "PASS",
        gpsChecklist: "PASS",
        mainPowerChecklist: "PASS",
        batteryBackupStatus: "OK",
        xconicsValidation: false,
        remarks: "",
      });
    }
  }, [ticket, mode]);

  const validate = () => {
    const newErrors = {};
    const requiredFields = ["ticketNo", "issueDetail", "supportAddress", "state", "district", "pincode"];
    
    requiredFields.forEach(field => {
      if (!formData[field]?.trim()) {
        newErrors[field] = `${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`;
      }
    });

    if (!formData.requestedAt) newErrors.requestedAt = "Requested date is required";
    if (!formData.preferredSupportDate) newErrors.preferredSupportDate = "Preferred support date is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      installationRequisitionId: formData.installationRequisitionId,
      ticketNo: formData.ticketNo,
      issueDetail: formData.issueDetail,
      supportAddress: formData.supportAddress,
      state: formData.state,
      district: formData.district,
      pincode: formData.pincode,
      requestedBy: formData.requestedBy,
      requestedAt: formData.requestedAt,
      preferredSupportDate: formData.preferredSupportDate,
      assignedAggregatorId: formData.assignedAggregatorId,
      tatHours: parseInt(formData.tatHours),
      supportFinishTimeAssigned: formData.supportFinishTimeAssigned,
      status: formData.status,
      aadhaarVerificationStatus: formData.aadhaarVerificationStatus,
      gsmChecklist: formData.gsmChecklist,
      gpsChecklist: formData.gpsChecklist,
      mainPowerChecklist: formData.mainPowerChecklist,
      batteryBackupStatus: formData.batteryBackupStatus,
      xconicsValidation: formData.xconicsValidation,
      remarks: formData.remarks,
    };

    let result;
    try {
      if (mode === "create") {
        result = await createSupportTicket(payload);
      } else if (mode === "edit") {
        result = await updateSupportTicket(ticket.id, payload);
      }

      if (result?.success) {
        alert(mode === "create" ? "Ticket created successfully!" : "Ticket updated successfully!");
        onSuccess();
      } else {
        alert(`Error: ${result?.error || "Unknown error"}`);
      }
    } catch (error) {
      alert(`Error: ${error.message || "Unknown error"}`);
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = mode === "create" ? "Create Support Ticket" : 
                    mode === "edit" ? "Edit Support Ticket" : "Ticket Details";

  // Aggregator options for select
  const aggregatorOptions = [
    { value: "", label: loadingAggregators ? "Loading aggregators..." : "Select Aggregator" },
    ...aggregators.map(aggregator => ({
      value: aggregator.id,
      label: `${aggregator.aggregatorName || 'Unnamed'} (${aggregator.aggregatorCode || 'N/A'})`
    }))
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="modal-header">
          <div>
            <h2 style={{ margin: 0, color: "#000" }}>{modalTitle}</h2>
            {mode !== "view" && ticket && (
              <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                {ticket.ticketNo}
              </p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} style={{ color: "#000" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ paddingBottom: "1rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
              
              {/* Basic Info */}
              <div>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Basic Information</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <InputField
                    label="Ticket No *"
                    name="ticketNo"
                    value={formData.ticketNo}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    error={errors.ticketNo}
                    required
                  />
                  <InputField
                    label="Issue Detail *"
                    name="issueDetail"
                    value={formData.issueDetail}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    error={errors.issueDetail}
                    as="textarea"
                    required
                  />
                  <InputField
                    label="Installation Requisition ID"
                    name="installationRequisitionId"
                    value={formData.installationRequisitionId}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Support Address</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <InputField
                    label="Support Address *"
                    name="supportAddress"
                    value={formData.supportAddress}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    error={errors.supportAddress}
                    required
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <InputField
                      label="State *"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      error={errors.state}
                      required
                    />
                    <InputField
                      label="District *"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      error={errors.district}
                      required
                    />
                  </div>
                  <InputField
                    label="Pincode *"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    error={errors.pincode}
                    required
                  />
                </div>
              </div>

              {/* Dates & Assignment */}
              <div>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Dates & Assignment</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <InputField
                      label="Requested At *"
                      name="requestedAt"
                      type="date"
                      value={formData.requestedAt}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      error={errors.requestedAt}
                      required
                    />
                    <InputField
                      label="Preferred Support Date *"
                      name="preferredSupportDate"
                      type="date"
                      value={formData.preferredSupportDate}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      error={errors.preferredSupportDate}
                      required
                    />
                  </div>
                  <InputField
                    label="TAT Hours"
                    name="tatHours"
                    type="number"
                    value={formData.tatHours}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    min="0"
                  />
                  <InputField
                    label="Support Finish Time"
                    name="supportFinishTimeAssigned"
                    type="date"
                    value={formData.supportFinishTimeAssigned}
                    onChange={handleChange}
                    disabled={mode === "view"}
                  />
                  <SelectField
                    label={`Assigned Aggregator ${loadingAggregators ? '(Loading...)' : ''}`}
                    name="assignedAggregatorId"
                    value={formData.assignedAggregatorId}
                    onChange={handleChange}
                    disabled={mode === "view" || loadingAggregators}
                    options={aggregatorOptions}
                  />
                </div>
              </div>

              {/* Checklists & Status */}
              <div>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Checklists & Status</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <SelectField
                      label="Aadhaar Status"
                      name="aadhaarVerificationStatus"
                      value={formData.aadhaarVerificationStatus}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      options={[
                        { value: "NOT_VERIFIED", label: "Not Verified" },
                        { value: "VERIFIED", label: "Verified" },
                      ]}
                    />
                    <SelectField
                      label="Status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      options={[
                        { value: "NEW", label: "New" },
                        { value: "ASSIGNED", label: "Assigned" },
                        { value: "IN_PROGRESS", label: "In Progress" },
                        { value: "COMPLETED", label: "Completed" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                    />
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                    <SelectField
                      label="GSM"
                      name="gsmChecklist"
                      value={formData.gsmChecklist}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      options={[
                        { value: "PASS", label: "PASS" },
                        { value: "FAIL", label: "FAIL" },
                      ]}
                      compact
                    />
                    <SelectField
                      label="GPS"
                      name="gpsChecklist"
                      value={formData.gpsChecklist}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      options={[
                        { value: "PASS", label: "PASS" },
                        { value: "FAIL", label: "FAIL" },
                      ]}
                      compact
                    />
                    <SelectField
                      label="Power"
                      name="mainPowerChecklist"
                      value={formData.mainPowerChecklist}
                      onChange={handleChange}
                      disabled={mode === "view"}
                      options={[
                        { value: "PASS", label: "PASS" },
                        { value: "FAIL", label: "FAIL" },
                      ]}
                      compact
                    />
                  </div>

                  <SelectField
                    label="Battery Backup"
                    name="batteryBackupStatus"
                    value={formData.batteryBackupStatus}
                    onChange={handleChange}
                    disabled={mode === "view"}
                    options={[
                      { value: "OK", label: "OK" },
                      { value: "NOT_OK", label: "Not OK" },
                    ]}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="xconicsValidation"
                      name="xconicsValidation"
                      checked={formData.xconicsValidation}
                      onChange={handleChange}
                      disabled={mode === "view"}
                    />
                    <label htmlFor="xconicsValidation" style={{ margin: 0, cursor: mode === "view" ? "default" : "pointer" }}>
                      Xconics Validation
                    </label>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              <div style={{ gridColumn: "1 / -1" }}>
                <h4 style={{ margin: "0 0 1rem 0", color: "#333" }}>Remarks</h4>
                <InputField
                  label="Remarks"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  disabled={mode === "view"}
                  as="textarea"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {mode !== "view" && (
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
                {submitting ? "Saving..." : (mode === "create" ? "Create Ticket" : "Update Ticket")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

// Reusable Input Components
function InputField({ label, name, value, onChange, disabled, error, type = "text", as = "input", required, rows, compact }) {
  const isTextarea = as === "textarea";
  const id = `input-${name}`;

  return (
    <div style={{ marginBottom: compact ? "0.5rem" : "1rem" }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
        {label} {required && <span style={{ color: "#c62828" }}>*</span>}
      </label>
      {isTextarea ? (
        <textarea
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          rows={rows || 3}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: error ? "1px solid #c62828" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
            resize: "vertical",
            backgroundColor: disabled ? "#f5f5f5" : "white",
          }}
        />
      ) : (
        <input
          id={id}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "0.75rem",
            border: error ? "1px solid #c62828" : "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
            backgroundColor: disabled ? "#f5f5f5" : "white",
          }}
        />
      )}
      {error && (
        <span style={{ color: "#c62828", fontSize: "0.85rem", marginTop: "0.25rem", display: "block" }}>
          {error}
        </span>
      )}
    </div>
  );
}

function SelectField({ label, name, value, onChange, disabled, options, compact }) {
  const id = `select-${name}`;

  return (
    <div style={{ marginBottom: compact ? "0.5rem" : "1rem" }}>
      <label htmlFor={id} style={{ display: "block", marginBottom: "0.25rem", fontWeight: "500", fontSize: compact ? "0.85rem" : "0.95rem" }}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          width: "100%",
          padding: compact ? "0.5rem" : "0.75rem",
          border: "1px solid #ccc",
          borderRadius: "4px",
          fontSize: "0.95rem",
          backgroundColor: disabled ? "#f5f5f5" : "white",
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
