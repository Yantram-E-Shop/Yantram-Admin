"use client";
import { useState } from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import axios from "@/api/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const useLogin = () => {
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { dispatch } = useAuthContext();
    const router = useRouter();

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        toast.loading("Logging in...");

        try {
            const response = await axios.post("/user/login/admin", {
                email,
                password,
            });

            console.log(response);
            const responseObj = await response.data.data;

            if (!response.data?.success) {
                setIsLoading(false);
                setError(response.data?.message);
            }
            if (response.data.success) {
                localStorage.setItem("user", responseObj.user);
                localStorage.setItem("accessToken", responseObj.accessToken);
                localStorage.setItem("refreshToken", responseObj.refreshToken);
                dispatch({ type: "LOGIN", payload: responseObj });
                setIsLoading(false);
                toast.dismiss();
                toast.success(response.data?.message);
                router.push("/");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                setIsLoading(false);
                toast.dismiss();
                toast.error(error.response?.data?.message)
                setError(error.response?.data?.message);
            }
        }
    };

    return { login, isLoading, error };
};
