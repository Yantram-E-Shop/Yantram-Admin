"use client";
import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

const AddFaqModal = ({ isOpen, onClose, onFaqAdded }) => {
  const [FaqData, setFaqData] = useState({
    ques: "",
    ans: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

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
      const response = await axios.post(`${BASE_URL}/faqs/add`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedback({
        type: "success",
        message: "Faq created successfully!",
      });
      onFaqAdded(response.data.data); // Pass the new Faq data back to the parent component
      onClose(); // Close the modal after submission
      setFaqData({
        ques: "",
        ans: "",
      });
    } catch (error) {
      console.error("Error creating Faq:", error);
      setFeedback({
        type: "error",
        message: "Failed to create Faq. Please try again.",
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

      <h2 className="text-black text-xl mb-4">Add Faq</h2>

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
        {isSubmitting ? "Submitting..." : "Submit Faq"}
      </button>
    </Modal>
  );
};

export default AddFaqModal;
