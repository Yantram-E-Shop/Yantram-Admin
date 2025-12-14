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

  // 1) & 3) Updated logic for quantity changes in "Confirmed" status
  const handleQuantityChange = (index, value) => {
    const quantity = parseInt(value);
    if (isNaN(quantity) || quantity < 0) return;

    const originalItems = order.items;
    const itemToUpdate = originalItems[index];

    // Preserve the price per unit. Use itemToUpdate.totalPrice / itemToUpdate.quantity
    // BUT, avoid division by zero if quantity is 0 or less.
    // If original quantity is 0, this case shouldn't occur in a normal flow, but as a safeguard,
    // we'll assume a price of 0 or get the price from the product. For now, rely on existing price per unit.
    const pricePerUnit = itemToUpdate.totalPrice / itemToUpdate.quantity || 0;

    let updatedItems = [...originalItems];

    if (quantity === 0) {
      // 3) If there are multiple items and quantity is 0, remove the item
      if (updatedItems.length > 1) {
        updatedItems.splice(index, 1);
        toast.info(`Item '${itemToUpdate.product?.title}' removed from order.`);
      } else {
        // 2) If it's the only item and quantity is 0, mark for cancellation
        setOrderData((prev) => ({ ...prev, status: "Cancelled" }));
        toast.warn("Order has been automatically marked as 'Cancelled' as the only item's quantity was set to 0.");
        // We stop here and let handleSubmit handle the cancellation logic for the single item case.
        return;
      }
    } else {
      // Update quantity and total price for the specific item
      const updatedItem = { ...itemToUpdate };
      updatedItem.quantity = quantity;
      updatedItem.totalPrice = pricePerUnit * quantity; // 1) Price consistency

      updatedItems[index] = updatedItem;
    }

    // Recalculate the overall order total
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

        // Check if there are any items left after potential removals
        if (order.items.length === 0) {
          // This should only happen if the single item was set to 0 and the status was already set to "Cancelled"
          // in handleQuantityChange. But if it somehow reaches here, force Cancelled.
          if (orderData.status !== "Cancelled") {
             setOrderData((prev) => ({ ...prev, status: "Cancelled" }));
             toast.warn("Order forced to 'Cancelled' status as it has no items left.");
          }
          // Proceed to "Cancelled" logic below.
          payload.status = "Cancelled";
        } else {
            // Logic for 'Confirmed' status update (including item/total price changes)
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

            // Important: We still need to update the status to "Confirmed" on the server
            // if we made item changes, otherwise the status remains unchanged.
            // This is done by the final PUT request after the if/else-if block.
            payload.status = "Confirmed";
        }
      } 
      
      if (payload.status === "Cancelled") {
        // Handle cancellation update specifically
        const response = await axios.put(
          `${BASE_URL}/orders/${order._id}`,
          { status: "Cancelled" } ,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        toast.info("Order status updated to 'Cancelled'.");
        onOrderStatusupdate(response.data.data);
        onClose();
        setOrderData({ status: "" });
        setPackageInfo({ waybill:"", length: "", breadth: "", height: "", weight: "" });
        return; // Exit after successful cancellation
      }

      if (orderData.status === "Shipping") 
      {
          // Logic for 'Shipping' status update
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
          // The final PUT request handles the status update itself.
          payload.status = "Shipping";
      }

      // Final status update (for non-Confirmed, non-Shipping status changes, 
      // and to finalize the status change for Confirmed/Shipping if they did not return)
      const finalStatusUpdateResponse = await axios.put(
        `${BASE_URL}/orders/${orderId}`, // Use orderId here, as order might be null if only status is being changed
        { status: payload.status } , // Only send status for general updates
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      
      // Update and close only if the status update was the main goal and was successful
      if (orderData.status !== "Confirmed" && orderData.status !== "Shipping") {
         toast.success(`Order status updated to '${payload.status}'.`);
         onOrderStatusupdate(finalStatusUpdateResponse.data.data);
      }
      
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
                       // Show price per unit, handle division by zero
                       (item.quantity > 0 ? item.totalPrice / item.quantity : 0).toFixed(2)
                    }
                  </td>
                  <td className="p-2 border">
                    <input
                      type="number"
                      min={0}
                      className="w-full p-1 border rounded"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                    />
                  </td>
                  <td className="p-2 border">₹{item.totalPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="4" className="p-2 border font-bold text-right">Order Total:</td>
                <td className="p-2 border font-bold">₹{order.totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot>
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
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200 disabled:bg-gray-400"
      >
        {isSubmitting ? "Submitting..." : "Submit Status"}
      </button>
    </Modal>
  );
};

export default UpdateOrderStatusModal;