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
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Handle input changes
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

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const formData = new FormData();
      formData.append("title", bannerData.name);
      formData.append("pageName", bannerData.page);
      formData.append("image", bannerData.image);

      const response = await axios.post(`${BASE_URL}/banner/create`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedback({
        type: "success",
        message: "Banner created successfully!",
      });
      onBannerAdded(response.data.data); // Pass the new banner data back to the parent component
      onClose(); // Close the modal after submission
      setBannerData({
        name: "",
        image: null,
        page: "",
      });
    } catch (error) {
      console.error("Error creating banner:", error);
      setFeedback({
        type: "error",
        message: "Failed to create banner. Please try again.",
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

      <h2 className="text-black text-xl mb-4">Add Banner</h2>

      {/* Name Input */}
      <input
        type="text"
        name="name"
        placeholder="Banner Name"
        value={bannerData.name}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />
       {/* Name Input */}
       <input
        type="text"
        name="page"
        placeholder="Page Name"
        value={bannerData.page}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded"
      />

      {/* Image Preview */}
      {bannerData.image && (
        <div className="mb-4">
          <img
            src={URL.createObjectURL(bannerData.image)}
            alt="Banner Preview"
            className="w-full h-auto rounded"
          />
        </div>
      )}

      {/* Submit Button */}
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
