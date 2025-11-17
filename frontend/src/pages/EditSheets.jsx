import React, { useEffect, useState } from "react";
import BackButton from "../components/backButton";

const EditSheets = () => {
  const [timesheets, setTimesheets] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState({});
  const [viewMode, setViewMode] = useState("daily");
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    const fetchTimesheet = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setError("User ID not found in localStorage");
          setLoading(false);
          return;
        }

        const res = await fetch(`https://timesheetautomate.onrender.com/api/timesheet/${userId}/all`);
        const data = await res.json();

        if (!data?.payload) {
          setError("Invalid data format received from backend");
          setLoading(false);
          return;
        }

        // Handle multiple days (array)
        const formatted = {};
        if (Array.isArray(data.payload) && data.payload.length > 0) {
          data.payload.forEach((sheet) => {
            formatted[sheet.date] = {
              shiftType: sheet.shiftType || "WORK",
              entries: sheet.entries || [],
              total: sheet.total || 0,
              isOT: sheet.isOT || false,
            };
          });
        } else if (Array.isArray(data.payload) && data.payload.length === 0) {
          setTimesheets({});
          setLoading(false);
          return;
        } else {
          const sheet = data.payload;
          formatted[sheet.date] = {
            shiftType: sheet.type || "WORK",
            entries: sheet.entries || [],
            total: sheet.total || 0,
            isOT: sheet.isOT || false,
          };
        }

        setTimesheets(formatted);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch timesheet data");
        setLoading(false);
      }
    };

    fetchTimesheet();
  }, []);

  // Toggle expand/collapse
  const toggleExpand = (date) => {
    if (expandedDate === date) {
      setExpandedDate(null);
      setEditMode(false);
    } else {
      setExpandedDate(date);
      setEditableData(timesheets[date]);
      setEditMode(false);
    }
  };

  // Handle input changes
  const handleInputChange = (date, index, field, value) => {
    const updated = { ...editableData };
    updated.entries[index][field] = value;
    updated.total = updated.entries.reduce(
      (sum, entry) => sum + parseFloat(entry.hours || 0),
      0
    );
    setEditableData(updated);
  };

  // Save updates
  const handleSave = (date) => {
    setTimesheets((prev) => ({
      ...prev,
      [date]: editableData,
    }));
    setEditMode(false);
    alert(`✅ Timesheet for ${date} saved successfully!`);
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  // Group by month
  const groupByMonth = () => {
    const grouped = {};
    Object.keys(timesheets).forEach((date) => {
      const d = new Date(date);
      const monthYear = d.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push({ date, ...timesheets[date] });
    });
    return grouped;
  };

  const groupedData = groupByMonth();

  // Monthly view data prep
  const monthlyData = {};
  Object.entries(timesheets).forEach(([date, data]) => {
    const d = new Date(date);
    const monthKey = d.toLocaleString("default", {
      month: "long",
      year: "numeric",
    });
    if (!monthlyData[monthKey]) monthlyData[monthKey] = [];
    data.entries.forEach((entry) => {
      monthlyData[monthKey].push({
        date: d.getDate(),
        task: entry.task,
        description: entry.description,
        hours: entry.hours,
        fullDate: d,
      });
    });
  });

  const toggleMonth = (monthKey) => {
    setExpandedMonth(expandedMonth === monthKey ? null : monthKey);
  };

  // Helper for formatting hours
  const formatHours = (val) => {
    if (val === 0 || val === null || val === undefined || val === "") return "";
    const formatted = parseFloat(val);
    return Number.isInteger(formatted)
      ? formatted.toString()
      : formatted.toFixed(1).replace(/\.0$/, "");
  };

  const isEmpty = Object.keys(timesheets).length === 0;

  return (
    <div className="w-screen h-screen bg-[#0f1a33] p-6 flex flex-col overflow-hidden">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <BackButton />
        </div>
        <div className="flex items-center justify-center flex-1">
          <img src="/logo.png" alt="TIME SHEET" className="w-14 h-14 mr-3" />
          <h1 className="text-3xl font-bold text-yellow-500">Time - Sheets</h1>
        </div>
        <div className="flex-1" />
      </div>

      {/* Conditional body */}
      {error ? (
        <div className="flex-1 flex items-center justify-center text-red-400 text-lg font-semibold">
          {error}
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
          Loading timesheet data...
        </div>
      ) : isEmpty ? (
        <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
          No time sheets filled yet.
        </div>
      ) : (
        <>
          {/* View Toggle */}
          <div className="flex justify-center gap-6 mb-6">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                viewMode === "daily"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode("monthly")}
              className={`px-6 py-2 rounded-lg font-semibold ${
                viewMode === "monthly"
                  ? "bg-yellow-400 text-black shadow-md"
                  : "bg-gray-700 text-gray-300"
              }`}
            >
              Monthly
            </button>
          </div>

          {/* DAILY VIEW */}
          {viewMode === "daily" && (
            <div className="flex flex-col gap-8 overflow-y-auto p-2">
              {Object.keys(groupedData).map((monthYear) => (
                <div key={monthYear}>
                  <h2 className="text-center text-yellow-400 mb-3">
                    {monthYear.toUpperCase()}
                  </h2>

                  {groupedData[monthYear]
                    .sort((a, b) => new Date(a.date) - new Date(b.date))
                    .map(({ date, shiftType, total, isOT, entries }) => (
                      <div
                        key={date}
                        className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-yellow-400"
                      >
                        <div
                          className="flex justify-between cursor-pointer"
                          onClick={() => toggleExpand(date)}
                        >
                          <p className="text-gray-300">
                            <span className="text-yellow-400 font-semibold">
                              {shiftType}
                            </span>
                            {isOT && (
                              <span className="text-green-400 ml-3 font-semibold">
                                OT
                              </span>
                            )}
                          </p>
                          <h2 className="text-lg text-gray-200">
                            {formatDate(date)} —{" "}
                            <span className="text-yellow-400">
                              {formatHours(total)} hrs
                            </span>
                          </h2>
                        </div>

                        {expandedDate === date && (
                          <div className="mt-4">
                            {/* SHIFT TYPE EDITOR */}
<div className="mb-3">
  <label className="text-gray-300 mr-3 font-medium">Shift Type:</label>
  <select
    disabled={!editMode}
    value={editableData.shiftType}
    onChange={(e) => {
      const updated = { ...editableData };
      updated.shiftType = e.target.value;
      setEditableData(updated);
    }}
    className={`px-3 py-1 rounded-md bg-gray-800 border ${
      editMode ? "border-yellow-400" : "border-gray-700"
    } text-gray-200`}
  >
    <option value="WORK">WORK</option>
    <option value="LEAVE">LEAVE</option>
    <option value="WFH">WFH</option>
    <option value="HOLIDAY">HOLIDAY</option>
    <option value="OT">OT</option>
  </select>
</div>

                            <table className="w-full border border-gray-700 rounded-lg overflow-hidden">
                              <thead className="bg-gray-800 text-gray-200">
                                <tr>
                                  <th className="p-2 text-left">Task</th>
                                  <th className="p-2 text-left">Hours</th>
                                  <th className="p-2 text-left">Description</th>
                                </tr>
                              </thead>
                              <tbody className="bg-gray-900 divide-y divide-gray-700">
                                {(editableData.entries || entries || []).map(
                                  (entry, idx) => (
                                    <tr key={idx}>
                                      <td className="p-2">
                                        <input
                                          type="text"
                                          value={entry.task}
                                          disabled={!editMode}
                                          onChange={(e) =>
                                            handleInputChange(
                                              date,
                                              idx,
                                              "task",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full bg-transparent border ${
                                            editMode
                                              ? "border-yellow-400"
                                              : "border-gray-700"
                                          } rounded-md px-2 py-1 text-gray-200`}
                                        />
                                      </td>
                                      <td className="p-2 text-center">
                                        {editMode ? (
                                          <input
                                            type="number"
                                            value={entry.hours}
                                            onChange={(e) =>
                                              handleInputChange(
                                                date,
                                                idx,
                                                "hours",
                                                e.target.value
                                              )
                                            }
                                            className="w-20 bg-transparent border border-yellow-400 rounded-md px-2 py-1 text-gray-200"
                                          />
                                        ) : (
                                          formatHours(entry.hours)
                                        )}
                                      </td>
                                      <td className="p-2">
                                        <input
                                          type="text"
                                          value={entry.description}
                                          disabled={!editMode}
                                          onChange={(e) =>
                                            handleInputChange(
                                              date,
                                              idx,
                                              "description",
                                              e.target.value
                                            )
                                          }
                                          className={`w-full bg-transparent border ${
                                            editMode
                                              ? "border-yellow-400"
                                              : "border-gray-700"
                                          } rounded-md px-2 py-1 text-gray-200`}
                                        />
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                            {/* ADD NEW TASK ROW */}
<button
  onClick={() => {
    if (!editMode) return;
    const updated = { ...editableData };
    updated.entries = [
      ...updated.entries,
      { task: "", hours: "", description: "" },
    ];
    setEditableData(updated);
  }}
  className={`mt-3 px-4 py-2 rounded-lg font-semibold ${
    editMode
      ? "bg-blue-500 text-white"
      : "bg-gray-700 text-gray-500 cursor-not-allowed"
  }`}
  disabled={!editMode}
>
  + Add Row
</button>


                            <div className="flex justify-end gap-4 mt-4">
                              <button
                                onClick={() => setEditMode(true)}
                                disabled={editMode}
                                className={`px-4 py-2 rounded-lg font-semibold ${
                                  editMode
                                    ? "bg-gray-600 text-gray-400"
                                    : "bg-yellow-400 text-black"
                                }`}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleSave(date)}
                                disabled={!editMode}
                                className={`px-4 py-2 rounded-lg font-semibold ${
                                  editMode
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-600 text-gray-400"
                                }`}
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              ))}
            </div>
          )}

          {/* MONTHLY VIEW (EXCEL STYLE) */}
          {viewMode === "monthly" && (
            <div className="overflow-y-auto p-2 flex flex-col gap-6">
              {Object.entries(monthlyData).map(([monthKey, entries]) => {
                // Get month and year from first entry’s date
                const firstEntryDate = entries[0]?.fullDate || new Date();
                const year = firstEntryDate.getFullYear();
                const month = firstEntryDate.getMonth();
                const daysInMonth = new Date(year, month + 1, 0).getDate();

                const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

                const taskMap = {};
                entries.forEach((e) => {
                  const key = e.task || e.description || "Unnamed Task";
                  if (!taskMap[key]) taskMap[key] = {};
                  taskMap[key][e.date] =
                    (taskMap[key][e.date] || 0) + parseFloat(e.hours || 0);
                });

                return (
                  <div
                    key={monthKey}
                    className="bg-gray-900 border border-gray-700 rounded-xl p-4 hover:border-yellow-400"
                  >
                    <div
                      className="flex justify-between items-center cursor-pointer"
                      onClick={() => toggleMonth(monthKey)}
                    >
                      <h2 className="text-xl font-semibold text-yellow-400">
                        {monthKey.toUpperCase()}
                      </h2>
                      <span className="text-gray-400">
                        {expandedMonth === monthKey ? "▲" : "▼"}
                      </span>
                    </div>

                    {expandedMonth === monthKey && (
                      <div className="mt-4 overflow-x-auto">
                        
                        <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                          <thead className="bg-gray-800 text-yellow-400 text-sm uppercase">
                            <tr>
                              <th className="p-2 text-left w-48">Description</th>
                              {days.map((day) => (
                                <th
                                  key={day}
                                  className="p-2 text-center w-10 border-l border-gray-700"
                                >
                                  {day}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-gray-900 divide-y divide-gray-700">
                            {Object.entries(taskMap).map(([task, logs]) => (
                              <tr key={task} className="hover:bg-gray-800">
                                <td className="p-2 text-gray-300 font-medium">
                                  {task}
                                </td>
                                {days.map((day) => (
                                  <td
                                    key={day}
                                    className="p-2 text-center border-l border-gray-700 text-gray-300"
                                  >
                                    {logs[day]
                                      ? formatHours(logs[day])
                                      : ""}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditSheets;
