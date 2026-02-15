"use client";
import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";
import { toast } from "react-hot-toast";

const AddProductModal = ({ isOpen, onClose, onProductAdded }) => {
  const [step, setStep] = useState(1); // Step 1: Product details, Step 2: Image upload
  const defaultProductForm = {
    title: "",
    description: "",
    category: "",
    subCategory: "",
    SKU: "",
    modelName: "",
    minQuantity:0,
    HSN: "",
    tax: "",
    attributes : [],
    originalPrice: 0,
    sellingPrice: [
      { minQuantity: 0, pricePerUnit: 0 },
      { minQuantity: 0, pricePerUnit: 0 },
      { minQuantity: 0, pricePerUnit: 0 },
    ],
    availableQuantity: 0,
    soldQuantity: 0,
    preference:1,
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

  const [categories, setCategories] = useState([]); // To store categories from API
  const [attributes, setAttributes] = useState([]); // To store attributes from API
  const [subCategories, setSubCategories] = useState([]); // To store subcategories based on selected category
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [selectedAttributes, setSelectedAttributes] = useState([]); 
  const [selectedImages, setSelectedImages] = useState([]);

const handleAddAttribute = () => {
  // Add selected attribute to the product data
  setProductData((prev) => ({
    ...prev,
    attributes: [...prev.attributes, { attribute: "", value: "" }],
  }));
};

const handleAttributeChange = (index, field, value) => {
  const updatedAttributes = [...productData.attributes];
  updatedAttributes[index][field] = value; // Update the specific field
  setProductData((prev) => ({ ...prev, attributes: updatedAttributes }));
};

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`/api/v1/category`);
        setCategories(response.data.data); // Use the categories data from the API response
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to fetch categories.");
      }
    };

    fetchCategories();
  }, [accessToken]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
         const response = await axios.get(`${BASE_URL}/attributes`, {
           headers: {
             Authorization: `Bearer ${accessToken}`,
           },
         });

        console.log("Fetched attributes:", response.data.data); // Log the fetched values
        setAttributes(response.data.data);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        toast.error("Failed to fetch attributes.");
      }
    };

    fetchAttributes();
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
      toast.success("Product created successfully!");
      resetForm();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages(files); 
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages((prev) => [...prev, ...imagePreviews]);
    
  };

  const handleSubmitImages = async () => {
    setIsSubmitting(true);

     console.log("Submitting product data:", productData);
     
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
      toast.success("Images uploaded successfully!");
      onClose(); // Close the modal after both steps are done
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log("Current productData:", productData);
  }, [productData]);


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

      {step === 1 && (
        <div>
          <h2 className="text-black text-xl mb-4">Add Product Details</h2>

          {/* Title Input */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={productData.title}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Description Input */}
          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
                className="w-full mb-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
                className="w-full p-2 bg-gray-900 text-black rounded border border-gray-600"
              />
            </div>
          ))}

          <h3 className="text-black text-lg mb-2">Add Attributes</h3>
          {productData.attributes.map((attr, index) => (
            <div key={index} className="flex mb-4">
              <select
                name="attribute"
                value={attr.attribute} // Change to reflect the updated structure
                onChange={(e) =>
                  handleAttributeChange(index, "attribute", e.target.value)
                }
                className="w-1/2 mr-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
              >
                <option value="">Select Attribute</option>
                {attributes.map((attribute) => (
                  <option key={attribute._id} value={attribute._id}>
                    {" "}
                    {/* Use attribute._id */}
                    {attribute.name}
                  </option>
                ))}
              </select>

              <select
                name="value"
                value={attr.value} // Change to reflect the updated structure
                onChange={(e) =>
                  handleAttributeChange(index, "value", e.target.value)
                }
                className="w-1/2 p-2 bg-gray-900 text-black rounded border border-gray-600"
                disabled={!attr.attribute} // Disable value dropdown if no attribute is selected
              >
                <option value="">Select Value</option>
                {attributes
                  .find((a) => a._id === attr.attribute) // Adjust the comparison
                  ?.values.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
              </select>
            </div>
          ))}
          <button
            onClick={handleAddAttribute}
            className="text-black bg-blue-500 hover:bg-blue-700 py-1 px-3 rounded mb-4"
          >
            Add Another Attribute
          </button>

          {/* Category Select */}
          <select
            name="category"
            value={productData.category}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Other Fields */}
          <input
            type="text"
            name="modelName"
            placeholder="Model Name"
            value={productData.modelName}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          <input
            type="number"
            name="minQuantity"
            placeholder="Minimum Order Quantity"
            value={productData.minQuantity === 0 ? "" : productData.minQuantity}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          <input
            type="text"
            name="HSN"
            placeholder="HSN"
            value={productData.HSN}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          <input
            type="number"
            name="tax"
            placeholder="Tax (%)"
            value={productData.tax}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />
          <input
            type="number"
            name="preference"
            placeholder="Preference"
            value={productData.preference}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          <input
            type="number"
            name="soldQuantity"
            placeholder="Sold Quantity"
            value={
              productData.soldQuantity === 0 ? "" : productData.soldQuantity
            }
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
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
            <label htmlFor="isAvailable" className="text-black">
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
            <label htmlFor="isFeatured" className="text-black">
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
            <label htmlFor="isOffer" className="text-black">
              Is Offer
            </label>
          </div>

          <input
            type="text"
            name="productCode"
            placeholder="Product Code"
            value={productData.productCode}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Submit Button */}
          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-black text-xl mb-4">
            Product Created! Upload Product Images
          </h2>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded"
          />
          <div className="image-previews grid grid-cols-3 gap-4 mb-4">
            {selectedImages.map(({ preview }, index) => (
              <div key={index} className="image-preview">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-auto rounded"
                />
              </div>
            ))}
          </div>
          <button onClick={handleSubmitImages} disabled={isSubmitting}>
            {isSubmitting ? "Uploading..." : "Submit Images"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default AddProductModal;
