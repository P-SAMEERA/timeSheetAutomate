import React, { useState } from "react";
import Button from "../components/Button.jsx";
import axios from "axios";

export default function AddUserModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    userId: "",
    password: "",
    role: "user",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const BASE_URL = "https://timesheetautomate.onrender.com";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.userId.trim() || !formData.password.trim()) {
      alert("Please fill all fields!");
      return;
    }

    try {
      setLoading(true);
      const id = localStorage.getItem("userId");
      const res = await axios.post(`${BASE_URL}/api/admin/${id}/add`, formData);

      alert("✅ User added successfully!");
      // 🔥 Trigger refresh AFTER alert is closed
      onAdd(res.data);
      onClose();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-[#0f1a33] border border-gray-700 rounded-2xl p-8 w-[400px] relative shadow-2xl">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl"
          onClick={onClose}
        >
          ✖
        </button>

        <h2 className="text-2xl font-semibold text-center mb-6 text-yellow-400">
          Add New User
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="userId"
            placeholder="User ID"
            value={formData.userId}
            onChange={handleChange}
            className="bg-[#1c253b] border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
            autoComplete="off"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="bg-[#1c253b] border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
            autoComplete="new-password"
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="bg-[#1c253b] border border-gray-700 rounded-md px-4 py-2 text-white focus:ring-2 focus:ring-yellow-400 outline-none"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <label className="flex items-center gap-2 text-gray-300">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="accent-yellow-400"
            />
            Active
          </label>

          <Button
            label={loading ? "Adding..." : "Add User"}
            onClick={handleSubmit}
            variant="primary"
            className="mt-4 w-full"
            disabled={loading}
          />
        </div>
      </div>
    </div>
  );
}
