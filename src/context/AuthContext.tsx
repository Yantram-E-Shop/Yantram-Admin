"use client";
import React, {
    createContext,
    useReducer,
    ReactNode,
    FC,
    useEffect,
    useState,
} from "react";

import { jwtDecode } from "jwt-decode";
interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
}

interface AuthProviderProps {
    children: ReactNode;
}

export interface AuthContextProps extends AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    dispatch: React.Dispatch<any>;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
    undefined
);

export const authReducer = (
    state: AuthState,
    action: { type: string; payload?: any }
) => {
    switch (action.type) {
        case "LOGIN":
            return {
                accessToken: action.payload.accessToken,
                refreshToken: action.payload.refreshToken,
            };
        case "LOGOUT":
            return { accessToken: null, refreshToken: null, user: null };
        default:
            return state;
    }
};

const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;
    try {
        const { exp } = jwtDecode<{ exp: number }>(token);
        if (Date.now() >= exp * 1000) {
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
};

export const AuthContextProvider: FC<AuthProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [state, dispatch] = useReducer(authReducer, {
        accessToken: null, // Initially set to null
        refreshToken: null,
    });

    useEffect(() => {
        // Only access localStorage after component mounts (client-side)
        if (typeof window !== "undefined") {
            const storedAuth: AuthState = {
                accessToken: localStorage.getItem("accessToken") ?? null,
                refreshToken: localStorage.getItem("refreshToken") ?? null,
            };

            if (storedAuth && isTokenValid(storedAuth.accessToken)) {
                dispatch({
                    type: "LOGIN",
                    payload: storedAuth,
                });
            } else {
                dispatch({ type: "LOGOUT" });
            }

            setLoading(false);
        }
    }, []);

    console.log("AuthContext state:", state);

    if (loading) {
        return (
            <div className="loader">
                {/* You can add your loader UI here */}
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ ...state, dispatch, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
