"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const AddFaqModal = ({ isOpen, onClose, onFaqAdded, data = null }) => {
  const [FaqData, setFaqData] = useState({
    ques: "",
    ans: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Check if in edit mode
  const isEditMode = !!data;

  useEffect(() => {
    if (isEditMode && data) {
      setFaqData({
        ques: data.question || data.ques || "",
        ans: data.answer || data.ans || "",
      });
    } else {
      setFaqData({
        ques: "",
        ans: "",
      });
    }
  }, [data, isOpen]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFaqData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    try {
      const payload = {
        question: FaqData.ques,
        answer: FaqData.ans,
      };

      let response;
      if (isEditMode) {
        // Update existing FAQ
        response = await axios.put(`${BASE_URL}/faqs/${data._id}`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFeedback({
          type: "success",
          message: "Faq updated successfully!",
        });
      } else {
        // Create new FAQ
        response = await axios.post(`${BASE_URL}/faqs/add`, payload, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFeedback({
          type: "success",
          message: "Faq created successfully!",
        });
      }

      onFaqAdded(response.data.data); // Pass the new/updated FAQ data back to the parent component
      onClose(); // Close the modal after submission
      setFaqData({
        ques: "",
        ans: "",
      });
    } catch (error) {
      console.error("Error saving Faq:", error);
      setFeedback({
        type: "error",
        message: isEditMode ? "Failed to update Faq. Please try again." : "Failed to create Faq. Please try again.",
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

      <h2 className="text-black text-xl mb-4">{isEditMode ? "Edit Faq" : "Add Faq"}</h2>

      {/* Name Input */}
      <input
        type="text"
        name="ques"
        placeholder="Add Question"
        value={FaqData.ques}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />
       {/* Name Input */}
       <input
        type="text"
        name="ans"
        placeholder="Add Answer"
        value={FaqData.ans}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />


      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Saving..." : isEditMode ? "Update Faq" : "Submit Faq"}
      </button>
    </Modal>
  );
};

export default AddFaqModal;
