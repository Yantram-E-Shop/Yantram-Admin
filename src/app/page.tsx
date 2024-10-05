"use client";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useLogout } from "@/hooks/useLogout";
import React from "react";

export default function Home() {
  useAuthRedirect();
  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <h1>You are logged in as admin</h1>
      <button onClick={handleLogout}>Logout</button>
    </>
  );
}