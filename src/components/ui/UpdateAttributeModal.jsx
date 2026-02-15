"use client";

import React, { useState, useEffect, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthContext } from "@/context/AuthContext";

const UpdateAttributeModal = ({
  isOpen,
  onClose,
  attributeData,
  onAttributeUpdated,
}) => {
  const [values, setValues] = useState([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

 useEffect(() => {
   if (isOpen) {
     // Initialize values with unique data
     setValues(
       Array.isArray(attributeData.values)
         ? [...new Set(attributeData.values)]
         : []
     );
   }
 }, [isOpen, attributeData]);


  // Handle input change for values
  const handleValueChange = (index, value) => {
    const updatedValues = [...values];
    updatedValues[index] = value;
    setValues(updatedValues);
  };

  // Add new value field
  const addValueField = () => {
    setValues([...values, ""]);
  };

  // Remove value field
  const removeValueField = (index) => {
    const updatedValues = values.filter((_, i) => i !== index);
    setValues(updatedValues);
  };

  // Handle form submission
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `/api/v1/attributes/${attributeData._id}/add`,
        { newValues: values.filter((value) => value.trim()) },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      toast.success("Attribute values updated successfully!");
      onAttributeUpdated();
      onClose(); // Close modal after success
    } catch (error) {
      console.error("Error updating attribute values:", error);
      toast.error("Failed to update attribute values. Please try again.");
    } finally {
      setLoading(false);
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Update Attribute"
      style={modalStyles}
    >
      <h2 className="text-black text-xl mb-4">Update Attribute Values</h2>

      {values.map((value, index) => (
        <div key={index} className="flex items-center mb-4">
          <Input
            type="text"
            placeholder={`Value ${index + 1}`}
            value={value}
            onChange={(e) => handleValueChange(index, e.target.value)}
            required
          />
          {values.length > 1 && (
            <Button
              onClick={() => removeValueField(index)}
              className="ml-2 bg-red-500"
            >
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button onClick={addValueField} className="mb-4 bg-green-500">
        + Add Value
      </Button>

      <Button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-500"
      >
        {loading ? "Updating..." : "Update Values"}
      </Button>
    </Modal>
  );
};

export default UpdateAttributeModal;
