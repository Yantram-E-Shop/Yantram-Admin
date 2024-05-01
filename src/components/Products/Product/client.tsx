"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { ProductColumn, columns } from "./columns";

interface ProductsClientProps {
  data: ProductColumn[];
}

const sampleData: ProductColumn[] = [
  {
    id: "1",
    name: "Product 1",
    price: 10.00,
    category: "Category A",
    size: "Medium",
    color: "Red",
    createdAt: "2024-05-01",
    isFeatured: true,
    isArchived: false,
  },
  {
    id: "2",
    name: "Product 2",
    price: 15.00,
    category: "Category B",
    size: "Large",
    color: "Blue",
    createdAt: "2024-05-02",
    isFeatured: false,
    isArchived: true,
  },
  // Add more sample data as needed
];


export const ProductsClient: React.FC<ProductsClientProps> = ({ data }) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Products (${sampleData.length})`} description="Manage products for your store" />
        <Button onClick={() => router.push(`/products/new`)}>
          <Plus className="w-4 h-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns}  data={sampleData} />
      <Heading title="API" description="API Calls for Products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
