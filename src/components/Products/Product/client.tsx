"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { ProductColumn, columns } from "./columns";
import React from "react";

interface ProductsClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalProducts: number;
}

export const ProductsClient: React.FC<ProductsClientProps> = ({ isModalOpen, setIsModalOpen, data, page, setPage, totalPages, totalProducts }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Products (${totalProducts})`} description="Manage products for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div >
      <Separator />
      <DataTable searchKey="title" columns={columns} data={data} />
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
      <Heading title="API" description="API Calls for Products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};