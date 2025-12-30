import API from "./api";


export const getLenderBranches = async (params = {}) => {
  try {
    const response = await API.get("/lenderBranch/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching lender branches:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch lender branches",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get lender branch by ID
 * @param {string} id - Lender branch ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with lender branch data
 */
export const getLenderBranchById = async (id) => {
  try {
    const response = await API.get(`/lenderBranch/read/${id}`);
    console.log("API Raw Response (Lender Branch):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching lender branch:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch lender branch",
    };
  }
};

/**
 * Create a new lender branch
 * @param {LenderBranchData} branchData - The lender branch data to create
 * @returns {Promise<ApiResponse>} - Response with created lender branch ID
 */
export const createLenderBranch = async (branchData) => {
  try {
    const response = await API.post("/lenderBranch/create", branchData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Lender branch created successfully",
    };
  } catch (error) {
    console.error("Error creating lender branch:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create lender branch",
      status: error.response?.status,
    };
  }
};

/**
 * Update lender branch
 * @param {string} id - Lender branch ID (UUID)
 * @param {LenderBranchData} branchData - Updated lender branch data
 * @returns {Promise<ApiResponse>} - Response with updated lender branch ID
 */
export const updateLenderBranch = async (id, branchData) => {
  try {
    const response = await API.put(`/lenderBranch/update/${id}`, branchData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Lender branch updated successfully",
    };
  } catch (error) {
    console.error("Error updating lender branch:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update lender branch",
    };
  }
};

/**
 * Delete lender branch
 * @param {string} id - Lender branch ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with deleted lender branch ID
 */
export const deleteLenderBranch = async (id) => {
  try {
    const response = await API.delete(`/lenderBranch/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Lender branch deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting lender branch:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete lender branch",
    };
  }
};

// Export constants for enum values
export const BRANCH_TYPES = {
  HO: "HO",      // Head Office
  RO: "RO",      // Regional Office
  BO: "BO",      // Branch Office
};

export const STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};
