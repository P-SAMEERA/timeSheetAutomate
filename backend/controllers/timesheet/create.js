import apiResponse from "../../middlewares/apiResponse.js";
import Timesheet from "../../models/timesheet.model.js";

export default async function create(req, res) {
  try {
    const { date, shiftType, isOT, entries = [], total, userId } = req.body;

    // ✅ Validate inputs
    if (!date || !shiftType || !userId) {
      return res
        .status(400)
        .send(new apiResponse(400, "Missing required fields", null));
    }

    const safeEntries = shiftType === "LEAVE" ? [] : entries;
    const safeTotal = shiftType === "LEAVE" ? 0 : total;
    const safeOT = shiftType === "LEAVE" ? false : isOT || false;

    // ✅ Check if record already exists for the same user and date
    const existingSheet = await Timesheet.findOne({ userId, date });

    let saved;
    if (existingSheet) {
      // ✅ Update the existing document
      existingSheet.shiftType = shiftType;
      existingSheet.isOT = safeOT;
      existingSheet.entries = safeEntries;
      existingSheet.total = safeTotal;

      saved = await existingSheet.save();
    } else {
      // ✅ Create a new document
      saved = await Timesheet.create({
        date,
        shiftType,
        isOT: safeOT,
        entries: safeEntries,
        total: safeTotal,
        userId,
      });
    }

    if (!saved) {
      return res
        .status(400)
        .send(new apiResponse(400, "Failed to save the timesheet", null));
    }

    return res.status(200).send(new apiResponse(200, "Timesheet saved", saved));
  } catch (error) {
    console.error("Error creating timesheet:", error);
    return res
      .status(500)
      .send(new apiResponse(500, "Internal Server Error", null));
  }
}
