"use client";

import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const UpdateCouponModal = ({
  isOpen,
  onClose,
  couponData,
  onCouponUpdated,
}) => {
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [maxUsageLimit, setMaxUsageLimit] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Populate fields when couponData changes
  useEffect(() => {
    if (couponData) {
      setCode(couponData.code || ""); // Default to empty string if undefined
      setDiscountType(couponData.discountType || "");
      setDiscountValue(couponData.discountValue || "");

      // Ensure validFrom and validUntil are defined and valid dates
      setValidFrom(
        couponData.validFrom ? couponData.validFrom.split("T")[0] : ""
      );
      setValidUntil(
        couponData.validUntil ? couponData.validUntil.split("T")[0] : ""
      );

      setMaxUsageLimit(couponData.maxUsageLimit || ""); // Allow empty input
    }
  }, [couponData]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const updates = {}; // Create an object to store updates

    // Only add fields to updates object if they have a value
    if (code !== couponData.code) updates.code = code; // Check if code is changed
    if (discountType !== couponData.discountType)
      updates.discountType = discountType; // Check if discountType is changed
    if (discountValue !== couponData.discountValue)
      updates.discountValue = discountValue; // Check if discountValue is changed

    // Format dates to ISO string if they have values
    if (validFrom && validFrom !== couponData.validFrom.split("T")[0]) {
      updates.validFrom = new Date(validFrom).toISOString();
    }
    if (validUntil && validUntil !== couponData.validUntil.split("T")[0]) {
      updates.validUntil = new Date(validUntil).toISOString();
    }

    // Convert maxUsageLimit to a number if it's provided and changed
    if (maxUsageLimit && maxUsageLimit !== couponData.maxUsageLimit) {
      updates.maxUsageLimit = Number(maxUsageLimit);
    }

    // If there are no updates, don't send the request
    if (Object.keys(updates).length === 0) {
      console.log("No changes made, not updating.");
      setIsSubmitting(false);
      onClose(); // Close the modal
      return;
    }

    try {
      const response = await axios.put(
        `${BASE_URL}/coupons/${couponData._id}`,
        { updates }, // Send updates object
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Coupon updated:", response.data);
      onCouponUpdated(); // Trigger the callback function to refresh data
    } catch (error) {
      console.error("Error updating coupon:", error);
    } finally {
      setIsSubmitting(false);
      onClose(); // Close the modal
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
      <h2 className="text-black text-xl mb-4">Update Coupon</h2>

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
        <option value="">Select Discount Type</option>
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
        value={maxUsageLimit}
        onChange={(e) => setMaxUsageLimit(e.target.value)}
        className="w-full mb-4 p-2 border rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-white rounded"
      >
        {isSubmitting ? "Updating..." : "Update Coupon"}
      </button>
    </Modal>
  );
};

export default UpdateCouponModal;
