"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { ShippingColumn, generateColumns } from "./columns"; // ✅ make sure generateColumns is imported
import React from "react";

interface ShippingClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: ShippingColumn[];
  onZoneAdded: (zone: any) => void;
}

export const ShippingClient: React.FC<ShippingClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  data,
  onZoneAdded, // ✅ receiving correctly
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Shipping Zones`} description="Manage shipping zones for your store" />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add New Zone
        </Button>
      </div>
      <Separator />

      <DataTable
        columns={generateColumns(data, onZoneAdded)} // ✅ correct usage here
        data={data} searchKey={""}      />

      <Heading title="API" description="API Calls for Shipping Zone" />
      <Separator />
      <ApiList entityName="zone" entityIdName="zoneId" />
    </>
  );
};
