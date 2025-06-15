"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { columns, OrderColumn } from "./columns";
import { AuthContext } from "@/context/AuthContext";
import React, { useContext, useState } from "react";
import { parse } from "date-fns";
import * as XLSX from "xlsx";
import axios from "axios";
import { format } from "date-fns";

interface OrdersClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalOrders: number;
}

export const OrdersClient: React.FC<OrdersClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  data,
  page,
  setPage,
  totalPages,
  totalOrders
}) => {
  const params = useParams();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [selectedFilter, setSelectedFilter] = useState("All");


const handleExportToExcel = async () => {
  const filteredOrders = await getFilteredOrders();
  console.log(filteredOrders);

  if (!filteredOrders || filteredOrders.length === 0) {
    alert("No data to export.");
    return;
  }

  try {
    const detailedOrders: any[] = [];
    for (const order of filteredOrders) {
      const res = await axios.get(`/api/v1/orders/admin/orders/${order.id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const o = res.data?.data?.order;
      o.items.forEach((item: { product: { SKU: any; title: any; sellingPrice: { pricePerUnit: any; }[]; }; quantity: any; }) => {
        detailedOrders.push({
          "Date": format(new Date(o.createdAt), "yyyy-MM-dd"),
          "Order ID": o.orderID,
          "Status": o.status,
          "Total Order Cost": o.paymentInfo?.totalamount,
          "Shipping Cost": o.paymentInfo?.shippingCost,
          "Order Cost": o.paymentInfo?.amount,
          "Payment Method": o.paymentInfo?.mode || "N/A",
          "Product SKU": item.product?.SKU,
          "Product": item.product?.title,
          "Product Price/Unit": item.product?.sellingPrice[0].pricePerUnit,
          "Quantity": item.quantity,
          "Customer Name": o.address?.user?.fullName,
          "Customer Address": o.address?.fullAddress,
          "Customer City": o.address?.district,
          "Customer State": o.address?.state,
          "Customer Pincode": o.address?.pincode,
          "Customer PhoneNumber": o.address?.phoneNumber,
          "Customer GST number": o.address?.gstNumber,
        });
      });
    }

    // ✅ Create workbook only after collecting all rows
    const worksheet = XLSX.utils.json_to_sheet(detailedOrders);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "detailed_orders.xlsx");
  } catch (err) {
    console.error("Export failed", err);
    alert("Failed to export orders. See console for details.");
  }
};


const getFilteredOrders = async() => {
  if (selectedFilter === "All") return data;

  const now = new Date();
  let fromDate: Date;

  switch (selectedFilter) {
    case "10days":
      fromDate = new Date();
      fromDate.setDate(now.getDate() - 10);
      break;
    case "1month":
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      fromDate = new Date();
      fromDate.setMonth(now.getMonth() - 6);
      break;
    default:
      return data;
  }

  return data.filter((order) => {
    // 🟡 Replace this with the actual date string field (e.g., order.createdAt)
    const orderDate = parse(order.createdAt, "MMMM do, yyyy", new Date());
    return orderDate >= fromDate;
  });
};

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Orders (${totalOrders})`} description="Manage Orders for your store" />

       <div className="flex items-center gap-2">
      <select
        value={selectedFilter}
        onChange={(e) => setSelectedFilter(e.target.value)}
        className="border px-2 py-1 rounded text-black"
      >
        <option value="All">All</option>
        <option value="10days">Last 10 Days</option>
        <option value="1month">Last 1 Month</option>
        <option value="3months">Last 3 Months</option>
        <option value="6months">Last 6 Months</option>
      </select>

      <Button onClick={handleExportToExcel}>
        Export to Excel
      </Button>

      <Button onClick={() => setIsModalOpen(true)}>
        <Plus className="w-4 h-4 mr-2" /> Update MinOrder Value
      </Button>
      </div>
      </div>

      <Separator />
      <DataTable searchKey="orderId" columns={columns} data={data} />

      <div className="flex items-center justify-between py-4 space-x-2">
        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </Button>
      </div>

      <Heading title="API" description="API Calls for Orders" />
      <Separator />
      <ApiList entityName="orders" entityIdName="orderId" />
    </>
  );
};
