import API from "./api";

export const getDeviceMovements = async (params = {}) => {
  try {
    const response = await API.get("/deviceMovement/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching device movements:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch device movements",
      data: [],
      maxPage: 0,
    };
  }
};

export const getDeviceMovementById = async (id) => {
  try {
    const response = await API.get(`/deviceMovement/read/${id}`);
    console.log("API Raw Response (Device Movement):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching device movement:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch device movement",
    };
  }
};

export const createDeviceMovement = async (payload) => {
  try {
    const response = await API.post("/deviceMovement/create", payload);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Device movement created successfully",
    };
  } catch (error) {
    console.error("Error creating device movement:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create device movement",
    };
  }
};

// ✅ FIXED: Matching Prisma Schema enum DeviceMovementType
export const MOVEMENT_TYPES = {
  PROD_TO_WH: "PROD_TO_WH",
  WH_TO_ENGINEER: "WH_TO_ENGINEER",
  ENGINEER_TO_VEHICLE: "ENGINEER_TO_VEHICLE",
};

// ✅ FIXED: Matching Prisma Schema enum MovementEntityType
export const ENTITY_TYPES = {
  PRODUCTION_WAREHOUSE: "PRODUCTION_WAREHOUSE",
  WAREHOUSE: "WAREHOUSE",
  ENGINEER: "ENGINEER",
  VEHICLE: "VEHICLE",
};

// ✅ FIXED: Matching Prisma Schema enum DeviceMovementStatus
export const MOVEMENT_STATUSES = {
  IN_TRANSIT: "IN_TRANSIT",
  RECEIVED: "RECEIVED",
  CANCELLED: "CANCELLED",
};
