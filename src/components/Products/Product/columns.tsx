"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ProductColumn = {
  _id: string;
  title: string;
  originalPrice: string | number;
  category: string;
  soldQuantity: string | number;
  createdAt: string;
  availableQuantity: string | number;
  isAvailable: boolean;
  attributes: { attribute: string; value: string; _id: string }[];
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Name",
  },
  {
    accessorKey: "originalPrice",
    header: "Price",
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