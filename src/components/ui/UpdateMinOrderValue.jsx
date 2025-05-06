"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const UpdateMinOrderValue = ({ isOpen, onClose}) => {
    const [orderData, setOrderData] = useState({
      minOrderValue: "",
    });
  
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState({ type: "", message: "" });
  
    const authContext = useContext(AuthContext);
    const accessToken = authContext?.accessToken;
  
      useEffect(() => {
          const fetchMinOrderValue = async () => {
            console.log("fetching min. order value called!!");
          try {
            const response = await axios.get(`/api/v1/orders/value/getminOrderValue`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            const orderData = response.data;
            setOrderData(orderData);
            console.log(orderData);
          } catch (error) {
            console.error("Error fetching min. order value:", error);
            setFeedback({
              type: "error",
              message: "Failed to fetch min. order value.",
            });
          };
        }
        fetchMinOrderValue();
      }, [accessToken]);

    // Handle input changes
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setOrderData((prev) => ({ ...prev, [name]: value }));
    };
  
    // Handle form submission
    const handleSubmit = async () => {
      setIsSubmitting(true);
      setFeedback({ type: "", message: "" });
  
      try {
        const payLoad = {"minOrderValue": orderData.minOrderValue};

        if (!orderData.minOrderValue) {
            setFeedback({
              type: "error",
              message: "Please provide a minOrderValue.",
            });
            return;
          }

        const response = await axios.put(`${BASE_URL}/orders/admin/orders/value/minordervalue`, payLoad, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        setFeedback({
          type: "success",
          message: "Min Order value updated successfully!",
        });
        onClose(); // Close the modal after submission
        setOrderData({
          minOrderValue: "",
        });
      } catch (error) {
        console.error("Error updating min order value:", error);
        setFeedback({
          type: "error",
          message: "Failed to update min order value.",
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
        <input
            type="number"
            name="minOrderValue"
            placeholder="Minimum Order Value"
            value={orderData.minOrderValue === 0 ? "" : orderData.minOrderValue}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />
  
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
  

export default UpdateMinOrderValue;
