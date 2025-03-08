"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/ui/loader";
import { AuthContext } from "@/context/AuthContext";

const OrderDetails = () => {
  const { orderId } = useParams(); // Get the orderId from the URL
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await axios.get(
          `/api/v1/orders/admin/orders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        console.log("Response:", response.data);
        setOrder(response.data.data); // Store order data in state
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) fetchOrderDetails();
  }, [orderId]);

  if (loading) return <Loader />;
  if (!order) return <p className="text-red-500">Order not found.</p>;

  return (
    <div className="p-6 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Order Details</h1>

      {/* Order Info */}
      <p>
        <strong>Order ID:</strong> {order._id}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Order Date:</strong>{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(order.updatedAt).toLocaleString()}
      </p>
      <p>
        <strong>Payment Info:</strong> {order.paymentInfo || "N/A"}
      </p>
      <p>
        <strong>Shipping Partner:</strong> {order.shippingPartner || "N/A"}
      </p>
      <p>
        <strong>Total Price:</strong> ${order.totalPrice}
      </p>

      {/* Address Section */}
      <h2 className="text-xl font-semibold mt-4">Shipping Address</h2>
      {order.address ? (
        <div className="border p-4 rounded-md -100">
          <p>
            <strong>Full Address:</strong> {order.address.fullAddress}
          </p>
          {order.address.landmark && (
            <p>
              <strong>Landmark:</strong> {order.address.landmark}
            </p>
          )}
          <p>
            <strong>Pincode:</strong> {order.address.pincode}
          </p>
          {order.address.district && (
            <p>
              <strong>District:</strong> {order.address.district}
            </p>
          )}
          {order.address.state && (
            <p>
              <strong>State:</strong> {order.address.state}
            </p>
          )}
          {order.address.phoneNumber && (
            <p>
              <strong>Phone:</strong> {order.address.phoneNumber}
            </p>
          )}
        </div>
      ) : (
        <p className="text-gray-500">No address available.</p>
      )}

      {/* Items Section */}
      <h2 className="text-xl font-semibold mt-4">Items</h2>
      {order.items && order.items.length > 0 ? (
        <ul>
          {order.items.map((item: any) => (
            <li
              key={item.product._id}
              className="border p-4 mt-2 rounded-md "
            >
              <p>
                <strong>Product:</strong> {item.product.title}
              </p>
              <p>
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p>
                <strong>Price:</strong> ${item.totalPrice}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No items found in this order.</p>
      )}
    </div>
  );
};

export default OrderDetails;
