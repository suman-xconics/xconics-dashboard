
import API from "./api"; // Your API instance

// Ignition Off Records API - PROPER IMEI PASSING
export const getVehicleIgnitionOffRecords = async (imei, params = {}) => {
  try {
    // CRITICAL: Pass IMEI as query parameter ?imei=...
    const queryParams = {
      imei,
      ...params, // search, offset, limit
    };

    const response = await API.get("/vehicles/ignitionoffrecords/list", {
      params: queryParams,
    });

    const records = response.data?.data || [];

    return {
      success: true,
      data: records,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch ignition off records",
      data: [],
    };
  }
};
