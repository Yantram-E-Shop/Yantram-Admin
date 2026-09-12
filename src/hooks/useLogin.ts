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

    // Step 1: Request OTP for 2FA login (this replaces the old direct-login flow)
    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);
        toast.loading("Requesting OTP...");

        try {
            const response = await axios.post("/user/login2FA/admin", {
                email,
                password,
            });

            if (!response.data?.success) {
                setIsLoading(false);
                toast.dismiss();
                const msg = response.data?.message || "Failed to request OTP";
                setError(msg);
                toast.error(msg);
                return { success: false, message: msg };
            }

            setIsLoading(false);
            toast.dismiss();
            toast.success(response.data?.message || "OTP sent to admin email");
            return { success: true };
        } catch (err) {
            if (err instanceof AxiosError) {
                setIsLoading(false);
                toast.dismiss();
                const msg = err.response?.data?.message || "Request failed";
                toast.error(msg);
                setError(msg);
                return { success: false, message: msg };
            }

            setIsLoading(false);
            toast.dismiss();
            const msg = "Request failed";
            toast.error(msg);
            setError(msg);
            return { success: false, message: msg };
        }
    };

    // Step 2: Verify OTP and finish login (generate tokens, set storage, dispatch)
    const verifyOtp = async (email: string, otp: string) => {
        setIsLoading(true);
        setError(null);
        toast.loading("Verifying OTP...");

        try {
            const response = await axios.post("/user/verify-admin-login-otp", {
                email,
                otp,
            });

            if (!response.data?.success) {
                setIsLoading(false);
                toast.dismiss();
                const msg = response.data?.message || "OTP verification failed";
                setError(msg);
                toast.error(msg);
                return { success: false, message: msg };
            }

            const responseObj = response.data.data;

            // store values and update context
            localStorage.setItem("user", JSON.stringify(responseObj.user));
            localStorage.setItem("accessToken", responseObj.accessToken);
            localStorage.setItem("refreshToken", responseObj.refreshToken);
            dispatch({ type: "LOGIN", payload: responseObj });

            setIsLoading(false);
            toast.dismiss();
            toast.success(response.data?.message || "Admin logged in");
            router.push("/");

            return { success: true, data: responseObj };
        } catch (err) {
            if (err instanceof AxiosError) {
                setIsLoading(false);
                toast.dismiss();
                const msg = err.response?.data?.message || "Verification failed";
                toast.error(msg);
                setError(msg);
                return { success: false, message: msg };
            }

            setIsLoading(false);
            toast.dismiss();
            const msg = "Verification failed";
            setError(msg);
            toast.error(msg);
            return { success: false, message: msg };
        }
    };

    return { login, verifyOtp, isLoading, error };
};
