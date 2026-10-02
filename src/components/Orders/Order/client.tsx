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
import * as XLSX from "xlsx";
import axios from "axios";
import { format } from "date-fns";
import { createExportCacheKey, fetchAllCachedPages, getCachedExportValue, mapWithConcurrency } from "@/lib/export-cache";

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
  const [isExporting, setIsExporting] = useState(false);

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
  setIsExporting(true);
  try {
    const cacheKey = createExportCacheKey(accessToken, "orders", searchQuery);
    const allOrders = await fetchAllCachedPages<any>(cacheKey, async (requestedPage) => {
      const params = new URLSearchParams({
        page: String(requestedPage),
        limit: "100",
        searchQuery,
      });
      const response = await axios.get(`/api/v1/orders/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    });
    const filteredOrders = getFilteredOrders(allOrders);

    if (filteredOrders.length === 0) {
      alert("No data to export.");
      return;
    }

    const orderRows = await mapWithConcurrency(filteredOrders, 4, async (order) => {
      const orderId = order._id || order.id;
      const orderKey = createExportCacheKey(accessToken, "order-detail", orderId);
      const orderResponse = await getCachedExportValue(orderKey, async () => {
        const response = await axios.get(`/api/v1/orders/admin/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      });
      const orderDetails = (orderResponse as any)?.data?.order;
      if (!orderDetails?.items) return [];

      return orderDetails.items.map((item: any) => ({
        "Payment Method": orderDetails.paymentInfo?.mode || "N/A",
        "Date": format(new Date(orderDetails.createdAt), "yyyy-MM-dd"),
        "Order ID": orderDetails.orderID,
        "Shop Name": orderDetails.address?.shopName || "N/A",
        "Customer Name": orderDetails.user?.fullName,
        "Customer Address": orderDetails.address?.fullAddress,
        "Customer City": orderDetails.address?.district,
        "Customer State": orderDetails.address?.state,
        "Customer Pincode": orderDetails.address?.pincode,
        "Customer PhoneNumber": orderDetails.address?.phoneNumber || orderDetails.user?.phoneNumber || "N/A",
        "Customer GST number": orderDetails.address?.gstNumber,
        "Product SKU": item.product?.SKU,
        "Product": item.product?.title,
        "Quantity": item.quantity,
        "Product Price/Unit": item.quantity ? item.totalPrice / item.quantity : 0,
        "Order Cost": orderDetails.paymentInfo?.amount,
        "Shipping Cost": orderDetails.paymentInfo?.shippingCost,
        "Total Order Cost": orderDetails.paymentInfo?.totalamount,
        "Status": orderDetails.status,
        "Invoice Generated": orderDetails.invoiceDocument ? "Yes" : "No",
      }));
    });

    const worksheet = XLSX.utils.json_to_sheet(orderRows.flat());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "detailed_orders.xlsx");
  } catch (err) {
    console.error("Export failed", err);
    alert("Failed to export orders. See console for details.");
  } finally {
    setIsExporting(false);
  }
};

const getFilteredOrders = (orders: any[]) => {
  if (selectedFilter === "All") return orders;

  const fromDate = new Date();
  switch (selectedFilter) {
    case "10days":
      fromDate.setDate(fromDate.getDate() - 10);
      break;
    case "1month":
      fromDate.setMonth(fromDate.getMonth() - 1);
      break;
    case "3months":
      fromDate.setMonth(fromDate.getMonth() - 3);
      break;
    case "6months":
      fromDate.setMonth(fromDate.getMonth() - 6);
      break;
    default:
      return orders;
  }

  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return !Number.isNaN(orderDate.getTime()) && orderDate >= fromDate;
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

      <Button onClick={handleExportToExcel} disabled={isExporting}>
    	        {isExporting ? "Exporting..." : "Export to Excel"}
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
