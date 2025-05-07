"use client";
import React, { useState, useContext } from "react";
import Modal from "react-modal";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { BASE_URL } from "@/api/axios";

// List of all Indian states
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
  "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
  "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep"
];

const AddZoneModal = ({ isOpen, onClose, onZoneAdded, existingZones }) => {
  const [zoneData, setZoneData] = useState({
    name: "",
    states: [],
    shippingFee: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const getUsedStates = () => {
    return existingZones.flatMap((zone) => zone.states);
  };

  const usedStates = getUsedStates();
  const availableStates = indianStates.filter(
    (state) => !usedStates.includes(state)
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setZoneData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (state) => {
    setZoneData((prev) => {
      const isSelected = prev.states.includes(state);
      return {
        ...prev,
        states: isSelected
          ? prev.states.filter((s) => s !== state)
          : [...prev.states, state],
      };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setFeedback({ type: "", message: "" });

    const { name, states, shippingFee } = zoneData;

    if (!name || states.length === 0 || !shippingFee || isNaN(shippingFee)) {
      setFeedback({
        type: "error",
        message: "Zone name, at least one state, and valid shipping fee are required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
        
      const payLoad = {
        name,
        states,
        shippingFee: parseFloat(shippingFee),
      };
        const response = await axios.post(`${BASE_URL}/zone`, payLoad, {
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            },
        });

      setFeedback({ type: "success", message: "Zone created successfully!" });
      onZoneAdded(response.data.data);
      onClose();
      setZoneData({ name: "", states: [], shippingFee: "" });
    } catch (error) {
      console.error("Error creating zone:", error);
      setFeedback({
        type: "error",
        message: error?.response?.data?.message || "Failed to create zone.",
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
        <p className={`mb-4 ${feedback.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {feedback.message}
        </p>
      )}

      <h2 className="text-black text-xl mb-4">Add Zone</h2>

      {/* Zone Name */}
      <input
        type="text"
        name="name"
        placeholder="Zone Name"
        value={zoneData.name}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />

      {/* States Checkbox List */}
      <div className="mb-4">
        <label className="block mb-2 font-semibold text-black">Select States</label>
        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto border border-gray-600 p-2 rounded bg-gray-900">
          {availableStates.map((state) => (
            <label key={state} className="flex items-center space-x-2 text-black">
              <input
                type="checkbox"
                value={state}
                checked={zoneData.states.includes(state)}
                onChange={() => handleCheckboxChange(state)}
              />
              <span>{state}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Shipping Fee */}
      <input
        type="number"
        name="shippingFee"
        placeholder="Shipping Fee (%)"
        value={zoneData.shippingFee}
        onChange={handleInputChange}
        className="w-full mb-4 p-2 bg-gray-900 text-black rounded border border-gray-600"
      />

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full p-2 bg-blue-500 text-black rounded hover:bg-blue-600 transition duration-200"
      >
        {isSubmitting ? "Submitting..." : "Submit Zone"}
      </button>
    </Modal>
  );
};

export default AddZoneModal;
