"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { ShippingColumn, columns } from "./columns";
import React from "react";

interface ShippingClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
}

export const ShippingClient: React.FC<ShippingClientProps> = ({ isModalOpen, setIsModalOpen, data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Shipping Zones`} description="Manage shipping zones for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add New Zone
        </Button>
      </div >
      <Separator />
      <DataTable searchKey="title" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Shipping Zone" />
      <Separator />
      <ApiList entityName="banners" entityIdName="bannerId" />
    </>
  );
};