

"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import SubcategoryAction from "./SubcategoryAction";

// Adjusted type to match category data
export type CategoryColumn = {
  _id: string;
  name: string; // Category name
  subcategories: { _id: string; name: string }[]; // Array of subcategories
  createdAt: string;
  updatedAt: string;
};

// Adjusted columns for category data
export const columns: ColumnDef<CategoryColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Category Name",
  },
  {
    accessorKey: "subcategories",
    header: "Subcategories",
    cell: ({ row }) => (
      <div className="flex flex-col gap-y-1">
        {row.original.subcategories.length > 0 ? (
          row.original.subcategories.map((subcat) => (
            <div key={subcat._id} className="flex justify-between">
              <span>{subcat.name}</span>
              <SubcategoryAction 
                subcategoryId={subcat._id} 
                onSubcategoryDeleted={() => { /* Add a function to refetch categories or update state */ }} 
              />
            </div>
          ))
        ) : (
          "No subcategories"
        )}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
