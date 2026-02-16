// components/ui/AttachInvoiceModal.tsx
"use client";

import { useState, useContext } from "react";
import { Modal } from "@/components/ui/modal"; // Replace with your modal component
import { Button } from "@/components/ui/button";
import axios from "axios";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const AttachInvoiceModal = ({
    isOpen,
    onClose,
    orderId,
    accessToken,
    onUploadSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);

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
            await axios.put(
                `/api/v1/orders/${orderId}/uploadinvoice`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken1}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            toast.success("Invoice attached successfully.");
            onUploadSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to upload invoice.");
            console.error("Upload error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Attach Tax Invoice" isOpen={isOpen} onClose={onClose}>
            <div className="flex flex-col gap-4">
                <input type="file" onChange={handleFileChange} />
                <Button onClick={handleUpload} disabled={loading}>
                    {loading ? "Uploading..." : "Upload Invoice"}
                </Button>
            </div>
        </Modal>
    );
};

export default AttachInvoiceModal;
