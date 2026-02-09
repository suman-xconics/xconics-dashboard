/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { MapPin, AlertCircle, ArrowLeft, Navigation, ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import { getVehicles, getVehicleByVehicleNo } from "../api/vehicleApi";
import "./VehicleList.css";
import { useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker } from '@vis.gl/react-google-maps';
import { getVehicleDataPackets } from "../api/dataPacketApis";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_ID = import.meta.env.VITE_GOOGLE_MAPS_ID;

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
      <div className="tracker-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading vehicles...
        </div>
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
    <div className="tracker-page">
      <div className="card page-header">
        <h2>Vehicle Tracker</h2>
        <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
          Track and manage all vehicles
        </p>
      </div>

      <div className="card toolbar">
        <div style={{ display: "flex", flex: 1, maxWidth: "500px" }}>
          <Search size={20} style={{ margin: "0.75rem 0.75rem 0.75rem 0.75rem", color: "#666" }} />
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
              borderLeft: "none",
              outline: "none",
            }}
          />
        </div>
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
                    {searchTerm ? `No vehicles found for "${searchTerm}"` : "No vehicles found"}
                  </td>
                </tr>
              ) : (
                vehicles.map((vehicle, index) => {
                  const statusStyle = getStatusBadge(vehicle.status);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;
                  
                  return (
                    <tr key={vehicle.id}>
                      <td>{rowNumber}</td>
                      <td><span style={{ fontFamily: "monospace", fontWeight: "500" }}>{vehicle.vehicleNo}</span></td>
                      <td>{vehicle.customerName}</td>
                      <td><span style={{ fontFamily: "monospace" }}>{vehicle.customerMobile}</span></td>
                      <td><span style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>{vehicle.device?.imei || "N/A"}</span></td>
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
                      {vehicle.device?.imei ? (
                        <td>
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
                              <Navigation size={16} />
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
                              <AlertCircle size={16} />
                              Alerts
                            </button>
                          </div>
                        </td>
                      ) : (
                        <td style={{ textAlign: "center", color: "#999" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", justifyContent: "center" }}>
                            <AlertCircle size={16} />
                            Device Not Installed
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {maxPage > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", padding: "1.5rem", borderTop: "1px solid #e0e0e0" }}>
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
            <span style={{ fontSize: "0.95rem", color: "#666" }}>Page {currentPage} of {maxPage}</span>
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

// ✅ SERVER-SIDE PAGINATION with Page Size Selector
function VehicleTrackingView({ vehicle, trackingData: initialTrackingData, imei, onBack, onRefresh, loading: initialLoading }) {
  const [currentDataPage, setCurrentDataPage] = useState(1);
  const [dataSearchTerm, setDataSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(10); // ✅ Page size selector
  const [mapCenter, setMapCenter] = useState({ lat: 22.5726, lng: 88.3639 });
  const [mapZoom, setMapZoom] = useState(20);
  const [trackingData, setTrackingData] = useState(initialTrackingData);
  const [maxPage, setMaxPage] = useState(0);
  const [loading, setLoading] = useState(initialLoading);

  // ✅ Fetch tracking data from server with server-side pagination
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

  // ✅ Fetch data when dependencies change
  useEffect(() => {
    fetchTrackingData();
  }, [fetchTrackingData]);

  // ✅ Reset to page 1 when search or page size changes
  useEffect(() => {
    setCurrentDataPage(1);
  }, [dataSearchTerm, pageSize]);

  // ✅ Set initial map center
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
      <div className="tracker-page">
        <div className="card" style={{ padding: "2rem", textAlign: "center" }}>
          Loading tracking data...
        </div>
      </div>
    );
  }

  return (
    <div className="tracker-page" style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      padding: 0,
      margin: 0
    }}>
      {/* Header */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "1rem",
        padding: "1rem 2rem",
        backgroundColor: "white",
        borderBottom: "1px solid #e0e0e0",
        flexShrink: 0
      }}>
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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
        >
          <ArrowLeft size={24} color="#000" />
        </button>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Vehicle Tracking - {vehicle.vehicleNo}</h2>
          <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
            IMEI: {imei} | Total Pages: {maxPage}
          </p>
        </div>
        <button
          onClick={handleRefreshData}
          disabled={loading}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: loading ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s"
          }}
        >
          <RefreshCw size={18} />
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ 
        display: "flex",
        flex: 1,
        minHeight: 0
      }}>
        {/* LEFT SIDE - Table */}
        <div style={{ 
          flex: 1,
          display: "flex", 
          flexDirection: "column",
          minWidth: 0,
          backgroundColor: "white",
          borderRight: "1px solid #e0e0e0"
        }}>
          {/* Table Header with Search, Page Size & Pagination */}
          <div style={{ 
            padding: "1.5rem",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#fafafa"
          }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1.2rem" }}>
              Location Records
            </h3>
            
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "1rem",
              flexWrap: "wrap"
            }}>
              {/* Search Field */}
              <div style={{ 
                display: "flex", 
                flex: 1,
                minWidth: "200px",
                border: "1px solid #ccc", 
                borderRadius: "6px",
                backgroundColor: "white"
              }}>
                <Search size={18} style={{ margin: "0.75rem 0.5rem", color: "#666" }} />
                <input
                  type="text"
                  placeholder="Search SLN, lat, lng..."
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
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.5rem",
                flexShrink: 0
              }}>
                <label style={{ fontSize: "0.9rem", color: "#666", fontWeight: "500", whiteSpace: "nowrap" }}>
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

              {/* Pagination Controls */}
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "0.75rem",
                flexShrink: 0
              }}>
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
                
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center",
                  minWidth: "100px"
                }}>
                  <span style={{ fontSize: "0.9rem", color: "#333", fontWeight: "600", whiteSpace: "nowrap" }}>
                    Page {currentDataPage} of {maxPage || 1}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "#666", whiteSpace: "nowrap" }}>
                    {trackingData?.length || 0} records
                  </span>
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
          </div>
          
          {/* Table Content */}
          <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
            {loading && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 100
              }}>
                <div style={{ textAlign: "center" }}>
                  <RefreshCw size={32} color="#1976d2" style={{ animation: "spin 1s linear infinite" }} />
                  <p style={{ marginTop: "1rem", color: "#666" }}>Loading data...</p>
                </div>
              </div>
            )}
            
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "0.9rem",
              tableLayout: "fixed"
            }}>
              <thead style={{ 
                position: "sticky", 
                top: 0, 
                backgroundColor: "#f5f5f5",
                zIndex: 10,
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}>
                <tr>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e0e0e0", width: "15%" }}>SL No</th>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e0e0e0", width: "30%" }}>Latitude</th>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "left", fontWeight: "600", borderBottom: "2px solid #e0e0e0", width: "30%" }}>Longitude</th>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "center", fontWeight: "600", borderBottom: "2px solid #e0e0e0", width: "25%" }}>Main Power</th>
                  <th style={{ padding: "1rem 0.5rem", textAlign: "center", fontWeight: "600", borderBottom: "2px solid #e0e0e0", width: "25%" }}>Speed</th>
                </tr>
              </thead>
              <tbody>
                {!trackingData || trackingData.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                      {dataSearchTerm ? `No records found for "${dataSearchTerm}"` : "No records available"}
                    </td>
                  </tr>
                ) : (
                  trackingData.map((data, idx) => {
                    const slNo = (currentDataPage - 1) * pageSize + idx + 1;
                    return (
                      <tr 
                        key={data.id || idx} 
                        style={{ 
                          borderBottom: "1px solid #f0f0f0",
                          transition: "background-color 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9f9f9"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                      >
                        <td style={{ padding: "1rem 0.5rem", fontWeight: "500", fontSize: "0.9rem" }}>{slNo}</td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#333" }}>
                            {data.latitude ? data.latitude.toFixed(6) : "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#333" }}>
                            {data.longitude ? data.longitude.toFixed(6) : "N/A"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                          <span
                            style={{
                              padding: "0.35rem 0.85rem",
                              borderRadius: "12px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              backgroundColor: data.main_power ? "#e8f5e9" : "#ffebee",
                              color: data.main_power ? "#2e7d32" : "#c62828",
                              display: "inline-block",
                            }}
                          >
                            {data.main_power ? "ON" : "OFF"}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 0.5rem", textAlign: "center" }}>
                          <span style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#333" }}>
                            {data.speed !== undefined ? `${data.speed} km/h` : "N/A"}
                          </span>
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
        <div style={{ 
          flex: 1,
          display: "flex", 
          flexDirection: "column",
          minWidth: 0
        }}>
          <div style={{ 
            padding: "1.5rem",
            borderBottom: "1px solid #e0e0e0",
            backgroundColor: "#fafafa"
          }}>
            <h3 style={{ margin: "0", fontSize: "1.2rem" }}>
              Location Map
            </h3>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              Showing {trackingData?.filter(d => d.latitude && d.longitude).length || 0} locations from page {currentDataPage}
            </p>
          </div>
          
          <div style={{ flex: 1, position: "relative", width: "100%", height: "100%" }}>
            {GOOGLE_MAPS_API_KEY ? (
              <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
                <Map
                  mapId={GOOGLE_MAPS_ID}
                  defaultCenter={mapCenter}
                  defaultZoom={mapZoom}
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  zoomControl={true}
                  mapTypeControl={true}
                  scaleControl={true}
                  streetViewControl={true}
                  rotateControl={true}
                  fullscreenControl={true}
                  style={{ width: "100%", height: "100%" }}
                  onCameraChanged={(ev) => {
                    setMapCenter(ev.detail.center);
                    setMapZoom(ev.detail.zoom);
                  }}
                >
                  {trackingData?.map((data, idx) => {
                    if (!data.latitude || !data.longitude) return null;
                    
                    return (
                      <AdvancedMarker
                        key={data.id || idx}
                        position={{ lat: data.latitude, lng: data.longitude }}
                      >
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            backgroundColor: data.main_power ? "#2e7d32" : "#c62828",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "3px solid white",
                            boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                            cursor: "pointer",
                            transition: "transform 0.2s"
                          }}
                          title={`SLN: ${data.sln} | Lat: ${data.latitude.toFixed(6)} | Lng: ${data.longitude.toFixed(6)} | Power: ${data.main_power ? 'ON' : 'OFF'}`}
                          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
                          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                        >
                          <MapPin size={20} color="white" />
                        </div>
                      </AdvancedMarker>
                    );
                  })}
                </Map>
              </APIProvider>
            ) : (
              <div style={{ 
                height: "100%", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                backgroundColor: "#f5f5f5",
                flexDirection: "column",
                gap: "1rem"
              }}>
                <AlertCircle size={48} color="#999" />
                <p style={{ color: "#666", fontSize: "1.1rem" }}>Google Maps API Key not configured</p>
              </div>
            )}
          </div>

          <div style={{ 
            padding: "1.5rem",
            borderTop: "2px solid #e0e0e0",
            display: "flex", 
            gap: "3rem", 
            justifyContent: "center", 
            alignItems: "center",
            backgroundColor: "#fafafa"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ 
                width: "28px", 
                height: "28px", 
                backgroundColor: "#2e7d32", 
                borderRadius: "50%", 
                border: "3px solid white", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)" 
              }} />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Main Power ON</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ 
                width: "28px", 
                height: "28px", 
                backgroundColor: "#c62828", 
                borderRadius: "50%", 
                border: "3px solid white", 
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)" 
              }} />
              <span style={{ fontSize: "0.95rem", fontWeight: "500" }}>Main Power OFF</span>
            </div>
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
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
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

      <div className="card">
        <h3 style={{ margin: "0 0 1.5rem 0", paddingBottom: "1rem", borderBottom: "2px solid #e0e0e0" }}>
          Basic Information
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
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
    </div>
  );
}

function InfoField({ label, value, mono = false, fullWidth = false }) {
  return (
    <div style={fullWidth ? { gridColumn: "1 / -1" } : {}}>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>{label}</p>
      <p style={{ margin: 0, fontWeight: "500", fontSize: "0.95rem", fontFamily: mono ? "monospace" : "inherit", wordBreak: "break-word" }}>
        {value || "N/A"}
      </p>
    </div>
  );
}