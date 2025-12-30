import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import { createFieldEngineer, EMPLOYMENT_TYPES, STATUSES, ID_PROOF_TYPES, SKILL_TYPES } from "../api/fieldEngineerApi";
import { getAggregators } from "../api/aggregatorApi";
import "./FieldEngineerForm.css";

/* =====================
   DUMMY DATA FOR PREFILL
   ===================== */
const DUMMY_ENGINEER = {
  engineerCode: "FE001",
  engineerName: "Rajesh Kumar",
  mobileNo: "+919876543210",
  emailId: "rajesh.kumar@example.com",
  aggregatorId: "",
  branchCode: "BR001",
  employmentType: "XCONICS",
  state: "Delhi",
  district: "South Delhi",
  baseLocation: "Nehru Place, Delhi",
  skillSet: ["GPS"],
  assignedDeviceCount: 5,
  status: "ACTIVE",
  joiningDate: "2025-01-15",
  lastWorkingDate: "",
  idProofType: "AADHAAR",
  idProofNumber: "123456789012",
  currentLatitude: 28.5355,
  currentLongitude: 77.3910,
  locationUpdatedAt: "2025-12-30",
  remarks: "Experienced field engineer with GPS expertise",
};

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

export default function FieldEngineerForm() {
  const navigate = useNavigate();

  const [engineer, setEngineer] = useState(EMPTY_ENGINEER);
  const [aggregators, setAggregators] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingAggregators, setLoadingAggregators] = useState(true);
  const [error, setError] = useState(null);

  /* =====================
     FETCH AGGREGATORS
     ===================== */
  useEffect(() => {
    const fetchAggregators = async () => {
      setLoadingAggregators(true);
      const result = await getAggregators({ limit: 1000 }); // Get all aggregators
      
      if (result.success) {
        setAggregators(result.data);
      } else {
        console.error("Failed to fetch aggregators:", result.error);
        setError("Failed to load aggregators");
      }
      
      setLoadingAggregators(false);
    };

    fetchAggregators();
  }, []);

  /* =====================
     FILL DUMMY DATA
     ===================== */
  const fillDummyData = () => {
    // Set aggregatorId to first available aggregator if exists
    const dummyWithAggregator = {
      ...DUMMY_ENGINEER,
      aggregatorId: aggregators.length > 0 ? aggregators[0].id : "",
    };
    setEngineer(dummyWithAggregator);
  };

  /* =====================
     HANDLE CHANGE
     ===================== */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
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
    setLoading(true);
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
        lastWorkingDate: engineer.lastWorkingDate || engineer.joiningDate, // Default to joining date if empty
        idProofType: engineer.idProofType,
        idProofNumber: engineer.idProofNumber,
        currentLatitude: Number(engineer.currentLatitude),
        currentLongitude: Number(engineer.currentLongitude),
        locationUpdatedAt: engineer.locationUpdatedAt || new Date().toISOString().split('T')[0],
        remarks: engineer.remarks,
      };

      console.log("Creating field engineer with payload:", payload);

      const result = await createFieldEngineer(payload);

      if (result.success) {
        console.log("Field engineer created successfully:", result.data);
        alert("Field engineer created successfully!");
        navigate("/engineers");
      } else {
        setError(result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lender-form-page">
      <LenderPageHeader
        title="Field Engineer Master"
        breadcrumbLabel="Field Engineer"
      />

      <div className="edit-lender-page">
        <div className="card fe-card full-width">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 className="edit-lender-title" style={{ margin: 0 }}>Add Field Engineer</h2>
            <button 
              type="button" 
              onClick={fillDummyData}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem"
              }}
            >
              Fill Dummy Data
            </button>
          </div>

          {error && (
            <div style={{ 
              padding: "1rem", 
              marginBottom: "1rem", 
              backgroundColor: "#f8d7da", 
              color: "#721c24", 
              borderRadius: "4px",
              border: "1px solid #f5c6cb"
            }}>
              {error}
            </div>
          )}

          <form className="fe-form" onSubmit={handleSubmit}>
            {/* BASIC DETAILS */}
            <section>
              <h3>Basic Details</h3>
              <div className="fe-grid">
                <label>
                  Engineer Code*
                  <input 
                    name="engineerCode" 
                    placeholder="Enter engineer code" 
                    value={engineer.engineerCode}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Engineer Name*
                  <input 
                    name="engineerName" 
                    placeholder="Enter engineer name" 
                    value={engineer.engineerName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Mobile No*
                  <input 
                    name="mobileNo" 
                    placeholder="+91XXXXXXXXXX" 
                    value={engineer.mobileNo}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Email ID*
                  <input 
                    type="email"
                    name="emailId" 
                    placeholder="engineer@example.com" 
                    value={engineer.emailId}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                    disabled={loading || loadingAggregators}
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
                    placeholder="Enter branch code" 
                    value={engineer.branchCode}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Employment Type*
                  <select 
                    name="employmentType" 
                    value={engineer.employmentType}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                    disabled={loading}
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
                    placeholder="Enter state" 
                    value={engineer.state}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  District*
                  <input 
                    name="district" 
                    placeholder="Enter district" 
                    value={engineer.district}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Base Location*
                  <input 
                    name="baseLocation" 
                    placeholder="Enter base location" 
                    value={engineer.baseLocation}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                      disabled={loading}
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
                    placeholder="0" 
                    value={engineer.assignedDeviceCount}
                    onChange={handleChange}
                    min="0"
                    required
                    disabled={loading}
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
                    disabled={loading}
                  />
                </label>

                <label>
                  Last Working Date
                  <input 
                    type="date" 
                    name="lastWorkingDate" 
                    value={engineer.lastWorkingDate}
                    onChange={handleChange}
                    disabled={loading}
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
                    disabled={loading}
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
                    placeholder="Enter ID proof number" 
                    value={engineer.idProofNumber}
                    onChange={handleChange}
                    required
                    disabled={loading}
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
                    placeholder="28.5355" 
                    value={engineer.currentLatitude}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Longitude*
                  <input 
                    type="number"
                    step="0.000001"
                    name="currentLongitude" 
                    placeholder="77.3910" 
                    value={engineer.currentLongitude}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </label>

                <label>
                  Location Updated At
                  <input 
                    type="date"
                    name="locationUpdatedAt" 
                    value={engineer.locationUpdatedAt}
                    onChange={handleChange}
                    disabled={loading}
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
                    placeholder="Enter any additional remarks"
                    value={engineer.remarks}
                    onChange={handleChange}
                    rows="4"
                    disabled={loading}
                  />
                </label>
              </div>
            </section>

            {/* ACTIONS */}
            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate("/engineers")}
                disabled={loading}
              >
                Cancel
              </button>

              <button 
                type="submit" 
                className="primary"
                disabled={loading || loadingAggregators}
              >
                {loading ? "Creating..." : "Create Field Engineer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
