import axios from "axios";

const API = axios.create({
    baseURL: "http://172.105.61.24:8020",
    headers: {
        "Content-Type": "application/json",
    },
});

// 🔐 Attach token automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `${token}`;
    }
    return config;
});

export default API;
