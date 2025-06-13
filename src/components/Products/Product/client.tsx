"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";
import { ProductColumn, columns } from "./columns";
import React, { useState,useContext,useRef  } from "react";
import * as XLSX from "xlsx";
import { AuthContext } from "@/context/AuthContext";
import axios from "axios";

interface ProductsClientProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  data: any;
  page: number;
  setPage: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  totalPages: number;
  totalProducts: number;
}

interface ProductUpdateRow {
  ID: string;
  SKU: string;
  Title: string;
  CategoryId: string;
  SubcategoryId: string;
  "Original Price": number;
  "Available Quantity": number;
  Status: string;
  Qty1: number;
  Price1: number;
  Qty2: number;
  Price2: number;
  Qty3: number;
  Price3: number;
}

export const ProductsClient: React.FC<ProductsClientProps> = ({
  isModalOpen,
  setIsModalOpen,
  data,
  page,
  setPage,
  searchQuery,
  setSearchQuery,
  totalPages,
  totalProducts,
}) => {
  const params = useParams();
  const router = useRouter();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  // Inside the component
const fileInputRef = useRef<HTMLInputElement | null>(null);

const triggerFileSelect = () => {
  fileInputRef.current?.click();
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);

    if (value.length >= 3 || value.length === 0) {
      setSearchQuery(value);
      setPage(1); // Reset to first page when new search is triggered
    }
  };

  const handleExportToExcel = async () => {
  try {
        const res = await axios.get(`api/v1/products?limit=100000&searchQuery=${searchQuery}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log(res.data?.data);

    const allProducts = res.data?.data?.data || [];
    if (allProducts.length === 0) {
      alert("No products found.");
      return;
    }

    const resCat = await axios.get(`api/v1/category`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
    
    const categories = resCat.data.data;
    const categoryMap: Record<string, string> = {};
    categories?.forEach((cat: any) => {
      categoryMap[cat._id] = cat.name;
    });

    const resSubCat = await axios.get(`api/v1/sub-category`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
    });
    
    const subCategories = resSubCat.data.data;
    const subCategoryMap: Record<string, string> = {};
    subCategories?.forEach((cat: any) => {
      subCategoryMap[cat._id] = cat.name;
    });


    const formatted = allProducts.map((product: any) => ({
      "ID":product._id,
      "SKU":product.SKU,
      "Title": product.title,
      "CategoryId": product.category || "N/A",
      "CategoryName": categoryMap[product.category],
      "SubcategoryId": product.subCategory || "N/A",
      "Sub-CategoryName": subCategoryMap[product.subCategory],
      "Original Price": product.originalPrice,
      "Available Quantity": product.availableQuantity,
      "Status": product.isAvailable ? "Active" : "Inactive",
         // Flattened Selling Prices
    "Qty1": product.sellingPrice[0]?.minQuantity ,
    "Price1": product.sellingPrice[0]?.pricePerUnit,
    "Qty2": product.sellingPrice[1]?.minQuantity ,
    "Price2": product.sellingPrice[1]?.pricePerUnit ,
    "Qty3": product.sellingPrice[2]?.minQuantity ,
    "Price3": product.sellingPrice[2]?.pricePerUnit ,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Products");

    XLSX.writeFile(workbook, "all_products.xlsx");

  } catch (err) {
    console.error("Export failed", err);
    alert("Failed to export all products.");
  }
};

const handleProductUpdateFromExcel = async (file: File) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json: ProductUpdateRow[] = XLSX.utils.sheet_to_json(sheet);

    for (const row of json) {
      try {
        // Step 2: Get product details by ID
        const productRes = await axios.get(`/api/v1/products/${row.ID}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const product = productRes.data.data;

        // Step 3: Update fields
        const updatedProduct = {
  ...product, // Start with existing product fields
  title: row.Title,
  SKU: row.SKU,
  category: row.CategoryId,           // Match how you're exporting
  subCategory: row.SubcategoryId,     // Correct the field name
  originalPrice: Number(row["Original Price"]),
  availableQuantity: Number(row["Available Quantity"]),
  isAvailable: row.Status === "Active", // Convert string to boolean
  sellingPrice: [
    { minQuantity: row.Qty1, pricePerUnit: row.Price1 },
    { minQuantity: row.Qty2, pricePerUnit: row.Price2 },
    { minQuantity: row.Qty3, pricePerUnit: row.Price3 },
  ].filter(e => e.minQuantity && e.pricePerUnit),
        };

        // Step 4: Call update API
        const response = await axios.put(
                `/api/v1/products/${row.ID}`,
                { content: updatedProduct },
                {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                }
              );

        console.log(`Updated product ${row.ID}`);
      } catch (err) {
        console.error(`Error updating product ${row.ID}:`, err);
      }
    }
    alert("All products updated successfully.");
  } catch (error) {
    console.error("Failed to process Excel file", error);
    alert("Something went wrong while processing Excel.");
  }
};

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${totalProducts})`}
          description="Manage products for your store"
        />
        <div className="flex items-center gap-2">
  <Button onClick={handleExportToExcel}>
    Export to Excel
  </Button>

  <Button variant="outline" onClick={triggerFileSelect}>
    Update from Excel
  </Button>

  <input
    type="file"
    accept=".xlsx, .xls"
    ref={fileInputRef}
    style={{ display: "none" }}
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        handleProductUpdateFromExcel(file);
        e.target.value = ""; // Allow re-uploading same file if needed
      }
    }}
  />

  <Button onClick={() => setIsModalOpen(true)}>
    <Plus className="w-4 h-4 mr-2" /> Add New
  </Button>
</div>


      </div>
      <Separator />

      {/* 🔍 Search Input */}
      <div className="mt-4 mb-2">
        <input
          type="text"
          placeholder="Search products..."
          value={localSearch}
          onChange={handleSearchChange}
          className="w-full p-2 text-white bg-black border border-gray-600 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {localSearch.length > 0 && localSearch.length < 3 && (
          <p className="text-sm text-gray-400 mt-1">
            Enter at least 3 characters to search.
          </p>
        )}
      </div>

      <DataTable searchKey="title" columns={columns} data={data} />

      <div className="flex items-center justify-between py-4 space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
        >
          Previous
        </Button>
        <span>
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </Button>
      </div>

      <Heading title="API" description="API Calls for Products" />
      <Separator />
      <ApiList entityName="products" entityIdName="productId" />
    </>
  );
};
