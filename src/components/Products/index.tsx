"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ProductsClient } from "./Product/client";
import { ProductColumn } from "./Product/columns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";

const Products = () => {
  const [products, setProducts] = useState<ProductColumn[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://13.201.54.226:5000/api/v1/products?page=${page}`, {
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
        setTimeout(() => {setLoading(false)}, 200);
      }
    };

    fetchProducts();
  }, [accessToken, page]);

  const formattedProducts = products.map((item) => ({
    id: item._id,
    title: item.title,
    originalPrice: item.originalPrice,
    category: item.category,
    Attributes: item.attributes.map(attr => attr.value).join(', ') || "N/A", // Use map here
    soldQuantity: item.soldQuantity,
    createdAt: format(new Date(item.createdAt), "MMMM do, yyyy"),
    isAvailable: item.isAvailable,
    availableQuantity: item.availableQuantity,
  }));  

  if(loading) {
    return(
        <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductsClient
          data={formattedProducts}
          page={page}
          setPage={setPage}
          totalPages={totalPages}
          totalProducts={totalProducts}
        />
      </div>
    </div>
  );
};

export default Products;