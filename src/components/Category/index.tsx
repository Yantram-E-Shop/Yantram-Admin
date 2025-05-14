"use client"; // Correctly mark this file as a Client Component

import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";
import { CategoryClient } from "./Cate/client";
import { CategoryColumn } from "./Cate/columns";
import AddCategoryModal from "../ui/AddCategoryModal";
import AddSubcategoryModal from "../ui/AddSubcategoryModal"; // Import your new modal

const Category = () => {
  const [categories, setCategories] = useState<CategoryColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false); // State for subcategory modal

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/category`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.data;
      console.log("Categories fetched:", data);
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const onSubcategoryAdded = () => {
    fetchCategories(); // Refetch categories after adding a new one
    setIsSubcategoryModalOpen(false); // Close the subcategory modal
  };

  useEffect(() => {
    fetchCategories(); // Initial fetch of categories
  }, [accessToken]);

  const formattedCategories = categories.map((category) => ({
    _id: category._id,
    name: category.name,
    subcategories: category.subcategories || [],
    createdAt: format(new Date(category.createdAt), "MMMM do, yyyy"),
    updatedAt: format(new Date(category.updatedAt), "MMMM do, yyyy"),
  }));

  if (loading) {
    return <Loader />;
  }

  const onCategoryAdded = () => {
    fetchCategories(); // Refetch categories after adding a new one
    setIsModalOpen(false); // Close the category modal
  };

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <CategoryClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          setIsSubcategoryModalOpen={setIsSubcategoryModalOpen} // Pass the new handler
          data={formattedCategories}
          rawCategories={categories}
        />
        <AddCategoryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCategoryAdded={onCategoryAdded} />
        <AddSubcategoryModal
          isOpen={isSubcategoryModalOpen} // Use the state for the subcategory modal
          onClose={() => setIsSubcategoryModalOpen(false)}
          onSubcategoryAdded={onSubcategoryAdded}
          categories={categories} // Pass the categories for the dropdown
        />
      </div>
    </div>
  );
};

export default Category;
