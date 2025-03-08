"use client";
import React, { useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

const AddAttributeModal = ({ isOpen, onClose, onAttributeAdded }) => {
  const [name, setName] = useState("");
  const [values, setValues] = useState([""]); // Start with an empty array with one value input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Handle input change for the name field
  const handleInputChange = (e) => {
    setName(e.target.value);
  };

  // Handle input change for the values array
  const handleValueChange = (index, value) => {
    const updatedValues = [...values];
    updatedValues[index] = value;
    setValues(updatedValues);
  };

  // Add a new empty value field
  const addValueField = () => {
    setValues([...values, ""]);
  };

  // Remove a value field at a specific index
  const removeValueField = (index) => {
    const updatedValues = values.filter((_, i) => i !== index);
    setValues(updatedValues);
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate that all required fields are filled
    if (!name.trim() || values.some((value) => !value.trim())) {
      setFeedback({ type: "error", message: "Please fill all fields." });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const attributeData = {
      name: name.trim(),
      values: values.filter((value) => value.trim()), // Ensure no empty values are submitted
    };

    try {
      // API call to create a new attribute
      const response = await axios.post(`/api/v1/attributes`, attributeData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      setFeedback({
        type: "success",
        message: "Attribute added successfully!",
      });
      onAttributeAdded(); // Trigger the callback function
      resetForm();
      onClose(); // Close the modal
    } catch (error) {
      console.error("Error adding attribute:", error);
      setFeedback({
        type: "error",
        message: "Failed to add attribute. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form fields
  const resetForm = () => {
    setName("");
    setValues([""]); // Reset values to a single empty input
  };

  // Modal styles for consistency with your previous modal
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

      <h2 className="text-black text-xl mb-4">Add New Attribute</h2>

      <input
        type="text"
        placeholder="Attribute Name"
        value={name}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
        required
      />

      <h3 className="text-black text-lg mb-2">Attribute Values</h3>

      {values.map((value, index) => (
        <div key={index} className="flex items-center mb-4">
          <input
            type="text"
            placeholder={`Value ${index + 1}`}
            value={value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            className="w-full p-2 bg-gray-900 text-black rounded border border-gray-600"
            required
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeValueField(index)}
              className="ml-2 bg-red-500 text-black p-2 rounded hover:bg-red-600"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addValueField}
        className="mb-4 bg-green-500 text-black p-2 rounded hover:bg-green-600"
      >
        + Add Value
      </button>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : "Add Attribute"}
      </button>
    </Modal>
  );
};

export default AddAttributeModal;
