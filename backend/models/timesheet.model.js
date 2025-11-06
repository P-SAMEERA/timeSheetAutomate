import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  task: { type: String, required: false },
  description: { type: String, required: false },
  hours: { type: Number, required: false },
});

const timeSheetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  entries: [entrySchema],
 shiftType: {
  type: String,
  enum: ["A shift", "B shift", "C shift", "General", "LEAVE", "OT"],
  required: true
}
,
  total: { type: Number, required: true },
});

export default mongoose.model("TimeSheet", timeSheetSchema);
