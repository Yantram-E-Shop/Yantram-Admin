"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import React from "react";
import { columns } from "./columns";

interface CategoryClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  setIsSubcategoryModalOpen: (isOpen: boolean) => void; // New prop for subcategory modal
  data: any;
}

export const CategoryClient: React.FC<CategoryClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  setIsSubcategoryModalOpen, // New prop for subcategory modal
  data,
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Categories (${data.length})`} description="Manage categories and subcategories for your store" />
        <Button onClick={() => { setIsModalOpen(true) }}>
          <Plus className="w-4 h-4" /> Add New Category
        </Button>
        <Button onClick={() => { setIsSubcategoryModalOpen(true) }}> {/* Adjusted to use new prop */}
          <Plus className="w-4 h-4" /> Add New Sub-Category
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="id" columns={columns} data={data} />

      <Heading title="API" description="API Calls for Categories" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};
