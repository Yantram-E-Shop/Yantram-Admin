"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { ProductColumn, columns } from "./columns";
import React, { useState } from "react";

interface ProductsClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
  totalProducts: number;
}

export const ProductsClient: React.FC<ProductsClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  data,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  totalPages,
  totalProducts,
}) => {
  const params = useParams();
  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (value.length >= 3 || value.length === 0) {
      setSearchQuery(value);
      setPage(1); // Reset to first page when new search is triggered
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${totalProducts})`}
          description="Manage products for your store"
        />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />

      {/* 🔍 Search Input */}
      <div className="mt-4 mb-2">
        <input
          type="text"
          placeholder="Search products..."
          value={localSearch}
          onChange={handleSearchChange}
          className="w-full p-2 text-white bg-black border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {localSearch.length > 0 && localSearch.length < 3 && (
          <p className="text-sm text-gray-400 mt-1">
            Enter at least 3 characters to search.
          </p>
        )}
      </div>

      <DataTable searchKey="title" columns={columns} data={data} />

      <div className="flex items-center justify-between py-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      <Heading title="API" description="API Calls for Products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
