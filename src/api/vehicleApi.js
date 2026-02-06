import API from "./api";


export const getVehicles = async (params = {}) => {
  try {
    const response = await API.get("/vehicles/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch vehicles",
      data: [],
      maxPage: 0,
    };
  }
};


export const getVehicleByVehicleNo = async (vehicleNo) => {
  try {
    const response = await API.get(`/vehicles/read/${vehicleNo}`);
    console.log("API Raw Response:", response.data); // Debug log

    return {
      success: true,
      data: response.data.data, // Extract nested data object
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch vehicle",
    };
  }
};
