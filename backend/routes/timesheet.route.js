import express from "express";
import update from "../controllers/timesheet/update.js";
import create from "../controllers/timesheet/create.js";
import read from "../controllers/timesheet/read.js";
import downloadTimesheet from "../controllers/timesheet/timeSheetDownload.js";
const router = express.Router();

router.post("/create",create);
router.put("/update",update);
router.get("/:id/all",read);
router.get("/download/:id/:m/:y", downloadTimesheet);
export default router;
