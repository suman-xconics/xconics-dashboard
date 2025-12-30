import axios from "axios";

const BASE_URL = "http://172.105.36.66:8020";

// 🔑 Token (temporary / from localStorage)
const TOKEN = localStorage.getItem("token");
// change key name if needed (accessToken / jwt)

/* =========================
   GET DEVICE MOVEMENTS
   ========================= */
export const getDeviceMovements = (params) => {
    return axios.get(`${BASE_URL}/deviceMovement/list`, {
        params: {
            offset: params?.offset || 0,
            limit: params?.limit || 10,
        },
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });
};

/* =========================
   CREATE DEVICE MOVEMENT
   ========================= */
export const createDeviceMovement = (payload) => {
    return axios.post(`${BASE_URL}/deviceMovement/create`, payload, {
        headers: {
            Authorization: `Bearer ${TOKEN}`,
        },
    });
};