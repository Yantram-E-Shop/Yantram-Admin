"use client";
import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded }) => {
  const [categoryName, setCategoryName] = useState("");
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setLogo(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      // Step 1: Create category
      const response = await axios.post(
        `/api/v1/category`,
        { name: categoryName },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const createdCategoryId = response.data.data._id;

      // Step 2: Upload logo
      const formData = new FormData();
      formData.append("logo", logo);

      await axios.put(
        `/api/v1/category/${createdCategoryId}/updateLogo`,
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
        message: "Category created successfully with logo!",
      });
      onCategoryAdded(); // Trigger the callback function
      resetForm();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding category:", error);
      setFeedback({
        type: "error",
        message: "Failed to add category. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setLogo(null);
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
      <h2 className="text-white text-xl mb-4">Add New Category</h2>

      <input
        type="text"
        placeholder="Category Name"
        value={categoryName}
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
        {isSubmitting ? "Submitting..." : "Add Category"}
      </button>
    </Modal>
  );
};

export default AddCategoryModal;
