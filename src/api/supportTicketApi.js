import API from "./api";


export const getSupportTickets = async (params = {}) => {
  try {
    const response = await API.get("/supportTicket/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch support tickets",
      data: [],
      maxPage: 0,
    };
  }
};


export const getSupportTicketById = async (id) => {
  try {
    const response = await API.get(`/supportTicket/read/${id}`);
    console.log("API Raw Response (Support Ticket):", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching support ticket:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch support ticket",
    };
  }
};


export const createSupportTicket = async (ticketData) => {
  try {
    const response = await API.post("/supportTicket/create", ticketData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Support ticket created successfully",
    };
  } catch (error) {
    console.error("Error creating support ticket:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to create support ticket",
      status: error.response?.status,
    };
  }
};


export const updateSupportTicket = async (id, ticketData) => {
  try {
    const response = await API.put(`/supportTicket/update/${id}`, ticketData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Support ticket updated successfully",
    };
  } catch (error) {
    console.error("Error updating support ticket:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update support ticket",
    };
  }
};


export const deleteSupportTicket = async (id) => {
  try {
    const response = await API.delete(`/supportTicket/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Support ticket deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete support ticket",
    };
  }
};


export const SUPPORT_STATUS = {
  NEW: "NEW",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
};

export const AADHAAR_VERIFICATION_STATUS = {
  VERIFIED: "VERIFIED",
  NOT_VERIFIED: "NOT_VERIFIED",
};

export const CHECKLIST_STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
};

export const BATTERY_BACKUP_STATUS = {
  OK: "OK",
  NOT_OK: "NOT_OK",
};
