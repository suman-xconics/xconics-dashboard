import API from "./api";

/**
 * Get vehicle health packets list with pagination, search, and optional IMEI filter
 * @param {Object} params - Query parameters (imei, search, offset, limit)
 * @returns {Promise} - Response with health packets data, message, and maxPage
 */
export const getHealthPackets = async (params = {}) => {
  try {
    const response = await API.get("/vehicles/healthpacket/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching health packets:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch health packets",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get vehicle health packet details by SLN
 * @param {string|number} sln - Health packet SLN (Serial Log Number)
 * @returns {Promise} - Response with health packet details
 */
export const getHealthPacketBySln = async (sln) => {
  try {
    const response = await API.get(`/vehicles/healthpacket/details/${sln}`);
    console.log("Health Packet API Raw Response:", response.data); // Debug log
    
    return {
      success: true,
      data: response.data.data, // Extract nested data object
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching health packet details:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch health packet details",
    };
  }
};

/**
 * Delete vehicle health packet by SLN
 * @param {string|number} sln - Health packet SLN (Serial Log Number)
 * @returns {Promise} - Response with deleted health packet details
 */
export const deleteHealthPacket = async (sln) => {
  try {
    const response = await API.delete(`/vehicles/healthpacket/delete/${sln}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Health packet deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting health packet:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete health packet",
    };
  }
};
