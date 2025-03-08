"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import React from "react";
import { columns } from "./columns"; // Define the attribute columns here

interface AttributesClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
}

export const AttributesClient: React.FC<AttributesClientProps> = ({ isModalOpen, setIsModalOpen, data }) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Attributes (${data.length})`} description="Manage product attributes for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add New Attribute
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      
      <Heading title="API" description="API Calls for Attributes" />
      <Separator />
      <ApiList entityName="attributes" entityIdName="attributeId" />
    </>
  );
};
