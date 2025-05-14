"use client";

import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { ShippingClient } from "./Shipping/client";
import { ShippingColumn } from "./Shipping/columns";
import { AuthContext } from "@/context/AuthContext";
import AddZoneModal from "../ui/AddZoneModal";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

const Shipping = () => {
  const [zones, setZones] = useState<ShippingColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const onZoneAdded = (zone: ShippingColumn) => {
    setZones((prevZones) => {
      const exists = prevZones.find((z) => z._id === zone._id);
      if (exists) {
        // Update existing zone
        return prevZones.map((z) => (z._id === zone._id ? zone : z));
      } else {
        // Add new zone
        return [...prevZones, zone];
      }
    });
    closeModal();
  };

  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/zone`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setZones(response.data.data || []);
      } catch (error) {
        console.error("Error fetching shipping zones:", error);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 200);
      }
    };

    fetchZones();
  }, [accessToken]);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ShippingClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={zones}
          onZoneAdded={onZoneAdded} // ✅ Correctly passed
        />

        {/* Modal for Create New Zone only (no zoneToEdit) */}
        <AddZoneModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onZoneAdded={onZoneAdded}
          existingZones={zones}
          zoneToEdit={null}
        />
      </div>
    </div>
  );
};

export default Shipping;
