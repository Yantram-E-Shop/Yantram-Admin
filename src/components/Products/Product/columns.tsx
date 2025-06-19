"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  _id:string;
  SKU:string;
  title: string;
  originalPrice: string | number;
  sellingPrice: { minQuantity: number; pricePerUnit: number }[]; 
  category: string;
  subCategory: string;
  soldQuantity: string | number;
  createdAt: string;
  availableQuantity: string | number;
  isAvailable: boolean;
  attributes: { attribute: string; value: string; _id: string }[];
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "SKU",
    header: "SKU",
  },
  {
    accessorKey: "title",
    header: "Name",
  },
  {
    accessorKey: "originalPrice",
    header: "MRP.",
  },
  {
    accessorKey: "sellingPrice",
    header: "Selling Prices",
    cell: ({ row }) => {
      const prices = row.original.sellingPrice;
      if (!prices || prices.length === 0) return "N/A";
  
      const validPrices = prices.filter(p => p.minQuantity > 0);
  
      if (validPrices.length === 0) return "N/A";
  
      return (
        <div className="space-y-1">
          {validPrices.map((p, idx) => (
            <div key={idx}>
              Min: {p.minQuantity}, ₹{p.pricePerUnit}/unit
            </div>
          ))}
        </div>
      );
    },
  },  
  {
    accessorKey: "isAvailable",
    header: "Available",
  },
  {
    accessorKey: "availableQuantity",
    header: "Available Quantity",
  },
  {
    accessorKey: "soldQuantity",
    header: "Sold Quantity",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "subCategory",
    header: "Sub-Category",
  },
  {
    accessorKey: "attributes",
    header: "Attributes",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.getValue("attributes")}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];