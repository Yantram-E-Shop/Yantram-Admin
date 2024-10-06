import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Product details, Step 2: Image upload
  const defaultProductForm = {
    title: "",
    description: "",
    category: "",
    subCategory: "",
    SKU: "",
    modelName: "",
    HSN: "",
    tax: "",
    originalPrice: 0,
    sellingPrice: [
      { minQuantity: 0, pricePerUnit: 0 },
      { minQuantity: 0, pricePerUnit: 0 },
      { minQuantity: 0, pricePerUnit: 0 },
    ],
    availableQuantity: 0,
    soldQuantity: 0,
    isAvailable: false,
    isFeatured: false,
    isOffer: false,
    productCode: "",
  };
  const [productData, setProductData] = useState(defaultProductForm);

  const resetForm = () => {
    setProductData(defaultProductForm);
  };
  const [productId, setProductId] = useState(null); // To store the created product ID
  const [images, setImages] = useState([]); // To store multiple images
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [categories, setCategories] = useState([]); // To store categories from API
  const [subCategories, setSubCategories] = useState([]); // To store subcategories based on selected category
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/v1/category`);
        setCategories(response.data.data); // Use the categories data from the API response
      } catch (error) {
        console.error("Error fetching categories:", error);
        setFeedback({ type: "error", message: "Failed to fetch categories." });
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

  const handleSellingPriceChange = (index, field, value) => {
    const updatedSellingPrice = [...productData.sellingPrice];
    updatedSellingPrice[index][field] = value;
    setProductData((prev) => ({ ...prev, sellingPrice: updatedSellingPrice }));
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      // Step 1: Submit product data
      const response = await axios.post(
        `/api/v1/products`,
        { content: productData },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const createdProductId = response.data.data._id;
      setProductId(createdProductId); // Store product ID for image upload
      setStep(2); // Proceed to the next step for image upload
      setFeedback({
        type: "success",
        message: "Product created successfully!",
      });
      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
      setFeedback({
        type: "error",
        message: "Failed to create product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); // Store multiple images
  };

  const handleSubmitImages = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const formData = new FormData();
      images.forEach((image, index) => formData.append("images", image)); // Handle multiple images

      // Upload the images for the created product
      await axios.put(`/api/v1/products/${productId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      onProductAdded();
      setStep(1); // Reset the step to 1 for the next product
      setFeedback({
        type: "",
        message: "",
      });
      onClose(); // Close the modal after both steps are done
    } catch (error) {
      console.error("Error uploading images:", error);
      setFeedback({
        type: "error",
        message: "Failed to upload images. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalStyles = {
    content: {
      backgroundColor: "#ffffff", // Darker background color for better contrast
      color: "#2d2d2d", // Light text color for readability
      border: "none",
      borderRadius: "10px",
      padding: "20px",
      maxWidth: "600px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
    },
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark overlay
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

      {step === 1 && (
        <div>
          <h2 className="text-white text-xl mb-4">Add Product Details</h2>

          {/* Title Input */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={productData.title}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Description Input */}
          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Original Price Input */}
          <input
            type="number"
            name="originalPrice"
            placeholder="Original Price"
            value={
              productData.originalPrice === 0 ? "" : productData.originalPrice
            }
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Selling Price Inputs */}
          {productData.sellingPrice.map((price, index) => (
            <div key={index} className="mb-4">
              <input
                type="number"
                name="minQuantity"
                placeholder={`Min Quantity ${index + 1}`}
                value={price.minQuantity === 0 ? "" : price.minQuantity}
                onChange={(e) =>
                  handleSellingPriceChange(index, "minQuantity", e.target.value)
                }
                className="w-full mb-2 p-2 bg-gray-900 text-white rounded border border-gray-600"
              />
              <input
                type="number"
                name="pricePerUnit"
                placeholder={`Price Per Unit ${index + 1}`}
                value={price.pricePerUnit === 0 ? "" : price.pricePerUnit}
                onChange={(e) =>
                  handleSellingPriceChange(
                    index,
                    "pricePerUnit",
                    e.target.value
                  )
                }
                className="w-full p-2 bg-gray-900 text-white rounded border border-gray-600"
              />
            </div>
          ))}

          {/* Category Select */}
          <select
            name="category"
            value={productData.category}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Subcategory Select */}
          <select
            name="subCategory"
            value={productData.subCategory}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </option>
            ))}
          </select>

          {/* SKU Input */}
          <input
            type="text"
            name="SKU"
            placeholder="SKU"
            value={productData.SKU}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Other Fields */}
          <input
            type="text"
            name="modelName"
            placeholder="Model Name"
            value={productData.modelName}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          <input
            type="text"
            name="HSN"
            placeholder="HSN"
            value={productData.HSN}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          <input
            type="number"
            name="tax"
            placeholder="Tax (%)"
            value={productData.tax}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Available Quantity and Sold Quantity Inputs */}
          <input
            type="number"
            name="availableQuantity"
            placeholder="Available Quantity"
            value={
              productData.availableQuantity === 0
                ? ""
                : productData.availableQuantity
            }
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          <input
            type="number"
            name="soldQuantity"
            placeholder="Sold Quantity"
            value={
              productData.soldQuantity === 0 ? "" : productData.soldQuantity
            }
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Checkboxes */}
          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isAvailable"
              checked={productData.isAvailable}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  isAvailable: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="isAvailable" className="text-white">
              Is Available
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isFeatured"
              checked={productData.isFeatured}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  isFeatured: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="isFeatured" className="text-white">
              Is Featured
            </label>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              name="isOffer"
              checked={productData.isOffer}
              onChange={(e) =>
                setProductData((prev) => ({
                  ...prev,
                  isOffer: e.target.checked,
                }))
              }
              className="mr-2"
            />
            <label htmlFor="isOffer" className="text-white">
              Is Offer
            </label>
          </div>

          <input
            type="text"
            name="productCode"
            placeholder="Product Code"
            value={productData.productCode}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded border border-gray-600"
          />

          {/* Submit Button */}
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
            Product Created! Upload Product Images
          </h2>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="w-full mb-4 p-2 bg-gray-900 text-white rounded"
          />
          <button onClick={handleSubmitImages} disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Submit Images"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AddProductModal;
