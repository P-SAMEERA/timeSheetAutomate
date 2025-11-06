import React, { useState, useEffect } from "react";
import axios from 'axios';
const UserModal = ({ user, onClose, allTimeSheets, onRefresh }) => {   // ✅ added `onRefresh`
  const [timesheets, setTimesheets] = useState({});
  const [groupedByMonth, setGroupedByMonth] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(null);
  const BASE_URL = 'http://localhost:5000';
  // Parse and group when admin opens modal
  useEffect(() => {
    if (!allTimeSheets || allTimeSheets.length === 0) return;

    const formatted = {};
    allTimeSheets.forEach((sheet) => {
      formatted[sheet.date] = {
        shiftType: sheet.shiftType || "WORK",
        entries: sheet.entries || [],
        total: sheet.total || 0,
      };
    });
    setTimesheets(formatted);

    // Group by month-year
    const grouped = {};
    Object.keys(formatted).forEach((date) => {
      const d = new Date(date);
      const monthYear = d.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[monthYear]) grouped[monthYear] = [];
      grouped[monthYear].push({ date, ...formatted[date] });
    });

    setGroupedByMonth(grouped);
  }, [allTimeSheets]);

  // Prepare monthly data
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
      });
    });
  });

  // Helper
  const formatHours = (val) => {
    if (val === 0 || val === null || val === undefined || val === "") return "";
    const formatted = parseFloat(val);
    return Number.isInteger(formatted)
      ? formatted.toString()
      : formatted.toFixed(1).replace(/\.0$/, "");
  };

  // Download handler
  const handleDownload = async () => {
  if (!selectedMonth || !user?._id) {
    console.error("Missing selectedMonth or user ID");
    return;
  }

  try {
    // Parse month and year from selectedMonth (e.g., "October 2025")
    const [monthName, yearStr] = selectedMonth.split(" ");
    const year = parseInt(yearStr, 10);

    // Convert month name → numeric month (1–12)
    const month = new Date(`${monthName} 1, ${year}`).getMonth() + 1;

    // Make request to backend for file (responseType must be 'blob' for file download)
    const response = await axios.get(
      `${BASE_URL}/api/timesheet/download/${user._id}/${month}/${year}`,
      {
        responseType: "blob",
      }
    );

    // Create a downloadable link for the blob
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);

    // Try to detect filename from headers or use a default
    const contentDisposition = response.headers["content-disposition"];
    let filename = `timesheet_${user.userId}_${monthName}_${year}.xlsx`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match) filename = match[1];
    }

    // Create temporary <a> tag to download file
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);

    // ✅ NEW: trigger refresh after download (instant update)
    if (typeof onRefresh === "function") {
      await onRefresh();
    }

  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file. Check console for details.");
  }
};

  // ✅ Function to calculate days in selected month dynamically
  const getDaysArray = (monthKey) => {
    const [monthName, yearStr] = monthKey.split(" ");
    const year = parseInt(yearStr, 10);
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-70 text-gray-200 z-50 p-4">
      <div className="bg-gray-900 w-full max-w-6xl rounded-lg shadow-lg p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
          <h2 className="text-xl font-semibold text-yellow-400">
            {user?.userId} — Monthly Time Sheets
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-400 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* If no month selected, show month cards */}
        {!selectedMonth ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Object.keys(groupedByMonth).length === 0 ? (
              <p className="col-span-full text-center text-gray-400">
                No time sheets available.
              </p>
            ) : (
              Object.keys(groupedByMonth).map((monthKey) => (
                <div
                  key={monthKey}
                  onClick={() => setSelectedMonth(monthKey)}
                  className="bg-gray-800 hover:bg-gray-700 cursor-pointer rounded-lg p-4 text-center border border-gray-600 hover:border-yellow-400 transition-all"
                >
                  <h3 className="text-lg font-semibold text-yellow-300">
                    {monthKey}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {groupedByMonth[monthKey].length} days logged
                  </p>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {/* Monthly Grid View */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-yellow-400">
                {selectedMonth}
              </h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDownload}
                  className="px-4 py-1 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded"
                >
                  DOWNLOAD
                </button>
                <button
                  onClick={() => setSelectedMonth(null)}
                  className="text-gray-400 hover:text-yellow-300"
                >
                  ← Back
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-700 rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-yellow-400 text-sm uppercase">
                  <tr>
                    <th className="p-2 text-left w-64">Description</th>
                    {getDaysArray(selectedMonth).map((day) => (
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
                  {(() => {
                    const entries = monthlyData[selectedMonth] || [];
                    const taskMap = {};

                    entries.forEach((e) => {
                      const key = e.task || e.description || "Unnamed Task";
                      if (!taskMap[key]) taskMap[key] = {};
                      taskMap[key][e.date] =
                        (taskMap[key][e.date] || 0) + parseFloat(e.hours || 0);
                    });

                    return Object.entries(taskMap).map(([task, logs]) => (
                      <tr key={task} className="hover:bg-gray-800">
                        <td className="p-2 text-gray-300 font-medium">
                          {task}
                        </td>
                        {getDaysArray(selectedMonth).map((day) => (
                          <td
                            key={day}
                            className="p-2 text-center border-l border-gray-700 text-gray-300"
                          >
                            {logs[day] ? formatHours(logs[day]) : ""}
                          </td>
                        ))}
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserModal;
