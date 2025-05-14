"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";

import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import AddZoneModal from "../../ui/AddZoneModal";

interface CellActionProps {
  data: any;
  existingZones: any[];
  onZoneAdded: (zone: any) => void;
}

export const CellAction: React.FC<CellActionProps> = ({ data, existingZones, onZoneAdded }) => {
  const [loading, setLoading] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const router = useRouter();
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const onConfirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/zone/${data.name}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Zone deleted.");
      router.refresh();
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
    }
  };

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success("Zone ID copied to clipboard.");
  };

  return (
    <>
      {/* ✅ Edit/Create Modal */}
      <AddZoneModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onZoneAdded={(zone) => {
          onZoneAdded(zone); // Notify parent
          setEditModalOpen(false);
        }}
        existingZones={existingZones}
        zoneToEdit={data} // Pass current zone for editing
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={onConfirmDelete}
        loading={loading}
      />

      {/* Dropdown Menu */}
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
            <Copy className="w-4 h-4 mr-2" /> Copy Id
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setEditModalOpen(true)}>
            <Edit className="w-4 h-4 mr-2" /> Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDeleteModalOpen(true)}>
            <Trash className="w-4 h-4 mr-2" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
