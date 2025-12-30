import API from "./api";


export const getFieldEngineers = async (params = {}) => {
  try {
    const response = await API.get("/fieldEngineer/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching field engineers:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch field engineers",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get field engineer by ID
 * @param {string} id - Field engineer ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with field engineer data
 */
export const getFieldEngineerById = async (id) => {
  try {
    const response = await API.get(`/fieldEngineer/read/${id}`);
    console.log("API Raw Response (Field Engineer):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching field engineer:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch field engineer",
    };
  }
};

/**
 * Create a new field engineer
 * @param {FieldEngineerData} fieldEngineerData - The field engineer data to create
 * @returns {Promise<ApiResponse>} - Response with created field engineer ID
 */
export const createFieldEngineer = async (fieldEngineerData) => {
  try {
    const response = await API.post("/fieldEngineer/create", fieldEngineerData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Field engineer created successfully",
    };
  } catch (error) {
    console.error("Error creating field engineer:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create field engineer",
      status: error.response?.status,
    };
  }
};

/**
 * Update field engineer
 * @param {string} id - Field engineer ID (UUID)
 * @param {FieldEngineerData} fieldEngineerData - Updated field engineer data
 * @returns {Promise<ApiResponse>} - Response with updated field engineer ID
 */
export const updateFieldEngineer = async (id, fieldEngineerData) => {
  try {
    const response = await API.put(`/fieldEngineer/update/${id}`, fieldEngineerData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Field engineer updated successfully",
    };
  } catch (error) {
    console.error("Error updating field engineer:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update field engineer",
    };
  }
};

/**
 * Delete field engineer
 * @param {string} id - Field engineer ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with deleted field engineer ID
 */
export const deleteFieldEngineer = async (id) => {
  try {
    const response = await API.delete(`/fieldEngineer/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Field engineer deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting field engineer:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete field engineer",
    };
  }
};

// Export constants for enum values
export const EMPLOYMENT_TYPES = {
  XCONICS: "XCONICS",
  AGGREGATOR: "AGGREGATOR",
};

export const STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};

export const ID_PROOF_TYPES = {
  AADHAAR: "AADHAAR",
  PAN: "PAN",
  DRIVING_LICENSE: "DRIVING_LICENSE",
  VOTER_ID: "VOTER_ID",
  PASSPORT: "PASSPORT",
};

export const SKILL_TYPES = {
  GPS: "GPS",
  INSTALLATION: "INSTALLATION",
  MAINTENANCE: "MAINTENANCE",
  REPAIR: "REPAIR",
  SURVEY: "SURVEY",
};
