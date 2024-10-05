"use client";
import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { BASE_URL } from "@/api/axios";
import { AuthContext } from "@/context/AuthContext";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Product details, Step 2: Image upload
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    category: "",
    subCategory: "",
    SKU: "",
    modelName: "",
    HSN: "",
    tax: "",
  });
  const [productId, setProductId] = useState(null); // To store the created product ID
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit
  const [error, setError] = useState(null);

  const [categories, setCategories] = useState([]); // To store categories from API
  const [subCategories, setSubCategories] = useState([]); // To store subcategories based on selected category
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/category`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCategories(response.data.data); // Use the categories data from the API response
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [accessToken]);

  // Fetch subcategories based on selected category
  useEffect(() => {
    if (productData.category) {
      const selectedCategory = categories.find(
        (cat) => cat._id === productData.category
      );
      if (selectedCategory) {
        setSubCategories(selectedCategory.subcategories); // Set subcategories for the selected category
      }
    }
  }, [productData.category, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    try {
      // Step 1: Submit product data
      const response = await axios.post(
        `${BASE_URL}/products`,
        {
          content: productData,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const createdProductId = response.data.data._id;
      setProductId(createdProductId); // Store product ID for image upload
      setStep(2); // Proceed to the next step for image upload
    } catch (error) {
      console.error("Error creating product:", error);
      setError("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmitImage = async (e) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("images", image); // The key should be "images" as per your API

      // Upload the image for the created product
      await axios.put(`${BASE_URL}/products/${productId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Call the callback to notify parent of successful addition
      onClose(); // Close the modal after both steps are done
    } catch (error) {
      console.error("Error uploading image:", error);
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyles = {
    content: {
      // Darker background color for better contrast
      color: "#000000", // Light text color for readability
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "600px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
      position: "relative", // Ensure modal is properly positioned
      zIndex: 9999, // Highest z-index
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark overlay
      zIndex: 9999, // Ensure modal is always on top
    },
  };

  const inputStyles = `
    w-full mb-4 p-2 bg-white-900 text-black rounded border border-gray-600
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
  `;

  const buttonStyles = `
    w-full py-3 px-4 rounded-lg transition duration-300
  `;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {step === 1 && (
        <div>
          <h2 className="text-white !important text-xl mb-4">
            Add Product Details
          </h2>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={productData.title}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          {/* Category Dropdown */}
          <select
            name="category"
            value={productData.category}
            onChange={handleInputChange}
            className={inputStyles}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          {/* Subcategory Dropdown */}
          <select
            name="subCategory"
            value={productData.subCategory}
            onChange={handleInputChange}
            className={inputStyles}
            required
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="SKU"
            placeholder="SKU"
            value={productData.SKU}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          <input
            type="text"
            name="modelName"
            placeholder="Model Name"
            value={productData.modelName}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          <input
            type="text"
            name="HSN"
            placeholder="HSN"
            value={productData.HSN}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          <input
            type="number"
            name="tax"
            placeholder="Tax (%)"
            value={productData.tax}
            onChange={handleInputChange}
            required
            className={inputStyles}
          />
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className={`${buttonStyles} bg-blue-500 text-white hover:bg-blue-600`}
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-white text-xl mb-4">
            Product Created! Upload Product Image
          </h2>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            className={inputStyles}
          />
          <button
            onClick={handleSubmitImage}
            disabled={isSubmitting}
            className={`${buttonStyles} bg-green-500 text-white hover:bg-green-600`}
          >
            {isSubmitting ? "Uploading..." : "Submit Image"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AddProductModal;
