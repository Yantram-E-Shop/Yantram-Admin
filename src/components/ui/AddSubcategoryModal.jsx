
"use client";

import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddSubcategoryModal = ({
  isOpen,
  onClose,
  onSubcategoryAdded,
  categories,
}) => {
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const handleInputChange = (e) => {
    setSubcategoryName(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategoryId(e.target.value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      // Step 1: Create subcategory
      const response = await axios.post(
        `/api/v1/sub-category/c/${selectedCategoryId}`, // Update with your API route for adding a subcategory
        { name: subcategoryName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const createdSubcategoryId = response.data.data._id;

      // Step 2: Upload logo
      const formData = new FormData();
      formData.append("logo", logo);

      await axios.put(
        `/api/v1/sub-category/${createdSubcategoryId}/updateLogo`, // Update with your API route for logo upload
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      setFeedback({
        type: "success",
        message: "Subcategory created successfully with logo!",
      });
      onSubcategoryAdded(); // Trigger the callback function
      resetForm();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding subcategory:", error);
      setFeedback({
        type: "error",
        message: "Failed to add subcategory. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubcategoryName("");
    setLogo(null);
    setSelectedCategoryId("");
  };

  const modalStyles = {
    content: {
      backgroundColor: "#ffffff",
      color: "#2d2d2d",
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "600px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
    },
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      {feedback.message && (
        <p
          className={`mb-4 ${
            feedback.type === "error" ? "text-red-500" : "text-green-500"
          }`}
        >
          {feedback.message}
        </p>
      )}
      <h2 className="text-white text-xl mb-4">Add New Subcategory</h2>

      <select
        value={selectedCategoryId}
        onChange={handleCategoryChange}
        className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
      >
        <option value="">Select Category</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Subcategory Name"
        value={subcategoryName}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="w-full mb-4 p-2 bg-gray-900 text-white rounded"
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : "Add Subcategory"}
      </button>
    </Modal>
  );
};

export default AddSubcategoryModal;
