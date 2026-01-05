import { useState, useEffect } from "react";
import { MapPin, Clock, Signal, X, ExternalLink } from "lucide-react";
import { getInstallationRequisitions } from "../api/installationRequisitionApi";
import "./VehicleTracking.css";

// Dummy West Bengal locations for testing
const DUMMY_WB_LOCATIONS = [
  { name: "Park Street, Kolkata", lat: 22.5532, lng: 88.3515 },
  { name: "Salt Lake, Kolkata", lat: 22.5698, lng: 88.4331 },
  { name: "Alipore, South 24 Parganas", lat: 22.5343, lng: 88.3301 },
  { name: "Barasat, North 24 Parganas", lat: 22.7210, lng: 88.4853 },
  { name: "Siliguri, Darjeeling", lat: 26.7271, lng: 88.3953 },
  { name: "Burdwan City Center", lat: 23.2419, lng: 87.8615 },
  { name: "Howrah Station Area", lat: 22.5820, lng: 88.3426 },
  { name: "Krishnanagar, Nadia", lat: 23.4058, lng: 88.4969 },
  { name: "Malda Town", lat: 25.0097, lng: 88.1433 },
  { name: "Asansol, Paschim Bardhaman", lat: 23.6839, lng: 86.9524 },
  { name: "Durgapur Steel City", lat: 23.5204, lng: 87.3119 },
  { name: "Rajarhat, Kolkata", lat: 22.6211, lng: 88.4372 },
  { name: "Kalyani, Nadia", lat: 22.9750, lng: 88.4344 },
  { name: "Serampore, Hooghly", lat: 22.7523, lng: 88.3408 },
  { name: "Kharagpur, Paschim Medinipur", lat: 22.3460, lng: 87.2320 },
  { name: "Bankura Town", lat: 23.2324, lng: 87.0694 },
  { name: "Jalpaiguri, Jalpaiguri", lat: 26.5167, lng: 88.7333 },
  { name: "Cooch Behar", lat: 26.3240, lng: 89.4450 },
  { name: "Midnapore Town", lat: 22.4240, lng: 87.3190 },
  { name: "Balurghat, Dakshin Dinajpur", lat: 25.2231, lng: 88.7631 },
];

export default function VehicleTracking() {
  const [trackingLogs, setTrackingLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const rowsPerPage = 10;

  // Fetch installation requisitions on mount
  useEffect(() => {
    fetchTrackingData();
  }, []);

  const fetchTrackingData = async () => {
    setLoading(true);
    try {
      const response = await getInstallationRequisitions({
        installationStatus: "COMPLETED",
      });

      if (response.success && response.data) {
        // Transform API data to tracking logs format
        const transformedLogs = response.data
          .filter((req) => req.vehicleNo) // Only records with vehicle numbers
          .map((req, index) => {
            // Use dummy West Bengal location if API doesn't provide coordinates
            const dummyLoc = DUMMY_WB_LOCATIONS[index % DUMMY_WB_LOCATIONS.length];
            const hasValidCoords = req.latitude && req.longitude && req.latitude !== 0 && req.longitude !== 0;
            
            return {
              id: req.id,
              vehicleNo: req.vehicleNo,
              location: req.installationAddress || dummyLoc.name,
              latitude: hasValidCoords ? req.latitude : dummyLoc.lat,
              longitude: hasValidCoords ? req.longitude : dummyLoc.lng,
              status: "STOPPED", // All records show STOPPED
              signalStrength: req.gsmSignalStrength || Math.floor(Math.random() * 5) + 1,
              ignition: "OFF", // All records show OFF
              timestamp: new Date(req.completedAt || req.updatedAt || req.createdAt),
              // Additional data for reference
              customerName: req.customerName,
              customerMobile: req.customerMobile,
              deviceType: req.deviceType,
              requisitionNo: req.requisitionNo,
              branchName: req.branch?.branchName,
              engineerName: req.installationRequisitionRequests?.[0]?.assignedEngineer?.engineerName,
            };
          });

        setTrackingLogs(transformedLogs);
        setMaxPage(response.maxPage || Math.ceil(transformedLogs.length / rowsPerPage));
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV function
  const handleExportCSV = () => {
    if (trackingLogs.length === 0) {
      alert("No data to export");
      return;
    }

    // Define CSV headers
    const headers = [
      "S.No",
      "Vehicle Number",
      "Location",
      "Latitude",
      "Longitude",
      "Status",
      "Ignition",
      "Signal Strength",
      "Customer Name",
      "Customer Mobile",
      "Device Type",
      "Branch Name",
      "Engineer Name",
      "Last Updated",
    ];

    // Convert data to CSV rows
    const csvRows = trackingLogs.map((log, index) => [
      index + 1,
      log.vehicleNo,
      `"${log.location}"`, // Wrap in quotes to handle commas in location
      log.latitude,
      log.longitude,
      log.status,
      log.ignition,
      `${log.signalStrength}/5`,
      log.customerName || "N/A",
      log.customerMobile || "N/A",
      log.deviceType || "GPS",
      log.branchName || "N/A",
      log.engineerName || "N/A",
      log.timestamp.toLocaleString("en-IN"),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `vehicle_tracking_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter logs
  const filteredLogs = trackingLogs.filter((log) => {
    return log.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentLogs = filteredLogs.slice(startIndex, endIndex);

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((Date.now() - date) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Signal strength bars
  const SignalBars = ({ strength }) => {
    return (
      <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "16px" }}>
        {[1, 2, 3, 4, 5].map((bar) => (
          <div
            key={bar}
            style={{
              width: "3px",
              height: `${bar * 3}px`,
              backgroundColor: strength >= bar ? "#2e7d32" : "#e0e0e0",
              borderRadius: "1px",
            }}
          />
        ))}
      </div>
    );
  };

  const handleViewMap = (log) => {
    setSelectedLog(log);
    setShowMapModal(true);
  };

  const closeModal = () => {
    setShowMapModal(false);
    setSelectedLog(null);
  };

  if (loading) {
    return (
      <div className="vehicle-tracking-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading tracking data...
        </div>
      </div>
    );
  }

  return (
    <div className="vehicle-tracking-page">
      {/* PAGE HEADER */}
      <div className="card page-header">
        <div>
          <h2>Vehicle Tracking Logs - West Bengal</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
            GPS tracking for completed device installations
          </p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{trackingLogs.length}</div>
            <div className="stat-label">Total Vehicles</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {trackingLogs.filter((l) => l.status === "STOPPED").length}
            </div>
            <div className="stat-label">Stopped</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {trackingLogs.filter((l) => l.ignition === "OFF").length}
            </div>
            <div className="stat-label">Ignition Off</div>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="card filters">
        <input
          type="text"
          placeholder="Search by vehicle number..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            flex: 1,
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
          }}
        />
        <button
          onClick={fetchTrackingData}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#2e7d32",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          Refresh Data
        </button>
        <button
          onClick={handleExportCSV}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
          }}
        >
          Export CSV
        </button>
      </div>

      {/* TABLE */}
      <div className="card">
        <div style={{ overflowX: "auto" }}>
          <table className="tracking-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Vehicle Number</th>
                <th>Location</th>
                <th>Status</th>
                <th>Ignition</th>
                <th>Signal</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "2rem" }}>
                    No tracking logs found
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, index) => {
                  return (
                    <tr key={log.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <span
                          style={{
                            fontFamily: "monospace",
                            fontWeight: "500",
                            fontSize: "0.9rem",
                          }}
                        >
                          {log.vehicleNo}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <MapPin size={14} color="#666" />
                          <span
                            style={{
                              maxWidth: "250px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={log.location}
                          >
                            {log.location}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "12px",
                            fontSize: "0.85rem",
                            fontWeight: "500",
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                            display: "inline-block",
                          }}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            fontWeight: "500",
                            backgroundColor: "#ffebee",
                            color: "#c62828",
                          }}
                        >
                          {log.ignition}
                        </span>
                      </td>
                      <td>
                        <SignalBars strength={log.signalStrength} />
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Clock size={14} color="#666" />
                          <span style={{ fontSize: "0.85rem", color: "#666" }}>
                            {formatTimeAgo(log.timestamp)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewMap(log)}
                          className="map-icon-btn"
                          title="View on Map"
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0.5rem",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f5f5f5";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          <MapPin size={18} color="#000" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Previous
            </button>

            <div className="page-numbers">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      className={currentPage === pageNum ? "active" : ""}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return <span key={pageNum}>...</span>;
                }
                return null;
              })}
            </div>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* MAP MODAL */}
      {showMapModal && selectedLog && (
        <LocationMapModal log={selectedLog} onClose={closeModal} />
      )}
    </div>
  );
}

// Location Map Modal Component
function LocationMapModal({ log, onClose }) {
  const fallbackMapUrl = `https://maps.google.com/maps?q=${log.latitude},${log.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "1rem",
        }}
      >
        {/* Modal Content */}
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            maxWidth: "1000px",
            width: "100%",
            maxHeight: "90vh",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: "1.5rem",
              borderBottom: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ fontFamily: "monospace" }}>{log.vehicleNo}</span>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: "500",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                  }}
                >
                  {log.status}
                </span>
              </h3>
              <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                <MapPin size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
                {log.location}
              </p>
            </div>
            <button
              onClick={onClose}
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
              <X size={24} color="#000" />
            </button>
          </div>

          {/* Vehicle Telemetry Info */}
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "#f9f9f9",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Ignition
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                <span
                  style={{
                    padding: "0.25rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    backgroundColor: "#ffebee",
                    color: "#c62828",
                  }}
                >
                  {log.ignition}
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Customer
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                {log.customerName || "N/A"}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Device Type
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                {log.deviceType || "GPS"}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Coordinates
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontFamily: "monospace", fontSize: "0.85rem" }}>
                {log.latitude.toFixed(4)}, {log.longitude.toFixed(4)}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Last Update
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                <Clock size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
                {log.timestamp.toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Map */}
          <div style={{ position: "relative", height: "500px" }}>
            <iframe
              title={`Map for ${log.vehicleNo}`}
              src={fallbackMapUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Modal Footer */}
          <div
            style={{
              padding: "1rem 1.5rem",
              borderTop: "1px solid #e0e0e0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <div style={{ fontSize: "0.85rem", color: "#666" }}>
              <Signal size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
              Signal Strength: {log.signalStrength}/5 bars
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                onClick={onClose}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#f5f5f5",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`,
                    "_blank"
                  )
                }
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor: "#1976d2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                Open in Google Maps
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
