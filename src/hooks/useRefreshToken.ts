import axios from "@/api/axios";
import { useAuth } from "@/context/AuthContext";

const useRefreshToken = () => {
    const { setAuth } = useAuth();
    const refreshToken = localStorage.getItem('refreshToken');

    const refresh = async () => {
        const response = await axios.post('/user/refresh-token', {
           refreshToken: refreshToken,
        });
        localStorage.setItem('refreshToken', response?.data?.data.refreshToken);
        setAuth(prev => {
            console.log(JSON.stringify(prev));
            console.log(response.data.data.accessToken);
            return { ...prev, accessToken: response.data.data.accessToken }
        });
        return response.data.data.accessToken;
    }
    return refresh;
};

export default useRefreshToken;