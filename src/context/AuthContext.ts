import React, { createContext, useContext, Dispatch, SetStateAction, Context } from "react";

interface User {
    email: string;
    role: string;
    fullName: string;
    phoneNumber: string;
    avatarName: string;
    isVerified: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    __v?: number;
}

interface AuthState {
    user: User;
    accessToken: string;
    refreshToken?: string;
}

interface AuthContextType {
    auth: AuthState;
    setAuth: Dispatch<SetStateAction<AuthState>>;
}

const initialAuthState: AuthState = {
    user: {
        email: "",
        role: "",
        fullName: "",
        phoneNumber: "",
        avatarName: "",
        isVerified: false,
    },
    accessToken: "",
};

export const AuthContext = createContext<AuthContextType>({
    auth: initialAuthState,
    setAuth: () => {},
});

export const useAuth = () => useContext(AuthContext);
