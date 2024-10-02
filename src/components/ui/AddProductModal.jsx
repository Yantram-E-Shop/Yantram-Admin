import React, { useState } from "react";
import Modal from "react-modal";
import axios from "axios";
import { BASE_URL } from "@/api/axios";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Product details, Step 2: Image upload
  const [productData, setProductData] = useState({
    title: "",
    description: "",
    originalPrice: "",
    category: "",
    subCategory: "",
    availableQuantity: 0,
  });
  const [productId, setProductId] = useState(null); // To store the created product ID
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    try {
      // Step 1: Submit product data
      const response = await axios.post(`${BASE_URL}/products`, {
        content: productData,
      });
      const createdProductId = response.data.productId;
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

  const handleSubmitImage = async () => {
    if (!image || !productId) {
      setError("Please select an image and ensure the product is created.");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("images", image);

      // Upload the image for the created product
      await axios.post(
        `${BASE_URL}/products/${productId}/upload-image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Call the callback to notify parent of successful addition
      onProductAdded();
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
      backgroundColor: "#1e1e1e", // Dark background color
      color: "#ffffff", // Light text color
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "500px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark overlay
    },
  };
  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
      {error && <p className="text-red-500">{error}</p>}

      {step === 1 && (
        <div>
          <h2 className="text-white text-xl mb-4">Add Product Details</h2>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={productData.title}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <input
            type="number"
            name="originalPrice"
            placeholder="Original Price"
            value={productData.originalPrice}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <input
            type="text"
            name="category"
            placeholder="Category ID"
            value={productData.category}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <input
            type="text"
            name="subCategory"
            placeholder="Subcategory ID"
            value={productData.subCategory}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <input
            type="number"
            name="availableQuantity"
            placeholder="Available Quantity"
            value={productData.availableQuantity}
            onChange={handleInputChange}
            required
            className="w-full mb-4 p-2 bg-gray-800 text-white rounded border border-gray-600"
          />
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
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
            className="w-full mb-4 text-white"
          />
          <button
            onClick={handleSubmitImage}
            disabled={isSubmitting}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            {isSubmitting ? "Uploading..." : "Submit Image"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AddProductModal;
