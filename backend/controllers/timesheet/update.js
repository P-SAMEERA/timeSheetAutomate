import apiResponse from "../../middlewares/apiResponse.js";
import TimeSheet from "../../models/timesheet.model.js";

export default async function update(req, res) {
  try {
    const { userId } = req.params;
    const { date, shiftType, isOT, entries, total } = req.body;

    if (!userId || !date || !shiftType) {
      return res
        .status(400)
        .send(new apiResponse(400, "Missing required fields", null));
    }

    const safeEntries = Array.isArray(entries)
      ? entries.map((entry) => ({
          task: entry.task || "",
          description: entry.description || "",
          hours: Number(entry.hours) || 0,
        }))
      : [];

    const updated = await TimeSheet.findOneAndUpdate(
      { userId, date },
      {
        shiftType,
        isOT: Boolean(isOT),
        entries: safeEntries,
        total: Number(total) || 0,
      },
      { new: true, upsert: false }
    );

    if (!updated) {
      return res
        .status(400)
        .send(new apiResponse(400, "Failed to update timesheet", null));
    }

    return res
      .status(200)
      .send(new apiResponse(200, "Timesheet updated successfully", updated));
  } catch (error) {
    console.log("Timesheet update error:", error);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
