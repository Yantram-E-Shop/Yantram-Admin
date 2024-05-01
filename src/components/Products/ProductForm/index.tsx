"use client"
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductForm } from "./product-form/product-form";

const ProductPage = ({ params }) => {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product data
        const productResponse = await axios.get(`/api/product/${params.productId}`);
        setProduct(productResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get(`/api/categories`);
        setCategories(categoriesResponse.data);

        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.productId]);

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductForm categories={categories}  initialData={product} />
      </div>
    </div>
  );
};

export default ProductPage;
