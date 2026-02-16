"use client";
import React, { useState, useEffect, useContext, useCallback } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";
import { toast } from "react-hot-toast";

const ManageBannerModal = ({ isOpen, onClose, onBannerManaged, bannerToEdit }) => {
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
  const [imagePreview, setImagePreview] = useState(null); // For displaying existing image or new upload

  const isEditMode = !!bannerToEdit;

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const resetForm = useCallback(() => {
    setBannerData({
      name: "",
      preference: 1,
      image: null,
      page: "",
      categoryId: "",
      subCategoryId: "",
      attributes: [],
    });
    setImagePreview(null);
    setSubcategories([]); // Clear subcategories when form resets
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setBannerData({
          name: bannerToEdit.title || "",
          preference: bannerToEdit.preference || 1,
          image: null, // Image is not pre-filled for security/complexity, user must re-upload if changing
          page: bannerToEdit.pageName || "", // Description
          categoryId: bannerToEdit.categoryId || "",
          subCategoryId: bannerToEdit.subCategoryId || "",
          attributes: bannerToEdit.attributes || [],
        });
        // Set image preview for existing image
        if (bannerToEdit.imageUrl) {
          setImagePreview(bannerToEdit.imageUrl);
        }
      } else {
        resetForm();
      }
    }
  }, [isOpen, isEditMode, bannerToEdit, resetForm]);

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

    if (isOpen) { // Fetch data only when modal is open
      fetchInitialData();
    }
  }, [accessToken, isOpen]);

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

    if (bannerData.categoryId) { // Only fetch if a category is selected
      fetchSubCategories();
    }
  }, [bannerData.categoryId, accessToken]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBannerData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
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

  const isFormValid = () => {
    if (isEditMode) {
      // In edit mode, only preference is editable
      return bannerData.preference !== "" && bannerData.preference !== null;
    } else {
      // In add mode, all original mandatory fields are required
      return bannerData.name.trim() !== "" && 
             bannerData.preference !== "" && 
             bannerData.preference !== null &&
             bannerData.page.trim() !== "" &&
             bannerData.image !== null;
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast.error(isEditMode ? "Preference is a mandatory field." : "Title, Preference, Description, and Image are mandatory fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // Update existing banner (only preference can be changed)
        const payload = {
          preference: bannerData.preference,
        };
        await axios.put(`${BASE_URL}/banner/update/${bannerToEdit._id}`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        toast.success("Banner preference updated successfully!");
      } else {
        // Create new banner
        const formData = new FormData();
        formData.append("title", bannerData.name);
        formData.append("preference", bannerData.preference);
        formData.append("pageName", bannerData.page);
        formData.append("image", bannerData.image);
        if (bannerData.categoryId) formData.append("categoryId", bannerData.categoryId);
        if (bannerData.subCategoryId) formData.append("subCategoryId", bannerData.subCategoryId);
        formData.append("attributes", JSON.stringify(bannerData.attributes));

        await axios.post(`${BASE_URL}/banner/create`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        toast.success("Banner created successfully!");
      }
      
      onBannerManaged(); // Notify parent to refresh and close modal
      onClose();
      resetForm(); // Reset form after successful submission
    } catch (error) {
      console.error(isEditMode ? "Error updating banner:" : "Error creating banner:", error);
      toast.error(isEditMode ? "Failed to update banner." : "Failed to create banner.");
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

      <h2 className="text-black text-lg mb-3">{isEditMode ? "Edit Banner" : "Add Banner"}</h2>

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
        disabled={isEditMode} // Disabled in edit mode
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
        disabled={isEditMode} // Disabled in edit mode
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
        Banner Image {isEditMode ? "" : <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded"
        disabled={isEditMode} // Disabled in edit mode
      />

      {(imagePreview && !isEditMode) || (imagePreview && isEditMode && !bannerData.image) ? ( // Show existing image in edit mode if no new image selected
        <div className="mb-3">
          <img src={imagePreview} alt="Banner Preview" className="w-32 h-32 rounded object-cover" />
        </div>
      ) : (bannerData.image && ( // Show new image preview if selected
        <div className="mb-3">
          <img src={URL.createObjectURL(bannerData.image)} alt="Banner Preview" className="w-32 h-32 rounded object-cover" />
        </div>
      ))}

      {/* Filter Products Section */}
      <h3 className="text-black text-sm font-semibold mb-2">Filter Products</h3>

      {/* Category Dropdown */}
      <select
        name="categoryId"
        value={bannerData.categoryId}
        onChange={handleInputChange}
        className="w-full mb-3 p-1.5 text-sm bg-gray-200 text-black rounded border border-gray-400"
        disabled={isEditMode} // Disabled in edit mode
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
        disabled={!bannerData.categoryId || isEditMode} // Disabled if no category or in edit mode
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
    className="mt-1.5 px-2.5 py-1 text-sm bg-blue-500 text-black rounded"
  >
    + Add Attribute
  </button>
</div>


      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !isFormValid()}
        className={`w-full p-1.5 text-sm rounded transition duration-200 ${
          isFormValid()
            ? "bg-blue-500 text-black hover:bg-blue-600 cursor-pointer"
            : "bg-gray-400 text-gray-700 cursor-not-allowed opacity-50"
        }`}
      >
        {isSubmitting ? "Submitting..." : "Submit Banner"}
      </button>
    </Modal>
  );
};

export default ManageBannerModal;
