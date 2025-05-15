"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const AddBannerModal = ({ isOpen, onClose, onBannerAdded }) => {
  const [bannerData, setBannerData] = useState({
    name: "",
    image: null,
    page: "",
    categoryId: "",
    subCategoryId: "",
    attributes: [],
  });

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [allAttributes, setAllAttributes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await axios.get(`${BASE_URL}/category`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCategories(catRes.data.data || []);

        const attrRes = await axios.get(`${BASE_URL}/attributes`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setAllAttributes(attrRes.data.data || []);
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      if (bannerData.categoryId) {
        try {
          const res = await axios.get(`/api/v1/sub-category?categoryId=${bannerData.categoryId}`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          
          setSubcategories(res.data.data || []);
        } catch (err) {
          console.error("Failed to fetch subcategories:", err);
        }
      } else {
        setSubcategories([]);
        setBannerData(prev => ({ ...prev, subCategoryId: "" }));
      }
    };

    fetchSubCategories();
  }, [bannerData.categoryId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleAttributeChange = (index, field, value) => {
    const updated = [...bannerData.attributes];
    updated[index] = { ...updated[index], [field]: value };
    setBannerData((prev) => ({ ...prev, attributes: updated }));
  };

  const addAttributeRow = () => {
    setBannerData((prev) => ({
      ...prev,
      attributes: [...prev.attributes, { attributeId: "", value: "" }],
    }));
  };

  const removeAttributeRow = (index) => {
    const updated = bannerData.attributes.filter((_, i) => i !== index);
    setBannerData((prev) => ({ ...prev, attributes: updated }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("title", bannerData.name);
      formData.append("pageName", bannerData.page);
      formData.append("image", bannerData.image);
      if (bannerData.categoryId) formData.append("categoryId", bannerData.categoryId);
      if (bannerData.subCategoryId) formData.append("subCategoryId", bannerData.subCategoryId);
      formData.append("attributes", JSON.stringify(bannerData.attributes));

      const response = await axios.post(`${BASE_URL}/banner/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedback({ type: "success", message: "Banner created successfully!" });
      onBannerAdded(response.data.data);
      onClose();

      setBannerData({
        name: "",
        image: null,
        page: "",
        categoryId: "",
        subCategoryId: "",
        attributes: [],
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      setFeedback({ type: "error", message: "Failed to create banner." });
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
        <p className={`mb-4 ${feedback.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {feedback.message}
        </p>
      )}

      <h2 className="text-black text-xl mb-4">Add Banner</h2>

      {/* Banner Name */}
      <input
        type="text"
        name="name"
        placeholder="Banner Name"
        value={bannerData.name}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-200 text-black rounded border border-gray-400"
      />

      {/* Page Name */}
      <input
        type="text"
        name="page"
        placeholder="Page Name"
        value={bannerData.page}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-200 text-black rounded border border-gray-400"
      />

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-4 p-2 bg-gray-200 text-black rounded"
      />

      {bannerData.image && (
        <div className="mb-4">
          <img src={URL.createObjectURL(bannerData.image)} alt="Banner Preview" className="w-full h-auto rounded" />
        </div>
      )}

      {/* Filter Products Section */}
      <h3 className="text-black text-lg font-semibold mb-2">Filter Products</h3>

      {/* Category Dropdown */}
      <select
        name="categoryId"
        value={bannerData.categoryId}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-200 text-black rounded border border-gray-400"
      >
        <option value="">Select Category (optional)</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Subcategory Dropdown */}
      <select
        name="subCategoryId"
        value={bannerData.subCategoryId}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-200 text-black rounded border border-gray-400"
        disabled={!bannerData.categoryId}
      >
        <option value="">Select Subcategory (optional)</option>
        {subcategories.map((sub) => (
          <option key={sub._id} value={sub._id}>
            {sub.name}
          </option>
        ))}
      </select>

      {/* Attribute Filters */}
      <div className="mb-4">
  <h4 className="text-black font-medium mb-2">Attributes</h4>
  {bannerData.attributes.map((attr, index) => {
    const selectedAttribute = allAttributes.find((a) => a._id === attr.attributeId);
    const possibleValues = selectedAttribute?.values || [];

    return (
      <div key={index} className="flex items-center mb-2 space-x-2">
        {/* Attribute Selector */}
        <select
          value={attr.attributeId}
          onChange={(e) => handleAttributeChange(index, "attributeId", e.target.value)}
          className="flex-1 p-2 bg-gray-200 text-black rounded border border-gray-400"
        >
          <option value="">Select Attribute</option>
          {allAttributes.map((a) => (
            <option key={a._id} value={a._id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Value Selector (based on selected attribute) */}
        <select
          value={attr.value}
          onChange={(e) => handleAttributeChange(index, "value", e.target.value)}
          className="flex-1 p-2 bg-gray-200 text-black rounded border border-gray-400"
          disabled={!selectedAttribute}
        >
          <option value="">Select Value</option>
          {possibleValues.map((val, i) => (
            <option key={i} value={val}>
              {val}
            </option>
          ))}
        </select>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => removeAttributeRow(index)}
          className="px-2 py-1 bg-red-500 text-white rounded"
        >
          ×
        </button>
      </div>
    );
  })}

  {/* Add Attribute Button */}
  <button
    type="button"
    onClick={addAttributeRow}
    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded"
  >
    + Add Attribute
  </button>
</div>


      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : "Submit Banner"}
      </button>
    </Modal>
  );
};

export default AddBannerModal;
