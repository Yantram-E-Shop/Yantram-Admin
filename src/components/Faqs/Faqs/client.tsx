"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { FaqColumn, columns } from "./columns";
import React from "react";

interface FaqsClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
}

export const FaqsClient: React.FC<FaqsClientProps> = ({ isModalOpen, setIsModalOpen, data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Faqs`} description="Manage Faqs for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div >
      <Separator />
      <DataTable searchKey="question" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Faqs" />
      <Separator />
      <ApiList entityName="Faqs" entityIdName="FaqId" />
    </>
  );
};