import API from "./api";

export const getVehicleAlerts = async (params = {}) => {
  try {
    const response = await API.get("/vehicles/alerts/list", { params });
    return {
      success: true,
      data: response.data.data?.alerts || response.data.data || [],
      message: response.data.message,
      maxPage: response.data.data?.maxPage || response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching vehicle alerts:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch vehicle alerts",
      data: [],
      maxPage: 0,
    };
  }
};


export const getVehicleAlertBySln = async (sln) => {
  try {
    const response = await API.get(`/vehicles/alert/details/${sln}`);
    console.log("Alert API Raw Response:", response.data); // Debug log

    return {
      success: true,
      data: response.data.data, // Extract nested data object
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching alert details:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch alert details",
    };
  }
};

export const deleteVehicleAlert = async (sln) => {
  try {
    const response = await API.delete(`/vehicles/alert/delete/${sln}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Alert deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting alert:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete alert",
    };
  }
};
