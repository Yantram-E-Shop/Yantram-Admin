"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { columns, OrderColumn } from "./columns";
import React from "react";

interface OrdersClientProps {
  data: any[];
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  totalOrders: number;
}

export const OrdersClient: React.FC<OrdersClientProps> = ({ data, page, setPage, totalPages, totalOrders }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Orders (${totalOrders})`} description="Manage products for your store" />
        <Button onClick={() => router.push(`/products/new`)}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="id" columns={columns} data={data} />
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