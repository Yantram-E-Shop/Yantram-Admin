import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ProductForm } from "./components/product-form";

const ProductPage = ({ params }) => {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product data
        const productResponse = await axios.get(`/api/product/${params.productId}`);
        setProduct(productResponse.data);

        // Fetch categories
        const categoriesResponse = await axios.get(`/api/categories`);
        setCategories(categoriesResponse.data);

        // Fetch sizes
        const sizesResponse = await axios.get(`/api/sizes`);
        setSizes(sizesResponse.data);

        // Fetch colors
        const colorsResponse = await axios.get(`/api/colors`);
        setColors(colorsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [params.productId]);

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ProductForm categories={categories} colors={colors} sizes={sizes} initialData={product} />
      </div>
    </div>
  );
};

export default ProductPage;
