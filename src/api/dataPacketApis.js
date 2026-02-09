// dataPacketApis.js - PROPER IMEI PASSING
import API from "./api"; // Your API instance
// import { parseNormalPacket } from "../utils/parse-packet"; // Your parser

export const getVehicleDataPackets = async (imei, params = {}) => {
  try {
    // CRITICAL: Pass IMEI as query parameter ?imei=...
    const queryParams = {
      imei,
      ...params,
    };

    const response = await API.get("/vehicles/data/list", {
      params: queryParams,
    });
    // console.log(response.data.data);

    const packets = response.data?.data?.dataPackets || [];

    // const formatted = packets.map((item) => ({
    //   ...parseNormalPacket(item.packet),
    //   imei: item.imei, // Preserve original IMEI
    //   packet_type: item.packet_type || "NRM"
    // }));

    return {
      success: true,
      data: packets,
      message: response.data.message,
      maxPage: response.data.data?.maxPage || 0,
    };
  } catch (error) {
    // console.error("Data packets error:", error.response?.data || error);
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch data packets",
      data: [],
      maxPage: 0,
    };
  }
};

// Alternative version matching your exact getDataPackets format
export const getDataPackets = async (params = {}) => {
  try {
    const response = await API.get("/vehicles/data/list", { params });
    const packets = response.data?.data?.dataPackets || [];

    // const formatted = packets.map((item) => parseNormalPacket(item.packet));

    return {
      success: true,
      data: packets,
      message: response.data.message,
      maxPage: response.data.data?.maxPage || 0,
    };
  } catch (error) {
    return {
      success: false,
      error:
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch data packets",
      data: [],
      maxPage: 0,
    };
  }
};
