import API from "./api";

/**
 * Get vehicle data packets list with pagination, search, and optional IMEI filter
 * @param {Object} params - Query parameters (imei, search, offset, limit)
 * @returns {Promise} - Response with data packets, message, and pagination info
 */
export const getDataPackets = async (params = {}) => {
  try {
    const response = await API.get("/vehicles/data/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      // Note: API doesn't explicitly show maxPage, but following your pattern
      maxPage: response.data.maxPage || Math.ceil((response.data.total || response.data.data?.length || 0) / (params.limit || 10)),
    };
  } catch (error) {
    console.error("Error fetching data packets:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch data packets",
      data: [],
      maxPage: 0,
    };
  }
};

/**
 * Get vehicle data packet details by SLN
 * @param {string|number} sln - Data packet SLN (Serial Log Number)
 * @returns {Promise} - Response with data packet details
 */
export const getDataPacketBySln = async (sln) => {
  try {
    const response = await API.get(`/vehicles/data/details/${sln}`);
    console.log("Data Packet API Raw Response:", response.data); // Debug log
    
    return {
      success: true,
      data: response.data.data, // Extract nested data object
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching data packet details:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch data packet details",
    };
  }
};
