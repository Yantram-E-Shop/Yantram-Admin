"use client";

import { Plus, Search } from "lucide-react";
import { useState } from "react";
import * as XLSX from "xlsx";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { columns, UserColumn } from "./columns";
import React from "react";

interface UsersClientProps {
  data: any[];
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
  totalUsers: number;
}

export const UsersClient: React.FC<UsersClientProps> = ({
  data,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  totalPages,
  totalUsers
}) => {
  const params = useParams();
  const router = useRouter();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  };

  const handleSearchSubmit = () => {
    if (localSearch.trim() !== searchQuery) {
      setSearchQuery(localSearch.trim());
      setPage(1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleExportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No users to export.");
      return;
    }

    const worksheetData = data.map((user) => ({
      "Full Name": user.fullName,
      "Shop Name": user.shopName,
      "Phone Number": user.phoneNumber,
      Role: user.role,
      "Number Verified": user.numberVerified,
      Status: user.state,
      Date: user.createdAt,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
    XLSX.writeFile(workbook, "users.xlsx");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Users (${totalUsers})`} description="Manage users of your platform" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            Export to Excel
          </Button>
          <Button onClick={() => router.push(`/users/new`)}>
            <Plus className="w-4 h-4 mr-2" /> Add New
          </Button>
        </div>
      </div>
      <Separator />
      <div className="mt-4 mb-2 flex items-center gap-2">
        <input
          type="text"
          placeholder="Search users Global (Press Enter or click Search)"
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 text-white bg-black border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={handleSearchSubmit} className="flex-shrink-0">
          <Search className="w-4 h-4 mr-2" /> Search
        </Button>
      </div>
      <DataTable searchKey="fullName" columns={columns} data={data} /> {/* Keep searchKey for client-side filtering on current page */}
      <div className="flex items-center justify-between py-4 space-x-2">
        <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </Button>
      </div>
      <Heading title="API" description="API Calls for Users" />
      <Separator />
      <ApiList entityName="users" entityIdName="userId" />
    </>
  );
};
