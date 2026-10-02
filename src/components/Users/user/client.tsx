"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { columns, UserColumn } from "./columns";
import React from "react";
import { useAuthContext } from "@/hooks/useAuthContext";
import axios from "axios";
import { createExportCacheKey, fetchAllCachedPages, getCachedExportValue, getCachedExportValueIfFresh, mapWithConcurrency } from "@/lib/export-cache";

interface UsersClientProps {
  data: any[];
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
  totalUsers: number;
}

export const UsersClient: React.FC<UsersClientProps> = ({
  data,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  totalPages,
  totalUsers
}) => {
  const params = useParams();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { role, accessToken } = useAuthContext();
  const isAdmin = role?.toLowerCase() === "admin";
  const [isExporting, setIsExporting] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (localSearch.trim() !== searchQuery) {
      setSearchQuery(localSearch.trim());
      setPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleExportToExcel = async () => {
    if (!isAdmin) return;

    setIsExporting(true);
    try {
      const cacheKey = createExportCacheKey(accessToken, "users", searchQuery);
      const allUsers = await fetchAllCachedPages<any>(cacheKey, async (requestedPage) => {
        const params = new URLSearchParams({
          page: String(requestedPage),
          limit: "100",
          searchQuery,
        });
        const response = await axios.get(`/api/v1/user?${params}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        return response.data;
      });

      if (allUsers.length === 0) {
        alert("No users to export.");
        return;
      }

    const cachedProducts = getCachedExportValueIfFresh<any[]>(
      `${createExportCacheKey(accessToken, "products")}:all`
    );
    const productNames = new Map(
      (cachedProducts ?? []).map((product) => [String(product._id), product.title])
    );

    const cartProductIds = Array.from(new Set(allUsers.flatMap((user) =>
      (Array.isArray(user.cart) ? user.cart : [])
        .flatMap((cart: any) => cart.items || [])
        .map((item: any) => {
          const product = item.product;
          return typeof product === "string" ? product : product?._id || product?.id;
        })
        .filter((productId: unknown): productId is string => typeof productId === "string")
    )));
    const uncachedProductIds = cartProductIds.filter((productId) => !productNames.has(productId));

    await mapWithConcurrency(uncachedProductIds, 4, async (productId) => {
      try {
        const product = await getCachedExportValue(
          createExportCacheKey(accessToken, "product-by-id", productId),
          async () => {
            const response = await axios.get(`/api/v1/products/${productId}`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            return response.data?.data;
          }
        );
        if (product?.title) productNames.set(productId, product.title);
      } catch (error) {
        console.warn(`[Users export] Could not resolve product ${productId}`, error);
      }
    });

    const worksheetData = allUsers.map((user) => {
      const address = user.address || user.addresses?.[0];
      return {
      "ID": user._id || user.id,
      "Full Name": user.fullName,
      "Phone Number": user.phoneNumber,
      "Email": user.email,
      "Shop Name": address?.shopName || user.shopName,
      "Full Address": address?.fullAddress,
      "Landmark": address?.landmark,
      "Pincode": address?.pincode,
      "District": address?.district,
      "State": address?.state,
      "Fcm Token": user.fcmToken,
      "Role": user.role,
      "Number Verified": user.numberVerified ?? (user.isNumberVerified ? "Yes" : "No"),
      "Status": user.state,
      "Date": user.createdAt,
      "Cart Items": (Array.isArray(user.cart) ? user.cart : [])
        .flatMap((cart: any) => cart.items || [])
        .map((item: any) => {
          const product = item.product;
          const productId = typeof product === "string" ? product : product?._id || product?.id;
          const cachedProductName = productNames.get(String(productId));
          const productName = product?.title || cachedProductName;
          return `${productName || productId || "N/A"} - Qty: ${item.quantity || 0} - Price: ${item.totalPrice || 0}`;
        })
        .join("\n"),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
    } catch (error) {
      console.error("User export failed", error);
      alert("Failed to export users.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Users (${totalUsers})`} description="Manage users of your platform" />
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button variant="outline" onClick={handleExportToExcel} disabled={isExporting}>
	              {isExporting ? "Exporting..." : "Export to Excel"}
            </Button>
          )}
        </div>
      </div>
      <Separator />
      <div className="mt-4 mb-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search users Global (Press Enter or click Search)"
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 text-white bg-black border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleSearchSubmit} className="flex-shrink-0">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>
      <DataTable searchKey="fullName" columns={columns} data={data} /> {/* Keep searchKey for client-side filtering on current page */}
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
      <Heading title="API" description="API Calls for Users" />
      <Separator />
      <ApiList entityName="users" entityIdName="userId" />
    </>
  );
};
