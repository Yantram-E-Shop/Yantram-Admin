"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type BannerColumn = {
  _id: string;
  title: string;
  Page: string;
  createdAt: string;
};

export const columns: ColumnDef<BannerColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Banner Name",
  },
  {
    accessorKey: "pageName",
    header: "Page",
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