"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const UpdateOrderStatusModal = ({ isOpen, onClose, orderId, onOrderStatusupdate }) => {
    const [orderData, setOrderData] = useState({
      status: "",
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
  
    const authContext = useContext(AuthContext);
    const accessToken = authContext?.accessToken;
  
    // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      console.log("Changed field:", name, "selected value:", value); // Debug lo
      setOrderData((prev) => ({ ...prev, [name]: value }));
    };
  
    // Handle form submission
    const handleSubmit = async () => {
      setIsSubmitting(true);
      setFeedback({ type: "", message: "" });
  
      try {
        const payLoad = {"status": orderData.status};

        if (!orderData.status) {
            setFeedback({
              type: "error",
              message: "Please select a status.",
            });
            return;
          }
  
        const response = await axios.put(`${BASE_URL}/orders/${orderId}`, payLoad, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        setFeedback({
          type: "success",
          message: "Order Status updated successfully!",
        });
        onOrderStatusupdate(response.data.data); // Pass the new order data back to the parent component
        onClose(); // Close the modal after submission
        setOrderData({
          status: "",
        });
      } catch (error) {
        console.error("Error updating order status:", error);
        setFeedback({
          type: "error",
          message: "Failed to update order status. Please try again.",
        });
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
  
    // Enum values for order status
    const orderStatusOptions = [
      "Order Placed",
      "Confirmed",
      "Shipping",
      "Out for delivery",
      "Returned",
      "Cancelled",
      "Delivered",
    ];
  
    return (
      <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
        {feedback.message && (
          <p
            className={`mb-4 ${
              feedback.type === "error" ? "text-red-500" : "text-green-500"
            }`}
          >
            {feedback.message}
          </p>
        )}
  
        <h2 className="text-black text-xl mb-4">Update Order Status</h2>
  
        {/* Order Status Dropdown */}
        <select
          name="status"
          value={orderData.status}
          onChange={handleInputChange}
          className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
        >
          <option value="status">Select Order Status</option>
          {orderStatusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
  
        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
        >
          {isSubmitting ? "Submitting..." : "Submit Status"}
        </button>
      </Modal>
    );
  };
  

export default UpdateOrderStatusModal;
