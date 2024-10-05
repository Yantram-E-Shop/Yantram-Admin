"use client";
import { useAuthContext } from "@/hooks/useAuthContext";
import axios from "@/api/axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export const useLogout = () => {
  const { dispatch } = useAuthContext();
  const router = useRouter();

  const logout = async () => {
    const accessToken = localStorage.getItem("accessToken");
    const response = await axios.post("/user/logout", {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    const responseObj = await response.data.data;
    console.log(responseObj);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    dispatch({ type: "LOGOUT" });
    toast.success(response.data.message);
    router.push("/login");
  };

  return { logout };
};
