import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getFieldEngineerById } from "../api/fieldEngineerApi";
import FieldEngineerPageHeader from "../components/FieldEngineerHeader";
import "./FieldEngineerDetail.css";

/**
 * Convert ISO date string to readable format
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
    console.error("Error formatting date:", isoDateString, error);
    return "N/A";
  }
};

/**
 * Convert ISO datetime string to readable format
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
    console.error("Error formatting datetime:", isoDateString, error);
    return "N/A";
  }
};

export default function FieldEngineerDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH FIELD ENGINEER DATA
     ===================== */
  useEffect(() => {
    const fetchEngineer = async () => {
      console.log("Fetching field engineer with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getFieldEngineerById(id);
        console.log("getFieldEngineerById Result:", result);

        if (result.success && result.data) {
          setEngineer(result.data);
        } else {
          const errorMsg = result.error || "Failed to fetch field engineer data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchEngineer:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEngineer();
    } else {
      setLoading(false);
      setError("No field engineer ID provided");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="lender-page">
        <FieldEngineerPageHeader />
        <div className="fe-detail-wrapper">
          <div className="card">
            <h2>Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching field engineer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !engineer) {
    return (
      <div className="lender-page">
        <FieldEngineerPageHeader />
        <div className="fe-detail-wrapper">
          <div className="card">
            <h2>Error</h2>
            <p style={{ padding: "2rem", textAlign: "center", color: "#721c24" }}>
              {error || "Field engineer not found"}
            </p>
            <div className="actions">
              <button onClick={() => navigate("/engineers")}>
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-page">
      {/* PAGE HEADER */}
      <FieldEngineerPageHeader />

      {/* CONTENT WRAPPER */}
      <div className="fe-detail-wrapper">
        {/* HEADER STRIP */}
        <div className="fe-detail-top">
          <div>
            <h2>{engineer.engineerCode}</h2>
            <p style={{ margin: "0.5rem 0 0 0", color: "#666", fontSize: "0.9rem" }}>
              ID: {engineer.id}
            </p>
          </div>
          <span className={`status ${engineer.status?.toLowerCase()}`}>
            {engineer.status}
          </span>
        </div>

        {/* INFO CARDS */}
        <div className="card-grid">
          <div className="card">
            <h4>Engineer Info</h4>
            <p><b>Name:</b> {engineer.engineerName}</p>
            <p><b>Employment Type:</b> {engineer.employmentType}</p>
            <p><b>Branch Code:</b> {engineer.branchCode}</p>
            <p><b>Aggregator ID:</b> {engineer.aggregatorId}</p>
          </div>

          <div className="card">
            <h4>Contact Info</h4>
            <p><b>Mobile:</b> {engineer.mobileNo}</p>
            <p><b>Email:</b> {engineer.emailId}</p>
          </div>

          <div className="card full">
            <h4>Location Details</h4>
            <p><b>Base Location:</b> {engineer.baseLocation}</p>
            <p><b>District:</b> {engineer.district}</p>
            <p><b>State:</b> {engineer.state}</p>
            <p>
              <b>Current Location:</b> Lat {engineer.currentLatitude || 0}, 
              Lng {engineer.currentLongitude || 0}
            </p>
            <p><b>Location Updated:</b> {formatDateTime(engineer.locationUpdatedAt)}</p>
          </div>
        </div>

        {/* SKILL SET */}
        <div className="card">
          <h4>Skill Set</h4>
          {engineer.skillSet && engineer.skillSet.length > 0 ? (
            <table className="skill-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Skill</th>
                </tr>
              </thead>
              <tbody>
                {engineer.skillSet.map((skill, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{skill}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p style={{ padding: "1rem", color: "#666" }}>No skills assigned</p>
          )}
        </div>

        {/* EMPLOYMENT & ID */}
        <div className="card-grid">
          <div className="card">
            <h4>Employment Details</h4>
            <p><b>Assigned Devices:</b> {engineer.assignedDeviceCount || 0}</p>
            <p><b>Joining Date:</b> {formatDate(engineer.joiningDate)}</p>
            <p>
              <b>Last Working Date:</b>{" "}
              {engineer.lastWorkingDate ? formatDate(engineer.lastWorkingDate) : "Currently Working"}
            </p>
          </div>

          <div className="card">
            <h4>ID Proof</h4>
            <p><b>Type:</b> {engineer.idProofType}</p>
            <p><b>Number:</b> {engineer.idProofNumber}</p>
          </div>
        </div>

        {/* TIMESTAMPS */}
        <div className="card">
          <h4>Record Information</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            <p><b>Created At:</b> {formatDateTime(engineer.createdAt)}</p>
            <p><b>Updated At:</b> {formatDateTime(engineer.updatedAt)}</p>
          </div>
        </div>

        {/* REMARKS */}
        <div className="card">
          <h4>Remarks</h4>
          <p>{engineer.remarks || "No remarks available"}</p>
        </div>

        {/* ACTIONS */}
        <div className="actions">
          <button
            className="secondary"
            onClick={() => navigate("/engineers")}
          >
            Back to List
          </button>

          <button
            className="primary"
            onClick={() => navigate(`/engineers/edit/${engineer.id}`)}
          >
            Edit Engineer
          </button>
        </div>
      </div>
    </div>
  );
}
