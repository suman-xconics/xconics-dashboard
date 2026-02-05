/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LenderPageHeader from "../components/LenderPageHeader";
import { getFieldEngineerById, updateFieldEngineer, EMPLOYMENT_TYPES, STATUSES, ID_PROOF_TYPES, SKILL_TYPES } from "../api/fieldEngineerApi";
import { 
  getFieldEngineerPincodeMappingsByEngineerId,
  createFieldEngineerPincodeMapping,
  updateFieldEngineerPincodeMapping,
  deleteFieldEngineerPincodeMapping 
} from "../api/fieldEngineerPinocdeMapping";
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

const EMPTY_PINCODE_MAPPING = {
  mappingPincode: "",
  state: "",
  district: "",
  isActive: true,
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

  // Pincode mapping states
  const [pincodeMappings, setPincodeMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [newMapping, setNewMapping] = useState(EMPTY_PINCODE_MAPPING);
  const [savingMapping, setSavingMapping] = useState(false);
  
  // Edit mode states
  const [editingMappingId, setEditingMappingId] = useState(null);
  const [editMapping, setEditMapping] = useState(null);
  const [updatingMapping, setUpdatingMapping] = useState(false);


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
     FETCH PINCODE MAPPINGS
     ===================== */
  const fetchPincodeMappings = async () => {
    if (!id) return;

    setLoadingMappings(true);
    try {
      // Use the new engineer-specific endpoint
      const result = await getFieldEngineerPincodeMappingsByEngineerId(id);

      if (result.success) {
        setPincodeMappings(result.data);
      } else {
        console.error("Failed to fetch pincode mappings:", result.error);
        setPincodeMappings([]);
      }
    } catch (err) {
      console.error("Error fetching pincode mappings:", err);
      setPincodeMappings([]);
    } finally {
      setLoadingMappings(false);
    }
  };

  useEffect(() => {
    fetchPincodeMappings();
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
     HANDLE PINCODE MAPPING CHANGE (New Mapping)
     ===================== */
  const handleMappingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMapping((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  /* =====================
     HANDLE EDIT MAPPING CHANGE
     ===================== */
  const handleEditMappingChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditMapping((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  /* =====================
     START EDITING MAPPING
     ===================== */
  const handleEditClick = (mapping) => {
    setEditingMappingId(mapping.id);
    setEditMapping({
      mappingPincode: mapping.mappingPincode,
      state: mapping.state,
      district: mapping.district,
      isActive: mapping.isActive,
    });
  };


  /* =====================
     CANCEL EDITING
     ===================== */
  const handleCancelEdit = () => {
    setEditingMappingId(null);
    setEditMapping(null);
  };


  /* =====================
     UPDATE PINCODE MAPPING
     ===================== */
  const handleUpdatePincodeMapping = async () => {
    if (!editMapping) return;

    // Validation
    if (!editMapping.mappingPincode.trim()) {
      alert("Please enter a pincode");
      return;
    }
    if (!editMapping.state.trim()) {
      alert("Please enter a state");
      return;
    }
    if (!editMapping.district.trim()) {
      alert("Please enter a district");
      return;
    }

    setUpdatingMapping(true);
    try {
      const result = await updateFieldEngineerPincodeMapping(editingMappingId, {
        fieldEngineerId: id,
        ...editMapping,
      });

      if (result.success) {
        alert("Pincode mapping updated successfully!");

        // Refresh the mappings list
        await fetchPincodeMappings();

        // Reset edit state
        setEditingMappingId(null);
        setEditMapping(null);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error updating pincode mapping:", err);
      alert("An unexpected error occurred");
    } finally {
      setUpdatingMapping(false);
    }
  };


  /* =====================
     ADD PINCODE MAPPING
     ===================== */
  const handleAddPincodeMapping = async () => {
    // Validation
    if (!newMapping.mappingPincode.trim()) {
      alert("Please enter a pincode");
      return;
    }
    if (!newMapping.state.trim()) {
      alert("Please enter a state");
      return;
    }
    if (!newMapping.district.trim()) {
      alert("Please enter a district");
      return;
    }

    setSavingMapping(true);
    try {
      const result = await createFieldEngineerPincodeMapping({
        fieldEngineerId: id,
        ...newMapping,
      });

      if (result.success) {
        alert("Pincode mapping added successfully!");

        // Refresh the mappings list
        await fetchPincodeMappings();

        // Reset form
        setNewMapping(EMPTY_PINCODE_MAPPING);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error adding pincode mapping:", err);
      alert("An unexpected error occurred");
    } finally {
      setSavingMapping(false);
    }
  };


  /* =====================
     DELETE PINCODE MAPPING
     ===================== */
  const handleDeletePincodeMapping = async (mappingId) => {
    if (!confirm("Are you sure you want to delete this pincode mapping?")) {
      return;
    }

    try {
      const result = await deleteFieldEngineerPincodeMapping(mappingId);

      if (result.success) {
        alert("Pincode mapping deleted successfully!");

        // Refresh the mappings list
        await fetchPincodeMappings();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (err) {
      console.error("Error deleting pincode mapping:", err);
      alert("An unexpected error occurred");
    }
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
                    placeholder="22.5726"
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
                    placeholder="88.3639"
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

        {/* PINCODE MAPPING SECTION */}
        <div className="card fe-card full-width" style={{ marginTop: "2rem" }}>
          <h2 className="edit-lender-title">Pincode Mappings</h2>

          {/* Add New Mapping Form */}
          <div style={{ 
            backgroundColor: "#f8f9fa", 
            padding: "1.5rem", 
            borderRadius: "8px", 
            marginBottom: "1.5rem",
            border: "1px solid #e0e0e0"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", color: "#333" }}>
              Add New Pincode Mapping
            </h3>

            <div className="fe-grid" style={{ marginBottom: "1rem" }}>
              <label>
                Pincode*
                <input
                  name="mappingPincode"
                  value={newMapping.mappingPincode}
                  onChange={handleMappingChange}
                  placeholder="700001"
                  disabled={savingMapping}
                  maxLength="6"
                />
              </label>

              <label>
                State*
                <input
                  name="state"
                  value={newMapping.state}
                  onChange={handleMappingChange}
                  placeholder="West Bengal"
                  disabled={savingMapping}
                />
              </label>

              <label>
                District*
                <input
                  name="district"
                  value={newMapping.district}
                  onChange={handleMappingChange}
                  placeholder="Kolkata"
                  disabled={savingMapping}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1.8rem" }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newMapping.isActive}
                  onChange={handleMappingChange}
                  disabled={savingMapping}
                />
                Active
              </label>
            </div>

            <button
              type="button"
              onClick={handleAddPincodeMapping}
              disabled={savingMapping}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "4px",
                cursor: savingMapping ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                fontWeight: "500",
                opacity: savingMapping ? 0.6 : 1,
              }}
            >
              {savingMapping ? "Adding..." : "+ Add Pincode Mapping"}
            </button>
          </div>

          {/* Existing Mappings Table */}
          <div>
            <h3 style={{ marginBottom: "1rem", fontSize: "1rem", color: "#333" }}>
              Existing Mappings ({pincodeMappings.length})
            </h3>

            {loadingMappings ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
                Loading mappings...
              </div>
            ) : pincodeMappings.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "2rem", 
                color: "#666",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px dashed #ccc"
              }}>
                No pincode mappings found. Add one above to get started.
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  backgroundColor: "white",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  overflow: "hidden"
                }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                        Pincode
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                        State
                      </th>
                      <th style={{ padding: "1rem", textAlign: "left", fontWeight: "600", color: "#495057" }}>
                        District
                      </th>
                      <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "#495057" }}>
                        Status
                      </th>
                      <th style={{ padding: "1rem", textAlign: "center", fontWeight: "600", color: "#495057", width: "200px" }}>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pincodeMappings.map((mapping) => (
                      <tr 
                        key={mapping.id}
                        style={{ 
                          borderBottom: "1px solid #dee2e6",
                          backgroundColor: editingMappingId === mapping.id ? "#fff3cd" : "white"
                        }}
                      >
                        {editingMappingId === mapping.id ? (
                          // EDIT MODE
                          <>
                            <td style={{ padding: "1rem" }}>
                              <input
                                name="mappingPincode"
                                value={editMapping.mappingPincode}
                                onChange={handleEditMappingChange}
                                placeholder="700001"
                                disabled={updatingMapping}
                                maxLength="6"
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                  fontSize: "0.9rem"
                                }}
                              />
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <input
                                name="state"
                                value={editMapping.state}
                                onChange={handleEditMappingChange}
                                placeholder="West Bengal"
                                disabled={updatingMapping}
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                  fontSize: "0.9rem"
                                }}
                              />
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <input
                                name="district"
                                value={editMapping.district}
                                onChange={handleEditMappingChange}
                                placeholder="Kolkata"
                                disabled={updatingMapping}
                                style={{
                                  width: "100%",
                                  padding: "0.5rem",
                                  border: "1px solid #ced4da",
                                  borderRadius: "4px",
                                  fontSize: "0.9rem"
                                }}
                              />
                            </td>
                            <td style={{ padding: "1rem", textAlign: "center" }}>
                              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                <input
                                  type="checkbox"
                                  name="isActive"
                                  checked={editMapping.isActive}
                                  onChange={handleEditMappingChange}
                                  disabled={updatingMapping}
                                />
                                Active
                              </label>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                <button
                                  onClick={handleUpdatePincodeMapping}
                                  disabled={updatingMapping}
                                  style={{
                                    backgroundColor: "#28a745",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "4px",
                                    cursor: updatingMapping ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    opacity: updatingMapping ? 0.6 : 1,
                                  }}
                                >
                                  {updatingMapping ? "Updating..." : "Update"}
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  disabled={updatingMapping}
                                  style={{
                                    backgroundColor: "#6c757d",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "4px",
                                    cursor: updatingMapping ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    opacity: updatingMapping ? 0.6 : 1,
                                  }}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          // VIEW MODE
                          <>
                            <td style={{ padding: "1rem", fontWeight: "600", color: "#212529" }}>
                              {mapping.mappingPincode}
                            </td>
                            <td style={{ padding: "1rem", color: "#495057" }}>
                              {mapping.state}
                            </td>
                            <td style={{ padding: "1rem", color: "#495057" }}>
                              {mapping.district}
                            </td>
                            <td style={{ padding: "1rem", textAlign: "center" }}>
                              <span style={{
                                padding: "0.25rem 0.75rem",
                                borderRadius: "12px",
                                fontSize: "0.8rem",
                                fontWeight: "500",
                                backgroundColor: mapping.isActive ? "#d4edda" : "#f8d7da",
                                color: mapping.isActive ? "#155724" : "#721c24",
                              }}>
                                {mapping.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td style={{ padding: "1rem" }}>
                              <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                                <button
                                  onClick={() => handleEditClick(mapping)}
                                  disabled={editingMappingId !== null}
                                  style={{
                                    backgroundColor: "#007bff",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "4px",
                                    cursor: editingMappingId !== null ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    opacity: editingMappingId !== null ? 0.6 : 1,
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeletePincodeMapping(mapping.id)}
                                  disabled={editingMappingId !== null}
                                  style={{
                                    backgroundColor: "#dc3545",
                                    color: "white",
                                    border: "none",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "4px",
                                    cursor: editingMappingId !== null ? "not-allowed" : "pointer",
                                    fontSize: "0.85rem",
                                    fontWeight: "500",
                                    opacity: editingMappingId !== null ? 0.6 : 1,
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}