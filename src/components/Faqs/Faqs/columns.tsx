"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type FaqColumn = {
  _id: string;
  question: string;
  answer: string;
  createdAt: string;
};

export const columns: ColumnDef<FaqColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "question",
    header: "Question",
  },
  {
    accessorKey: "answer",
    header: "Answer",
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