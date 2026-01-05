import { useState, useEffect } from "react";
import { MapPin, X } from "lucide-react";
import { getInstallationRequisitions } from "../api/installationRequisitionApi";
import "./TrackerPage.css";

// Dummy West Bengal locations for fallback
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
];

export default function TrackerPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch vehicles on mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await getInstallationRequisitions({
        installationStatus: "COMPLETED",
      });

      if (response.success && response.data) {
        // Transform API data to vehicle format
        const transformedVehicles = response.data
          .filter((req) => req.vehicleNo) // Only records with vehicle numbers
          .map((req, index) => {
            const dummyLoc = DUMMY_WB_LOCATIONS[index % DUMMY_WB_LOCATIONS.length];
            const hasValidCoords = req.latitude && req.longitude && req.latitude !== 0 && req.longitude !== 0;
            
            return {
              id: req.id,
              vehicleNo: req.vehicleNo,
              status: "STOPPED", // All completed installations are stopped
              location: {
                city: req.installationAddress || dummyLoc.name,
                lat: hasValidCoords ? req.latitude : dummyLoc.lat,
                lng: hasValidCoords ? req.longitude : dummyLoc.lng,
              },
              lastUpdate: new Date(req.completedAt || req.updatedAt || req.createdAt).toLocaleString('en-IN'),
            };
          });

        setVehicles(transformedVehicles);
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) =>
    v.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewMap = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedVehicle(null);
  };

  const getStatusBadge = (status) => {
    const colors = {
      Moving: { bg: "#e8f5e9", color: "#2e7d32" },
      Stopped: { bg: "#ffebee", color: "#c62828" },
      Idle: { bg: "#fff3e0", color: "#f57c00" },
    };
    const style = colors[status] || { bg: "#f5f5f5", color: "#666" };
    return style;
  };

  if (loading) {
    return (
      <div className="tracker-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading vehicles...
        </div>
      </div>
    );
  }

  return (
    <div className="tracker-page">
      {/* PAGE HEADER */}
      <div className="card page-header">
        <h2>Vehicle List - West Bengal</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
          All vehicles with completed installations
        </p>
      </div>

      {/* TOOLBAR */}
      <div className="card toolbar">
        <input
          type="text"
          placeholder="Search by vehicle number..."
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
                <th>Vehicle Number</th>
                <th>Status</th>
                <th>Location</th>
                <th>Last Update</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredVehicles.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                    No vehicles found
                  </td>
                </tr>
              ) : (
                filteredVehicles.map((vehicle, index) => {
                  const statusStyle = getStatusBadge(vehicle.status);
                  return (
                    <tr key={vehicle.id}>
                      <td>{index + 1}</td>
                      <td>
                        <span style={{ fontFamily: "monospace", fontWeight: "500" }}>
                          {vehicle.vehicleNo}
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
                          {vehicle.status}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            maxWidth: "300px",
                            display: "inline-block",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={vehicle.location.city}
                        >
                          {vehicle.location.city}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "#666" }}>
                        {vehicle.lastUpdate}
                      </td>
                      <td>
                        <button
                          onClick={() => handleViewMap(vehicle)}
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
                          <MapPin size={20} color="#000" strokeWidth={2} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      {showModal && selectedVehicle && (
        <MapModal vehicle={selectedVehicle} onClose={closeModal} />
      )}
    </div>
  );
}

// Map Modal Component
function MapModal({ vehicle, onClose }) {
  const fallbackMapUrl = `https://maps.google.com/maps?q=${vehicle.location.lat},${vehicle.location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

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
            maxWidth: "900px",
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
              <h3 style={{ margin: 0, fontSize: "1.25rem" }}>
                {vehicle.vehicleNo}
              </h3>
              <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
                {vehicle.location.city} • {vehicle.status}
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

          {/* Vehicle Info */}
          <div
            style={{
              padding: "1rem 1.5rem",
              backgroundColor: "#f9f9f9",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                Coordinates
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500", fontFamily: "monospace" }}>
                {vehicle.location.lat.toFixed(4)}, {vehicle.location.lng.toFixed(4)}
              </p>
            </div>
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
                Last Update
              </p>
              <p style={{ margin: "0.25rem 0 0 0", fontWeight: "500" }}>
                {vehicle.lastUpdate}
              </p>
            </div>
          </div>

          {/* Map */}
          <div style={{ position: "relative", height: "500px" }}>
            <iframe
              title={`Map for ${vehicle.vehicleNo}`}
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
              justifyContent: "flex-end",
              gap: "0.5rem",
            }}
          >
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
                  `https://www.google.com/maps/search/?api=1&query=${vehicle.location.lat},${vehicle.location.lng}`,
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
              }}
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
