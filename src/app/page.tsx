"use client";
import React, { useEffect, useState, useContext } from "react";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useLogout } from "@/hooks/useLogout";
import axios from "axios";
import { AuthContext } from "@/context/AuthContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

// custom tooltip to display two lines: name and value
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const name = item.payload?.name || label;
    const value = item.value;
    return (
      <div style={{ backgroundColor: '#741616', padding: '5px', border: '1px solid #ccc' }}>
        <div style={{ fontWeight: 'bold' }}>{name}</div>
        <div>{value}</div>
      </div>
    );
  }
  return null;
};

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
  upiImageUrl: string;
};

type SummaryData = {
  revenue: number;
  orders: number;
  customers: number;
  aov: number;
};

type RevenueTrend = {
  date: string;
  revenue: number;
};

type TopSpender = {
  name: string;
  amount: number;
};

type TopProduct = {
  name: string;
  sales: number;
};

type TopCategory = {
  name: string;
  revenue: number;
};

type StatusBreakdown = {
  name: string;
  value: number;
  color: string;
};

type RecentOrder = {
  id: string;
  customer: string;
  total: number;
  status: string;
};

export default function Home() {
  useAuthRedirect();
  const { logout } = useLogout();
  const [seller, setSeller] = useState<Seller | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Seller>>({});
  const [upiImageFile, setUpiImageFile] = useState<File | null>(null);
  const authContext = useContext(AuthContext);
  const accessToken = authContext?.accessToken;

  // Analytics states
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<RevenueTrend[]>([]);
  const [newUsers, setNewUsers] = useState<number>(0);
  const [repeatCustomers, setRepeatCustomers] = useState<number>(0);
  const [topSpenders, setTopSpenders] = useState<TopSpender[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCategories, setTopCategories] = useState<TopCategory[]>([]);
  const [unsoldProducts, setUnsoldProducts] = useState<number>(0);
  const [ordersPerDay, setOrdersPerDay] = useState<number>(0);
  const [statusBreakdown, setStatusBreakdown] = useState<StatusBreakdown[]>([]);
  const [fulfillmentRate, setFulfillmentRate] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = "/api/v1/analytics";

  const fetchSummary = async () => {
    try {
      const res = await axios.get(`${API_BASE}/summary?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Summary response:", res.data);
      const data = res.data.data;
      setSummaryData({
        revenue: data.totalRevenue,
        orders: data.totalOrders,
        customers: data.totalCustomers,
        aov: data.averageOrderValue,
      });
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const fetchRevenueTrend = async () => {
    try {
      const res = await axios.get(`${API_BASE}/revenue/trend?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Revenue trend response:", res.data);
      setRevenueTrend(res.data.data);
    } catch (error) {
      console.error("Failed to fetch revenue trend", error);
    }
  };

  const fetchNewUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/new?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("New users response:", res.data);
      const data = res.data.data;
      const totalNewUsers = data.reduce((sum: number, item: any) => sum + item.users, 0);
      setNewUsers(totalNewUsers);
    } catch (error) {
      console.error("Failed to fetch new users", error);
    }
  };

  const fetchRepeatCustomers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/repeat?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Repeat customers response:", res.data);
      setRepeatCustomers(res.data.data.length);
    } catch (error) {
      console.error("Failed to fetch repeat customers", error);
    }
  };

  const fetchTopSpenders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users/top-spenders?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Top spenders response:", res.data);
      const data = res.data.data.map((item: any) => ({
        name: item.userName,
        amount: item.spent,
      }));
      setTopSpenders(data);
    } catch (error) {
      console.error("Failed to fetch top spenders", error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/top?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Top products response:", res.data);
      const data = res.data.data.map((item: any) => ({
        name: item.productName,
        sales: item.sold,
      }));
      setTopProducts(data);
    } catch (error) {
      console.error("Failed to fetch top products", error);
    }
  };

  const fetchTopCategories = async () => {
    try {
      const res = await axios.get(`${API_BASE}/categories/top?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Top categories response:", res.data);
      const data = res.data.data.map((item: any) => ({
        name: item.categoryName,
        revenue: item.sold, // API returns 'sold' (quantity), using as revenue for chart
      }));
      setTopCategories(data);
    } catch (error) {
      console.error("Failed to fetch top categories", error);
    }
  };

  const fetchUnsoldProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/products/unsold?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Unsold products response:", res.data);
      setUnsoldProducts(res.data.data.length);
    } catch (error) {
      console.error("Failed to fetch unsold products", error);
    }
  };

  const fetchOrdersDaily = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/daily?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Orders daily response:", res.data);
      const data = res.data.data;
      const totalOrders = data.reduce((sum: number, item: any) => sum + item.orders, 0);
      const averageOrdersPerDay = data.length > 0 ? Math.round(totalOrders / data.length) : 0;
      setOrdersPerDay(averageOrdersPerDay);
    } catch (error) {
      console.error("Failed to fetch orders daily", error);
    }
  };

  const fetchOrderStatusBreakdown = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/status?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Order status breakdown response:", res.data);
      const data = res.data.data;
      const statusColors: { [key: string]: string } = {
        orderplaced: "#FFA500",       // orange
        confirmed: "#0088FE",            // blue
        shipping: "#00C49F",             // teal
        outfordelivery: "#800080", // purple
        returned: "#FF0000",             // red
        cancelled: "#A9A9A9",            // dark grey
        delivered: "#008000",            // green
      };
      const breakdown = Object.entries(data).map(([status, count]) => ({
        name: status, // status already formatted in API (e.g. "Order Placed")
        value: count as number,
        color: statusColors[status] || "#8884d8",
      }));
      setStatusBreakdown(breakdown);
    } catch (error) {
      console.error("Failed to fetch order status breakdown", error);
    }
  };

  const fetchFulfillmentRate = async () => {
    try {
      const res = await axios.get(`${API_BASE}/orders/fulfillment-rate?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Fulfillment rate response:", res.data);
      setFulfillmentRate(res.data.data.fulfillmentRate);
    } catch (error) {
      console.error("Failed to fetch fulfillment rate", error);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE}/recent-orders?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Recent orders response:", res.data);
      const data = res.data.data.map((order: any) => ({
        id: order.orderID,
        customer: order.user?.fullName || "Unknown",
        total: order.totalPrice,
        status: order.status,
      }));
      setRecentOrders(data);
    } catch (error) {
      console.error("Failed to fetch recent orders", error);
    }
  };

  const fetchAllData = async () => {
    console.log("fetchAllData called, accessToken:", accessToken);
    console.log("API_BASE:", API_BASE);
    console.log("Date range:", startDate, endDate);
    setLoading(true);

    // Test basic API connectivity
    try {
      const testRes = await axios.get("/api/v1/seller/getall", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log("Test API response:", testRes.data);
    } catch (error) {
      console.error("Test API failed:", error);
    }

    await Promise.all([
      fetchSummary(),
      fetchRevenueTrend(),
      fetchNewUsers(),
      fetchRepeatCustomers(),
      fetchTopSpenders(),
      fetchTopProducts(),
      fetchTopCategories(),
      fetchUnsoldProducts(),
      fetchOrdersDaily(),
      fetchOrderStatusBreakdown(),
      fetchFulfillmentRate(),
      fetchRecentOrders(),
    ]);
    setLoading(false);
  };

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
      setUpiImageFile(file);
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
        form.append("upiImage", upiImageFile);
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
    fetchAllData();
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

      {/* Main Layout */}
      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Seller Info - Left Side */}
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <h2>Seller Information</h2>
          {seller ? (
            <div
              style={{
                padding: "2rem",
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

        {/* Analytics - Right Side */}
        <div style={{ flex: 2 }}>
          {/* Date Range Selector */}
          <div style={{ marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center" }}>
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ marginLeft: "0.5rem", padding: "0.5rem", border: "1px solid #ccc", borderRadius: "4px", color: "black" }}
              />
            </label>
            <button onClick={fetchAllData} disabled={loading} style={buttonStyle}>
              {loading ? "Loading..." : "Update Data"}
            </button>
          </div>

          {/* SUMMARY */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>SUMMARY</h3>
            {summaryData ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginTop: "1rem" }}>
                <div style={{ padding: "1rem", border: "1px solid #31f10a", borderRadius: "8px", textAlign: "center" }}>
                  <h4>Revenue</h4>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>₹{summaryData.revenue.toLocaleString()}</p>
                </div>
                <div style={{ padding: "1rem", border: "1px solid #31f10a", borderRadius: "8px", textAlign: "center" }}>
                  <h4>Orders</h4>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{summaryData.orders}</p>
                </div>
                <div style={{ padding: "1rem", border: "1px solid #31f10a", borderRadius: "8px", textAlign: "center" }}>
                  <h4>Customers</h4>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{summaryData.customers}</p>
                </div>
                <div style={{ padding: "1rem", border: "1px solid #31f10a", borderRadius: "8px", textAlign: "center" }}>
                  <h4>AOV</h4>
                  <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>₹{summaryData.aov}</p>
                </div>
              </div>
            ) : (
              <p>Loading summary...</p>
            )}
          </div>

          {/* Sales Trend */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>Sales Trend (Line Chart)</h3>
            <div style={{ height: "300px", marginTop: "1rem" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* User Analytics */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>User Analytics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>New Users</h4>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{newUsers}</p>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Top Customers</h4>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topSpenders} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(str: string) =>
                          str.length > 12 ? str.slice(0, 12) + '...' : str
                        }
                      />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Repeat Customers</h4>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{repeatCustomers}</p>
              </div>
            </div>
          </div>

          {/* Product Analytics */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>Product Analytics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Top Products</h4>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topProducts} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tickFormatter={(str: string) =>
                          str.length > 12 ? str.slice(0, 12) + '...' : str
                        }
                      />
                      <YAxis />
                      <RechartsTooltip content={<CustomTooltip />} />
                      <Bar dataKey="sales" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Top Categories</h4>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topCategories}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="revenue"
                        label
                      >
                        {topCategories.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Unsold Products</h4>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{unsoldProducts}</p>
              </div>
            </div>
          </div>

          {/* Order Analytics */}
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>Order Analytics</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginTop: "1rem" }}>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", textAlign: "center" }}>
                <h4>Orders per day</h4>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{ordersPerDay}</p>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
                <h4>Status breakdown</h4>
                <div style={{ height: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusBreakdown}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {statusBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 60}, 70%, 50%)`} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div style={{ padding: "1rem", border: "1px solid #ccc", borderRadius: "8px", textAlign: "center" }}>
                <h4>Fulfillment rate</h4>
                <p style={{ fontSize: "2rem", fontWeight: "bold" }}>{fulfillmentRate}%</p>
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div>
            <h3 style={{ borderBottom: "2px solid #000", paddingBottom: "0.5rem" }}>Recent Orders</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Order ID</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Customer</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Total</th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "0.5rem" }}>{order.id}</td>
                    <td style={{ padding: "0.5rem" }}>{order.customer}</td>
                    <td style={{ padding: "0.5rem" }}>₹{order.total}</td>
                    <td style={{ padding: "0.5rem" }}>{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
