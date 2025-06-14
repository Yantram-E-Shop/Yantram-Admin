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
  const fileInputRefBulk = useRef<HTMLInputElement | null>(null);

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

const handleBulkProductCreateFromExcel = async (file: File) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    // Step 1: Query all mappings once
    const [resCat, resSubCat, resAttr] = await Promise.all([
      axios.get(`/api/v1/category`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      axios.get(`/api/v1/sub-category`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      axios.get(`/api/v1/attributes`, { headers: { Authorization: `Bearer ${accessToken}` } }),
    ]);

    const categoryMap: Record<string, string> = {};
    resCat.data.data.forEach((cat: any) => {
      categoryMap[cat.name.trim().toLowerCase()] = cat._id;
    });

    const subCategoryMap: Record<string, string> = {};
    resSubCat.data.data.forEach((sub: any) => {
      subCategoryMap[sub.name.trim().toLowerCase()] = sub._id;
    });

    const attributeMap: Record<string, string> = {};
    resAttr.data.data.forEach((attr: any) => {
      attributeMap[attr.name.trim().toLowerCase()] = attr._id;
    });

    console.log(subCategoryMap);


    // Step 2: Process each row
    for (const row of json) {
      try {
        console.log("Subctaegory Name",row.SubCategoryName);
        console.log(subCategoryMap[(row.SubCategoryName || "").trim().toLowerCase()]);
        const attributes: { attribute: string; value: string }[] = [];

        if (row.Attributes) {
          const attrPairs = (row.Attributes as string).split(";");
          for (const pair of attrPairs) {
            const [key, value] = pair.split(":");
            if (key && value) {
              const attrId = attributeMap[key.trim().toLowerCase()];
              if (attrId) {
                attributes.push({ attribute: attrId, value: value.trim() });
              } else {
                console.warn(`Attribute "${key}" not found in system.`);
              }
            }
          }
        }

        const productData = {
          title: row.Title,
          description: row.Description,
          category: categoryMap[(row.CategoryName || "").trim().toLowerCase()],
          subCategory: subCategoryMap[(row.SubCategoryName || "").trim().toLowerCase()],
          SKU: row.SKU,
          modelName: row.ModelName || "",
          minQuantity: Number(row.MinQuantity) || 0,
          HSN: row.HSN || "",
          tax: row.Tax || "",
          attributes,
          originalPrice: Number(row["Original Price"]) || 0,
          sellingPrice: [
            { minQuantity: Number(row.Qty1), pricePerUnit: Number(row.Price1) },
            { minQuantity: Number(row.Qty2), pricePerUnit: Number(row.Price2) },
            { minQuantity: Number(row.Qty3), pricePerUnit: Number(row.Price3) },
          ].filter(e => e.minQuantity && e.pricePerUnit),
          availableQuantity: Number(row["Available Quantity"]) || 0,
          soldQuantity: 0,
          isAvailable: row.Status === "Active",
          isFeatured: row.IsFeatured === "true" || false,
          isOffer: row.IsOffer === "true" || false,
          productCode: row.ProductCode || "",
        };

        console.log(productData);
        const res = await axios.post(`/api/v1/products`,  { content: productData }, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const createdProductId = res.data.data._id;
        console.log(`Created product Id: ${createdProductId}`);

        const imagePaths = row.ImagePath
        ? row.ImagePath.split(";").map(img => img.trim()).filter(Boolean)
        : [];

      const imageUrls = {
          imageUrls: imagePaths
      };

        await axios.put(`/api/v1/products/${createdProductId}/imagesurl`, imageUrls, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        console.log(`✅ Uploaded images for ${productData.title}`);

      } catch (err) {
        console.error("Error creating product:", err);
      }
    }
    alert("Bulk product creation completed!");
  } catch (error) {
    console.error("Error processing Excel:", error);
    alert("Failed to process the bulk product Excel file.");
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
 <Button variant="outline" onClick={() => fileInputRefBulk.current?.click()}>
  Create Bulk Products
</Button>
<input
  type="file"
  accept=".xlsx, .xls"
  ref={fileInputRefBulk}
  style={{ display: "none" }}
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleBulkProductCreateFromExcel(file);
      e.target.value = ""; // Reset file input
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
      {/* <div className="mt-4 mb-2">
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
      </div> */}

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
