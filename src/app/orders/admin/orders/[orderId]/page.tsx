"use client";

import { useContext, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Loader from "@/components/ui/loader";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState<any>(null);
    const [shippingDetail, setShippingDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
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
                setOrder(response.data.data.order);
                setShippingDetail(response.data.data.shippingDetail);
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        if (orderId) fetchOrderDetails();
    }, [orderId]);

    const handleQuantityChange = (index: number, value: string) => {
        const quantity = parseInt(value);
        if (isNaN(quantity) || quantity < 1) return;

        // Create a new copy of the order to ensure immutability
        const newItems = [...order.items];
        const item = newItems[index];

        // Find the correct price based on the selected quantity
        const selectedPrice =
            item.product?.sellingPrice
                .filter(
                    (priceOption: any) => quantity >= priceOption.minQuantity
                )
                .sort((a: any, b: any) => b.minQuantity - a.minQuantity)[0]
                ?.pricePerUnit || item.product?.originalPrice;

        console.log("Selected price :", selectedPrice);
        // Update the item quantity and total price
        item.quantity = quantity;
        item.totalPrice = selectedPrice * quantity;

        // Recalculate the total price of the entire order
        const newTotal = newItems.reduce(
            (sum, item) => sum + item.totalPrice,
            0
        );

        // Update the order state
        setOrder((prevOrder: any) => ({
            ...prevOrder,
            items: newItems,
            totalPrice: newTotal,
        }));
    };

    const handleUpdateOrder = async () => {
        if (!order) return;
        setUpdating(true);
        try {
            const payload = {
                items: order.items.map((item: any) => ({
                    product: item.product?._id,
                    quantity: item.quantity,
                    totalPrice: item.totalPrice,
                })),
                totalPrice: order.totalPrice,
            };

            const response = await axios.put(
                `/api/v1/orders/update/${order._id}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            toast.success("Order updated successfully");
            setOrder(response.data.data);
        } catch (error: any) {
            console.error("Error updating order:", error);
            toast.error("Failed to update order");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Loader />;
    if (!order) return <p className="text-red-500">Order not found.</p>;

    return (
        <div className="p-6 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold mb-4">Order Details</h1>
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
                <strong>Shipping Partner:</strong>{" "}
                {order.shippingPartner || "N/A"}
            </p>
            

<h2 className="text-xl font-semibold mt-4">Payment Info</h2>
            {order.paymentInfo ? (
                <div className="border p-4 rounded-md">
             <p>
                <strong>Payment Mode:</strong>{" "}
                {order.paymentInfo?.mode || "N/A"}
            </p>
            <p>
                <strong>Order Value:</strong> ₹{order.paymentInfo.amount.toFixed(2)}
            </p>
            <p>
                <strong>Shipping Cost:</strong> ₹{order.paymentInfo.shippingCost.toFixed(2)}
            </p>
            <p>
                <strong>Total Order Cost:</strong> ₹{order.paymentInfo.totalamount.toFixed(2)}
            </p>
            <p>
                <strong>Transaction Id:</strong> {order.paymentInfo.transactionId}
            </p>
            {order?.paymentInfo?.transactionimageUrl && (
      <img
        src={order.paymentInfo.transactionimageUrl}
        alt="Payment Screenshot"
        className="w-25 h-25 border rounded object-cover"
      />
    )}
                </div>
            ) : (
                <p className="text-gray-500">No Payment Info.</p>
            )}

<h2 className="text-xl font-semibold mt-4">Shipment Info</h2>
            {order.status === 'Shipping' ? (
                <div className="border p-4 rounded-md">
             <p>
                <strong>Status:</strong>{" "}
                {shippingDetail?.status || "N/A"}
            </p>
            <p>
                <strong>Location:</strong> {shippingDetail?.location}
            </p>
            <p>
                <strong>LastUpdated :</strong> {shippingDetail?.lastUpdated}
            </p>
            <p>
                <strong>Details:</strong> {shippingDetail?.instructions}
            </p>
        </div>
            ) : (
                <p className="text-gray-500">No Shipment Info.</p>
            )}

            <h2 className="text-xl font-semibold mt-4">Shipping Address</h2>
            {order.address ? (
                <div className="border p-4 rounded-md">
                    <p>
                        <strong>Full Address:</strong>{" "}
                        {order.address.fullAddress}
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

            <h2 className="text-xl font-semibold mt-4">Items</h2>
            {order.items?.length > 0 ? (
                <ul>
                    {order.items.map((item: any, index: number) => (
                        <li
                            key={item.product?._id}
                            className="border p-4 mt-2 rounded-md"
                        >
                            <p>
                                <strong>Product SKU:</strong> {item?.product?.SKU}
                            </p>
                            <p>
                                <strong>Product:</strong> {item?.product?.title}
                            </p>
                            <p>
                                <strong>Quantity:</strong>{" "}
                                <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) =>
                                        handleQuantityChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    className="border px-2 py-1 rounded w-16 bg-black text-white"
                                />
                            </p>
                            <p>
                                <strong>Price:</strong> ₹
                                {(() => {
                                    // Find the correct price for the current quantity
                                    const price =
                                        item?.product?.sellingPrice.find(
                                            (priceOption: any) =>
                                                item.quantity >=
                                                priceOption.minQuantity
                                        );

                                    // If the price for the current quantity is found, use it; otherwise, fall back to originalPrice
                                    const selectedPrice = price
                                        ? price?.pricePerUnit
                                        : item.product?.originalPrice;

                                    return selectedPrice?.toFixed(2);
                                })()}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500">No items found in this order.</p>
            )}

            <button
                className="mt-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleUpdateOrder}
                disabled={updating}
            >
                {updating ? "Updating..." : "Update Order"}
            </button>
        </div>
    );
};

export default OrderDetails;
