"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import { useContext, useState } from "react";
import { toast } from "react-hot-toast";

import { AlertModal } from "@/components/modals/alert-modal";
import  EditProductModal  from "../../ui/EditProductModal.jsx"
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import React from "react";

interface CellActionProps {
  data: any;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false); // Modal state
  const [selectedProduct, setSelectedProduct] = useState(null); // Track selected product

  const router = useRouter();
  const params = useParams();
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const onConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/v1/products/${data.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      toast.success("Product deleted.");
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
    toast.success("copied to clipboard.");
  };

  const handleOpenEditModal = () => {
    setSelectedProduct(data); // Store selected product
    setEditModalOpen(true); // Open modal
  };

  const handleProductUpdated = () => {
    setEditModalOpen(false); // Close modal after update
    router.refresh(); // Refresh product list
  };

  return (
      <>
          {/* Delete Confirmation Modal */}
          <AlertModal
              isOpen={open}
              onClose={() => setOpen(false)}
              onConfirm={onConfirm}
              loading={loading}
          />

          {/* Edit Product Modal */}
          {editModalOpen && selectedProduct && (
              <EditProductModal
                  productId={(selectedProduct as { id: string }).id}
                  isOpen={editModalOpen}
                  onClose={() => setEditModalOpen(false)}
                  onProductUpdated={handleProductUpdated}
              />
          )}

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
                  <DropdownMenuItem onClick={handleOpenEditModal}>
                      <Edit className="w-4 h-4 mr-2" /> Update
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setOpen(true)}>
                      <Trash className="w-4 h-4 mr-2" /> Delete
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCopy(data.imageUrls[0])}>
                      <Copy className="w-4 h-4 mr-2" /> Copy Image URL
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </>
  );
};
