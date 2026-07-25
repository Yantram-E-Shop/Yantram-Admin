"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { add, format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";
import { UsersClient } from "./user/client";

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/v1/user?page=${page}&limit=10000&searchQuery=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        setUsers(data.data?.data || []);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalUsers(data.data.pagination.totalUsers || 0);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchUsers();
  }, [accessToken, page, searchQuery]);

  const formattedUsers = users.map((user) => ({
    id: user._id,
    fullName: user.fullName || "N/A",
    shopName: user.addresses && user.addresses.length > 0 ? user.addresses[0].shopName : "N/A",
    address: user.addresses && user.addresses.length > 0 ? user.addresses[0] : "N/A",
    email: user.email || "N/A",
    phoneNumber: user.phoneNumber || "N/A",
    role: user.role || "N/A",
    fcmToken: user.fcmToken || "N/A",
    numberVerified: user.isNumberVerified ? "Yes" : "No",
    state:user.state || "Active",
    createdAt: format(new Date(user.createdAt), "MMMM do, yyyy"),
  }));

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <UsersClient
          data={formattedUsers}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalUsers={totalUsers}
        />
      </div>
    </div>
  );
};

export default Users;
