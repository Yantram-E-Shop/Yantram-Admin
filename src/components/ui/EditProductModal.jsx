// "use client";
// import React, { useEffect, useState, useContext } from "react";
// import Modal from "react-modal";
// import axios from "axios";
// import { AuthContext } from "@/context/AuthContext";
// import { BASE_URL } from "@/api/axios";

// const EditProductModal = ({ isOpen, onClose, productId, onProductUpdated }) => {
//   const [step, setStep] = useState(1); // Step 1: Product details, Step 2: Image upload
//   const defaultProductForm = {
//     title: "",
//     description: "",
//     category: "",
//     subCategory: "",
//     SKU: "",
//     modelName: "",
//     HSN: "",
//     tax: "",
//     attributes: [],
//     originalPrice: 0,
//     sellingPrice: [
//       { minQuantity: 0, pricePerUnit: 0 },
//       { minQuantity: 0, pricePerUnit: 0 },
//       { minQuantity: 0, pricePerUnit: 0 },
//     ],
//     availableQuantity: 0,
//     soldQuantity: 0,
//     isAvailable: false,
//     isFeatured: false,
//     isOffer: false,
//     productCode: "",
//   };
//   const [productData, setProductData] = useState(defaultProductForm);

//   const resetForm = () => {
//     setProductData(defaultProductForm);
//   };
//   const [images, setImages] = useState([]); // To store multiple images
//   const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit
//   const [feedback, setFeedback] = useState({ type: "", message: "" });

//   const [categories, setCategories] = useState([]); // To store categories from API
//   const [attributes, setAttributes] = useState([]); // To store attributes from API
//   const [subCategories, setSubCategories] = useState([]); // To store subcategories based on selected category
//   const authContext = useContext(AuthContext);
//   const accessToken = authContext?.accessToken;
//   const [selectedAttributes, setSelectedAttributes] = useState([]);
//   const [selectedImages, setSelectedImages] = useState([]);

//   // Fetch product data for editing
//   useEffect(() => {
//     if (productId) {
//       const fetchProductData = async () => {
//         try {
//           const response = await axios.get(`/api/v1/products/${productId}`, {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//             },
//           });
//           setProductData(response.data.data);
//         } catch (error) {
//           console.error("Error fetching product data:", error);
//           setFeedback({
//             type: "error",
//             message: "Failed to fetch product data.",
//           });
//         }
//       };
//       fetchProductData();
//     }
//   }, [productId, accessToken]);

//   // Fetch categories on component mount
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await axios.get(`/api/v1/category`);
//         setCategories(response.data.data); // Use the categories data from the API response
//       } catch (error) {
//         console.error("Error fetching categories:", error);
//         setFeedback({ type: "error", message: "Failed to fetch categories." });
//       }
//     };

//     fetchCategories();
//   }, [accessToken]);

//   useEffect(() => {
//     const fetchAttributes = async () => {
//       try {
//         const response = await axios.get(`${BASE_URL}/attributes`, {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         });

//         setAttributes(response.data.data);
//       } catch (error) {
//         console.error("Error fetching attributes:", error);
//         setFeedback({
//           type: "error",
//           message: "Failed to fetch attributes.",
//         });
//       }
//     };

//     fetchAttributes();
//   }, [accessToken]);

//   useEffect(() => {
//     if (productData.category) {
//       const selectedCategory = categories.find(
//         (cat) => cat._id === productData.category
//       );
//       if (selectedCategory) {
//         setSubCategories(selectedCategory.subcategories);
//       }
//     }
//   }, [productData.category, categories]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setProductData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSellingPriceChange = (index, field, value) => {
//     const updatedSellingPrice = [...productData.sellingPrice];
//     updatedSellingPrice[index][field] = value;
//     setProductData((prev) => ({ ...prev, sellingPrice: updatedSellingPrice }));
//   };

//   const handleAttributeChange = (index, field, value) => {
//     const updatedAttributes = [...productData.attributes];
//     updatedAttributes[index][field] = value;
//     setProductData((prev) => ({ ...prev, attributes: updatedAttributes }));
//   };

//   const handleNextStep = async () => {
//     setIsSubmitting(true);
//     setFeedback({ type: "", message: "" });
//     try {
//       const response = await axios.put(
//         `/api/v1/products/${productId}`,
//         { content: productData },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );
//       setStep(2);
//       setFeedback({
//         type: "success",
//         message: "Product updated successfully!",
//       });
//     } catch (error) {
//       console.error("Error updating product:", error);
//       setFeedback({
//         type: "error",
//         message: "Failed to update product. Please try again.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleImageUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const imagePreviews = files.map((file) => ({
//       file,
//       preview: URL.createObjectURL(file),
//     }));

//     setSelectedImages((prev) => [...prev, ...imagePreviews]);
//   };

//   const handleSubmitImages = async () => {
//     setIsSubmitting(true);
//     setFeedback({ type: "", message: "" });

//     try {
//       const formData = new FormData();
//       images.forEach((image) => formData.append("images", image));

//       await axios.put(`/api/v1/products/${productId}/images`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });

//       onProductUpdated();
//       onClose();
//     } catch (error) {
//       console.error("Error uploading images:", error);
//       setFeedback({
//         type: "error",
//         message: "Failed to upload images. Please try again.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   useEffect(() => {
//     console.log("Current productData:", productData);
//   }, [productData]);

//   const modalStyles = {
//     content: {
//       backgroundColor: "#ffffff",
//       color: "#2d2d2d",
//       border: "none",
//       borderRadius: "10px",
//       padding: "20px",
//       maxWidth: "600px",
//       margin: "auto",
//       boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
//     },
//     overlay: {
//       backgroundColor: "rgba(0, 0, 0, 0.8)",
//       zIndex: 1000,
//     },
//   };

//   return (
//     <Modal isOpen={isOpen} onRequestClose={onClose} style={modalStyles}>
//       {feedback.message && (
//         <p
//           className={`mb-4 ${
//             feedback.type === "error" ? "text-red-500" : "text-green-500"
//           }`}
//         >
//           {feedback.message}
//         </p>
//       )}

//       {step === 1 && (
//         <div>
//           <h2 className="text-black text-xl mb-4">Edit Product Details</h2>

//           <input
//             type="text"
//             name="title"
//             placeholder="Title"
//             value={productData.title}
//             onChange={handleInputChange}
//             className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
//           />

//           <textarea
//             name="description"
//             placeholder="Description"
//             value={productData.description}
//             onChange={handleInputChange}
//             className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
//           />

//           <input
//             type="number"
//             name="originalPrice"
//             placeholder="Original Price"
//             value={
//               productData.originalPrice === 0 ? "" : productData.originalPrice
//             }
//             onChange={handleInputChange}
//             className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
//           />

//           {productData.sellingPrice.map((price, index) => (
//             <div key={index} className="mb-4">
//               <input
//                 type="number"
//                 name="minQuantity"
//                 placeholder={`Min Quantity ${index + 1}`}
//                 value={price.minQuantity === 0 ? "" : price.minQuantity}
//                 onChange={(e) =>
//                   handleSellingPriceChange(index, "minQuantity", e.target.value)
//                 }
//                 className="w-full mb-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
//               />
//               <input
//                 type="number"
//                 name="pricePerUnit"
//                 placeholder={`Price Per Unit ${index + 1}`}
//                 value={price.pricePerUnit === 0 ? "" : price.pricePerUnit}
//                 onChange={(e) =>
//                   handleSellingPriceChange(
//                     index,
//                     "pricePerUnit",
//                     e.target.value
//                   )
//                 }
//                 className="w-full p-2 bg-gray-900 text-black rounded border border-gray-600"
//               />
//             </div>
//           ))}

//           <h3 className="text-black text-lg mb-2">Edit Attributes</h3>
//           {productData.attributes.map((attr, index) => (
//             <div key={index} className="flex mb-4">
//               <select
//                 name="attribute"
//                 value={attr.attribute}
//                 onChange={(e) =>
//                   handleAttributeChange(index, "attribute", e.target.value)
//                 }
//                 className="w-1/2 mr-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
//               >
//                 <option value="">Select Attribute</option>
//                 {attributes.map((attribute) => (
//                   <option key={attribute._id} value={attribute._id}>
//                     {attribute.name}
//                   </option>
//                 ))}
//               </select>

//               <select
//                 name="value"
//                 value={attr.value}
//                 onChange={(e) =>
//                   handleAttributeChange(index, "value", e.target.value)
//                 }
//                 className="w-1/2 p-2 bg-gray-900 text-black rounded border border-gray-600"
//                 disabled={!attr.attribute}
//               >
//                 <option value="">Select Value</option>
//                 {attributes
//                   .find((a) => a._id === attr.attribute)
//                   ?.values.map((value) => (
//                     <option key={value} value={value}>
//                       {value}
//                     </option>
//                   ))}
//               </select>
//             </div>
//           ))}
//           <button
//             onClick={handleNextStep}
//             disabled={isSubmitting}
//             className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
//           >
//             {isSubmitting ? "Updating..." : "Next"}
//           </button>
//         </div>
//       )}

//       {step === 2 && (
//         <div>
//           <h2 className="text-black text-xl mb-4">Edit Product Images</h2>
//           <input
//             type="file"
//             onChange={handleImageUpload}
//             accept="image/*"
//             multiple
//             className="w-full mb-4 p-2 bg-gray-900 text-black rounded"
//           />
//           <div className="image-previews grid grid-cols-3 gap-4 mb-4">
//             {selectedImages.map(({ preview }, index) => (
//               <div key={index} className="image-preview">
//                 <img
//                   src={preview}
//                   alt={`Preview ${index + 1}`}
//                   className="w-full h-auto rounded"
//                 />
//               </div>
//             ))}
//           </div>
//           <button
//             onClick={handleSubmitImages}
//             disabled={isSubmitting}
//             className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
//           >
//             {isSubmitting ? "Uploading..." : "Submit Images"}
//           </button>
//         </div>
//       )}
//     </Modal>
//   );
// };

// export default EditProductModal;



"use client";
import React, { useEffect, useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const EditProductModal = ({ isOpen, onClose, productId, onProductUpdated }) => {
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
    attributes: [],
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
    images: [], // Add images to product form state
  };
  const [productData, setProductData] = useState(defaultProductForm);

  const resetForm = () => {
    setProductData(defaultProductForm);
  };
  const [images, setImages] = useState([]); // To store multiple images (new ones)
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for submit
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [categories, setCategories] = useState([]); // To store categories from API
  const [attributes, setAttributes] = useState([]); // To store attributes from API
  const [subCategories, setSubCategories] = useState([]); // To store subcategories based on selected category
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);

  // Fetch product data for editing
  useEffect(() => {
    if (productId) {
      const fetchProductData = async () => {
        try {
          const response = await axios.get(`/api/v1/products/${productId}`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const product = response.data.data;
          setProductData(product);
          setSelectedImages(product.images || []); // Load previously uploaded images
        } catch (error) {
          console.error("Error fetching product data:", error);
          setFeedback({
            type: "error",
            message: "Failed to fetch product data.",
          });
        }
      };
      fetchProductData();
    }
  }, [productId, accessToken]);

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

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/attributes`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setAttributes(response.data.data);
      } catch (error) {
        console.error("Error fetching attributes:", error);
        setFeedback({
          type: "error",
          message: "Failed to fetch attributes.",
        });
      }
    };

    fetchAttributes();
  }, [accessToken]);

  useEffect(() => {
    if (productData.category) {
      const selectedCategory = categories.find(
        (cat) => cat._id === productData.category
      );
      if (selectedCategory) {
        setSubCategories(selectedCategory.subcategories);
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

  const handleAttributeChange = (index, field, value) => {
    const updatedAttributes = [...productData.attributes];
    updatedAttributes[index][field] = value;
    setProductData((prev) => ({ ...prev, attributes: updatedAttributes }));
  };

  const handleNextStep = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
    try {
      const response = await axios.put(
        `/api/v1/products/${productId}`,
        { content: productData },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setStep(2);
      setFeedback({
        type: "success",
        message: "Product updated successfully!",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      setFeedback({
        type: "error",
        message: "Failed to update product. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e) => {
    console.log(productData);
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setSelectedImages(imagePreviews);
  };

  const handleSubmitImages = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });
  
    try {
      const formData = new FormData();
  
      if (selectedImages.length > 0 && selectedImages.some((img) => img.file)) {
        selectedImages.forEach((image) => {
          if (image.file) {
            formData.append("images", image.file);
          }
        });

        // Assumes backend can accept existing image references as part of payload
        const payload = {
          images: productData.imageNames, // assumes these are strings (URLs or filenames)
        };
        console.log(productData.imageNames);
  
        await axios.put(
          `/api/v1/products/${productId}/images/delete`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      } else {
        // ✅ No new images — send existing image URLs or identifiers
        // Assumes backend can accept existing image references as part of payload
        // const payload = {
        //   images: productData.images, // assumes these are strings (URLs or filenames)
        // };
  
        // await axios.put(
        //   `/api/v1/products/${productId}/images`,
        //   payload,
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${accessToken}`,
        //     },
        //   }
        // );
  
        onProductUpdated();
        onClose();
        return;
      }
  
      // If new images were uploaded
      await axios.put(`/api/v1/products/${productId}/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });
  
      onProductUpdated();
      onClose();
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

      {step === 1 && (
        <div>
          <h2 className="text-black text-xl mb-4">Edit Product Details</h2>

          {/* Title */}
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={productData.title}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Description"
            value={productData.description}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          <select
            name="category"
            value={productData.category || ""}
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

          {/* SubCategory */}
          <select
            name="subCategory"
            value={productData.subCategory}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
            disabled={!productData.category}
          >
            <option value="">Select SubCategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.name}
              </option>
            ))}
          </select>

          {/* SKU */}
          <input
            type="text"
            name="SKU"
            placeholder="SKU"
            value={productData.SKU}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Model Name */}
          <input
            type="text"
            name="modelName"
            placeholder="Model Name"
            value={productData.modelName}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* HSN */}
          <input
            type="text"
            name="HSN"
            placeholder="HSN"
            value={productData.HSN}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Tax */}
          <input
            type="text"
            name="tax"
            placeholder="Tax"
            value={productData.tax}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Original Price */}
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

          {/* Selling Price */}
          <h3 className="text-black text-lg mb-2">Selling Prices</h3>

          {Array.isArray(productData.sellingPrice) &&
          productData.sellingPrice.length > 0 ? (
            productData.sellingPrice.map((price, index) => (
              <div key={index} className="mb-4">
                <input
                  type="number"
                  name={`minQuantity-${index}`}
                  placeholder={`Min Quantity ${index + 1}`}
                  value={price.minQuantity === 0 ? "" : price.minQuantity} // Avoid rendering `0` as empty string
                  onChange={(e) =>
                    handleSellingPriceChange(
                      index,
                      "minQuantity",
                      e.target.value
                    )
                  }
                  className="w-full mb-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
                />
                <input
                  type="number"
                  name={`pricePerUnit-${index}`}
                  placeholder={`Price Per Unit ${index + 1}`}
                  value={price.pricePerUnit === 0 ? "" : price.pricePerUnit} // Avoid rendering `0` as empty string
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
            ))
          ) : (
            <p>No selling prices available</p> // If there are no selling prices, show a fallback message
          )}

          {/* Available Quantity */}
          <input
            type="number"
            name="availableQuantity"
            placeholder="Available Quantity"
            value={productData.availableQuantity}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Sold Quantity */}
          <input
            type="number"
            name="soldQuantity"
            placeholder="Sold Quantity"
            value={productData.soldQuantity}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Availability Toggle */}
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
            <label>Available</label>
          </div>

          {/* Featured Toggle */}
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
            <label>Featured</label>
          </div>

          {/* Offer Toggle */}
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
            <label>Offer</label>
          </div>

          {/* Product Code */}
          <input
            type="text"
            name="productCode"
            placeholder="Product Code"
            value={productData.productCode}
            onChange={handleInputChange}
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
          />

          {/* Attributes */}
          <h3 className="text-black text-lg mb-2">Edit Attributes</h3>
          {Array.isArray(productData.attributes) &&
          productData.attributes.length > 0 ? (
            productData.attributes.map((attr, index) => (
              <div key={index} className="flex mb-4">
                <select
                  name="attribute"
                  value={attr.attribute}
                  onChange={(e) =>
                    handleAttributeChange(index, "attribute", e.target.value)
                  }
                  className="w-1/2 mr-2 p-2 bg-gray-900 text-black rounded border border-gray-600"
                >
                  <option value="">Select Attribute</option>
                  {Array.isArray(attributes) &&
                    attributes.map((attribute) => (
                      <option key={attribute._id} value={attribute._id}>
                        {attribute.name}
                      </option>
                    ))}
                </select>

                <select
                  name="value"
                  value={attr.value}
                  onChange={(e) =>
                    handleAttributeChange(index, "value", e.target.value)
                  }
                  className="w-1/2 p-2 bg-gray-900 text-black rounded border border-gray-600"
                  disabled={!attr.attribute}
                >
                  <option value="">Select Value</option>
                  {Array.isArray(attributes) &&
                    attributes
                      .find((a) => a._id === attr.attribute)
                      ?.values.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                </select>
              </div>
            ))
          ) : (
            <p>No attributes available</p> // Fallback message if there are no attributes
          )}

          {/* Add New Attribute */}
          <button
            onClick={() =>
              setProductData((prev) => ({
                ...prev,
                attributes: [...prev.attributes, { attribute: "", value: "" }],
              }))
            }
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
          >
            Add New Attribute
          </button>

          <button
            onClick={handleNextStep}
            disabled={isSubmitting}
            className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
          >
            {isSubmitting ? "Updating..." : "Next"}
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="text-black text-xl mb-4">Edit Product Images</h2>
          <input
            type="file"
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="w-full mb-4 p-2 bg-gray-900 text-black rounded"
          />
          <div className="image-previews grid grid-cols-3 gap-4 mb-4">
            {/* Display previously uploaded images */}
            {productData.images && productData.images.length > 0 && (
              <div className="image-preview">
                <h3 className="text-black">Previous Images:</h3>
                {productData.images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Uploaded Image ${index + 1}`}
                    className="w-full h-auto rounded"
                  />
                ))}
              </div>
            )}
            {/* Display newly selected images */}
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
          <button
            onClick={handleSubmitImages}
            disabled={isSubmitting}
            className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
          >
            {isSubmitting ? "Uploading..." : "Submit Images"}
          </button>
        </div>
      )}
    </Modal>
  );
};

export default EditProductModal;
