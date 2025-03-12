"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { BannersClient } from "./Banners/client";
import { BannerColumn } from "./Banners/columns";
import { AuthContext } from "@/context/AuthContext";
import AddBannerModal from "../ui/AddBannerModal";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

const Banners = () => {
  const [banners, setBanners] = useState<BannerColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const  onBannerAdded = () => {
    closeModal();
  }
  useEffect(() => {
    const fetchBanners = async () => {
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
    };

    fetchBanners();
  }, [accessToken]);


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
          data={banners}
        />
        <AddBannerModal isOpen={isModalOpen} onClose={closeModal} onBannerAdded={onBannerAdded} />
      </div>
    </div>
  );
};

export default Banners;