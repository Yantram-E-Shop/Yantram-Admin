"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type ShippingColumn = {
  _id: string;
  name: string;
  states: string[];
  shippingFee: number;
  createdAt: string;
};

export const columns: ColumnDef<ShippingColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Zone",
  },
  {
    accessorKey: "states",
    header: "States",
  },
  {
    accessorKey: "shippingFee",
    header: "Shipping(%)",
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