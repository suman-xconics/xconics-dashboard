/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { MapPin, AlertCircle, ArrowLeft, Navigation, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import { getVehicles, getVehicleByVehicleNo } from "../api/vehicleApi";
import "./VehicleList.css";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { getVehicleDataPackets } from "../api/dataPacketApis";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;

// ✅ Power Markers Component - Shows all individual points with power status
function PowerMarkers({ trackingData }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trackingData) return null;

  return (
    <>
      {trackingData.map((data, idx) => {
        if (!data.latitude || !data.longitude) return null;
        
        return (
          <AdvancedMarker
            key={idx}
            position={{ lat: data.latitude, lng: data.longitude }}
          >
            <div
              style={{
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Power Status Marker */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: data.main_power ? "#4caf50" : "#f44336",
                  border: "3px solid white",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  transition: "transform 0.2s",
                  transform: hoveredPoint === idx ? "scale(1.4)" : "scale(1)"
                }}
              />
              
              {/* Tooltip on Hover */}
              {hoveredPoint === idx && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '28px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    minWidth: '240px',
                    border: '2px solid ' + (data.main_power ? '#4caf50' : '#f44336')
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '700', color: data.main_power ? '#4caf50' : '#f44336', marginBottom: '10px', textAlign: 'center' }}>
                    {data.main_power ? '🟢 POWER ON' : '🔴 POWER OFF'} - Point #{idx + 1}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Latitude:</strong> {data.latitude.toFixed(6)}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Longitude:</strong> {data.longitude.toFixed(6)}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Speed:</strong> {data.speed !== undefined ? `${data.speed} km/h` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Main Power:</strong> <span style={{ color: data.main_power ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                      {data.main_power ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    {data.time_stamp_server ? new Date(data.time_stamp_server).toLocaleString() : 'N/A'}
                  </div>
                  {/* Arrow pointing down */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'white',
                      border: '2px solid ' + (data.main_power ? '#4caf50' : '#f44336'),
                      borderTop: 'none',
                      borderLeft: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

// ✅ Route Path Component - Shows continuous path with start/end markers
function PathWithMarkers({ trackingData }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!trackingData) return null;

  const validPoints = trackingData.filter(d => d.latitude && d.longitude);

  return (
    <>
      {/* Polyline Route */}
      <PolylineRoute points={validPoints} />
      
      {/* Only show START and END markers */}
      {validPoints.map((data, idx) => {
        const isFirst = idx === 0;
        const isLast = idx === validPoints.length - 1;
        
        // Only render first and last points
        if (!isFirst && !isLast) return null;
        
        return (
          <AdvancedMarker
            key={idx}
            position={{ lat: data.latitude, lng: data.longitude }}
          >
            <div
              style={{
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseEnter={() => setHoveredPoint(idx)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              {/* Marker Pin - Teardrop style like in image */}
              <div
                style={{
                  width: '32px',
                  height: '42px',
                  position: 'relative',
                  filter: hoveredPoint === idx ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                  transform: hoveredPoint === idx ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z"
                    fill={isFirst ? '#4CAF50' : '#F44336'}
                  />
                  <circle cx="16" cy="16" r="6" fill="white" />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: isFirst ? '#4CAF50' : '#F44336'
                  }}
                >
                  {isFirst ? 'S' : 'E'}
                </div>
              </div>
              
              {/* Tooltip on Hover */}
              {hoveredPoint === idx && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: '50px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'white',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    whiteSpace: 'nowrap',
                    zIndex: 1000,
                    minWidth: '240px',
                    border: '2px solid ' + (isFirst ? '#4CAF50' : '#F44336')
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: '700', color: isFirst ? '#4CAF50' : '#F44336', marginBottom: '10px', textAlign: 'center' }}>
                    {isFirst ? '🟢 START POINT' : '🔴 END POINT'}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Location:</strong> {data.latitude.toFixed(6)}, {data.longitude.toFixed(6)}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Speed:</strong> {data.speed !== undefined ? `${data.speed} km/h` : 'N/A'}
                  </div>
                  <div style={{ fontSize: '12px', marginBottom: '6px', color: '#333' }}>
                    <strong>Power:</strong> <span style={{ color: data.main_power ? '#4CAF50' : '#F44336', fontWeight: '600' }}>
                      {data.main_power ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #eee' }}>
                    {data.time_stamp_server ? new Date(data.time_stamp_server).toLocaleString() : 'N/A'}
                  </div>
                  {/* Arrow pointing down */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '14px',
                      height: '14px',
                      backgroundColor: 'white',
                      border: '2px solid ' + (isFirst ? '#4CAF50' : '#F44336'),
                      borderTop: 'none',
                      borderLeft: 'none'
                    }}
                  />
                </div>
              )}
            </div>
          </AdvancedMarker>
        );
      })}
    </>
  );
}

// Polyline component using useMapsLibrary hook
function PolylineRoute({ points }) {
  const map = useMap();
  const mapsLibrary = useMapsLibrary('maps');
  const [polyline, setPolyline] = useState(null);

  useEffect(() => {
    if (!map || !mapsLibrary || !points || points.length < 2) return;

    const pathCoordinates = points.map(d => ({
      lat: d.latitude,
      lng: d.longitude
    }));

    // Create the main route polyline
    const routeLine = new mapsLibrary.Polyline({
      path: pathCoordinates,
      geodesic: true,
      strokeColor: '#1976D2',
      strokeOpacity: 1.0,
      strokeWeight: 5,
      map: map
    });

    setPolyline(routeLine);

    return () => {
      if (routeLine) {
        routeLine.setMap(null);
      }
    };
  }, [map, mapsLibrary, points]);

  return null;
}

export default function TrackerPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [trackingData, setTrackingData] = useState(null);
  const [trackingImei, setTrackingImei] = useState(null);

  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchVehicles = useCallback(async () => {
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
  }, [searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleRefreshTrackingData = useCallback(async () => {
    if (!trackingImei || !selectedVehicle) return;

    setLoading(true);
    try {
      const response = await getVehicleDataPackets(trackingImei);
      if (response.success && response.data && response.data.length > 0) {
        setTrackingData(response.data);
      } else {
        alert("No tracking data found for this vehicle");
      }
    } catch (error) {
      console.error("Error refreshing tracking data:", error);
      alert("Error refreshing tracking data");
    } finally {
      setLoading(false);
    }
  }, [trackingImei, selectedVehicle]);

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

  const handleTrackVehicle = async (vehicle) => {
    if (!vehicle.device?.imei) {
      alert("No IMEI found for this vehicle");
      return;
    }

    setLoading(true);
    try {
      const response = await getVehicleDataPackets(vehicle.device.imei);
      if (response.success && response.data && response.data.length > 0) {
        setTrackingData(response.data);
        setTrackingImei(vehicle.device.imei);
        setSelectedVehicle(vehicle);
        setViewMode("tracking");
      } else {
        alert("No tracking data found for this vehicle");
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      alert("Error fetching tracking data");
    } finally {
      setLoading(false);
    }
  };

  const handleAlertClick = (vehicle) => {
    navigate(`/vehicles-alerts?search=${vehicle.device?.imei}`);
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedVehicle(null);
    setTrackingData(null);
    setTrackingImei(null);
    setCurrentPage(1);
    setSearchTerm("");
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.2rem",
        }}
      >
        <RefreshCw style={{ marginRight: "10px", animation: "spin 1s linear infinite" }} />
        Loading vehicles...
      </div>
    );
  }

  if (viewMode === "detail" && selectedVehicle) {
    return <VehicleDetailView vehicle={selectedVehicle} onBack={handleBackToList} loading={loading} />;
  }

  if (viewMode === "tracking" && trackingData) {
    return (
      <VehicleTrackingView
        vehicle={selectedVehicle}
        trackingData={trackingData}
        imei={trackingImei}
        onBack={handleBackToList}
        onRefresh={handleRefreshTrackingData}
        loading={loading}
      />
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.5rem" }}>
          Vehicle Tracker
        </h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>Track and manage all vehicles</p>
      </div>

      <div style={{ marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            border: "1px solid #ccc",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <Search
            style={{ marginLeft: "0.75rem", color: "#666" }}
            size={20}
          />
          <input
            type="text"
            placeholder="Search by vehicle number, customer name, or IMEI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "0.95rem",
              borderLeft: "none",
              outline: "none",
            }}
          />
        </div>
        <button
          onClick={fetchVehicles}
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
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #e0e0e0" }}>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>#</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>Vehicle No</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>Customer Name</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>Customer Mobile</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>Device IMEI</th>
              <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#666" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "#666" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "3rem", textAlign: "center", color: "#999" }}>
                  {searchTerm ? `No vehicles found for "${searchTerm}"` : "No vehicles found"}
                </td>
              </tr>
            ) : (
              vehicles.map((vehicle, index) => {
                const statusStyle = getStatusBadge(vehicle.status);
                const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                return (
                  <tr
                    key={vehicle.id}
                    style={{ borderBottom: "1px solid #f0f0f0" }}
                  >
                    <td style={{ padding: "1rem", color: "#666" }}>{rowNumber}</td>
                    <td style={{ padding: "1rem", fontWeight: "500" }}>{vehicle.vehicleNo}</td>
                    <td style={{ padding: "1rem" }}>{vehicle.customerName}</td>
                    <td style={{ padding: "1rem" }}>{vehicle.customerMobile}</td>
                    <td style={{ padding: "1rem", fontFamily: "monospace", color: "#666" }}>
                      {vehicle.device?.imei || "N/A"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.4rem 0.8rem",
                          borderRadius: "4px",
                          fontSize: "0.85rem",
                          fontWeight: "500",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {vehicle.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", textAlign: "center" }}>
                      {vehicle.device?.imei ? (
                        <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                          <button
                            onClick={() => handleTrackVehicle(vehicle)}
                            title="Track Vehicle"
                            style={{
                              background: "none",
                              border: "1px solid #2e7d32",
                              cursor: "pointer",
                              padding: "0.4rem 0.8rem",
                              borderRadius: "4px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              color: "#2e7d32",
                              fontSize: "0.85rem",
                              fontWeight: "500",
                              transition: "all 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "#2e7d32";
                              e.currentTarget.style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "transparent";
                              e.currentTarget.style.color = "#2e7d32";
                            }}
                          >
                            <Navigation size={14} />
                            Track
                          </button>
                          <button
                            onClick={() => handleAlertClick(vehicle)}
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
                            <AlertCircle size={14} />
                            Alerts
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontSize: "0.85rem" }}>
                          <AlertCircle size={14} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                          Device Not Installed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {maxPage > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem",
              borderTop: "1px solid #f0f0f0",
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
              <ChevronLeft size={16} style={{ verticalAlign: "middle", marginRight: "4px" }} />
              Previous
            </button>

            <span style={{ color: "#666", fontSize: "0.95rem" }}>
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
              <ChevronRight size={16} style={{ verticalAlign: "middle", marginLeft: "4px" }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ SERVER-SIDE PAGINATION with Page Size Selector
function VehicleTrackingView({ vehicle, trackingData: initialTrackingData, imei, onBack, onRefresh, loading: initialLoading }) {
  const [currentDataPage, setCurrentDataPage] = useState(1);
  const [dataSearchTerm, setDataSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [mapCenter, setMapCenter] = useState({ lat: 22.5726, lng: 88.3639 });
  const [mapZoom, setMapZoom] = useState(20);
  const [trackingData, setTrackingData] = useState(initialTrackingData);
  const [maxPage, setMaxPage] = useState(0);
  const [loading, setLoading] = useState(initialLoading);
  const [mapViewMode, setMapViewMode] = useState("route"); // "route" or "markers"

  const fetchTrackingData = useCallback(async () => {
    if (!imei) return;

    setLoading(true);
    try {
      const response = await getVehicleDataPackets(imei, {
        offset: (currentDataPage - 1) * pageSize,
        limit: pageSize,
        search: dataSearchTerm
      });

      if (response.success && response.data) {
        setTrackingData(response.data);
        setMaxPage(response.maxPage || 0);
      } else {
        setTrackingData([]);
        setMaxPage(0);
      }
    } catch (error) {
      console.error("Error fetching tracking data:", error);
      setTrackingData([]);
      setMaxPage(0);
    } finally {
      setLoading(false);
    }
  }, [imei, currentDataPage, pageSize, dataSearchTerm]);

  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  useEffect(() => {
    setCurrentDataPage(1);
  }, [dataSearchTerm, pageSize]);

  useEffect(() => {
    if (trackingData && trackingData.length > 0) {
      const validLocation = trackingData.find(d => d.latitude && d.longitude);
      if (validLocation) {
        setMapCenter({ lat: validLocation.latitude, lng: validLocation.longitude });
        setMapZoom(20);
      }
    }
  }, [trackingData]);

  const handleRefreshData = async () => {
    await fetchTrackingData();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading && !trackingData?.length) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "1.2rem" }}>
        <RefreshCw style={{ marginRight: "10px", animation: "spin 1s linear infinite" }} />
        Loading tracking data...
      </div>
    );
  }

  return (
    <div style={{ padding: "1.5rem", height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
        <button
          onClick={onBack}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.25rem",
            backgroundColor: "transparent",
            border: "1px solid #ccc",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            color: "#333",
            transition: "background-color 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <ArrowLeft size={18} />
          Back to List
        </button>

        <div style={{ flex: 1, marginLeft: "2rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>
            Vehicle Tracking - {vehicle.vehicleNo}
          </h2>
          <p style={{ color: "#666", fontSize: "0.9rem", margin: "0.25rem 0 0 0" }}>
            IMEI: {imei} | Total Pages: {maxPage}
          </p>
        </div>

        <button
          onClick={handleRefreshData}
          disabled={loading}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: loading ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.95rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <RefreshCw size={18} className={loading ? "spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* LEFT SIDE - Table */}
        <div style={{ flex: "0 0 55%", display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          {/* Table Header with Search, Page Size & Pagination */}
          <div style={{ padding: "1.25rem", borderBottom: "2px solid #f0f0f0", backgroundColor: "#fafafa" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
              Location Records
            </h3>

            {/* Search Field */}
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", border: "1px solid #ccc", borderRadius: "6px", backgroundColor: "white", paddingLeft: "0.75rem" }}>
                <Search size={18} color="#666" />
                <input
                  type="text"
                  placeholder="Search location data..."
                  value={dataSearchTerm}
                  onChange={(e) => setDataSearchTerm(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.75rem 0.75rem 0.75rem 0",
                    border: "none",
                    outline: "none",
                    fontSize: "0.9rem",
                  }}
                />
              </div>

              {/* Page Size Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <label style={{ fontSize: "0.9rem", fontWeight: "500", color: "#666", whiteSpace: "nowrap" }}>
                  Show:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="page-size-selector"
                  style={{
                    padding: "0.65rem 0.75rem",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    outline: "none",
                    minWidth: "80px"
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <button
                onClick={() => setCurrentDataPage((prev) => Math.max(1, prev - 1))}
                disabled={currentDataPage === 1 || loading}
                className="pagination-btn"
                style={{
                  padding: "0.75rem",
                  backgroundColor: (currentDataPage === 1 || loading) ? "#f5f5f5" : "#1976d2",
                  color: (currentDataPage === 1 || loading) ? "#999" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: (currentDataPage === 1 || loading) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  minWidth: "40px",
                  height: "40px"
                }}
                title="Previous Page"
              >
                <ChevronLeft size={20} />
              </button>

              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: "0.95rem", fontWeight: "600", color: "#333" }}>
                  Page {currentDataPage} of {maxPage || 1}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.25rem" }}>
                  {trackingData?.length || 0} records
                </div>
              </div>

              <button
                onClick={() => setCurrentDataPage((prev) => Math.min(maxPage, prev + 1))}
                disabled={currentDataPage === maxPage || loading || maxPage === 0}
                className="pagination-btn"
                style={{
                  padding: "0.75rem",
                  backgroundColor: (currentDataPage === maxPage || loading || maxPage === 0) ? "#f5f5f5" : "#1976d2",
                  color: (currentDataPage === maxPage || loading || maxPage === 0) ? "#999" : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: (currentDataPage === maxPage || loading || maxPage === 0) ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  minWidth: "40px",
                  height: "40px"
                }}
                title="Next Page"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Table Content */}
          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            {loading && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem 1.5rem", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
                  <RefreshCw size={20} style={{ animation: "spin 1s linear infinite" }} />
                  <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Loading data...</span>
                </div>
              </div>
            )}

            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 1 }}>
                <tr>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>SL No</th>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>Latitude</th>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>Longitude</th>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>Main Power</th>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>Speed</th>
                  <th style={{ padding: "0.875rem", textAlign: "left", fontWeight: "600", fontSize: "0.85rem", color: "#666", borderBottom: "2px solid #e0e0e0" }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {!trackingData || trackingData.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: "3rem", textAlign: "center", color: "#999" }}>
                      {dataSearchTerm ? `No records found for "${dataSearchTerm}"` : "No records available"}
                    </td>
                  </tr>
                ) : (
                  trackingData.map((data, idx) => {
                    const slNo = (currentDataPage - 1) * pageSize + idx + 1;
                    return (
                      <tr
                        key={idx}
                        style={{ borderBottom: "1px solid #f0f0f0", transition: "background-color 0.15s" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9f9f9"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "0.875rem", fontSize: "0.9rem", color: "#666" }}>{slNo}</td>
                        <td style={{ padding: "0.875rem", fontSize: "0.9rem", fontFamily: "monospace" }}>
                          {data.latitude ? data.latitude.toFixed(6) : "N/A"}
                        </td>
                        <td style={{ padding: "0.875rem", fontSize: "0.9rem", fontFamily: "monospace" }}>
                          {data.longitude ? data.longitude.toFixed(6) : "N/A"}
                        </td>
                        <td style={{ padding: "0.875rem", fontSize: "0.9rem" }}>
                          <span style={{ 
                            padding: "0.3rem 0.6rem", 
                            borderRadius: "4px", 
                            fontSize: "0.8rem", 
                            fontWeight: "600",
                            backgroundColor: data.main_power ? "#e8f5e9" : "#ffebee",
                            color: data.main_power ? "#2e7d32" : "#c62828"
                          }}>
                            {data.main_power ? "ON" : "OFF"}
                          </span>
                        </td>
                        <td style={{ padding: "0.875rem", fontSize: "0.9rem" }}>
                          {data.speed !== undefined ? `${data.speed} km/h` : "N/A"}
                        </td>
                        <td style={{ padding: "0.875rem", fontSize: "0.85rem", color: "#666" }}>
                          {data.time_stamp_server ? new Date(data.time_stamp_server).toLocaleString() : "N/A"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDE - Map */}
        <div style={{ flex: "0 0 45%", display: "flex", flexDirection: "column", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem", borderBottom: "2px solid #f0f0f0", backgroundColor: "#fafafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: "#333" }}>
                Location Map
              </h3>
              
              {/* Mode Toggle Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#e8e8e8", padding: "4px", borderRadius: "8px" }}>
                <button
                  onClick={() => setMapViewMode("route")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: mapViewMode === "route" ? "#1976d2" : "transparent",
                    color: mapViewMode === "route" ? "white" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12h4l3 9 4-18 3 9h4" />
                  </svg>
                  Route
                </button>
                <button
                  onClick={() => setMapViewMode("markers")}
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: mapViewMode === "markers" ? "#1976d2" : "transparent",
                    color: mapViewMode === "markers" ? "white" : "#666",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem"
                  }}
                >
                  <MapPin size={16} />
                  Pointer
                </button>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#666" }}>
              Showing {trackingData?.filter(d => d.latitude && d.longitude).length || 0} locations from page {currentDataPage}
            </p>
          </div>

          <div style={{ flex: 1, position: "relative" }}>
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  mapId={GOOGLE_MAPS_ID}
                  center={mapCenter}
                  zoom={mapZoom}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: "100%", height: "100%", borderRadius: "8px" }}
                  onCameraChanged={(ev) => {
                    setMapCenter(ev.detail.center);
                    setMapZoom(ev.detail.zoom);
                  }}
                >
                  {mapViewMode === "route" ? (
                    <PathWithMarkers trackingData={trackingData} />
                  ) : (
                    <PowerMarkers trackingData={trackingData} />
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                Google Maps API Key not configured
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ padding: "1rem", borderTop: "1px solid #f0f0f0", display: "flex", gap: "2rem", fontSize: "0.85rem", justifyContent: "center" }}>
            {mapViewMode === "route" ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="20" height="26" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z" fill="#4CAF50"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                  </svg>
                  <span style={{ fontWeight: '500' }}>Start Point</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="20" height="26" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16 0C7.163 0 0 7.163 0 16c0 8.837 16 26 16 26s16-17.163 16-26C32 7.163 24.837 0 16 0z" fill="#F44336"/>
                    <circle cx="16" cy="16" r="6" fill="white"/>
                  </svg>
                  <span style={{ fontWeight: '500' }}>End Point</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "40px", height: "4px", backgroundColor: "#1976D2", borderRadius: "2px" }} />
                  <span style={{ fontWeight: '500' }}>Travel Route</span>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#4caf50", border: "3px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
                  <span style={{ fontWeight: '500' }}>Power ON</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ width: "16px", height: "16px", borderRadius: "50%", backgroundColor: "#f44336", border: "3px solid white", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }} />
                  <span style={{ fontWeight: '500' }}>Power OFF</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontSize: "1.2rem" }}>
        <RefreshCw style={{ marginRight: "10px", animation: "spin 1s linear infinite" }} />
        Loading vehicle details...
      </div>
    );
  }

  const statusStyle = getStatusBadge(vehicle.status);

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button
        onClick={onBack}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1.25rem",
          backgroundColor: "transparent",
          border: "1px solid #ccc",
          borderRadius: "6px",
          cursor: "pointer",
          fontSize: "0.95rem",
          fontWeight: "500",
          color: "#333",
          marginBottom: "2rem",
          transition: "background-color 0.2s"
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
      >
        <ArrowLeft size={18} />
        Back to List
      </button>

      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", color: "#1a1a1a", marginBottom: "0.5rem" }}>
          Vehicle Details - {vehicle.vehicleNo}
        </h1>
        <p style={{ color: "#666", fontSize: "1rem" }}>Complete vehicle information</p>
      </div>

      <div style={{ backgroundColor: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: "600", marginBottom: "1.5rem", color: "#333" }}>
          Basic Information
        </h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem" }}>
          <InfoField label="Vehicle Number" value={vehicle.vehicleNo} />
          <InfoField label="Customer Name" value={vehicle.customerName} />
          <InfoField label="Customer Mobile" value={vehicle.customerMobile} />
          <InfoField label="Device IMEI" value={vehicle.device?.imei} mono />
          <InfoField 
            label="Status" 
            value={
              <span
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "4px",
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  backgroundColor: statusStyle.bg,
                  color: statusStyle.color,
                }}
              >
                {vehicle.status.replace(/_/g, " ")}
              </span>
            } 
          />
        </div>
      </div>
    </div>
  );
}

function InfoField({ label, value, mono = false, fullWidth = false }) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem", fontWeight: "500" }}>
        {label}
      </div>
      <div style={{ fontSize: "1rem", color: "#333", fontFamily: mono ? "monospace" : "inherit" }}>
        {value || "N/A"}
      </div>
    </div>
  );
}