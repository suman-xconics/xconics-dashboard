import API from "./api";



export const getAggregators = async (params = {}) => {
  try {
    const response = await API.get("/aggregator/list", { params });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching aggregators:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch aggregators",
      data: [],
      maxPage: 0,
    };
  }
};


export const getAggregatorById = async (id) => {
  try {
    const response = await API.get(`/aggregator/read/${id}`);
    console.log("API Raw Response (Aggregator):", response.data);
    
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching aggregator:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to fetch aggregator",
    };
  }
};


export const createAggregator = async (aggregatorData) => {
  try {
    const response = await API.post("/aggregator/create", aggregatorData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Aggregator created successfully",
    };
  } catch (error) {
    console.error("Error creating aggregator:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to create aggregator",
      status: error.response?.status,
    };
  }
};


export const updateAggregator = async (id, aggregatorData) => {
  try {
    const response = await API.put(`/aggregator/update/${id}`, aggregatorData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Aggregator updated successfully",
    };
  } catch (error) {
    console.error("Error updating aggregator:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to update aggregator",
    };
  }
};


export const deleteAggregator = async (id) => {
  try {
    const response = await API.delete(`/aggregator/delete/${id}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Aggregator deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting aggregator:", error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || "Failed to delete aggregator",
    };
  }
};

// Export constants for enum values
export const SERVICE_TYPES = {
  INSTALLATION: "INSTALLATION",
  MAINTENANCE: "MAINTENANCE",
  REPAIR: "REPAIR",
  SURVEY: "SURVEY",
};

export const BILLING_CYCLES = {
  WEEKLY: "WEEKLY",
  MONTHLY: "MONTHLY",
  QUARTERLY: "QUARTERLY",
  YEARLY: "YEARLY",
};

export const STATUSES = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
};
