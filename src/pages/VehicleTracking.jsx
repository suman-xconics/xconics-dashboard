import { useState } from "react";
import { MapPin, Navigation, Clock, Signal, X, ExternalLink } from "lucide-react";
import "./VehicleTracking.css";

// Generate realistic tracking logs
const generateTrackingLogs = () => {
  const vehicles = [
    "WB-01-AB-1234", // Kolkata
    "WB-20-CD-5678", // Alipore
    "WB-26-EF-9012", // Barasat
    "WB-74-GH-3456", // Siliguri
    "WB-42-IJ-7890", // Burdwan
    "WB-12-KL-2345", // Howrah
    "WB-52-MN-6789", // Nadia
    "WB-66-OP-0123", // Malda
    "WB-38-QR-4567", // Asansol
    "WB-34-ST-8901", // Midnapur
  ];

  const locations = [
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
  ];

  const statuses = ["Moving", "Stopped", "Idle", "Parked"];
  const speeds = [0, 15, 25, 35, 45, 55, 60, 0, 0, 20];

  const logs = [];
  const now = Date.now();

  for (let i = 0; i < 50; i++) {
    const vehicleIndex = i % vehicles.length;
    const locationIndex = i % locations.length;
    const status = speeds[i % speeds.length] === 0 ? "Stopped" : speeds[i % speeds.length] < 10 ? "Idle" : "Moving";
    
    logs.push({
      id: i + 1,
      vehicleNo: vehicles[vehicleIndex],
      location: locations[locationIndex].name,
      latitude: (locations[locationIndex].lat + (Math.random() - 0.5) * 0.01).toFixed(6),
      longitude: (locations[locationIndex].lng + (Math.random() - 0.5) * 0.01).toFixed(6),
      speed: speeds[i % speeds.length],
      status: status,
      signalStrength: Math.floor(Math.random() * 5) + 1,
      ignition: speeds[i % speeds.length] > 0 ? "ON" : "OFF",
      batteryVoltage: (12 + Math.random() * 2).toFixed(1),
      timestamp: new Date(now - i * 5 * 60 * 1000),
    });
  }

  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

export default function VehicleTracking() {
  const [trackingLogs] = useState(generateTrackingLogs());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const rowsPerPage = 10;

  // Filter logs
  const filteredLogs = trackingLogs.filter((log) => {
    const matchesSearch = log.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
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

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      Moving: { bg: "#e8f5e9", color: "#2e7d32" },
      Stopped: { bg: "#ffebee", color: "#c62828" },
      Idle: { bg: "#fff3e0", color: "#f57c00" },
      Parked: { bg: "#e3f2fd", color: "#1976d2" },
    };
    return styles[status] || { bg: "#f5f5f5", color: "#666" };
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

  return (
    <div className="vehicle-tracking-page">
      {/* PAGE HEADER */}
      <div className="card page-header">
        <div>
          <h2>Vehicle Tracking Logs - West Bengal</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
            Real-time GPS tracking history and vehicle telemetry
          </p>
        </div>
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-value">{trackingLogs.length}</div>
            <div className="stat-label">Total Logs</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {trackingLogs.filter((l) => l.status === "Moving").length}
            </div>
            <div className="stat-label">Moving</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {new Set(trackingLogs.map((l) => l.vehicleNo)).size}
            </div>
            <div className="stat-label">Vehicles</div>
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
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={{
            padding: "0.75rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "0.95rem",
            minWidth: "150px",
          }}
        >
          <option value="">All Status</option>
          <option value="Moving">Moving</option>
          <option value="Stopped">Stopped</option>
          <option value="Idle">Idle</option>
          <option value="Parked">Parked</option>
        </select>
        <button
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
                <th>Coordinates</th>
                <th>Speed</th>
                <th>Status</th>
                <th>Ignition</th>
                <th>Signal</th>
                <th>Battery</th>
                <th>Last Updated</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {currentLogs.length === 0 ? (
                <tr>
                  <td colSpan="11" style={{ textAlign: "center", padding: "2rem" }}>
                    No tracking logs found
                  </td>
                </tr>
              ) : (
                currentLogs.map((log, index) => {
                  const statusStyle = getStatusBadge(log.status);
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
                              maxWidth: "200px",
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
                            fontFamily: "monospace",
                            fontSize: "0.85rem",
                            color: "#666",
                          }}
                        >
                          {log.latitude}, {log.longitude}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Navigation size={14} color="#666" />
                          <span style={{ fontWeight: "500" }}>
                            {log.speed} km/h
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
                            backgroundColor: statusStyle.bg,
                            color: statusStyle.color,
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
                            backgroundColor:
                              log.ignition === "ON" ? "#e8f5e9" : "#ffebee",
                            color: log.ignition === "ON" ? "#2e7d32" : "#c62828",
                          }}
                        >
                          {log.ignition}
                        </span>
                      </td>
                      <td>
                        <SignalBars strength={log.signalStrength} />
                      </td>
                      <td>
                        <span style={{ fontSize: "0.85rem", color: "#666" }}>
                          {log.batteryVoltage}V
                        </span>
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
  const statusStyle = {
    Moving: { bg: "#e8f5e9", color: "#2e7d32" },
    Stopped: { bg: "#ffebee", color: "#c62828" },
    Idle: { bg: "#fff3e0", color: "#f57c00" },
    Parked: { bg: "#e3f2fd", color: "#1976d2" },
  }[log.status] || { bg: "#f5f5f5", color: "#666" };

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
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
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
                Speed
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                <Navigation size={14} style={{ display: "inline", marginRight: "0.25rem" }} />
                {log.speed} km/h
              </p>
            </div>
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
                    backgroundColor: log.ignition === "ON" ? "#e8f5e9" : "#ffebee",
                    color: log.ignition === "ON" ? "#2e7d32" : "#c62828",
                  }}
                >
                  {log.ignition}
                </span>
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Battery
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontSize: "0.95rem" }}>
                {log.batteryVoltage}V
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#666", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Coordinates
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontFamily: "monospace", fontSize: "0.85rem" }}>
                {log.latitude}, {log.longitude}
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
