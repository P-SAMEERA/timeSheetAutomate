import React, { useState, useEffect } from "react";
import Button from "../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [sheetType, setSheetType] = useState("A shift");
  const [isOT, setIsOT] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role === "admin") setIsAdmin(true);

    setTasks([
      { id: 1, task: "Development", hours: "", description: "" },
      { id: 2, task: "Testing", hours: "", description: "" },
      { id: 3, task: "Documentation", hours: "", description: "" },
      { id: 4, task: "Team Meeting", hours: "", description: "" },
      { id: 5, task: "Code Review", hours: "", description: "" },
      { id: 6, task: "Incidents", hours: "", description: "", incidentOption: "" },
    ]);
  }, []);

const handleUpdate = async () => {
  try {
    const response = await axios.put(
      `https://timesheetautomate.onrender.com/api/timesheet/update`,
      {
        userId: localStorage.getItem("userId"),
        tasks,         // your updated tasks array
        totalHours,    // calculated total hours
      }
    );
    alert("✅ Timesheet updated successfully!");
    console.log("Update response:", response.data);
  } catch (error) {
    console.error("❌ Error updating timesheet:", error);
    alert(`Failed to update timesheet: ${error.response?.data?.message || error.message}`);
  }
};


  const handleSubmit = async () => {
    if (!selectedDate) return alert("❌ Please select a date first!");

    const userId = localStorage.getItem("userId");
    if (!userId) return alert("⚠️ Missing user session!");

    const formatted = {
      userId,
      date: selectedDate,
      shiftType: sheetType,
      isOT,
      total: totalHours,
      entries: tasks
        .filter((t) => parseFloat(t.hours) > 0)
        .map((t) => ({
          task: t.customName || t.task,
          hours: parseFloat(t.hours),
          description: t.description,
          incidentOption: t.incidentOption || undefined,
        })),
    };

    try {
      const res = await axios.post(
        "https://timesheetautomate.onrender.com/api/timesheet/create",
        formatted
      );
      alert("✅ TimeSheet Saved Successfully!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save timesheet!");
    }
  };

  const addOtherTask = () => {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        task: "Others",
        type: "others",
        customName: "",
        hours: "",
        description: "",
      },
    ]);
  };

  const removeOtherTask = (id) =>
    setTasks((prev) => prev.filter((task) => task.id !== id));

  const handleEdit = () => navigate("/edit");
  const handleProfile = () => navigate("/profile");
  const handleAdminDashboard = () => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    navigate("/admin", { state: { userData } });
  };
  const handleLogout = () => {
    localStorage.clear();
    window.location.reload(true);
    navigate("https://time-sheet-automate-30xgr0hw7-p-sameeras-projects.vercel.app/");
  };

  const getMaxHours = () => {
    if (isOT) return 24;
    if (sheetType === "C shift") return 6;
    return 8;
  };

  return (
    <div className="w-screen h-screen bg-[#0f1a33] p-6 flex flex-col text-white relative overflow-hidden">
      {/* --- Top Right Menu --- */}
      <div className="absolute top-6 right-10 z-50">
        <div
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-10 h-10 rounded-full bg-yellow-400 hover:bg-yellow-500 flex items-center justify-center text-black font-bold text-lg shadow-md transition-all duration-300 cursor-pointer"
        >
          {menuOpen ? "❌" : "👤"}
        </div>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg border border-gray-700 flex flex-col z-50 overflow-hidden">
            <div
              className="px-4 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer"
              onClick={handleProfile}
            >
              Profile
            </div>
            <div
              className="px-4 py-2 text-gray-200 hover:bg-gray-700 cursor-pointer"
              onClick={handleEdit}
            >
              Your Timesheets
            </div>
            {isAdmin && (
              <div
                className="px-4 py-2 text-yellow-400 hover:bg-gray-700 cursor-pointer font-semibold"
                onClick={handleAdminDashboard}
              >
                Admin Dashboard
              </div>
            )}
            <div
              className="px-4 py-2 text-red-400 hover:bg-red-500 hover:text-white cursor-pointer font-semibold"
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        )}
      </div>

      {/* --- Main Card --- */}
      <div className="w-11/12 md:w-4/5 lg:w-3/4 mx-auto bg-[#0f1a33] p-8 rounded-2xl shadow-2xl border border-gray-800 flex flex-col flex-grow overflow-hidden">
        {/* Header Section */}
        <div className="w-full flex flex-wrap items-center justify-between bg-[#0b152b] px-8 py-5 rounded-xl shadow-md relative flex-shrink-0">
          <div className="flex items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-[#1c253b] text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex justify-center items-center">
            <img
              src="/logo.png"
              alt="TIME SHEET"
              className="h-16 w-auto object-contain mx-auto"
            />
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <select
              value={sheetType}
              onChange={(e) => setSheetType(e.target.value)}
              className="bg-[#1c253b] text-white border border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option>A shift</option>
              <option>B shift</option>
              <option>C shift</option>
              <option>General</option>
              <option>LEAVE</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isOT}
                onChange={(e) => setIsOT(e.target.checked)}
                className="w-4 h-4 accent-yellow-400"
              />
              <span className="text-gray-200">OT</span>
            </label>

            <div className="text-yellow-400 font-semibold text-lg">
              Total: <span className="ml-1">{totalHours.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Table / Leave Section */}
        <div className="flex-grow overflow-y-auto min-h-0 mt-4">
          {sheetType === "LEAVE" ? (
            <div className="flex justify-center items-center text-gray-400 italic h-full">
              Day Off — No entries required.
            </div>
          ) : (
            <table className="w-full border border-gray-700 rounded-xl">
              <thead className="bg-gray-800 text-gray-200 text-sm uppercase">
                <tr>
                  <th className="p-3 text-left">Task</th>
                  <th className="p-3 text-left">Hours</th>
                  <th className="p-3 text-left">Description</th>
                </tr>
              </thead>
              <tbody className="bg-gray-900 divide-y divide-gray-700">
                {tasks.map((task, index) => (
                  <tr key={task.id}>
                    <td className="p-3">
                      {task.type === "others" ? (
                        <>
                          <input
                            type="text"
                            value={task.customName}
                            onChange={(e) =>
                              handleChange(index, "customName", e.target.value)
                            }
                            className="bg-gray-900 text-gray-100 border border-gray-700 rounded-lg px-3 py-2 w-40"
                            placeholder="Task name..."
                          />
                          <Button
                            label="Delete"
                            variant="danger"
                            onClick={() => removeOtherTask(task.id)}
                          />
                        </>
                      ) : (
                        <>
                          {task.task}
                          {task.task === "Incidents" && (
                            <select
                              className="ml-2 px-2 py-1 text-sm rounded-md bg-gray-800 border border-gray-700 text-gray-300"
                              value={task.incidentOption || ""}
                              onChange={(e) =>
                                handleChange(
                                  index,
                                  "incidentOption",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">Select</option>
                              <option value="Option 1">Option 1</option>
                              <option value="Option 2">Option 2</option>
                              <option value="Option 3">Option 3</option>
                            </select>
                          )}
                        </>
                      )}
                    </td>

                    <td>
                      <input
                        type="number"
                        value={task.hours}
                        onChange={(e) =>
                          handleChange(index, "hours", e.target.value)
                        }
                        className="w-24 px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
                        min="0"
                        max={getMaxHours()}
                      />
                    </td>

                    <td>
                      <input
                        type="text"
                        value={task.description}
                        onChange={(e) =>
                          handleChange(index, "description", e.target.value)
                        }
                        className="w-full px-3 py-2 rounded-md bg-gray-800 border border-gray-700 text-gray-200"
                        placeholder="Enter task description..."
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between items-center mt-6 flex-shrink-0">
          {sheetType !== "LEAVE" && (
            <Button label="+ Add Other Task" onClick={addOtherTask} variant="primary" />
          )}
          <Button label="Save" onClick={handleSubmit} variant="primary" className="w-32" />
        </div>
      </div>
    </div>
  );
}
