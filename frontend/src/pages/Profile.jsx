import React, { useEffect, useState, useRef } from "react";
import BackButton from "../components/backButton";
import axios from "axios";

const Profile = () => {
  const [userInfo, setUserInfo] = useState({ userId: "", password: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fetched = useRef(false); // prevents duplicate API calls in dev StrictMode

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id || fetched.current) return;
    fetched.current = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          "http://localhost:5000/api/admin/one",
          { userId: id },
          { headers: { "Content-Type": "application/json" } }
        );

        // console.log("✅ API Response:", response.data.payload);
        const { userId, password } = response.data.payload;
        setUserInfo({ userId, password });
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
        setError("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="w-screen h-screen bg-[#0f1a33] text-white flex flex-col items-center justify-center gap-8 p-6">
      <div className="bg-[#161b22] p-10 rounded-2xl shadow-xl border border-gray-700 w-[400px] flex flex-col gap-6 text-center">
        <h1 className="text-3xl font-bold text-yellow-400 mb-4">Your Profile</h1>

        {loading ? (
          <p className="text-gray-400">Loading profile...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="flex flex-col gap-4 text-lg">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">User ID:</span>
              <span className="font-semibold text-white">{userInfo.userId}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Password:</span>
              <span className="font-semibold text-white">{userInfo.password}</span>
            </div>
          </div>
        )}

        <div className="pt-6">
          <BackButton />
        </div>
      </div>
    </div>
  );
};

export default Profile;
