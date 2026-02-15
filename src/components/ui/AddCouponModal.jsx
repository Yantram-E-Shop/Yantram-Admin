import React, { useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";
import { toast } from "react-hot-toast";

const AddCouponModal = ({ isOpen, onClose, onCouponAdded }) => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("value"); // value or percentage
  const [discountValue, setDiscountValue] = useState(0);
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUsageLimit, setMaxUsageLimit] = useState(null); // Nullable
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

const handleSubmit = async () => {
  setIsSubmitting(true);
  try {
    const response = await axios.post(
      `${BASE_URL}/coupons`,
      {
        content: {
          code,
          discountType,
          discountValue: parseFloat(discountValue),
          validFrom: new Date(validFrom).toISOString(), // Convert to ISO format
          validUntil: new Date(validUntil).toISOString(), // Convert to ISO format
          maxUsageLimit: maxUsageLimit ? parseInt(maxUsageLimit, 10) : null,
          isActive,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log("Coupon created:", response.data);
    onCouponAdded();
    toast.success("Coupon added successfully!");
    onClose();
  } catch (error) {
    console.error(
      "Error adding coupon:",
      error.response?.data || error.message
    ); // Log the actual error response
    toast.error(error.response?.data?.message || "Failed to add coupon.");
  } finally {
    setIsSubmitting(false);
  }
};


  const modalStyles = {
    content: {
      backgroundColor: "#ffffff",
      color: "#2d2d2d",
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "600px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      <h2 className="text-black text-xl mb-4">Add New Coupon</h2>

      <input
        type="text"
        placeholder="Coupon Code"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <select
        value={discountType}
        onChange={(e) => setDiscountType(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="value">Value</option>
        <option value="percentage">Percentage</option>
      </select>

      <input
        type="number"
        placeholder="Discount Value"
        value={discountValue}
        onChange={(e) => setDiscountValue(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="date"
        placeholder="Valid From"
        value={validFrom}
        onChange={(e) => setValidFrom(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="date"
        placeholder="Valid Until"
        value={validUntil}
        onChange={(e) => setValidUntil(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <input
        type="number"
        placeholder="Max Usage Limit"
        value={maxUsageLimit || ""}
        onChange={(e) => setMaxUsageLimit(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="form-checkbox"
        />
        <span>Is Active</span>
      </label>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="bg-blue-500 text-white p-2 rounded w-full"
      >
        {isSubmitting ? "Submitting..." : "Add Coupon"}
      </button>
    </Modal>
  );
};

export default AddCouponModal;
