import API from "./api";


export const getWarehouses = async (params = {}) => {
  try {
    const response = await API.get("/warehouse/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch warehouses",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get warehouse by ID
 * @param {string} id - Warehouse ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with warehouse data
 */
export const getWarehouseById = async (id) => {
  try {
    const response = await API.get(`/warehouse/read/${id}`);
    console.log("API Raw Response (Warehouse):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch warehouse",
    };
  }
};

/**
 * Create a new warehouse
 * @param {WarehouseData} warehouseData - The warehouse data to create
 * @returns {Promise<ApiResponse>} - Response with created warehouse ID
 */
export const createWarehouse = async (warehouseData) => {
  try {
    const response = await API.post("/warehouse/create", warehouseData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Warehouse created successfully",
    };
  } catch (error) {
    console.error("Error creating warehouse:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create warehouse",
      status: error.response?.status,
    };
  }
};

/**
 * Update warehouse
 * @param {string} id - Warehouse ID (UUID)
 * @param {WarehouseData} warehouseData - Updated warehouse data
 * @returns {Promise<ApiResponse>} - Response with updated warehouse ID
 */
export const updateWarehouse = async (id, warehouseData) => {
  try {
    const response = await API.put(`/warehouse/update/${id}`, warehouseData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Warehouse updated successfully",
    };
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update warehouse",
    };
  }
};

/**
 * Delete warehouse
 * @param {string} id - Warehouse ID (UUID)
 * @returns {Promise<ApiResponse>} - Response with deleted warehouse ID
 */
export const deleteWarehouse = async (id) => {
  try {
    const response = await API.delete(`/warehouse/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Warehouse deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete warehouse",
    };
  }
};

// Export constants for enum values
export const WAREHOUSE_TYPES = {
  PRODUCTION: "PRODUCTION",
  LOCAL: "LOCAL",
  REGIONAL: "REGIONAL",
};

export const OWNER_TYPES = {
  XCONICS: "XCONICS",
  AGGREGATOR: "AGGREGATOR",
};

export const STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};
