"use client";
import React, { useEffect, useState, useContext } from "react";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useLogout } from "@/hooks/useLogout";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";

type Seller = {
  _id: string;
  sellerName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  upi: string;
  upiImageUrl: string; // ✅ renamed field
};

export default function Home() {
  useAuthRedirect();
  const { logout } = useLogout();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Seller>>({});
  const [upiImageFile, setUpiImageFile] = useState<File | null>(null); // ✅ added
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  const handleLogout = async () => {
    await logout();
  };

  const fetchSeller = async () => {
    try {
      const res = await axios.get("/api/v1/seller/getall", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const sellerData = res.data.data;
      setSeller(sellerData);
      setFormData({ ...sellerData });
    } catch (error) {
      console.error("Failed to fetch seller", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUpiImageFile(file); // ✅ set selected file
    }
  };

  const handleUpdate = async () => {
    if (!seller?._id) return;
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          form.append(key, value);
        }
      });

      if (upiImageFile) {
        form.append("upiImage", upiImageFile); // ✅ send file
      }

      await axios.put("/api/v1/seller/update", form, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      await fetchSeller();
      setEditing(false);
      setUpiImageFile(null);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  useEffect(() => {
    fetchSeller();
  }, []);

  const buttonStyle: React.CSSProperties = {
    backgroundColor: "#fff",
    color: "#000",
    border: "1px solid #000",
    padding: "0.5rem 1rem",
    borderRadius: "4px",
    cursor: "pointer",
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "2rem"
      }}>
        <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
          You are logged in as admin
        </div>
        <button onClick={handleLogout} style={buttonStyle}>
          Logout
        </button>
      </div>

      {/* Seller Info */}
      <div style={{ textAlign: "center" }}>
        <h2>Seller Information</h2>
        {seller ? (
          <div
            style={{
              margin: "0 auto",
              padding: "2rem",
              maxWidth: "500px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0,0,0,0.1)",
              textAlign: "left",
            }}
          >
            <p><strong>Name:</strong> {seller.sellerName}</p>
            <p><strong>Address:</strong> {seller.address}</p>
            <p><strong>City:</strong> {seller.city}</p>
            <p><strong>State:</strong> {seller.state}</p>
            <p><strong>Pincode:</strong> {seller.pincode}</p>
            <p><strong>Phone:</strong> {seller.phoneNumber}</p>
            <p><strong>Email:</strong> {seller.email}</p>
            <p><strong>GST:</strong> {seller.gstNumber}</p>
            <p><strong>UPI:</strong> {seller.upi}</p>
            <p>
              <strong>UPI Image Preview:</strong><br />
              {seller.upiImageUrl && (
                <img src={seller.upiImageUrl} alt="UPI" width="100" />
              )}
            </p>

            <button style={{ ...buttonStyle, marginTop: "1rem" }} onClick={() => setEditing(true)}>
              Update Seller Details
            </button>
          </div>
        ) : (
          <p>Loading seller information...</p>
        )}
      </div>

      {/* Modal */}
      {editing && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              color: "#000",
              padding: "2rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
            }}
          >
            <h2>Update Seller Information</h2>
            <form onSubmit={(e) => e.preventDefault()}>
              {[
                "sellerName",
                "address",
                "city",
                "state",
                "pincode",
                "phoneNumber",
                "email",
                "gstNumber",
                "upi",
              ].map((field) => (
                <div key={field} style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px", color: "#000" }}>
                    {field}
                  </label>
                  <input
                    type="text"
                    name={field}
                    value={formData?.[field as keyof Seller] || ""}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      color: "#000",
                      backgroundColor: "#fff",
                    }}
                  />
                </div>
              ))}

              {/* File input for UPI image */}
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px", color: "#000" }}>
                  UPI Image
                </label>
                <input type="file" accept="image/*" onChange={handleImageChange} />
                {upiImageFile && (
                  <div style={{ marginTop: "0.5rem" }}>
                    <strong>Preview:</strong><br />
                    <img src={URL.createObjectURL(upiImageFile)} alt="Selected" width="100" />
                  </div>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: "1.5rem",
                }}
              >
                <button type="button" onClick={() => setEditing(false)} style={buttonStyle}>
                  Cancel
                </button>
                <button type="button" onClick={handleUpdate} style={buttonStyle}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
