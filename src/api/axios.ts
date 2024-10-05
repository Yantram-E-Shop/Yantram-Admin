import axios from "axios";
import { useRouter } from "next/router";

export const BASE_URL = "http://13.126.92.193:5000/api/v1";

const api = axios.create({
    baseURL: BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
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
        const refreshToken = localStorage.getItem("refreshToken");

        if (error.response.status === 401 && refreshToken) {
            try {
                const response = await axios.post(
                    `${BASE_URL}/user/refresh-token`,
                    {
                        refreshToken: refreshToken,
                    }
                );

                localStorage.setItem("accessToken", response.data.accessToken);
                localStorage.setItem("refreshToken", response.data.refreshToken);
                originalRequest.headers.Authorization = `Bearer ${response.data.access}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                const router = useRouter();
                router.push("/login");
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
