import API from "./api";

export const getFieldEngineerPincodeMappings = async (params = {}) => {
  try {
    const response = await API.get("/fieldEngineerPincodeMapping/list", {
      params,
    });
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
      maxPage: response.data.maxPage || 0,
    };
  } catch (error) {
    console.error("Error fetching field engineer pincode mappings:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pincode mappings",
      data: [],
      maxPage: 0,
    };
  }
};

export const getFieldEngineerPincodeMappingById = async (id) => {
  try {
    const response = await API.get(`/fieldEngineerPincodeMapping/read/${id}`);
    console.log("API Raw Response (Pincode Mapping):", response.data);

    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    console.error("Error fetching pincode mapping:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pincode mapping",
    };
  }
};

export const getFieldEngineerPincodeMappingsByEngineerId = async (
  engineerId,
) => {
  try {
    const response = await API.get(
      `/fieldEngineerPincodeMapping/engineer/${engineerId}`,
    );
    return {
      success: true,
      data: response.data.data || [],
      message:
        response.data.message || "Field engineer mappings fetched successfully",
    };
  } catch (error) {
    console.error("Error fetching field engineer pincode mappings:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch pincode mappings",
      data: [],
    };
  }
};

export const createFieldEngineerPincodeMapping = async (mappingData) => {
  try {
    const response = await API.post(
      "/fieldEngineerPincodeMapping/create",
      mappingData,
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Pincode mapping created successfully",
    };
  } catch (error) {
    console.error("Error creating pincode mapping:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to create pincode mapping",
      status: error.response?.status,
    };
  }
};

export const updateFieldEngineerPincodeMapping = async (id, mappingData) => {
  try {
    const response = await API.put(
      `/fieldEngineerPincodeMapping/update/${id}`,
      mappingData,
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Pincode mapping updated successfully",
    };
  } catch (error) {
    console.error("Error updating pincode mapping:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to update pincode mapping",
    };
  }
};

export const deleteFieldEngineerPincodeMapping = async (id) => {
  try {
    const response = await API.delete(
      `/fieldEngineerPincodeMapping/delete/${id}`,
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message || "Pincode mapping deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting pincode mapping:", error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to delete pincode mapping",
    };
  }
};
