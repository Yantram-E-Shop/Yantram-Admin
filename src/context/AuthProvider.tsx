"use client";
import React, { useState, ReactNode } from "react";
import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const initialAuth = {
        email: "",
        role: "",
        fullName: "",
        phoneNumber: "",
        avatarName: "",
        isVerified: false,
    }

    const [auth, setAuth] = useState({ user: initialAuth, accessToken: "" });

    return (
        <AuthContext.Provider value={{ auth, setAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
