import fs from "fs";
import path from "path";
import ExcelJS from "exceljs";
import Timesheet from "../../models/timesheet.model.js";
import User from "../../models/users.model.js";
import apiResponse from "../../middlewares/apiResponse.js";

export default async function download(req, res) {
  try {
    const { id, m, y } = req.params;

    if (!id || !m || !y) {
      return res
        .status(400)
        .send(new apiResponse(400, "Missing required fields", null));
    }
    console.log(id);
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .send(new apiResponse(404, "User not found", null));
    }

    const userId = user.userId;
    const fileName = `Timesheet_${userId}_${m}_${y}.xlsx`;
    const filePath = path.join("exports", fileName);

    if (fs.existsSync(filePath)) {
      return res.download(filePath);
    }

    const allSheets = await Timesheet.find({ userId: id });
    const filteredSheets = allSheets.filter((sheet) => {
      const d = new Date(sheet.date);
      return (
        d.getMonth() + 1 === parseInt(m) && d.getFullYear() === parseInt(y)
      );
    });

    if (filteredSheets.length === 0) {
      return res
        .status(404)
        .send(
          new apiResponse(404, "No timesheet data found for given month", null)
        );
    }

    filteredSheets.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Shift counters
    let morningCount = 0,
      afternoonCount = 0,
      nightCount = 0,
      generalCount = 0,
      leaveCount = 0,
      otCount = 0;

    // Mapping for shift + tasks
    const dayShifts = {};
    const taskMatrix = {};

    filteredSheets.forEach((sheet) => {
      const dateObj = new Date(sheet.date);
      const day = dateObj.getDate();
      const shift = sheet.shiftType;

      // Count shift types
      switch (shift.toUpperCase()) {
        case "A SHIFT":
          morningCount++;
          break;
        case "B SHIFT":
          afternoonCount++;
          break;
        case "C SHIFT":
          nightCount++;
          break;
        case "GENERAL":
          generalCount++;
          break;
        case "LEAVE":
          leaveCount++;
          break;
        case "OT":
          otCount++;
          break;
      }

      dayShifts[day] = shift;

      // Build task matrix (by description)
      sheet.entries.forEach((entry) => {
        if (!entry.description) return;
        if (!taskMatrix[entry.description]) taskMatrix[entry.description] = {};
        taskMatrix[entry.description][day] = entry.hours || 0;
      });
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Timesheet");

    // Header: Name + Month
    const headerRow = sheet.addRow([
      "Name",
      user.userId,
      "",
      "Month",
      `${new Date(y, m - 1).toLocaleString("default", { month: "long" })} ${y}`,
    ]);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "E6E6FA" },
      };
      cell.font = { bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });

    sheet.addRow([]);

    // Shift summary
    sheet.addRow([
      "Morning (A)",
      "Afternoon (B)",
      "Night (C)",
      "General",
      "Leave",
      "OT",
    ]);
    const summaryRow = sheet.addRow([
      morningCount,
      afternoonCount,
      nightCount,
      generalCount,
      leaveCount,
      otCount,
    ]);
    summaryRow.eachCell((c) => (c.alignment = { horizontal: "center" }));

    sheet.addRow([]);

    const daysInMonth = new Date(y, m, 0).getDate();

    // Sundays
    const sundays = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const current = new Date(y, m - 1, d);
      if (current.getDay() === 0) sundays.push(d);
    }

    // Row 1: Shift row
    const shiftRow = sheet.addRow([
      "Shift →",
      ...Array.from({ length: daysInMonth }, (_, i) => dayShifts[i + 1] || ""),
    ]);
    shiftRow.font = { bold: true };

    // Row 2: Date row
    // const dateRow = sheet.addRow([
    //   "Date →",
    //   ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    // ]);
    // dateRow.font = { bold: true };

    // sheet.addRow([]);

    // Table Header
    const headerCells = ["Description", ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    const header = sheet.addRow(headerCells);
    header.font = { bold: true };

    // Fill Data
    Object.keys(taskMatrix).forEach((desc) => {
      const rowData = [desc];
      for (let d = 1; d <= daysInMonth; d++) {
        rowData.push(taskMatrix[desc][d] || "");
      }
      sheet.addRow(rowData);
    });

    // Style adjustments
    sheet.columns.forEach((col, idx) => {
      col.width = idx === 0 ? 25 : 12;
    });

    sheet.eachRow((row, rowNumber) => {
      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };

        const day = colNumber - 1;

        // Gray out Sundays
        if (sundays.includes(day) && rowNumber > 8) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "D3D3D3" },
          };
        }

        // Red out LEAVE
        const shiftType = dayShifts[day]?.toUpperCase();
        if (shiftType === "LEAVE" && rowNumber <= 2 + Object.keys(taskMatrix).length + 6) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "F4CCCC" },
          };
        }
      });
    });

    if (!fs.existsSync("exports")) fs.mkdirSync("exports");

    await workbook.xlsx.writeFile(filePath);
    return res.download(filePath);
  } catch (err) {
    console.error("Error generating Excel:", err);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
