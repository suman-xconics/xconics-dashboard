/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { MapPin, AlertCircle, Eye, ArrowLeft } from "lucide-react";
import { getVehicles, getVehicleByVehicleNo } from "../api/vehicleApi";
import "./VehicleList.css";

export default function TrackerPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" or "detail"
  const itemsPerPage = 10;

  // Fetch vehicles on mount and when page/search changes
  useEffect(() => {
    fetchVehicles();
  }, [currentPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchVehicles();
    }
  }, [searchTerm]);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getVehicles({
        search: searchTerm,
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });

      if (response.success && response.data) {
        setVehicles(response.data);
        setMaxPage(response.maxPage);
      } else {
        console.error("Failed to fetch vehicles:", response.error);
        setVehicles([]);
        setMaxPage(0);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
      setMaxPage(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (vehicleNo) => {
    setLoading(true);
    try {
      const response = await getVehicleByVehicleNo(vehicleNo);
      
      if (response.success && response.data) {
        setSelectedVehicle(response.data);
        setViewMode("detail");
      } else {
        alert("Failed to fetch vehicle details: " + response.error);
      }
    } catch (error) {
      console.error("Error fetching vehicle details:", error);
      alert("Error fetching vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClick = (vehicle) => {
    // TODO: Implement alert functionality
    console.log("Alert clicked for:", vehicle.vehicleNo);
    alert(`Alert functionality for ${vehicle.vehicleNo} - Coming soon!`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVehicle(null);
  };

const getStatusBadge = (status) => {
  const colors = {
    NEW: { bg: "#e3f2fd", color: "#1565c0" },
    PENDING: { bg: "#fff3e0", color: "#e65100" },
    ASSIGNED: { bg: "#f3e5f5", color: "#6a1b9a" },
    ACCEPTED: { bg: "#e1f5fe", color: "#0277bd" },
    IN_PROGRESS: { bg: "#fff9c4", color: "#f57f17" },
    COMPLETED: { bg: "#e8f5e9", color: "#2e7d32" },
    CANCELLED: { bg: "#ffebee", color: "#c62828" },
    ACTIVE: { bg: "#e8f5e9", color: "#2e7d32" },
    INACTIVE: { bg: "#ffebee", color: "#c62828" },
  };
  return colors[status] || { bg: "#f5f5f5", color: "#666" };
};


  if (loading && viewMode === "list") {
    return (
      <div className="tracker-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading vehicles...
        </div>
      </div>
    );
  }

  // Detail View
  if (viewMode === "detail" && selectedVehicle) {
    return <VehicleDetailView vehicle={selectedVehicle} onBack={handleBackToList} loading={loading} />;
  }

  // List View
  return (
    <div className="tracker-page">
      {/* PAGE HEADER */}
      <div className="card page-header">
        <h2>Vehicle Tracker</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
          Track and manage all vehicles
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="card toolbar">
        <input
          type="text"
          placeholder="Search by vehicle number, customer name, or mobile..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
          }}
        />
        <button
          onClick={fetchVehicles}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            marginLeft: "0.5rem",
          }}
        >
          Refresh
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="tracker-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle No</th>
                <th>Customer Name</th>
                <th>Customer Mobile</th>
                <th>Device IMEI</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                    No vehicles found
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => {
                  const statusStyle = getStatusBadge(vehicle.status);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  return (
                    <tr key={vehicle.id}>
                      <td>{rowNumber}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
                          {vehicle.vehicleNo}
                        </span>
                      </td>
                      <td>{vehicle.customerName}</td>
                      <td>
                        <span style={{ fontFamily: "monospace" }}>
                          {vehicle.customerMobile}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                          {vehicle.device?.imei || "N/A"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
                            display: "inline-block",
                          }}
                        >
                          {vehicle.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          {/* <button
                            onClick={() => handleViewDetails(vehicle.vehicleNo)}
                            className="action-btn"
                            title="View Details"
                            style={{
                              background: "none",
                              border: "1px solid #1976d2",
                              cursor: "pointer",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              color: "#1976d2",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#1976d2";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#1976d2";
                            }}
                          >
                            <Eye size={16} />
                            View
                          </button> */}
                          <button
                            onClick={() => handleAlertClick(vehicle)}
                            className="action-btn"
                            title="Alerts"
                            style={{
                              background: "none",
                              border: "1px solid #f57c00",
                              cursor: "pointer",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              color: "#f57c00",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#f57c00";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#f57c00";
                            }}
                          >
                            <AlertCircle size={16} />
                            Alerts
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {maxPage > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              padding: "1.5rem",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === 1 ? "#f5f5f5" : "#1976d2",
                color: currentPage === 1 ? "#999" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              Previous
            </button>
            
            <span style={{ fontSize: "0.95rem", color: "#666" }}>
              Page {currentPage} of {maxPage}
            </span>
            
            <button
              onClick={() => setCurrentPage((prev) => Math.min(maxPage, prev + 1))}
              disabled={currentPage === maxPage}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: currentPage === maxPage ? "#f5f5f5" : "#1976d2",
                color: currentPage === maxPage ? "#999" : "white",
                border: "none",
                borderRadius: "4px",
                cursor: currentPage === maxPage ? "not-allowed" : "pointer",
                fontSize: "0.9rem",
                fontWeight: "500",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Vehicle Detail View Component
function VehicleDetailView({ vehicle, onBack, loading }) {
  const getStatusBadge = (status) => {
    const colors = {
      NEW: { bg: "#e3f2fd", color: "#1565c0" },
      ASSIGNED: { bg: "#fff3e0", color: "#e65100" },
      IN_PROGRESS: { bg: "#fff9c4", color: "#f57f17" },
      COMPLETED: { bg: "#e8f5e9", color: "#2e7d32" },
      CANCELLED: { bg: "#ffebee", color: "#c62828" },
      ACTIVE: { bg: "#e8f5e9", color: "#2e7d32" },
      INACTIVE: { bg: "#ffebee", color: "#c62828" },
    };
    return colors[status] || { bg: "#f5f5f5", color: "#666" };
  };

  if (loading) {
    return (
      <div className="tracker-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading vehicle details...
        </div>
      </div>
    );
  }

  const statusStyle = getStatusBadge(vehicle.status);

  return (
    <div className="tracker-page">
      {/* HEADER WITH BACK BUTTON */}
      <div className="card page-header" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.5rem",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <ArrowLeft size={24} color="#000" />
        </button>
        <div>
          <h2 style={{ margin: 0 }}>Vehicle Details - {vehicle.vehicleNo}</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
            Complete vehicle information
          </p>
        </div>
      </div>

      {/* VEHICLE INFO */}
      <div className="card">
        <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
          Basic Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <InfoField label="Vehicle Number" value={vehicle.vehicleNo} mono />
          <InfoField label="Requisition No" value={vehicle.requisitionNo} mono />
          <InfoField label="Customer Name" value={vehicle.customerName} />
          <InfoField label="Customer Mobile" value={vehicle.customerMobile} mono />
          <InfoField label="Device Type" value={vehicle.deviceType} />
          <InfoField
            label="Status"
            value={
              <span
                style={{
                  padding: "0.35rem 1rem",
                  borderRadius: "12px",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                  display: "inline-block",
                }}
              >
                {vehicle.status.replace(/_/g, " ")}
              </span>
            }
          />
        </div>
      </div>

      {/* DEVICE INFO */}
      {vehicle.device && (
        <div className="card">
          <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
            Device Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <InfoField label="IMEI" value={vehicle.device.imei} mono />
            <InfoField label="QR Code" value={vehicle.device.qr} mono />
            <InfoField label="Location Type" value={vehicle.device.locationType?.replace(/_/g, " ")} />
            {vehicle.device.locationProductionFloor && (
              <InfoField label="Production Floor" value={vehicle.device.locationProductionFloor} />
            )}
          </div>
        </div>
      )}

      {/* LENDER INFO */}
      {vehicle.lender && (
        <div className="card">
          <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
            Lender Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <InfoField label="Lender Code" value={vehicle.lender.lenderCode} mono />
            <InfoField label="Lender Name" value={vehicle.lender.lenderName} />
            <InfoField label="Lender Type" value={vehicle.lender.lenderType} />
            <InfoField label="Contact Person" value={vehicle.lender.contactPersonName} />
            <InfoField label="Contact Mobile" value={vehicle.lender.contactMobile} mono />
            <InfoField label="Contact Email" value={vehicle.lender.contactEmail} />
            <InfoField label="State" value={vehicle.lender.state} />
            <InfoField label="Region" value={vehicle.lender.region} />
            <InfoField
              label="Status"
              value={
                <span
                  style={{
                    padding: "0.35rem 1rem",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    ...getStatusBadge(vehicle.lender.status),
                  }}
                >
                  {vehicle.lender.status}
                </span>
              }
            />
          </div>
        </div>
      )}

      {/* BRANCH INFO */}
      {vehicle.branch && (
        <div className="card">
          <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
            Branch Information
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <InfoField label="Branch Code" value={vehicle.branch.branchCode} mono />
            <InfoField label="Branch Name" value={vehicle.branch.branchName} />
            <InfoField label="Branch Type" value={vehicle.branch.branchType} />
            <InfoField label="Contact Person" value={vehicle.branch.contactPersonName} />
            <InfoField label="Contact Mobile" value={vehicle.branch.contactMobile} mono />
            <InfoField label="Address" value={vehicle.branch.address} fullWidth />
            <InfoField label="State" value={vehicle.branch.state} />
            <InfoField label="District" value={vehicle.branch.district} />
            <InfoField label="Pincode" value={vehicle.branch.pincode} mono />
          </div>
        </div>
      )}

      {/* AGGREGATOR INFO */}
      {vehicle.assignedAggregator && (
        <div className="card">
          <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
            Assigned Aggregator
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            <InfoField label="Aggregator Code" value={vehicle.assignedAggregator.aggregatorCode} mono />
            <InfoField label="Aggregator Name" value={vehicle.assignedAggregator.aggregatorName} />
            <InfoField label="Contact Person" value={vehicle.assignedAggregator.contactPersonName} />
            <InfoField label="Contact Mobile" value={vehicle.assignedAggregator.contactMobile} mono />
            <InfoField label="Service Type" value={vehicle.assignedAggregator.serviceType} />
            <InfoField label="TAT Hours" value={vehicle.assignedAggregator.tatHours} />
            <InfoField label="State" value={vehicle.assignedAggregator.state} />
            <InfoField label="District" value={vehicle.assignedAggregator.district} />
          </div>
        </div>
      )}

      {/* TIMESTAMPS */}
      <div className="card">
        <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
          Timeline
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1.5rem",
          }}
        >
          <InfoField label="Created At" value={new Date(vehicle.createdAt).toLocaleString("en-IN")} />
          <InfoField label="Updated At" value={new Date(vehicle.updatedAt).toLocaleString("en-IN")} />
        </div>
      </div>
    </div>
  );
}

// Info Field Component
function InfoField({ label, value, mono = false, fullWidth = false }) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>{label}</p>
      <p
        style={{
          margin: 0,
          fontWeight: "500",
          fontSize: "0.95rem",
          fontFamily: mono ? "monospace" : "inherit",
          wordBreak: "break-word",
        }}
      >
        {value || "N/A"}
      </p>
    </div>
  );
}
