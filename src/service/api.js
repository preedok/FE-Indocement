import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_REACT_APP_API_URL || "http://api.pmmsmanual.halotec.my.id/api", // Fallback URL
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("API Error:", error.response ? error.response.data : error.message);
        return Promise.reject(error);
    }
);

export default api;
