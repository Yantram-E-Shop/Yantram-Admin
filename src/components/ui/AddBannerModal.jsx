"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const AddBannerModal = ({ isOpen, onClose, onBannerAdded }) => {
  const [bannerData, setBannerData] = useState({
    name: "",
    preference: 1,
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

  const isMandatoryFieldsFilled = () => {
    return bannerData.name.trim() !== "" && 
           bannerData.preference !== "" && 
           bannerData.preference !== null &&
           bannerData.page.trim() !== "" &&
           bannerData.image !== null;
  };

  const handleSubmit = async () => {
    if (!isMandatoryFieldsFilled()) {
      setFeedback({ 
        type: "error", 
        message: "Title, Preference, Description, and Image are mandatory fields." 
      });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("title", bannerData.name);
      formData.append("preference", bannerData.preference);
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
        preference: 1,
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
      padding: "12px",
      maxWidth: "900px",
      margin: "auto",
      boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
      maxHeight: "90vh",
      overflow: "auto",
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

      <h2 className="text-black text-lg mb-3">Add Banner</h2>

      {/* Banner Name */}
      <label className="block text-black text-sm font-semibold mb-1">
        Banner Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="name"
        placeholder="Enter Banner Name"
        value={bannerData.name}
        onChange={handleInputChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
      />

      {/* Page Name */}
      <label className="block text-black text-sm font-semibold mb-1">
        Description <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        name="page"
        placeholder="Enter Description"
        value={bannerData.page}
        onChange={handleInputChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
      />

      <label className="block text-black text-sm font-semibold mb-1">
        Preference <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        name="preference"
        placeholder="Enter Preference"
        value={bannerData.preference}
        onChange={(e) => setBannerData((prev) => ({ ...prev, preference: Number(e.target.value) }))}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
      />
  
      {/* Image Upload */}
      <label className="block text-black text-sm font-semibold mb-1">
        Banner Image <span className="text-red-500">*</span>
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded"
      />

      {bannerData.image && (
        <div className="mb-3">
          <img src={URL.createObjectURL(bannerData.image)} alt="Banner Preview" className="w-32 h-32 rounded object-cover" />
        </div>
      )}

      {/* Filter Products Section */}
      <h3 className="text-black text-sm font-semibold mb-2">Filter Products</h3>

      {/* Category Dropdown */}
      <select
        name="categoryId"
        value={bannerData.categoryId}
        onChange={handleInputChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
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
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
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
      <div className="mb-3">
  <h4 className="text-black text-sm font-medium mb-1">Attributes</h4>
  {bannerData.attributes.map((attr, index) => {
    const selectedAttribute = allAttributes.find((a) => a._id === attr.attributeId);
    const possibleValues = selectedAttribute?.values || [];

    return (
      <div key={index} className="flex items-center mb-1.5 space-x-1.5">
        {/* Attribute Selector */}
        <select
          value={attr.attributeId}
          onChange={(e) => handleAttributeChange(index, "attributeId", e.target.value)}
          className="flex-1 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
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
          className="flex-1 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
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
          className="px-1.5 py-0.5 text-sm bg-red-500 text-white rounded"
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
    className="mt-1.5 px-2.5 py-1 text-sm bg-blue-500 text-white rounded"
  >
    + Add Attribute
  </button>
</div>


      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !isMandatoryFieldsFilled()}
        className={`w-full p-1.5 text-sm rounded transition duration-200 ${
          isMandatoryFieldsFilled()
            ? "bg-blue-500 text-black hover:bg-blue-600 cursor-pointer"
            : "bg-gray-400 text-gray-700 cursor-not-allowed opacity-50"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Banner"}
      </button>
    </Modal>
  );
};

export default AddBannerModal;
