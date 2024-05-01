"use client";

import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { columns, OrderColumn } from "./columns";

interface OrderClientProps {
  data: OrderColumn[];
}

export const OrderClient: React.FC<OrderClientProps> = ({ data }) => {

    const sampleData = [
        {
          id: '1',
          phone: '1234567890',
          address: '123 Main St, City, Country',
          isPaid: true,
          totalPrice: '$100.00',
          products: 'Product 1, Product 2',
          createdAt: '2022-05-01',
        },
        {
          id: '2',
          phone: '9876543210',
          address: '456 Elm St, City, Country',
          isPaid: false,
          totalPrice: '$50.00',
          products: 'Product 3, Product 4',
          createdAt: '2022-05-02',
        },
        // Add more sample data as needed
      ];


  return (
    <>
      <Heading title={`Orders (${data.length})`} description="Manage orders for your store" />
      <Separator />
      <DataTable searchKey="products" columns={columns} data={sampleData} />
    </>
  );
};
