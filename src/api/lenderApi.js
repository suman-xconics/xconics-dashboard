import API from "./api";

/**
 * Get lenders with pagination and search
 * @param {Object} params - Query parameters (search, offset, limit)
 * @returns {Promise} - Response with data, message, and maxPage
 */
export const getLenders = async (params = {}) => {
  try {
    const response = await API.get("/lender/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching lenders:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch lenders",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get lender by ID
 * @param {string} id - Lender ID
 * @returns {Promise} - Axios response promise
 */
export const getLenderById = async (id) => {
  try {
    const response = await API.get(`/lender/read/${id}`);
    console.log("API Raw Response:", response.data); // Debug log
    
    return {
      success: true,
      data: response.data.data, // Extract nested data object
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching lender:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch lender",
    };
  }
};

/**
 * Create a new lender
 * @param {Object} lenderData - The lender data to create
 * @returns {Promise} - Axios response promise
 */
export const createLender = async (lenderData) => {
  try {
    const response = await API.post("/lender/create", lenderData);
    return {
      success: true,
      data: response.data,
      message: "Lender created successfully",
    };
  } catch (error) {
    console.error("Error creating lender:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create lender",
      status: error.response?.status,
    };
  }
};

/**
 * Update lender
 * @param {string} id - Lender ID
 * @param {Object} lenderData - Updated lender data
 * @returns {Promise} - Axios response promise
 */
export const updateLender = async (id, lenderData) => {
  try {
    const response = await API.put(`/lender/update/${id}`, lenderData);
    return {
      success: true,
      data: response.data,
      message: "Lender updated successfully",
    };
  } catch (error) {
    console.error("Error updating lender:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update lender",
    };
  }
};

/**
 * Delete lender
 * @param {string} id - Lender ID
 * @returns {Promise} - Axios response promise
 */
export const deleteLender = async (id) => {
  try {
    const response = await API.delete(`/lender/delete/${id}`);
    return {
      success: true,
      data: response.data,
      message: "Lender deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting lender:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete lender",
    };
  }
};
