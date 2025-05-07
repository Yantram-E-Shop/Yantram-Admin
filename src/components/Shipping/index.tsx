"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ShippingClient } from "./Shipping/client";
import { ShippingColumn } from "./Shipping/columns";
import { AuthContext } from "@/context/AuthContext";
import AddZoneModal from "../ui/AddZoneModal";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

const Shipping = () => {
  const [zones, setZones] = useState<ShippingColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const  onShippingAdded = () => {
    closeModal();
  }
  useEffect(() => {
    const fetchZones = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/zone`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        setZones(data.data);
      } catch (error) {
        console.error("Error fetching shipping zones:", error);
      } finally {
        setTimeout(() => { setLoading(false) }, 200);
      }
    };

    fetchZones();
  }, [accessToken]);


  if (loading) {
    return (
      <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <ShippingClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={zones}
        />
        <AddZoneModal isOpen={isModalOpen} onClose={closeModal} onZoneAdded={onShippingAdded} existingZones={zones} />
      </div>
    </div>
  );
};

export default Shipping;