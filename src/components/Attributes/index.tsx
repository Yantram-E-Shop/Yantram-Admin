"use client"; // Mark this file as a Client Component
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";
import { AttributeColumn } from "./Attribute/columns";
import AddAttributeModal from "../ui/AddAttributeModal";
import { AttributesClient } from "./Attribute/client";

const Attributes = () => {
  const [attributes, setAttributes] = useState<AttributeColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAttributes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/attributes`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.data;
      console.log("Attributes fetched:", data);
      setAttributes(data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  const onAttributeAdded = () => {
    fetchAttributes();
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchAttributes();
  }, [accessToken]);

const formattedAttributes = attributes.map((attribute) => {
  let formattedDate = "N/A"; // Default value if the date is invalid

  if (attribute.updatedAt) {
    const date = new Date(attribute.updatedAt);
    if (!isNaN(date.getTime())) {
      formattedDate = format(date, "MMMM do, yyyy");
    }
  }

  return {
    _id: attribute._id,
    name: attribute.name,
    values: attribute.values, // Join array values with commas
    updatedAt: formattedDate,
  };
});


  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <AttributesClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={formattedAttributes}
        />
        <AddAttributeModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAttributeAdded={onAttributeAdded}
        />
      </div>
    </div>
  );
};

export default Attributes;
