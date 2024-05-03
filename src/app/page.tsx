"use client";
import LoginForm from "@/components/LoginForm";
import { useAuth } from "@/context/AuthContext";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useRefreshToken from "@/hooks/useRefreshToken";
import Image from "next/image";
import { useEffect } from "react";

export default function Home() {
    const { auth } = useAuth();

    console.log(auth.accessToken);

    const refresh = useRefreshToken();

    if (!auth.accessToken) {
        return (
            <>
                <LoginForm />
            </>
        );
    } else {
        return (
            <>
                <h1>You are logged in as admin</h1>
                <button onClick={() => {refresh()}}>refresh token</button>
            </>
        );
    }
}
