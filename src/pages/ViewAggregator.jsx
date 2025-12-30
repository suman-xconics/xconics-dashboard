import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import LenderPageHeader from "../components/LenderPageHeader";
import { getAggregatorById } from "../api/aggregatorApi";
import { getFieldEngineers } from "../api/fieldEngineerApi";
import "./EditLender.css";

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
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return "N/A";
  }
};

export default function ViewAggregator() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [aggregator, setAggregator] = useState(null);
  const [mappedEngineers, setMappedEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEngineers, setLoadingEngineers] = useState(true);
  const [error, setError] = useState(null);
  const [engineersError, setEngineersError] = useState(null);

  /* =====================
     FETCH AGGREGATOR DATA
     ===================== */
  useEffect(() => {
    const fetchAggregator = async () => {
      console.log("Fetching aggregator with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getAggregatorById(id);
        console.log("getAggregatorById Result:", result);

        if (result.success && result.data) {
          setAggregator(result.data);
        } else {
          const errorMsg = result.error || "Failed to fetch aggregator data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Error fetching aggregator:", err);
        setError("Failed to fetch aggregator data");
        alert("Failed to fetch aggregator data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAggregator();
    }
  }, [id]);

  /* =====================
     FETCH MAPPED FIELD ENGINEERS
     ===================== */
  useEffect(() => {
    const fetchFieldEngineers = async () => {
      console.log("Fetching field engineers for aggregator ID:", id);
      setLoadingEngineers(true);
      setEngineersError(null);

      try {
        // Fetch field engineers filtered by aggregator ID
        const result = await getFieldEngineers({
          aggregatorId: id,
          limit: 1000, // Get all engineers for this aggregator
        });

        console.log("Field Engineers Result:", result);

        if (result.success) {
          setMappedEngineers(result.data);
          console.log(`Found ${result.data.length} field engineers for this aggregator`);
        } else {
          const errorMsg = result.error || "Failed to fetch field engineers";
          setEngineersError(errorMsg);
          console.error("Error fetching field engineers:", errorMsg);
        }
      } catch (err) {
        console.error("Exception while fetching field engineers:", err);
        setEngineersError("An unexpected error occurred");
      } finally {
        setLoadingEngineers(false);
      }
    };

    if (id) {
      fetchFieldEngineers();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader
          title="Aggregator Master"
          breadcrumbLabel="Aggregator > View"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching aggregator data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !aggregator) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader
          title="Aggregator Master"
          breadcrumbLabel="Aggregator > View"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Error</h2>
            <p style={{ padding: "2rem", textAlign: "center", color: "#721c24" }}>
              {error || "Aggregator not found"}
            </p>
            <div className="form-actions">
              <button type="button" onClick={() => navigate("/aggregators")}>
                Back to List
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Aggregator Master"
        breadcrumbLabel="Aggregator > View"
      />

      {/* =====================
         AGGREGATOR DETAILS
         ===================== */}
      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Aggregator Details</h2>
            <button 
              type="button"
              onClick={() => navigate(`/aggregators/edit/${id}`)}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Edit Aggregator
            </button>
          </div>

          <div className="edit-form two-column">
            <label>
              Aggregator ID
              <input value={aggregator.id || ""} disabled />
            </label>

            <label>
              Aggregator Code
              <input value={aggregator.aggregatorCode || ""} disabled />
            </label>

            <label>
              Aggregator Name
              <input value={aggregator.aggregatorName || ""} disabled />
            </label>

            <label>
              Contact Person Name
              <input value={aggregator.contactPersonName || ""} disabled />
            </label>

            <label>
              Contact Mobile
              <input value={aggregator.contactMobile || ""} disabled />
            </label>

            <label>
              Contact Email
              <input value={aggregator.contactEmail || ""} disabled />
            </label>

            <label>
              Office Address
              <input value={aggregator.officeAddress || ""} disabled />
            </label>

            <label>
              State
              <input value={aggregator.state || ""} disabled />
            </label>

            <label>
              District
              <input value={aggregator.district || ""} disabled />
            </label>

            <label>
              Service Coverage
              <input value={aggregator.serviceCoverage || ""} disabled />
            </label>

            <label>
              Service Type
              <input value={aggregator.serviceType || ""} disabled />
            </label>

            <label>
              TAT Hours
              <input value={aggregator.tatHours || ""} disabled />
            </label>

            <label>
              LD Applicable
              <input value={aggregator.ldApplicable ? "Yes" : "No"} disabled />
            </label>

            <label>
              LD Percentage Cap
              <input value={aggregator.ldPercentageCap || "0"} disabled />
            </label>

            <label>
              Billing Cycle
              <input value={aggregator.billingCycle || ""} disabled />
            </label>

            <label>
              Payment Terms (Days)
              <input value={aggregator.paymentTermsDays || ""} disabled />
            </label>

            <label>
              Contract Start Date
              <input value={formatDate(aggregator.contractStartDate)} disabled />
            </label>

            <label>
              Contract End Date
              <input value={formatDate(aggregator.contractEndDate)} disabled />
            </label>

            <label>
              Bank Name
              <input value={aggregator.bankName || ""} disabled />
            </label>

            <label>
              Bank Account No
              <input value={aggregator.bankAccountNo || ""} disabled />
            </label>

            <label>
              IFSC Code
              <input value={aggregator.ifscCode || ""} disabled />
            </label>

            <label>
              GST Number
              <input value={aggregator.gstNumber || ""} disabled />
            </label>

            <label>
              PAN Number
              <input value={aggregator.panNumber || ""} disabled />
            </label>

            <label>
              Status
              <input value={aggregator.status || ""} disabled />
            </label>

            <label>
              Created At
              <input value={formatDate(aggregator.createdAt)} disabled />
            </label>

            <label>
              Updated At
              <input value={formatDate(aggregator.updatedAt)} disabled />
            </label>

            <label style={{ gridColumn: "1 / -1" }}>
              Remarks
              <textarea value={aggregator.remarks || ""} disabled rows="3" />
            </label>
          </div>
        </div>
      </div>

      {/* =====================
         FIELD ENGINEER MAPPING
         ===================== */}
      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>
              Mapped Field Engineers ({mappedEngineers.length})
            </h2>
            {!loadingEngineers && mappedEngineers.length > 0 && (
              <button 
                type="button"
                onClick={() => navigate("/engineers/add")}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
              >
                + Add Engineer
              </button>
            )}
          </div>

          {engineersError && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#fff3cd",
                color: "#856404",
                borderRadius: "4px",
                border: "1px solid #ffeaa7",
              }}
            >
              {engineersError}
            </div>
          )}

          {loadingEngineers ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Loading field engineers...</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Engineer Code</th>
                  <th>Engineer Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Employment Type</th>
                  <th>State</th>
                  <th>Base Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {mappedEngineers.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: "center", padding: "2rem" }}>
                      <p style={{ color: "#666", marginBottom: "1rem" }}>
                        No field engineers mapped to this aggregator
                      </p>
                      <button 
                        type="button"
                        onClick={() => navigate("/engineers/add")}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#007bff",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "0.9rem"
                        }}
                      >
                        Add Field Engineer
                      </button>
                    </td>
                  </tr>
                ) : (
                  mappedEngineers.map((fe) => (
                    <tr key={fe.id}>
                      <td>{fe.engineerCode}</td>
                      <td>{fe.engineerName}</td>
                      <td>{fe.mobileNo}</td>
                      <td>{fe.emailId}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            backgroundColor: fe.employmentType === "XCONICS" ? "#e3f2fd" : "#fff3e0",
                            color: fe.employmentType === "XCONICS" ? "#1976d2" : "#f57c00",
                          }}
                        >
                          {fe.employmentType}
                        </span>
                      </td>
                      <td>{fe.state}</td>
                      <td>{fe.baseLocation}</td>
                      <td>
                        <span
                          style={{
                            padding: "0.25rem 0.5rem",
                            borderRadius: "4px",
                            fontSize: "0.8rem",
                            backgroundColor: fe.status === "ACTIVE" ? "#d4edda" : "#f8d7da",
                            color: fe.status === "ACTIVE" ? "#155724" : "#721c24",
                          }}
                        >
                          {fe.status}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => navigate(`/engineers/view/${fe.id}`)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            marginRight: "0.5rem",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                        >
                          View
                        </button>
                        <button
                          onClick={() => navigate(`/engineers/edit/${fe.id}`)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem"
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          <div className="form-actions" style={{ marginTop: "16px" }}>
            <button type="button" onClick={() => navigate("/aggregators")}>
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
