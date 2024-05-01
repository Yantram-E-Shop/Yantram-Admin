"use client"
import { format } from "date-fns";


import { formatter } from "@/lib/utils";

import { OrderColumn } from "./Order/columns";
import { OrderClient } from "./Order/client";
import { useEffect, useState } from "react";
import axios from "axios";

const Orders = async () => {
    const [orders, setOrders] = useState<OrderColumn[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('/api/v1/orders'); // Replace with your backend API endpoint
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);
  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((orderItem) => orderItem.product.name).join(", "),
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + Number(item.product.price);
      }, 0)
    ),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default Orders;
