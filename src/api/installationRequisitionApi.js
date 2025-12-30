import API from "./api";

export const getInstallationRequisitions = async (params = {}) => {
  try {
    const response = await API.get("/installationRequisition/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching installation requisitions:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch installation requisitions",
      data: [],
      maxPage: 0,
    };
  }
};

export const getInstallationRequisitionById = async (id) => {
  try {
    const response = await API.get(`/installationRequisition/read/${id}`);
    console.log("API Raw Response (Installation Requisition):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching installation requisition:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch installation requisition",
    };
  }
};

export const updateInstallationRequisition = async (id, payload) => {
  try {
    const response = await API.put(`/installationRequisition/update/${id}`, payload);
    console.log("API Raw Response (Update Installation Requisition):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Installation requisition updated successfully",
    };
  } catch (error) {
    console.error("Error updating installation requisition:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update installation requisition",
    };
  }
};

export const REQUISITION_STATUSES = {
  NEW: "NEW",
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  ACCEPTED: "ACCEPTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};


export const PRIORITY_LEVELS = {
  LOW: "LOW",
  NORMAL: "NORMAL",
  HIGH: "HIGH",
  URGENT: "URGENT",
};
