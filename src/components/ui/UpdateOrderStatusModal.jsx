"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const UpdateOrderStatusModal = ({ isOpen, onClose, orderId, onOrderStatusupdate }) => {
  const [orderData, setOrderData] = useState({ status: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [items, setItems] = useState([]);
  const [shippedQuantities, setShippedQuantities] = useState({});
  const [packageInfo, setPackageInfo] = useState({
    length: "",
    breadth: "",
    height: "",
    weight: "",
  });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    if (orderId && isOpen) {
      axios
        .get(`${BASE_URL}/orders/admin/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
        .then((res) => {
          const order = res.data.data;
          console.log(order);
          console.log("Fetched order:", order);
console.log("Type of order.items:", typeof order.items);
console.log("Is Array:", Array.isArray(order.items));

          setItems(order.items || []);
          const defaultShipped = {};
          order.items.forEach((item) => {
            defaultShipped[item._id] = item.quantity;
          });
          setShippedQuantities(defaultShipped);
        })
        .catch((err) => {
          console.error("Failed to fetch order details:", err);
        });
    }
  }, [orderId, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData((prev) => ({ ...prev, [name]: value }));
  };

  const handleShippedQtyChange = (itemId, value) => {
    setShippedQuantities((prev) => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handlePackageInfoChange = (e) => {
    const { name, value } = e.target;
    setPackageInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    if (!orderData.status) {
      setFeedback({ type: "error", message: "Please select a status." });
      setIsSubmitting(false);
      return;
    }

    const payload = {
      status: orderData.status,
    };

    if (orderData.status === "Confirmed") {
      payload.shippedQuantities = shippedQuantities;
    }

    if (orderData.status === "Shipping") {
      payload.packageInfo = packageInfo;
    }

    try {
      const response = await axios.put(`${BASE_URL}/orders/admin/orders/${orderId}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedback({
        type: "success",
        message: "Order status updated successfully!",
      });
      onOrderStatusupdate(response.data.data);
      onClose();
      setOrderData({ status: "" });
      setPackageInfo({ length: "", breadth: "", height: "", weight: "" });
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
      maxWidth: "700px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
    },
  };

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
        className="w-full mb-4 p-2 bg-gray-100 text-black rounded border border-gray-300"
      >
        <option value="">Select Order Status</option>
        {orderStatusOptions.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>

      {/* Shipped Quantity Inputs */}
      {orderData.status === "Confirmed" && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Shipped Quantities</h3>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Ordered Qty</th>
                <th className="p-2 border">Shipped Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="p-2 border">
                    {item.product?.title || "Product name missing"}
                  </td>
                  <td className="p-2 border">{item.quantity}</td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      min={0}
                      className="w-full p-1 border rounded"
                      value={shippedQuantities[item._id] || ""}
                      onChange={(e) =>
                        handleShippedQtyChange(item._id, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Info Fields */}
      {orderData.status === "Shipping" && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Package Info</h3>
          <div className="grid grid-cols-2 gap-4">
            {["length", "breadth", "height", "weight"].map((field) => (
              <div key={field}>
                <label className="block text-sm mb-1 capitalize">
                  {field}
                </label>
                <input
                  type="number"
                  name={field}
                  className="w-full p-2 border rounded"
                  value={packageInfo[field]}
                  onChange={handlePackageInfoChange}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : "Submit Status"}
      </button>
    </Modal>
  );
};

export default UpdateOrderStatusModal;
