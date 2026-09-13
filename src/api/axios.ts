import axios from "axios";

export const BASE_URL = "/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
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
    async (error) => {
        const originalRequest = error.config;
        const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

        if (error.response?.status === 401 && refreshToken && !originalRequest?._retry) {
            originalRequest._retry = true;
            try {
                const response = await axios.post(
                    `${BASE_URL}/user/refresh-token`,
                    {
                        refreshToken: refreshToken,
                    }
                );

                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                window.location.assign("/login");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
