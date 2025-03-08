"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action"; // Assume you have similar actions for coupons

// Adjusted type to match coupon data
export type CouponColumn = {
  _id: string;
  code: string;
  discountType: string; // value or percentage
  discountValue: number; // discount amount
  validFrom: Date;
  validUntil: string;
  maxUsageLimit: number;
  currentUsage: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

// Adjusted columns for coupon data
export const columns: ColumnDef<CouponColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "code",
    header: "Coupon Code",
  },
  {
    accessorKey: "discountType",
    header: "Discount Type",
  },
  {
    accessorKey: "discountValue",
    header: "Discount Value",
    cell: ({ row }) => (
      <span>
        {row.original.discountType === "percentage"
          ? `${row.original.discountValue}%`
          : `$${row.original.discountValue}`}
      </span>
    ),
  },
  {
    accessorKey: "validFrom",
    header: "Valid From",
  },
  {
    accessorKey: "validUntil",
    header: "Valid Until",
  },
  {
    accessorKey: "maxUsageLimit",
    header: "Max Usage Limit",
  },
  {
    accessorKey: "currentUsage",
    header: "Current Usage",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (row.original.isActive ? "Yes" : "No"),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />, // Assuming you have a similar action component
  },
];
