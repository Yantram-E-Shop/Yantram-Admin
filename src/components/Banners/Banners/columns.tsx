"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type BannerColumn = {
  _id: string;
  title: string;
  preference: number;
  Page: string;
  createdAt: string;
};

export const columns = (onOpenModal: (banner: BannerColumn) => void): ColumnDef<BannerColumn>[] => [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "title",
    header: "Banner Name",
  },
  {
    accessorKey: "preference",
    header: "Preference",
  },
  {
    accessorKey: "pageName",
    header: "Description",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} onOpenModal={onOpenModal} />,
  },
];