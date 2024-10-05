"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";
import { OrderColumn } from "./Order/columns";
import { OrdersClient } from "./Order/client";

const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fecthOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://13.201.54.226:5000/api/v1/orders/admin/all?page=${page}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        setOrders(data.data?.data);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalOrders(data.data.pagination.totalOrders || 0);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setTimeout(() => {setLoading(false)}, 200);
      }
    };

    fecthOrders();
  }, [accessToken, page]);


  const formattedOrders = orders.map((item) => ({
    id: item.orderID,
    paymentMethod: item.paymentMethod,
    totalPrice: item.totalPrice,
    address: item.address?.fullAddress + " " + item.address?.landmark + " " + item.address?.district + " " + item.address?.state + " " + item.address?.phoneNumber + " " + item.address?.alternatePhoneNumber|| "N/A",
    // attributes: item.attributes.map(attr => attr.value).join(', ') || "N/A",
    status: item.status,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
  }));

  console.log(formattedOrders);

  if(loading) {
    return(
        <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <OrdersClient
          data={formattedOrders}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalOrders={totalOrders}
        />
      </div>
    </div>
  );
};

export default Orders;