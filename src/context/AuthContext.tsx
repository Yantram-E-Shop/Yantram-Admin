"use client";
import React, {
    createContext,
    useReducer,
    ReactNode,
    FC,
    useEffect,
    useState,
} from "react";

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

export const AuthContextProvider: FC<AuthProviderProps> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [state, dispatch] = useReducer(authReducer, {
        accessToken: localStorage.getItem('accessToken') ?? null,
        refreshToken: localStorage.getItem('refreshToken') ?? null,
    });

    useEffect(() => {
        const storedAuth: AuthState = {
            accessToken: localStorage.getItem('accessToken') ?? null,
            refreshToken: localStorage.getItem('refreshToken') ?? null,
        };

        if (storedAuth && storedAuth.accessToken) {
            dispatch({
                type: "LOGIN",
                payload: storedAuth,
            });
        } else {
            dispatch({ type: "LOGOUT" });
        }
        setLoading(false);
    }, []);

    console.log("AuthContext state:", state);

    if (loading) {
        return (
            <div className="loader">
                {/* <svg
                    className="icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="40"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="6" x2="10" y1="11" y2="11" />
                    <line x1="8" x2="8" y1="9" y2="13" />
                    <line x1="15" x2="15.01" y1="12" y2="12" />
                    <line x1="18" x2="18.01" y1="10" y2="10" />
                    <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z" />
                </svg> */}
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ ...state, dispatch, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
