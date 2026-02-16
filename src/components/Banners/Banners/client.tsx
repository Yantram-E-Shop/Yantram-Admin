"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { BannerColumn, columns } from "./columns";
import React from "react";

interface BannersClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onOpenModal: (banner?: BannerColumn) => void; // New prop for opening modal with optional banner data
  data: any;
}

export const BannersClient: React.FC<BannersClientProps> = ({ isModalOpen, setIsModalOpen, onOpenModal, data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Banners`} description="Manage banners for your store" />
        <Button onClick={() => { onOpenModal() }}> {/* Call onOpenModal without arguments for adding */}
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div >
      <Separator />
      <DataTable searchKey="title" columns={columns(onOpenModal)} data={data} /> {/* Pass onOpenModal to columns */}
      <Heading title="API" description="API Calls for Banners" />
      <Separator />
      <ApiList entityName="banners" entityIdName="bannerId" />
    </>
  );
};