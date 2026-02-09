/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { MapPin, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import "./VehicleAlertPage.css";
import { deleteVehicleAlert, getVehicleAlertBySln, getVehicleAlerts } from "../api/alertApis";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;

export default function VehicleAlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const itemsPerPage = 10;

  // Debounce timer ref
  const searchTimerRef = useRef(null);

  // Initialize search from URL params
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [currentPage]);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    // Update URL params
    if (searchTerm) {
      setSearchParams({ search: searchTerm });
    } else {
      setSearchParams({});
    }

    // Set new timer for debounced search
    searchTimerRef.current = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchAlerts();
      }
    }, 500); // 500ms debounce delay

    // Cleanup function
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchTerm]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const response = await getVehicleAlerts({
        search: searchTerm,
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage,
      });
      if (response.success) {
        setAlerts(response.data);
        setMaxPage(response.maxPage || Math.ceil(response.totalCount / itemsPerPage) || 0);
      } else {
        setAlerts([]);
        setMaxPage(0);
      }
    } catch (error) {
      console.error("Fetch alerts error:", error);
      setAlerts([]);
      setMaxPage(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (sln) => {
    setLoading(true);
    try {
      const response = await getVehicleAlertBySln(sln);
      if (response.success) {
        setSelectedAlert(response.data);
        setViewMode("detail");
      }
    } catch (error) {
      alert("Error fetching alert details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAlert = async (sln) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    setLoading(true);
    try {
      const response = await deleteVehicleAlert(sln);
      if (response.success) {
        alert(response.message);
        fetchAlerts();
      }
    } catch (error) {
      alert("Error deleting alert");
    } finally {
      setLoading(false);
    }
  };

  const handleLocationClick = (alert) => {
    setSelectedLocation({
      lat: parseFloat(alert.latitude),
      lng: parseFloat(alert.longitude),
      vehicleNo: alert.vehicleNo === "Unknown" ? "N/A" : alert.vehicleNo,
      time: alert.time_stamp_server,
      imei: alert.imei
    });
    setShowLocationModal(true);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedAlert(null);
  };

  const getPowerBadge = (mainPower) => {
    const isOn = mainPower === true || mainPower === "ON" || mainPower === "on";
    return {
      bg: isOn ? "#d4edda" : "#f8d7da",
      color: isOn ? "#155724" : "#721c24",
      label: isOn ? "ON" : "OFF"
    };
  };

  const getTamperBadge = (tamper) => {
    const isTampered = tamper === true || tamper === "YES" || tamper === "yes";
    return {
      bg: isTampered ? "#f8d7da" : "#d4edda",
      color: isTampered ? "#721c24" : "#155724",
      label: isTampered ? "YES" : "NO"
    };
  };

  const goToPage = (page) => {
    if (page >= 1 && page <= maxPage) {
      setCurrentPage(page);
    }
  };

  const getPaginationRange = () => {
    const delta = 2;
    const range = [];
    
    range.push(1);
    
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(maxPage - 1, currentPage + delta);
    
    for (let i = left; i <= right; i++) {
      if (range.indexOf(i) === -1) {
        range.push(i);
      }
    }
    
    if (currentPage - delta > 2) {
      range.splice(1, 0, '…');
    }
    
    if (maxPage - currentPage > delta + 1) {
      range.splice(-1, 0, '…');
    }
    
    if (maxPage !== 1 && range[range.length - 1] !== maxPage) {
      range.push(maxPage);
    }
    
    return range;
  };

  if (loading && viewMode === "list") {
    return (
      <div className="alerts-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          <div className="spinner"></div>
          <p style={{ marginTop: "1rem", color: "#64748b" }}>Loading alerts...</p>
        </div>
      </div>
    );
  }

  if (viewMode === "detail" && selectedAlert) {
    return <AlertDetailView alert={selectedAlert} onBack={handleBackToList} />;
  }

  return (
    <div className="alerts-page">
      <div className="card page-header">
        <h2>Vehicle Alerts</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
          Monitor real-time vehicle alerts and notifications
        </p>
      </div>

      <div className="card toolbar">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search by IMEI, vehicle number, or timestamp..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {loading && searchTerm && (
            <div className="search-loading-indicator">
              <div className="mini-spinner"></div>
            </div>
          )}
        </div>
        <button onClick={fetchAlerts} className="refresh-btn" disabled={loading}>
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            className={loading ? "spinning" : ""}
          >
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Refresh
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="alerts-table">
            <thead>
              <tr>
                <th>Serial No</th>
                <th>Vehicle No</th>
                <th>IMEI</th>
                <th>Main Power</th>
                <th>Tamper</th>
                <th>Timestamp</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="no-data">
                    {loading ? (
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                        <div className="spinner"></div>
                        <span>Loading alerts...</span>
                      </div>
                    ) : (
                      <>
                        <svg 
                          width="48" 
                          height="48" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          style={{ margin: "0 auto 1rem", opacity: 0.3 }}
                        >
                          <circle cx="11" cy="11" r="8"></circle>
                          <path d="m21 21-4.35-4.35"></path>
                        </svg>
                        <div>No alerts found</div>
                        {searchTerm && (
                          <div style={{ fontSize: "0.85rem", marginTop: "0.5rem", color: "#9ca3af" }}>
                            Try adjusting your search terms
                          </div>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                alerts.map((alert, index) => {
                  const powerStyle = getPowerBadge(alert.main_power);
                  const tamperStyle = getTamperBadge(alert.tamper);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  return (
                    <tr key={alert.sln}>
                      <td>{rowNumber}</td>
                      <td>{alert.vehicleNo === "Unknown" ? "N/A" : alert.vehicleNo}</td>
                      <td>{alert.imei}</td>
                      <td>
                        <span className="status-badge" style={{
                          backgroundColor: powerStyle.bg,
                          color: powerStyle.color,
                        }}>
                          {powerStyle.label}
                        </span>
                      </td>
                      <td>
                        <span className="status-badge" style={{
                          backgroundColor: tamperStyle.bg,
                          color: tamperStyle.color,
                        }}>
                          {tamperStyle.label}
                        </span>
                      </td>
                      <td>{new Date(alert.time_stamp_server).toLocaleString("en-IN")}</td>
                      <td>
                        <button onClick={() => handleLocationClick(alert)} className="action-btn location-btn">
                          <MapPin size={14} /> Location
                        </button>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleViewDetails(alert.sln)} 
                            className="action-btn view-btn"
                          >
                            View
                          </button>
                          <button 
                            onClick={() => handleDeleteAlert(alert.sln)} 
                            className="action-btn delete-btn"
                          >
                            <Trash2 size={14} />
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

        {maxPage > 1 && (
          <div className="pagination-section">
            <div className="pagination-info">
              Page <strong>{currentPage}</strong> of <strong>{maxPage}</strong> • Showing {alerts.length} alerts
            </div>
            <div className="pagination-controls">
              <button 
                className="pagination-btn first-page"
                onClick={() => goToPage(1)}
                disabled={currentPage === 1}
                title="First Page"
              >
                <ChevronsLeft size={18} />
              </button>
              <button 
                className="pagination-btn prev-page"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                title="Previous Page"
              >
                <ChevronLeft size={18} />
              </button>
              
              <div className="page-numbers-container">
                {getPaginationRange().map((pageNum, index) => (
                  pageNum === '…' ? (
                    <span key={`ellipsis-${index}`} className="ellipsis">…</span>
                  ) : (
                    <button
                      key={pageNum}
                      className={`page-number-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                      title={`Go to page ${pageNum}`}
                    >
                      {pageNum}
                    </button>
                  )
                ))}
              </div>
              
              <button 
                className="pagination-btn next-page"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === maxPage}
                title="Next Page"
              >
                <ChevronRight size={18} />
              </button>
              <button 
                className="pagination-btn last-page"
                onClick={() => goToPage(maxPage)}
                disabled={currentPage === maxPage}
                title="Last Page"
              >
                <ChevronsRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {showLocationModal && selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setShowLocationModal(false)}
          apiKey={GOOGLE_MAPS_API_KEY}
          mapId={GOOGLE_MAPS_ID}
        />
      )}
    </div>
  );
}

function LocationModal({ location, onClose, apiKey, mapId }) {
  const [mapInstance, setMapInstance] = useState(null);

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="location-modal-header">
          <div>
            <h3>Alert Location</h3>
            <p className="location-subtitle">Vehicle tracking position</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="location-map-container">
          <APIProvider apiKey={apiKey}>
            <Map
              mapId={mapId}
              defaultCenter={{ lat: location.lat, lng: location.lng }}
              defaultZoom={18}
              gestureHandling="greedy"
              disableDefaultUI={false}
              zoomControl={true}
              mapTypeControl={true}
              streetViewControl={true}
              fullscreenControl={true}
              style={{ width: "100%", height: "100%" }}
              onLoad={(map) => setMapInstance(map)}
            >
              <AdvancedMarker position={{ lat: location.lat, lng: location.lng }}>
                <Pin 
                  background={"#ef4444"} 
                  glyphColor={"#ffffff"} 
                  borderColor={"#991b1b"} 
                  scale={1.8} 
                />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        </div>

        <div className="location-info">
          <div className="info-grid">
            <div className="info-item">
              <div className="info-label">Vehicle Number</div>
              <div className="info-value">{location.vehicleNo}</div>
            </div>
            <div className="info-item">
              <div className="info-label">IMEI</div>
              <div className="info-value info-value-mono">{location.imei}</div>
            </div>
            <div className="info-item">
              <div className="info-label">Timestamp</div>
              <div className="info-value">{new Date(location.time).toLocaleString("en-IN")}</div>
            </div>
            <div className="info-item full-width">
              <div className="info-label">GPS Coordinates</div>
              <div className="info-value coords">
                <span className="coord-label">Lat:</span> {location.lat.toFixed(6)}
                <span className="coord-separator">•</span>
                <span className="coord-label">Lng:</span> {location.lng.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertDetailView({ alert, onBack }) {
  return (
    <div className="alerts-page">
      <div className="card page-header">
        <button onClick={onBack} className="back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Back to List
        </button>
        <h2>Alert Details</h2>
      </div>
      <div className="card">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
          <InfoField label="Vehicle No" value={alert.vehicleNo || "N/A"} />
          <InfoField label="IMEI" value={alert.imei} mono />
          <InfoField label="Alert Type" value={alert.packet_type} />
          <InfoField label="Main Power" value={alert.main_power ? "ON" : "OFF"} />
          <InfoField label="Tamper" value={alert.tamper ? "YES" : "NO"} />
          <InfoField label="Timestamp" value={new Date(alert.time_stamp_server).toLocaleString("en-IN")} fullWidth />
          <InfoField label="Latitude" value={alert.latitude} mono fullWidth />
          <InfoField label="Longitude" value={alert.longitude} mono fullWidth />
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono = false, fullWidth = false }) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: "500", fontSize: "0.95rem", fontFamily: mono ? "monospace" : "inherit" }}>
        {value || "N/A"}
      </p>
    </div>
  );
}
