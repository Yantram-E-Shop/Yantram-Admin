"use client";

import React, { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";

const UserDetails = () => {
  const { userId } = useParams();
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/v1/user/admin/${userId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        console.log("Response:", response.data);
        setUserDetails(response.data?.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserDetails();
  }, [userId]);

  if (loading) return <Loader />;
  if (!userDetails)
    return <p className="text-red-500">No user details available.</p>;

  return (
    <div className="p-6 rounded-lg shadow-md">
      {/* User Info */}
      <h1 className="text-2xl font-bold mb-4">User Details</h1>
      <p>
        <strong>User ID:</strong> {userDetails._id}
      </p>
      <p>
        <strong>Full Name:</strong> {userDetails.fullName}
      </p>
      <p>
        <strong>Email:</strong> {userDetails.email}
      </p>
      <p>
        <strong>Phone:</strong> {userDetails.phoneNumber}
      </p>
      <p>
        <strong>Role:</strong> {userDetails.role}
      </p>
      <p>
        <strong>FCM Token:</strong>{userDetails.fcmToken}
      </p>
      <p>
        <strong>Number Verified:</strong>{" "}
        {userDetails.isNumberVerified ? "Yes" : "No"}
      </p>
      <p>
        <strong>Created At:</strong>{" "}
        {new Date(userDetails.createdAt).toLocaleString()}
      </p>
      <p>
        <strong>Last Updated:</strong>{" "}
        {new Date(userDetails.updatedAt).toLocaleString()}
      </p>

      {/* Addresses Section */}
      <h2 className="text-xl font-semibold mt-6">Addresses</h2>
      {userDetails.addresses?.length > 0 ? (
        userDetails.addresses.map((address: any, index: number) => (
          <div key={index} className="border p-4 mt-2 rounded-md">
            <p>
              <strong>Full Address:</strong> {address.fullAddress}
            </p>
            <p>
              <strong>Landmark:</strong> {address.landmark || "N/A"}
            </p>
            <p>
              <strong>District:</strong> {address.district}
            </p>
            <p>
              <strong>State:</strong> {address.state}
            </p>
            <p>
              <strong>Pincode:</strong> {address.pincode}
            </p>
            <p>
              <strong>Phone:</strong> {address.phoneNumber}
            </p>
            {address.gstNumber && (
              <p>
                <strong>GST Number:</strong> {address.gstNumber}
              </p>
            )}
          </div>
        ))
      ) : (
        <p className="text-gray-500">No addresses found.</p>
      )}

      {/* Orders Section */}
      <h2 className="text-xl font-semibold mt-6">Orders</h2>
      {userDetails.orders?.length > 0 ? (
        userDetails.orders.map((order: any, index: number) => (
          <div key={index} className="border p-4 mt-2 rounded-md">
            <p>
              <strong>Order ID:</strong> {order.orderID}
            </p>
            <p>
              <strong>Status:</strong> {order.status}
            </p>
            <p>
              <strong>Payment Method:</strong> {order.paymentMethod}
            </p>
            <p>
              <strong>Shipping Partner:</strong> {order.shippingPartner}
            </p>
            <p>
              <strong>Total Price:</strong> ${order.totalPrice}
            </p>
            <p>
              <strong>Order Date:</strong>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>

            <h3 className="text-lg font-semibold mt-2">Items:</h3>
            <ul>
              {order.items.map((item: any) => (
                <li
                  key={item._id}
                  className="border p-2 mt-2 rounded-md"
                >
                  <p>
                    <strong>Product ID:</strong> {item.product}
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
          </div>
        ))
      ) : (
        <p className="text-gray-500">No orders found.</p>
      )}

      {/* Cart Section */}
      <h2 className="text-xl font-semibold mt-6">Cart</h2>
      {userDetails.cart?.items?.length > 0 ? (
        <ul>
          {userDetails.cart.items.map((item: any, index: number) => (
            <li key={index} className="border p-2 mt-2 rounded-md">
              <p>
                <strong>Product ID:</strong> {item.product}
              </p>
              <p>
                <strong>Quantity:</strong> {item.quantity}
              </p>
              <p>
                <strong>Total Price:</strong> ${item.totalPrice}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Cart is empty.</p>
      )}

      {/* Wishlist Section */}
      <h2 className="text-xl font-semibold mt-6">Wishlist</h2>
      {userDetails.wishlist?.items?.length > 0 ? (
        <ul>
          {userDetails.wishlist.items.map((item: any, index: number) => (
            <li key={index} className="border p-2 mt-2 rounded-md">
              <p>
                <strong>Product ID:</strong> {item.product}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">Wishlist is empty.</p>
      )}

      {/* Back Button */}
      <div className="mt-6">
        <Button onClick={() => history.back()} variant="outline">
          Back
        </Button>
      </div>
    </div>
  );
};

export default UserDetails;
