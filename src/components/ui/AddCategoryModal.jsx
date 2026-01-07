"use client";
import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddCategoryModal = ({ isOpen, onClose, onCategoryAdded, categoryToEdit }) => {
  const [categoryName, setCategoryName] = useState("");
  const [preference, setPreference] = useState(1);
  const [logo, setLogo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });
  const [logoPreview, setLogoPreview] = useState(null); // For logo preview

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Set initial values when the modal opens in "edit" mode
  useEffect(() => {
    if (categoryToEdit) {
      setCategoryName(categoryToEdit.name);
      setPreference(categoryToEdit.preference);
      setLogoPreview(categoryToEdit.logoUrl); // Set the existing logo URL for preview
    } else {
      setCategoryName("");
      setLogoPreview(null); // Reset preview if not editing
    }
  }, [categoryToEdit]);

  const handleInputChange = (e) => {
    setCategoryName(e.target.value);

  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    setLogo(file);

    // Create a URL for the logo preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      let response;
      let formData = new FormData();

      // Step 1: Handle category creation or update
      if (categoryToEdit) {
        // Update category if we are editing an existing one
        formData.append("name", categoryName);
        formData.append("preference", preference);
        formData.append("logoUpdated", logo);
        response = await axios.put(
          `/api/v1/category/${categoryToEdit._id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        // Create new category
        response = await axios.post(
          `/api/v1/category`,
          { name: categoryName,
            preference: preference
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      

      const createdCategoryId = response.data.data._id;

      // Step 2: Upload the logo if provided
      if (logo) {
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
      }
    }

      setFeedback({
        type: "success",
        message: categoryToEdit
          ? "Category updated successfully!"
          : "Category created successfully with logo!",
      });
      onCategoryAdded(); // Trigger the callback function to update the category list
      resetForm();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding/updating category:", error);
      setFeedback({
        type: "error",
        message: "Failed to add/update category. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setPreference(1);
    setLogo(null);
    setLogoPreview(null);
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
      <h2 className="text-white text-xl mb-4">
        {categoryToEdit ? "Update Category" : "Add New Category"}
      </h2>

      <input
        type="text"
        placeholder="Category Name"
        value={categoryName}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />
      <input
        type="number"
        placeholder="Category Preference"
        value={preference}
        onChange={(e) => setPreference(Number(e.target.value))}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoUpload}
        className="w-full mb-4 p-2 bg-gray-900 text-white rounded"
      />

      {logoPreview && (
        <div className="mb-4">
          <h3>Logo Preview:</h3>
          <img
            src={logoPreview}
            alt="Logo preview"
            className="w-32 h-32 object-cover rounded"
          />
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-#00000 rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : categoryToEdit ? "Update Category" : "Add Category"}
      </button>
    </Modal>
  );
};

export default AddCategoryModal;
