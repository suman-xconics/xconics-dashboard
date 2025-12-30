import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getWarehouseById } from "../api/warehouseApi";
import WarehouseHeader from "../components/WarehouseHeader";
import "./WarehouseDetail.css";

/**
 * Format date for display
 */
const formatDate = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

/**
 * Format datetime for display
 */
const formatDateTime = (isoDateString) => {
  if (!isoDateString) return "N/A";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "N/A";
    
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return "N/A";
  }
};

export default function WarehouseDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH WAREHOUSE DATA
     ===================== */
  useEffect(() => {
    const fetchWarehouse = async () => {
      console.log("Fetching warehouse with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getWarehouseById(id);
        console.log("getWarehouseById Result:", result);

        if (result.success && result.data) {
          setWarehouse(result.data);
        } else {
          const errorMsg = result.error || "Failed to fetch warehouse data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchWarehouse:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchWarehouse();
    } else {
      setLoading(false);
      setError("No warehouse ID provided");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="warehouse-page">
        <WarehouseHeader />
        <div className="warehouse-detail-container">
          <div className="card">
            <h2>Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching warehouse data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="warehouse-page">
        <WarehouseHeader />
        <div className="warehouse-detail-container">
          <div className="card">
            <h2>Error</h2>
            <p style={{ padding: "2rem", textAlign: "center", color: "#721c24" }}>
              {error || "Warehouse not found"}
            </p>
            <div className="actions">
              <button onClick={() => navigate("/warehouse")}>
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="warehouse-page">
      <WarehouseHeader />

      <div className="warehouse-detail-container">
        {/* HEADER STRIP */}
        <div className="header">
          <div>
            <h2>{warehouse.warehouseCode}</h2>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              {warehouse.warehouseName}
            </p>
            <p style={{ margin: "0.25rem 0 0 0", color: "#999", fontSize: "0.8rem" }}>
              ID: {warehouse.id}
            </p>
          </div>
          <span className={`status ${warehouse.status?.toLowerCase()}`}>
            {warehouse.status}
          </span>
        </div>

        {/* INFO CARDS */}
        <div className="card-grid">
          <div className="card">
            <h4>Warehouse Info</h4>
            <p><b>Type:</b> {warehouse.warehouseType}</p>
            <p><b>Owner Type:</b> {warehouse.ownerType}</p>
            <p><b>Aggregator ID:</b> {warehouse.aggregatorId || "N/A (Xconics Owned)"}</p>
          </div>

          <div className="card">
            <h4>Contact Info</h4>
            <p><b>Person:</b> {warehouse.contactPersonName}</p>
            <p><b>Mobile:</b> {warehouse.contactMobile}</p>
            <p><b>Email:</b> {warehouse.emailId}</p>
          </div>

          <div className="card full">
            <h4>Address</h4>
            <p>{warehouse.address}</p>
            <p><b>District:</b> {warehouse.district}</p>
            <p><b>State:</b> {warehouse.state}</p>
            <p><b>Pincode:</b> {warehouse.pincode}</p>
            <p>
              <b>Location:</b> Lat {warehouse.latitude || 0}, Lng {warehouse.longitude || 0}
            </p>
          </div>
        </div>

        {/* TIMESTAMPS */}
        <div className="card">
          <h4>Record Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <p><b>Created At:</b> {formatDateTime(warehouse.createdAt)}</p>
            <p><b>Updated At:</b> {formatDateTime(warehouse.updatedAt)}</p>
          </div>
        </div>

        {/* REMARKS */}
        <div className="card">
          <h4>Remarks</h4>
          <p>{warehouse.remarks || "No remarks available"}</p>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button
            className="secondary"
            onClick={() => navigate("/warehouse")}
          >
            Back to List
          </button>

          <button
            className="primary"
            onClick={() => navigate(`/warehouse/edit/${warehouse.id}`)}
          >
            Edit Warehouse
          </button>
        </div>
      </div>
    </div>
  );
}
