"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState,useContext } from "react";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserColumn } from "./columns";
import React from "react";

interface CellActionProps {
  data: UserColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }: { data: any }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/users/${data.id}`);
      toast.success("User deleted.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("User ID copied to clipboard.");
  };

  const BlockUser = async(id: string) => {
    try {
      setLoading(true);
      const payLoad = {"state" : "Blocked"};
      const response = await axios.put(`${BASE_URL}/user/userstate/${id}`, payLoad, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
      toast.success("User Blocked.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const ActivateUser = async(id: string) => {
    try {
      setLoading(true);
      const payLoad = {"state" : "Active"};
      const response = await axios.put(`${BASE_URL}/user/userstate/${id}`, payLoad, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          });
      toast.success("User is active again.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onConfirm} loading={loading} />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="w-8 h-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="w-4 h-4 mr-2" /> Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => BlockUser(data.id)}>
            <Copy className="w-4 h-4 mr-2" /> Block User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => ActivateUser(data.id)}>
            <Copy className="w-4 h-4 mr-2" /> Activate User
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => router.push(`/users/${data.id}`)}>
            <Edit className="w-4 h-4 mr-2" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => router.push(`/users/${data.id}`)}>
  <Edit className="w-4 h-4 mr-2" /> View Details
</DropdownMenuItem>

        </DropdownMenuContent>
        
      </DropdownMenu>
    </>
  );
};
