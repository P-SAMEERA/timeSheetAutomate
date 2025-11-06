import React, { useState, useEffect } from "react";
import axios from "axios";
import UserModal from "../components/userModal";
import AddUserModal from "../components/addModal";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/backButton";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTimesheets, setUserTimesheets] = useState([]); // all sheets
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [adminId, setAdminId] = useState(null);

  const BASE_URL = "http://localhost:5000";

  // Fetch admin + users on mount
  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) {
      setAdminId(id);
      fetchUsers(id);
    } else {
      console.warn("No userId found in localStorage");
      navigate("/");
    }
  }, [navigate]);

  const fetchUsers = async (id) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/${id}/all`);
      if (res.data?.payload && Array.isArray(res.data.payload)) {
        setUsers(res.data.payload);
      } else {
        console.warn("Unexpected user data:", res.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // When user card is clicked → fetch all their timesheets
  const handleUserClick = async (user) => {
    if (deleteMode || !adminId) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/timesheet/${user._id}/all`);
      const payload = res.data?.payload || [];
      setSelectedUser(user);
      setUserTimesheets(payload);
    } catch (err) {
      console.error("Error fetching user timesheets:", err);
    }
  };

  // Delete user (soft delete)
  const handleDeleteClick = async (user) => {
    if (!adminId) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/${adminId}/delete`, {
        data: { id: user._id, userId: user.userId, name: user.name },
      });
      await fetchUsers(adminId); // refresh after soft delete
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // ✅ Reactivate user
  const handleReactivateClick = async (user) => {
    if (!adminId) return;
    try {
      await axios.put(`${BASE_URL}/api/admin/${adminId}/update`, {
        id: user._id,
        userId: user.userId,
        name: user.name,
        role: user.role,
        isActive: true, // re-activate
      });
      await fetchUsers(adminId); // refresh after reactivation
    } catch (err) {
      console.error("Error reactivating user:", err);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#0f1a33] text-white flex flex-col items-center p-8 overflow-hidden">
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <BackButton />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-xl font-semibold"
          >
            + Add User
          </button>
          <button
            onClick={() => setDeleteMode(!deleteMode)}
            className={`px-5 py-2 rounded-xl font-semibold ${
              deleteMode
                ? "bg-red-700 hover:bg-red-600"
                : "bg-red-600 hover:bg-red-500"
            }`}
          >
            {deleteMode ? "Cancel" : "De-Activate User"}
          </button>
        </div>
      </div>

      {/* User Grid */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-6xl">
        {users.map((user) => (
          <div
            key={user._id}
            className="relative bg-[#1a2342] border border-gray-700 p-6 rounded-2xl shadow-xl hover:border-yellow-400 transition-all duration-200 cursor-pointer"
            onClick={() => handleUserClick(user)}
          >
            <h2 className="text-xl font-bold mb-2">{user.userId}</h2>
            <p className="text-gray-400">Role: {user.role}</p>
            <p
              className={`font-semibold ${
                user.isActive ? "text-green-400" : "text-red-400"
              }`}
            >
              Status: {user.isActive ? "Active" : "Inactive"}
            </p>

            {/* Delete Mode Button */}
            {deleteMode && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(user);
                }}
                className="absolute top-3 right-4 text-red-500 hover:text-red-400 text-xl font-bold"
              >
                ✖
              </button>
            )}

            {/* Reactivate Button for Inactive Users */}
            {!user.isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReactivateClick(user);
                }}
                className="absolute bottom-3 right-4 text-green-400 hover:text-green-300 font-semibold text-sm"
              >
                🔄 Re-Activate
              </button>
            )}
          </div>
        ))}
      </div>

      {/* User Modal */}
      {selectedUser && (
        <UserModal
          user={selectedUser}
          allTimeSheets={userTimesheets}
          onClose={() => {
            setSelectedUser(null);
            setUserTimesheets([]);
          }}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddUserModal
          onClose={() => setShowAddModal(false)}
          onAdd={async () => {
            await fetchUsers(adminId); // refresh user list after alert
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}
