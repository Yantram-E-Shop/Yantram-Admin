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

const Products = () => {
  const [products, setProducts] = useState<ProductColumn[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        const response = await axios.get(`${BASE_URL}/products?page=${page}`, {
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

    fetchProducts();
  }, [accessToken, page]);

  const formattedProducts = products.map((item) => ({
    id: item._id,
    title: item.title,
    originalPrice: item.originalPrice,
    category: item.category,
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
          totalPages={totalPages}
          totalProducts={totalProducts}
        />
        <AddProductModal isOpen={isModalOpen} onClose={closeModal} onProductAdded={onProductAdded} />
      </div>
    </div>
  );
};

export default Products;