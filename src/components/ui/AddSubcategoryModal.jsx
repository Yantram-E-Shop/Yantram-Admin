"use client";

import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddSubcategoryModal = ({
  isOpen,
  onClose,
  onSubcategoryAdded,
  subcategoryToEdit, // ✨ New prop for edit
  categories,
}) => {
  const [subcategoryName, setSubcategoryName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null); // ✨ Preview
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fetchSubcategory = async () => {
      if (subcategoryToEdit) {
        try {
          const res = await axios.get(
            `/api/v1/sub-category/${subcategoryToEdit}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          setSubcategoryName(res.data.data.name);
          setSelectedCategoryId(res.data.data.category || "");
          if (res.data.data.logoUrl) {
            setLogoPreview(res.data.data.logoUrl); // fix: use res.data.data.logoUrl
          }
        } catch (err) {
          console.error("Failed to fetch subcategory", err);
        }
      } else {
        resetForm();
      }
    };
  
    fetchSubcategory();
  }, [subcategoryToEdit, isOpen]);
  

  const handleInputChange = (e) => setSubcategoryName(e.target.value);

  const handleCategoryChange = (e) => setSelectedCategoryId(e.target.value);

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId || !subcategoryName) {
      setFeedback({ type: "error", message: "All fields are required" });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      let subcategoryId;

      // Create or update subcategory
      if (subcategoryToEdit) {

        const formData = new FormData();
        formData.append("logo", logo);
        formData.append("name",subcategoryName);
        formData.append("category",selectedCategoryId);
        const res = await axios.put(
          `/api/v1/sub-category/${subcategoryToEdit}`,formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        subcategoryId = res.data.data._id;
      } 
      else 
      {
        const res = await axios.post(
          `/api/v1/sub-category/c/${selectedCategoryId}`,
          { name: subcategoryName },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        subcategoryId = res.data.data._id;

        // Handle logo upload
        if (logo) {
          const formData = new FormData();
          formData.append("logo", logo);

          await axios.put(
            `/api/v1/sub-category/${subcategoryId}/updateLogo`,
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
        message: `Subcategory ${subcategoryToEdit ? "updated" : "created"} successfully!`,
      });
      onSubcategoryAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error:", error);
      setFeedback({
        type: "error",
        message: `Failed to ${subcategoryToEdit ? "update" : "add"} subcategory.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubcategoryName("");
    setSelectedCategoryId("");
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
        {subcategoryToEdit ? "Edit Subcategory" : "Add New Subcategory"}
      </h2>

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

      {logoPreview && (
        <img
          src={logoPreview}
          alt="Logo Preview"
          className="mb-4 w-32 h-32 object-contain border rounded"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting
          ? "Submitting..."
          : subcategoryToEdit
          ? "Update Subcategory"
          : "Add Subcategory"}
      </button>
    </Modal>
  );
};

export default AddSubcategoryModal;
