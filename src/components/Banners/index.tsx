"use client";
import React, { useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { format } from "date-fns";
import { BannersClient } from "./Banners/client";
import { BannerColumn } from "./Banners/columns";
import { AuthContext } from "@/context/AuthContext"; // Keep AuthContext
import ManageBannerModal from "../ui/ManageBannerModal"; // Renamed import
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

const Banners = () => {
  const [banners, setBanners] = useState<BannerColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBannerForEdit, setSelectedBannerForEdit] = useState<BannerColumn | null>(null);

  const openModal = (banner?: BannerColumn) => {
    setSelectedBannerForEdit(banner || null);
    setIsModalOpen(true);
  };
  const closeModal = useCallback(() => {
    setIsModalOpen(false); // Corrected: Call setIsModalOpen to close the modal
    setSelectedBannerForEdit(null); // Clear selected banner when modal closes
  }, []);

  const fetchBanners = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/banner/getall`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = response.data;
      setBanners(data.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setTimeout(() => { setLoading(false) }, 200);
    }
  }, [accessToken]); // Dependencies for useCallback

  useEffect(() => {
    fetchBanners();
  }, [accessToken, fetchBanners]); // Add fetchBanners to useEffect dependencies

  const onBannerManaged = () => {
    closeModal();
    // Re-fetch banners to show updated data
    fetchBanners(); // Call the fetch function directly
  };

  if (loading) {
    return (
      <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <BannersClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          onOpenModal={openModal} // Pass openModal to client
          data={banners}
        />
        <ManageBannerModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onBannerManaged={onBannerManaged}
          bannerToEdit={selectedBannerForEdit}
        />
      </div>
    </div>
  );
};

export default Banners;