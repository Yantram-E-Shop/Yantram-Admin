import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import ValueAction from "./ValueAction";
import { useState } from "react";

export type AttributeColumn = {
  _id: string;
  name: string;
  values: string[]; // Array of values (like color options)
  updatedAt: string; // Last updated date
};

// New component for the cell rendering
const ValuesCell: React.FC<{ row: any }> = ({ row }) => {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  const toggleValue = (value: string) => {
    setSelectedValues((prevSelected) =>
      prevSelected.includes(value)
        ? prevSelected.filter((v) => v !== value)
        : [...prevSelected, value]
    );
  };

  return (
    <div className="flex flex-col gap-y-1">
      {Array.isArray(row.original.values) && row.original.values.length > 0 ? (
        row.original.values.map((value: string, index: number) => (
          <div key={index} className="flex justify-between items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(value)}
                onChange={() => toggleValue(value)}
                className="mr-2"
              />
              {value}
            </label>
          </div>
        ))
      ) : (
        <span>No values</span>
      )}
      <ValueAction
        attributeId={row.original._id} // Pass the attribute ID
        valuesToDelete={selectedValues} // Pass the selected values to delete
        onValueDeleted={() => {
          window.location.reload();
        }}
      />
    </div>
  );
};

// Adjusted columns for attributes data
export const columns: ColumnDef<AttributeColumn>[] = [
  {
    accessorKey: "_id",
    header: "ID",
  },
  {
    accessorKey: "name",
    header: "Attribute Name",
  },
  {
    accessorKey: "values",
    header: "Values",
    cell: ValuesCell, // Use the new component here
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