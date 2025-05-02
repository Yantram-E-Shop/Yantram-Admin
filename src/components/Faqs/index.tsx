"use client";
import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { FaqsClient } from "./Faqs/client";
import { FaqColumn } from "./Faqs/columns";
import { AuthContext } from "@/context/AuthContext";
import AddFaqModal from "../ui/AddFaqModal";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";

const Faqs = () => {
  const [faqs, setFaqs] = useState<FaqColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const  onFaqAdded = () => {
    closeModal();
  }
  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/Faqs/getall`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = response.data;
        setFaqs(data.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setTimeout(() => { setLoading(false) }, 200);
      }
    };

    fetchFaqs();
  }, [accessToken]);


  if (loading) {
    return (
      <Loader />
    )
  }
  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <FaqsClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={faqs}
        />
        <AddFaqModal isOpen={isModalOpen} onClose={closeModal} onFaqAdded={onFaqAdded} />
      </div>
    </div>
  );
};

export default Faqs;