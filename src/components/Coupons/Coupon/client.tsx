"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import React from "react";
import { columns } from "./columns"; // Define the coupon columns here

interface CouponsClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
}

export const CouponsClient: React.FC<CouponsClientProps> = ({ isModalOpen, setIsModalOpen, data }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Coupons (${data.length})`} description="Manage discount coupons for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add New Coupon
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="code" columns={columns} data={data} />
      
      <Heading title="API" description="API Calls for Coupons" />
      <Separator />
      <ApiList entityName="coupons" entityIdName="couponId" />
    </>
  );
};
