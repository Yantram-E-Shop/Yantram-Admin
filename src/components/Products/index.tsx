"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ProductsClient } from "./Product/client";
import { ProductColumn } from "./Product/columns";
import { AuthContext } from "@/context/AuthContext";
import AddProductModal from "../ui/AddProductModal";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

type Category = { _id: string; name: string };

const Products = () => {
  const [products, setProducts] = useState<ProductColumn[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubCategories ] = useState(null);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const  onProductAdded = () => {
    closeModal();
    setPage(1);
  }
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/products?page=${page}&limit=10000&searchQuery=${searchQuery}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        setProducts(data.data.data);
        setTotalPages(data.data.pagination.totalPages || 1);
        setTotalProducts(data.data.pagination.totalProducts || 0);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setTimeout(() => { setLoading(false) }, 200);
      }
    };

    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/category`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const data = response.data.data;
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/sub-category`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
  
        const data = response.data.data;
        setSubCategories(data);
      } catch (error) {
        console.error("Error fetching sub categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    fetchCategories();
    fetchSubCategories();
  }, [accessToken, page, searchQuery]);

  const categoryMap = React.useMemo(() => {
      const map: Record<string, string> = {};
      (categories ?? []).forEach((cat) => {
          map[cat._id] = cat.name;
      });
      return map;
  }, [categories]);
  
  const subcategoryMap = React.useMemo(() => {
      const map: Record<string, string> = {};
      (subcategories ?? []).forEach((sub: { _id: string; name: string }) => {
          map[sub._id] = sub.name;
      });
      return map;
  }, [subcategories]);
  
  const formattedProducts = products.map((item) => ({
    id:item.id,
    SKU:item.SKU,
    title: item.title,
    originalPrice: item.originalPrice,
    category: categoryMap[item.category] || "Unknown",
    subCategory: subcategoryMap[item.subCategory] || "Unknown",
    sellingPrice:item.sellingPrice || [],
    attributes: item.attributes.map(attr => attr.value).join(', ') || "N/A",
    soldQuantity: item.soldQuantity,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
    isAvailable: item.isAvailable,
    availableQuantity: item.availableQuantity,
  }));

  if (loading) {
    return (
      <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductsClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={formattedProducts}
          page={page}
          setPage={setPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalPages={totalPages}
          totalProducts={totalProducts}
        />
        <AddProductModal isOpen={isModalOpen} onClose={closeModal} onProductAdded={onProductAdded} />
      </div>
    </div>
  );
};

export default Products;