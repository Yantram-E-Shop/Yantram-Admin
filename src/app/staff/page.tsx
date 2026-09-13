"use client";

import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StaffManagement from "@/components/Users/staff-management";
import Loader from "@/components/ui/loader";
import { AuthContext } from "@/context/AuthContext";

export default function StaffPage() {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const accessToken = authContext?.accessToken;
    const [checkingAccess, setCheckingAccess] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!accessToken) {
            router.replace("/login");
            return;
        }

        axios.get("/api/v1/user/me", {
            headers: { Authorization: `Bearer ${accessToken}` },
        }).then((response) => {
            const role = response.data?.data?.role?.toLowerCase();
            if (role !== "admin") {
                router.replace("/");
                return;
            }
            setIsAdmin(true);
        }).catch(() => {
            router.replace("/login");
        }).finally(() => {
            setCheckingAccess(false);
        });
    }, [accessToken, router]);

    if (checkingAccess) return <Loader />;
    if (!isAdmin) return null;

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <StaffManagement />
            </div>
        </div>
    );
}