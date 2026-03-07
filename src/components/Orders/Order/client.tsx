"use client";

import { Plus, Search } from "lucide-react"; // Added Search
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
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
  totalOrders: number;
}

export const OrdersClient: React.FC<OrdersClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  data,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  totalPages,
  totalOrders
}) => {
  const params = useParams();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  // Only updates local state
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
  };

  // Function to execute the search on backend
  const handleSearchSubmit = () => {
    if (localSearch.trim() !== searchQuery) {
      setSearchQuery(localSearch.trim());
      setPage(1); // Reset to first page when new search is triggered
    }
  };

  // Function to handle 'Enter' key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };


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
      o.items.forEach((item: {
        totalPrice: any; product: { SKU: any; title: any; sellingPrice: { pricePerUnit: any; }[]; }; quantity: any; 
}) => {
        detailedOrders.push({
          "Payment Method": o.paymentInfo?.mode || "N/A",
          "Date": format(new Date(o.createdAt), "yyyy-MM-dd"),
          "Order ID": o.orderID,
          "Shop Name": o.address?.shopName || "N/A", 
          "Customer Name": o.user?.fullName,
          "Customer Address": o.address?.fullAddress,
          "Customer City": o.address?.district,
          "Customer State": o.address?.state,
          "Customer Pincode": o.address?.pincode,
          "Customer PhoneNumber": o.address?.phoneNumber || o.user?.phoneNumber || "N/A",
          "Customer GST number": o.address?.gstNumber,
          "Product SKU": item.product?.SKU,
          "Product": item.product?.title,
          "Quantity": item.quantity,
          "Product Price/Unit": item.totalPrice/item.quantity,
          "Order Cost": o.paymentInfo?.amount,
          "Shipping Cost": o.paymentInfo?.shippingCost,
          "Total Order Cost": o.paymentInfo?.totalamount,
          "Status": o.status,
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

      {/* 🔍 Modified Search Input with Button */}
      <div className="mt-4 mb-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search orders Global (Press Enter or click Search)"
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown} // Listen for Enter key
          className="flex-grow p-2 text-white bg-black border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleSearchSubmit} className="flex-shrink-0">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>
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
