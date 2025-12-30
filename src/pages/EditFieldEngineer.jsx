import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import { getFieldEngineerById, updateFieldEngineer, EMPLOYMENT_TYPES, STATUSES, ID_PROOF_TYPES, SKILL_TYPES } from "../api/fieldEngineerApi";
import { getAggregators } from "../api/aggregatorApi";
import "./FieldEngineerForm.css";

/* =====================
   EMPTY MODEL
   ===================== */
const EMPTY_ENGINEER = {
  engineerCode: "",
  engineerName: "",
  mobileNo: "",
  emailId: "",
  aggregatorId: "",
  branchCode: "",
  employmentType: "XCONICS",
  state: "",
  district: "",
  baseLocation: "",
  skillSet: [],
  assignedDeviceCount: 0,
  status: "ACTIVE",
  joiningDate: "",
  lastWorkingDate: "",
  idProofType: "AADHAAR",
  idProofNumber: "",
  currentLatitude: 0,
  currentLongitude: 0,
  locationUpdatedAt: "",
  remarks: "",
};

/**
 * Convert ISO date string to YYYY-MM-DD format for date input
 */
const formatDateForInput = (isoDateString) => {
  if (!isoDateString) return "";
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "";
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error("Error formatting date:", isoDateString, error);
    return "";
  }
};

export default function EditFieldEngineer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [engineer, setEngineer] = useState(EMPTY_ENGINEER);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingAggregators, setLoadingAggregators] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH AGGREGATORS
     ===================== */
  useEffect(() => {
    const fetchAggregators = async () => {
      setLoadingAggregators(true);
      const result = await getAggregators({ limit: 1000 });
      
      if (result.success) {
        setAggregators(result.data);
      } else {
        console.error("Failed to fetch aggregators:", result.error);
      }
      
      setLoadingAggregators(false);
    };

    fetchAggregators();
  }, []);

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
          const apiData = result.data;
          console.log("API Data received:", apiData);

          // Map API data to form state
          const newFormData = {
            engineerCode: apiData.engineerCode ?? "",
            engineerName: apiData.engineerName ?? "",
            mobileNo: apiData.mobileNo ?? "",
            emailId: apiData.emailId ?? "",
            aggregatorId: apiData.aggregatorId ?? "",
            branchCode: apiData.branchCode ?? "",
            employmentType: apiData.employmentType ?? "XCONICS",
            state: apiData.state ?? "",
            district: apiData.district ?? "",
            baseLocation: apiData.baseLocation ?? "",
            skillSet: apiData.skillSet ?? [],
            assignedDeviceCount: apiData.assignedDeviceCount ?? 0,
            status: apiData.status ?? "ACTIVE",
            joiningDate: formatDateForInput(apiData.joiningDate),
            lastWorkingDate: formatDateForInput(apiData.lastWorkingDate),
            idProofType: apiData.idProofType ?? "AADHAAR",
            idProofNumber: apiData.idProofNumber ?? "",
            currentLatitude: apiData.currentLatitude ?? 0,
            currentLongitude: apiData.currentLongitude ?? 0,
            locationUpdatedAt: formatDateForInput(apiData.locationUpdatedAt),
            remarks: apiData.remarks ?? "",
          };

          console.log("Setting form data to:", newFormData);
          setEngineer(newFormData);
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

  /* =====================
     HANDLE CHANGE
     ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    console.log(`Field changed: ${name} = ${type === "checkbox" ? checked : value}`);

    setEngineer((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* =====================
     HANDLE SKILL SET CHANGE
     ===================== */
  const handleSkillChange = (skill) => {
    setEngineer((prev) => {
      const skillSet = prev.skillSet.includes(skill)
        ? prev.skillSet.filter((s) => s !== skill)
        : [...prev.skillSet, skill];
      return { ...prev, skillSet };
    });
  };

  /* =====================
     HANDLE SUBMIT
     ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Prepare payload with proper types
      const payload = {
        engineerCode: engineer.engineerCode,
        engineerName: engineer.engineerName,
        mobileNo: engineer.mobileNo,
        emailId: engineer.emailId,
        aggregatorId: engineer.aggregatorId,
        branchCode: engineer.branchCode,
        employmentType: engineer.employmentType,
        state: engineer.state,
        district: engineer.district,
        baseLocation: engineer.baseLocation,
        skillSet: engineer.skillSet,
        assignedDeviceCount: Number(engineer.assignedDeviceCount),
        status: engineer.status,
        joiningDate: engineer.joiningDate,
        lastWorkingDate: engineer.lastWorkingDate || engineer.joiningDate,
        idProofType: engineer.idProofType,
        idProofNumber: engineer.idProofNumber,
        currentLatitude: Number(engineer.currentLatitude),
        currentLongitude: Number(engineer.currentLongitude),
        locationUpdatedAt: engineer.locationUpdatedAt || new Date().toISOString().split('T')[0],
        remarks: engineer.remarks,
      };

      console.log("Submitting update with payload:", payload);

      const result = await updateFieldEngineer(id, payload);

      if (result.success) {
        console.log("Field engineer updated successfully:", result.data);
        alert("Field engineer updated successfully!");
        navigate("/engineers");
      } else {
        setError(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error during update:", err);
      setError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="lender-form-page">
        <LenderPageHeader
          title="Field Engineer Master"
          breadcrumbLabel="Field Engineer > Edit"
        />
        <div className="edit-lender-page">
          <div className="card fe-card full-width">
            <h2 className="edit-lender-title">Loading...</h2>
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <div className="spinner"></div>
              <p style={{ marginTop: "1rem", color: "#666" }}>Fetching field engineer data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Field Engineer Master"
        breadcrumbLabel="Field Engineer > Edit"
      />

      <div className="edit-lender-page">
        <div className="card fe-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Edit Field Engineer</h2>
            <div style={{ fontSize: "0.9rem", color: "#666", padding: "0.5rem 1rem", backgroundColor: "#f0f0f0", borderRadius: "4px" }}>
              ID: <strong>{id}</strong>
            </div>
          </div>

          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#f8d7da",
                color: "#721c24",
                borderRadius: "4px",
                border: "1px solid #f5c6cb",
              }}
            >
              {error}
            </div>
          )}

          <form className="fe-form" onSubmit={handleSubmit}>
            {/* BASIC DETAILS */}
            <section>
              <h3>Basic Details</h3>
              <div className="fe-grid">
                <label>
                  Engineer Code (Read-only)
                  <input
                    name="engineerCode"
                    value={engineer.engineerCode}
                    readOnly
                    disabled
                    style={{ backgroundColor: "#f5f5f5" }}
                  />
                </label>

                <label>
                  Engineer Name*
                  <input
                    name="engineerName"
                    value={engineer.engineerName}
                    onChange={handleChange}
                    placeholder="Enter engineer name"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Mobile Number*
                  <input
                    name="mobileNo"
                    value={engineer.mobileNo}
                    onChange={handleChange}
                    placeholder="+91XXXXXXXXXX"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Email ID*
                  <input
                    type="email"
                    name="emailId"
                    value={engineer.emailId}
                    onChange={handleChange}
                    placeholder="engineer@example.com"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* ORGANIZATION */}
            <section>
              <h3>Organization</h3>
              <div className="fe-grid">
                <label>
                  Aggregator*
                  <select
                    name="aggregatorId"
                    value={engineer.aggregatorId}
                    onChange={handleChange}
                    required
                    disabled={submitting || loadingAggregators}
                  >
                    <option value="">Select Aggregator</option>
                    {aggregators.map((agg) => (
                      <option key={agg.id} value={agg.id}>
                        {agg.aggregatorName} ({agg.aggregatorCode})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Branch Code*
                  <input
                    name="branchCode"
                    value={engineer.branchCode}
                    onChange={handleChange}
                    placeholder="Enter branch code"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Employment Type*
                  <select
                    name="employmentType"
                    value={engineer.employmentType}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="XCONICS">Xconics</option>
                    <option value="AGGREGATOR">Aggregator</option>
                  </select>
                </label>

                <label>
                  Status*
                  <select
                    name="status"
                    value={engineer.status}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </label>
              </div>
            </section>

            {/* LOCATION */}
            <section>
              <h3>Location</h3>
              <div className="fe-grid">
                <label>
                  State*
                  <input
                    name="state"
                    value={engineer.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  District*
                  <input
                    name="district"
                    value={engineer.district}
                    onChange={handleChange}
                    placeholder="Enter district"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Base Location*
                  <input
                    name="baseLocation"
                    value={engineer.baseLocation}
                    onChange={handleChange}
                    placeholder="Enter base location"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* SKILLS & DEVICES */}
            <section>
              <h3>Skills & Devices</h3>
              
              <label>Skill Set*</label>
              <div className="skill-checkboxes" style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                {Object.values(SKILL_TYPES).map((skill) => (
                  <label key={skill} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      checked={engineer.skillSet.includes(skill)}
                      onChange={() => handleSkillChange(skill)}
                      disabled={submitting}
                    />
                    {skill}
                  </label>
                ))}
              </div>

              <div className="fe-grid">
                <label>
                  Assigned Device Count*
                  <input
                    type="number"
                    name="assignedDeviceCount"
                    value={engineer.assignedDeviceCount}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* DATES */}
            <section>
              <h3>Dates</h3>
              <div className="fe-grid">
                <label>
                  Joining Date*
                  <input
                    type="date"
                    name="joiningDate"
                    value={engineer.joiningDate}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Last Working Date
                  <input
                    type="date"
                    name="lastWorkingDate"
                    value={engineer.lastWorkingDate}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* ID PROOF */}
            <section>
              <h3>ID Proof</h3>
              <div className="fe-grid">
                <label>
                  ID Proof Type*
                  <select
                    name="idProofType"
                    value={engineer.idProofType}
                    onChange={handleChange}
                    required
                    disabled={submitting}
                  >
                    <option value="AADHAAR">Aadhaar</option>
                    <option value="PAN">PAN</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="VOTER_ID">Voter ID</option>
                    <option value="PASSPORT">Passport</option>
                  </select>
                </label>

                <label>
                  ID Proof Number*
                  <input
                    name="idProofNumber"
                    value={engineer.idProofNumber}
                    onChange={handleChange}
                    placeholder="Enter ID proof number"
                    required
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* CURRENT LOCATION */}
            <section>
              <h3>Current Location</h3>
              <div className="fe-grid">
                <label>
                  Latitude*
                  <input
                    type="number"
                    step="0.000001"
                    name="currentLatitude"
                    value={engineer.currentLatitude}
                    onChange={handleChange}
                    placeholder="28.5355"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Longitude*
                  <input
                    type="number"
                    step="0.000001"
                    name="currentLongitude"
                    value={engineer.currentLongitude}
                    onChange={handleChange}
                    placeholder="77.3910"
                    required
                    disabled={submitting}
                  />
                </label>

                <label>
                  Location Updated At
                  <input
                    type="date"
                    name="locationUpdatedAt"
                    value={engineer.locationUpdatedAt}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* REMARKS */}
            <section>
              <h3>Remarks</h3>
              <div className="fe-grid">
                <label className="full-width">
                  <textarea
                    name="remarks"
                    value={engineer.remarks}
                    onChange={handleChange}
                    placeholder="Enter any additional remarks"
                    rows="4"
                    disabled={submitting}
                  />
                </label>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/engineers")}
                disabled={submitting}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary"
                disabled={submitting || loadingAggregators}
              >
                {submitting ? "Updating..." : "Update Field Engineer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
