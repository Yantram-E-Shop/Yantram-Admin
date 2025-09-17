"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";
import { toast } from "react-toastify";

const UpdateOrderStatusModal = ({ isOpen, onClose, orderId, onOrderStatusupdate }) => {
  const [order, setOrder] = useState(null);
  const [orderData, setOrderData] = useState({ status: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [shippedQuantities, setShippedQuantities] = useState({});
  const [packageInfo, setPackageInfo] = useState({
  shippingPartner: "",
  shipmentMode: "", // ✅ Added
  waybill: "",
  length: "",
  breadth: "",
  height: "",
  weight: "",
  shipmentLink: "", // ✅ Added
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
          const fetchedOrder = res.data.data?.order;
          setOrder(fetchedOrder);
          console.log(fetchedOrder);

          const defaultShipped = {};
          fetchedOrder.items.forEach((item) => {
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

  const handleQuantityChange = (index, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 1) return;

    const updatedItems = [...order.items];
    const item = updatedItems[index];

    const selectedPrice =
      item.product.sellingPrice
        ?.filter((p) => quantity >= p.minQuantity)
        .sort((a, b) => b.minQuantity - a.minQuantity)[0]?.pricePerUnit ||
      item.product.originalPrice;

    item.quantity = quantity;
    item.totalPrice = selectedPrice * quantity;

    const updatedTotal = updatedItems.reduce((sum, i) => sum + i.totalPrice, 0);

    setOrder((prev) => ({
      ...prev,
      items: updatedItems,
      totalPrice: updatedTotal,
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

    const payload = { status: orderData.status };

    try {
      if (orderData.status === "Confirmed") {
        if (!order) return;

        const confirmedPayload = {
          items: order.items.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            totalPrice: item.totalPrice,
          })),
          totalPrice: order.totalPrice,
        };

        const response = await axios.put(
          `${BASE_URL}/orders/update/${order._id}`,
          confirmedPayload ,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );


        toast.success("Order confirmed and updated successfully.");
        setOrder(response.data.data);
        onOrderStatusupdate(response.data.data);
      } 
      else if (orderData.status === "Shipping") 
      {
          payload.packageInfo = packageInfo;

          const response = await axios.put(
            `${BASE_URL}/orders/ship/${orderId}`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );

        setFeedback({
          type: "success",
          message: "Order status updated successfully!",
        });

        onOrderStatusupdate(response.data.data);
      }

      const response = await axios.put(
        `${BASE_URL}/orders/${order._id}`,
        payload ,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      onClose();
      setOrderData({ status: "" });
      setPackageInfo({ waybill:"", length: "", breadth: "", height: "", weight: "" });
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

  const ShipmentPartner =
  [
    "Delhivery",
    "BlueDart",
    "ShipRocket",
    "Other"
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

      {/* Confirmed Status: Edit Quantities */}
      {orderData.status === "Confirmed" && order?.items && (
        <div className="mb-4">
  <div className="mb-4">
  <h3 className="text-lg font-semibold mb-2">Payment Info</h3>
  <div className="flex items-start justify-between gap-4 text-sm">
    <div className="flex-1 space-y-1">
      <div>
        <span className="font-semibold">Payment Method:</span>{" "}
        {order?.paymentInfo?.mode || "N/A"}
      </div>
      <div>
        <span className="font-semibold">Transaction Ref:</span>{" "}
        {order?.paymentInfo?.transactionId || "N/A"}
      </div>
    </div>
    {order?.paymentInfo?.transactionimageUrl && (
      <img
        src={order.paymentInfo.transactionimageUrl}
        alt="Payment Screenshot"
        className="w-25 h-25 border rounded object-cover"
      />
    )}
  </div>
</div>

          <h3 className="text-lg font-semibold mb-2">Edit Item Quantities</h3>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-2 border">SKU</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Price/Unit</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={item._id}>
                  <td className="p-2 border">{item.product?.SKU}</td>
                  <td className="p-2 border">{item.product?.title}</td>
                  <td className="p-2 border">
                    ₹
                    {
                      item.product?.sellingPrice
                        ?.sort((a, b) => b.minQuantity - a.minQuantity)[0]
                        ?.pricePerUnit ?? item.product?.originalPrice
                    }
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      min={1}
                      className="w-full p-1 border rounded"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />
                  </td>
                  <td className="p-2 border">₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Shipping Status: Package Info */}
      {orderData.status === "Shipping" && (
  <div className="mb-4">
    <h3 className="text-lg font-semibold mb-2">Package Info</h3>

    {/* Shipping Partner Dropdown */}
    <div className="mt-4">
      <label className="block text-sm mb-1">Shipping Partner</label>
      <select
        name="shippingPartner"
        value={packageInfo.shippingPartner}
        onChange={handlePackageInfoChange}
        className="w-full p-2 bg-gray-100 border rounded"
      >
        <option value="">Select Partner</option>
        {ShipmentPartner.map((partner) => (
          <option key={partner} value={partner}>
            {partner}
          </option>
        ))}
      </select>
    </div>

    {/* If "Other" → ONLY show Shipment Link */}
    {packageInfo.shippingPartner === "Other" && (
      <div className="mt-4">
        <label className="block text-sm mb-1">Shipment Link</label>
        <input
          type="text"
          name="shipmentLink"
          placeholder="Enter tracking link"
          className="w-full p-2 border rounded"
          value={packageInfo.shipmentLink}
          onChange={handlePackageInfoChange}
        />
      </div>
    )}

    {/* If Delhivery, ShipRocket, or BlueDart */}
    {["Delhivery", "ShipRocket", "BlueDart"].includes(packageInfo.shippingPartner) && (
      <>
        {/* Shipment Mode Dropdown */}
        <div className="mt-4">
          <label className="block text-sm mb-1">Shipment Mode</label>
          <select
            name="shipmentMode"
            value={packageInfo.shipmentMode}
            onChange={handlePackageInfoChange}
            className="w-full p-2 bg-gray-100 border rounded"
          >
            <option value="">Select Mode</option>
            <option value="Surface">Surface</option>
            <option value="Express">Express</option>
          </select>
        </div>

        {/* Package Fields */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {["waybill", "length", "breadth", "height", "weight"].map((field) => (
            <div key={field}>
              <label className="block text-sm mb-1 capitalize">{field}</label>
              <input
                type="text"
                name={field}
                className="w-full p-2 border rounded"
                value={packageInfo[field]}
                onChange={handlePackageInfoChange}
              />
            </div>
          ))}
        </div>
      </>
    )}
  </div>
)}


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
