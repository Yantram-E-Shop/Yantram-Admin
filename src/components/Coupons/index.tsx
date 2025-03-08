"use client"; // Correctly mark this file as a Client Component
import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { format } from "date-fns";
import { AuthContext } from "@/context/AuthContext";
import Loader from "../ui/loader";
import { BASE_URL } from "@/api/axios";
import { CouponsClient } from "./Coupon/client"; 
import { CouponColumn } from "./Coupon/columns"; 
import AddCouponModal from "../ui/AddCouponModal"; 

const Coupons = () => {
  const [coupons, setCoupons] = useState<CouponColumn[]>([]);
  const [loading, setLoading] = useState(false);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;
  const [isModalOpen, setIsModalOpen] = useState(false); 

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/coupons`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data.data.coupons;
      console.log("Coupons fetched:", data);
      setCoupons(data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const onCouponAdded = () => {
    fetchCoupons(); 
    setIsModalOpen(false); 
  };

  useEffect(() => {
    fetchCoupons(); 
  }, [accessToken]);

  const formattedCoupons = coupons.map((coupon) => ({
  _id: coupon._id,
  code: coupon.code,
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  validFrom: format(new Date(coupon.validFrom), "dd-MM-yyyy"), // Change to dd-MM-yyyy
  validUntil: format(new Date(coupon.validUntil), "dd-MM-yyyy"), // Change to dd-MM-yyyy
  maxUsageLimit: coupon.maxUsageLimit,
  currentUsage: coupon.currentUsage,
  isActive: coupon.isActive,
  createdAt: format(new Date(coupon.createdAt), "dd-MM-yyyy"), // Change to dd-MM-yyyy
  updatedAt: format(new Date(coupon.updatedAt), "dd-MM-yyyy"), // Change to dd-MM-yyyy
}));

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="flex-col">
      <div className="flex-1 p-8 pt-6 space-y-4">
        <CouponsClient
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          data={formattedCoupons}
        />
        <AddCouponModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onCouponAdded={onCouponAdded}
        />
      </div>
    </div>
  );
};

export default Coupons;
