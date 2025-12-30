import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getLenderBranchById } from "../api/lenderBranchApi";
import LenderPageHeader from "../components/LenderPageHeader";
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

export default function ViewLenderBranch() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH BRANCH DATA
     ===================== */
  useEffect(() => {
    const fetchBranch = async () => {
      console.log("Fetching lender branch with ID:", id);
      setLoading(true);
      setError(null);

      try {
        const result = await getLenderBranchById(id);
        console.log("getLenderBranchById Result:", result);

        if (result.success && result.data) {
          setBranch(result.data);
        } else {
          const errorMsg = result.error || "Failed to fetch lender branch data";
          setError(errorMsg);
          alert(`Error: ${errorMsg}`);
        }
      } catch (err) {
        console.error("Exception in fetchBranch:", err);
        setError("An unexpected error occurred while fetching data");
        alert("An unexpected error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBranch();
    } else {
      setLoading(false);
      setError("No lender branch ID provided");
    }
  }, [id]);

  if (loading) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader
          title="Lender Branch"
          breadcrumbLabel="Lender Branch > View"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching lender branch data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader
          title="Lender Branch"
          breadcrumbLabel="Lender Branch > View"
        />
        <div className="edit-lender-page">
          <div className="card edit-lender-card full-width">
            <h2 className="edit-lender-title">Error</h2>
            <p style={{ padding: "2rem", textAlign: "center", color: "#721c24" }}>
              {error || "Lender branch not found"}
            </p>
            <div className="form-actions">
              <button onClick={() => navigate("/lender-branches")}>
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
        title="Lender Branch"
        breadcrumbLabel="Lender Branch > View"
      />

      <div className="edit-lender-page">
        <div className="card edit-lender-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Lender Branch Details</h2>
            <div style={{ fontSize: "0.9rem", color: "#666", padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
              ID: <strong>{branch.id}</strong>
            </div>
          </div>

          <div className="edit-form two-column">
            <label>
              Lender ID
              <input value={branch.lenderId || "N/A"} disabled />
            </label>

            <label>
              Branch Code
              <input value={branch.branchCode} disabled />
            </label>

            <label>
              Branch Name
              <input value={branch.branchName} disabled />
            </label>

            <label>
              Branch Type
              <input value={branch.branchType} disabled />
            </label>

            <label>
              Contact Person Name
              <input value={branch.contactPersonName} disabled />
            </label>

            <label>
              Contact Mobile
              <input value={branch.contactMobile} disabled />
            </label>

            <label>
              Contact Email
              <input value={branch.contactEmail} disabled />
            </label>

            <label>
              Address
              <input value={branch.address} disabled />
            </label>

            <label>
              State
              <input value={branch.state} disabled />
            </label>

            <label>
              District
              <input value={branch.district} disabled />
            </label>

            <label>
              Pincode
              <input value={branch.pincode} disabled />
            </label>

            <label>
              Latitude
              <input value={branch.latitude || 0} disabled />
            </label>

            <label>
              Longitude
              <input value={branch.longitude || 0} disabled />
            </label>

            <label>
              Location Updated At
              <input value={formatDate(branch.locationUpdatedAt)} disabled />
            </label>

            <div className="ld-inline-field">
              <span className="ld-inline-label">Billing Applicable</span>
              <input type="checkbox" checked={branch.billingApplicable} disabled />
            </div>

            <label>
              Status
              <input value={branch.status} disabled />
            </label>

            <label className="full-width">
              Remarks
              <textarea value={branch.remarks || "No remarks available"} disabled rows="3" />
            </label>

            <label>
              Created At
              <input value={formatDateTime(branch.createdAt)} disabled />
            </label>

            <label>
              Updated At
              <input value={formatDateTime(branch.updatedAt)} disabled />
            </label>

            {/* ACTIONS */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate("/lender-branches")}>
                Back to List
              </button>

              <button 
                type="button" 
                className="primary"
                onClick={() => navigate(`/lender-branches/edit/${branch.id}`)}
              >
                Edit Branch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
