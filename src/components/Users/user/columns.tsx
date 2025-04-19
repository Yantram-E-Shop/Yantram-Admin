"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type UserColumn = {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  fcmToken: string;
  numberVerified: string;
  createdAt: string;
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "fullName",
    header: "Full Name",
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone Number",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "fcmToken",
    header: "FCM Token",
  },
  {
    accessorKey: "numberVerified",
    header: "Number Verified",
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
