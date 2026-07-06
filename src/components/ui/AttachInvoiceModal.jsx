// components/ui/AttachInvoiceModal.tsx
"use client";

import { useState, useContext, useEffect } from "react";
import { Modal } from "@/components/ui/modal"; // Replace with your modal component
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";

const AttachInvoiceModal = ({
    isOpen,
    onClose,
    orderId,
    accessToken,
    onUploadSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [invoiceUrl, setInvoiceUrl] = useState(null);
    const [invoiceName, setInvoiceName] = useState(null);

    const authContext = useContext(AuthContext);
    const accessToken1 = authContext?.accessToken;

    const handleFileChange = (e) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("invoice", selectedFile);

        try {
            setLoading(true);
            const route = invoiceUrl ?
                `/api/v1/orders/${orderId}/updateinvoice` :
                `/api/v1/orders/${orderId}/uploadinvoice`;

            const response = await axios.put(route, formData, {
                headers: {
                    Authorization: `Bearer ${accessToken1}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            toast.success(invoiceUrl ? "Invoice updated successfully." : "Invoice uploaded successfully.");
            const updatedOrder = response.data?.data;
            const newInvoiceUrl = updatedOrder?.invoiceDocument || null;
            setInvoiceUrl(newInvoiceUrl);
            if (newInvoiceUrl) {
                const parts = newInvoiceUrl.split("/");
                setInvoiceName(parts[parts.length - 1]);
            }
            onUploadSuccess && onUploadSuccess();
            setSelectedFile(null);
        } catch (error) {
            toast.error("Failed to upload invoice.");
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoice = async () => {
        if (!orderId) return;
        try {
            const res = await axios.get(`/api/v1/orders/admin/orders/${orderId}`, {
                headers: { Authorization: `Bearer ${accessToken1}` },
            });
            const order = res.data?.data?.order || res.data?.data;
            const url = order?.invoiceDocument || null;
            setInvoiceUrl(url);
            if (url) {
                const parts = url.split("/");
                setInvoiceName(parts[parts.length - 1]);
            } else {
                setInvoiceName(null);
            }
        } catch (err) {
            console.error("Failed to fetch order invoice:", err);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchInvoice();
            setSelectedFile(null);
        }
    }, [isOpen, orderId]);

    const handleDelete = async () => {
        if (!invoiceUrl) {
            toast.error("No invoice to delete.");
            return;
        }

        if (!confirm("Delete attached invoice? This cannot be undone.")) return;

        try {
            setLoading(true);
            await axios.delete(`/api/v1/orders/${orderId}/deleteinvoice`, {
                headers: { Authorization: `Bearer ${accessToken1}` },
            });
            toast.success("Invoice deleted.");
            setInvoiceUrl(null);
            setInvoiceName(null);
            onUploadSuccess && onUploadSuccess();
        } catch (err) {
            console.error("Failed to delete invoice:", err);
            toast.error("Failed to delete invoice.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!invoiceUrl) {
            toast.error("No invoice to download.");
            return;
        }

        try {
            setLoading(true);
            const res = await axios.get(`/api/v1/orders/${orderId}/downloadInvoice`, {
                headers: { Authorization: `Bearer ${accessToken1}` },
                responseType: "blob",
            });

            const disposition = res.headers["content-disposition"] || "";
            let filename = invoiceName || "invoice";
            const match = disposition.match(/filename="?([^";]+)"?/);
            if (match && match[1]) filename = match[1];

            const blob = new Blob([res.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Failed to download invoice:", err);
            toast.error("Failed to download invoice.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Attach Tax Invoice" isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <input type="file" onChange={handleFileChange} />
                <div className="flex items-center gap-2">
                    <Button onClick={handleUpload} disabled={loading}>
                        {loading ? "Uploading..." : invoiceUrl ? "Update Invoice" : "Upload Invoice"}
                    </Button>
                    {invoiceUrl && (
                        <>
                            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                                Delete
                            </Button>
                            <Button onClick={handleDownload} disabled={loading || !invoiceUrl}>
                                {loading ? "Processing..." : "Download"}
                            </Button>
                        </>
                    )}
                </div>

                {!invoiceUrl && (
                    <div className="text-sm text-gray-500">No invoice attached.</div>
                )}
            </div>
        </Modal>
    );
};

export default AttachInvoiceModal;
