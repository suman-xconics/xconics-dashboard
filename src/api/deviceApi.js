import API from "./api";

export const getDevices = async (params = {}) => {
  try {
    const response = await API.get("/device/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching devices:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch devices",
      data: [],
      maxPage: 0,
    };
  }
};

export const getDeviceById = async (id) => {
  try {
    const response = await API.get(`/device/read/${id}`);
    console.log("API Raw Response (Device):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching device:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch device",
    };
  }
};

export const createDevice = async (deviceData) => {
  try {
    const response = await API.post("/device/create", deviceData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Device created successfully",
    };
  } catch (error) {
    console.error("Error creating device:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create device",
      status: error.response?.status,
    };
  }
};

export const updateDevice = async (id, deviceData) => {
  try {
    const response = await API.put(`/device/update/${id}`, deviceData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Device updated successfully",
    };
  } catch (error) {
    console.error("Error updating device:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update device",
    };
  }
};

export const deleteDevice = async (id) => {
  try {
    const response = await API.delete(`/device/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Device deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting device:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete device",
    };
  }
};

export const getDevicesByFieldEngineer = async (fieldEngineerId, options = {}) => {
  return getDevices({
    fieldEngineerId,
    ...options,
  });
};

export const getDevicesByLocationType = async (locationType, options = {}) => {
  return getDevices({
    locationType,
    ...options,
  });
};

export const LOCATION_TYPES = {
  PRODUCTION_FLOOR: "PRODUCTION_FLOOR",
  WAREHOUSE: "WAREHOUSE",
  FIELD_ENGINEER: "FIELD_ENGINEER",
  VEHICLE: "VEHICLE",
};

export const MOVEMENT_TYPES = {
  PROD_TO_WH: "PROD_TO_WH",
  WH_TO_FE: "WH_TO_FE",
  FE_TO_WH: "FE_TO_WH",
  WH_TO_VEHICLE: "WH_TO_VEHICLE",
  VEHICLE_TO_FE: "VEHICLE_TO_FE",
};

export const ENTITY_TYPES = {
  PRODUCTION_WAREHOUSE: "PRODUCTION_WAREHOUSE",
  FIELD_ENGINEER: "FIELD_ENGINEER",
  VEHICLE: "VEHICLE",
};

export const MOVEMENT_STATUSES = {
  IN_TRANSIT: "IN_TRANSIT",
  DELIVERED: "DELIVERED",
  RETURNED: "RETURNED",
  CANCELLED: "CANCELLED",
};
