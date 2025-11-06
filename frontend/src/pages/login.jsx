import React, { useState } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ setLoggedIn }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({ username: false, password: false });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      username: formData.username.trim() === "",
      password: formData.password.trim() === "",
    };
    setErrors(newErrors);

    if (newErrors.username || newErrors.password) return;

    try {
      setLoading(true);
      const response = await axios.post("https://timesheetautomate.onrender.com/api/login", {
        userId: formData.username,
        password: formData.password,
      });
      const { role, userId } = response.data.payload;
      // ✅ Save to localStorage
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", role);

      // ✅ Update app state
      setLoggedIn(true);

      // ✅ Redirect
      navigate("/dashboard");
    } catch (error) {
      const message = error.response?.data?.message;
      alert(message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center w-screen h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-10 rounded-xl shadow-2xl w-full max-w-md flex flex-col gap-6"
        autoComplete="off"
      >
        <h2 className="text-4xl font-extrabold text-center text-white mb-6">
          Login
        </h2>

        {["username", "password"].map((field) => (
          <div key={field} className="flex flex-col gap-1 relative">
            <label className="text-gray-300 capitalize">{field}</label>
            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              placeholder={`Enter your ${field}`}
              value={formData[field]}
              onChange={(e) => {
                handleChange(e);
                if (errors[field])
                  setErrors((prev) => ({ ...prev, [field]: false }));
              }}
              className={`px-4 py-2 rounded-lg border-2 
                ${!errors[field] ? "border-gray-600" : "border-red-500 animate-shake"} 
                bg-gray-700 text-white placeholder-gray-400 
                focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-600 transition-all duration-500`}
              required
            />
            {errors[field] && (
              <span className="text-red-500 text-sm absolute top-full left-0 mt-1">
                *required
              </span>
            )}
          </div>
        ))}

        <Button
          type="submit"
          label={loading ? "Logging in..." : "Login"}
          variant="primary"
          className="w-full mt-4"
          disabled={loading}
        />
      </form>
    </div>
  );
};

export default Login;
