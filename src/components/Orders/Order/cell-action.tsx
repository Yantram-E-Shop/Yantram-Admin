"use client";

import axios from "axios";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState ,useContext} from "react";
import { toast } from "react-hot-toast";
import  UpdateOrderStatusModal  from "../../ui/UpdateOrderStatusModal.jsx"
import AttachInvoiceModal from "../../ui/AttachInvoiceModal.jsx";
import { AuthContext } from "@/context/AuthContext";
import { AlertModal } from "@/components/modals/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrderColumn } from "./columns";
import React from "react";


interface CellActionProps {
  data: OrderColumn;
}

export const CellAction: React.FC<CellActionProps> = ({ data }:{data:any}) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const [orderstatusModalOpen, setOrderstatusModalOpen] = useState(false); // Modal state
  //const [selectedOrder, setSelectedOrder] = useState(null); // Track selected product
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [attachInvoiceOpen, setAttachInvoiceOpen] = useState(false);

const onDelete = (id: string) => {
  setDeletingOrderId(id);         // Set order to delete
  setDeleteConfirmOpen(true);     // Open confirmation modal
};

const confirmDelete = async () => {
  if (!deletingOrderId) return;

  try {
    setLoading(true);
    await axios.delete(`/api/v1/orders/admin/${deletingOrderId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    toast.success("Order deleted successfully.");
    router.refresh(); // refresh data
  } catch (error) {
    toast.error("Failed to delete order.");
    console.error("Order delete error:", error);
  } finally {
    setLoading(false);
    setDeleteConfirmOpen(false);
    setDeletingOrderId(null);
  }
};

  const handleOpenOrderStatusModal = () => {
    //setSelectedOrder(data); // Store selected product
    setOrderstatusModalOpen(true); // Open modal
  };

  const handleOrderStatusUpdated = () => {
    setOrderstatusModalOpen(false); // Close modal after update
    router.refresh(); // Refresh product list
  };

  const onConfirm = async () => {
    try {
      setLoading(true);
      toast.success("order window updated.");
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
    toast.success("Order ID copied to clipboard.");
  };

  console.log(data)
  return (
    <>
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <AlertModal
      isOpen={deleteConfirmOpen}
      loading={loading}
      onClose={() => setDeleteConfirmOpen(false)}
      onConfirm={confirmDelete}
    />

      {/* update order status Modal */}
      {orderstatusModalOpen && (
        <UpdateOrderStatusModal
          orderId={data.id}
          isOpen={orderstatusModalOpen}
          onClose={() => setOrderstatusModalOpen(false)}
          onOrderStatusupdate={handleOrderStatusUpdated}
        />
      )}

      <AttachInvoiceModal
      isOpen={attachInvoiceOpen}
      onClose={() => setAttachInvoiceOpen(false)}
      orderId={data.id}
      accessToken={accessToken}
      onUploadSuccess={() => {
        router.refresh();
      }}
    />

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
          {/* {/* <DropdownMenuItem onClick={() => router.push(`/orders/${data.id}`)}>
            <Edit className="w-4 h-4 mr-2" /> Update
          </DropdownMenuItem> */}
          <DropdownMenuItem onClick={() => router.push(`/orders/admin/orders/${data.id}`)}>
            <Edit className="w-4 h-4 mr-2" /> Show Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenOrderStatusModal}>
            <Edit className="w-4 h-4 mr-2" /> Manage Order 
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setAttachInvoiceOpen(true)}>
          <Edit className="w-4 h-4 mr-2" /> Manage Tax Invoice
         </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onDelete(data.id)}>
          <Trash className="w-4 h-4 mr-2 text-red-500" /> Delete Order
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
