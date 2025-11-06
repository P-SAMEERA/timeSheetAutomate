import express from "express";
import updateUser from "../controllers/user/update.js";
import createUser from "../controllers/user/create.js";
import readAllUser from "../controllers/user/readAll.js";
import readOneUser from "../controllers/user/readOne.js";
import deleteUser from "../controllers/user/delete.js";
import readOneUserForProfile from "../controllers/user/readForProfile.js";
const router = express.Router();

router.post("/:id/add", createUser);
router.put("/:id/update", updateUser);
router.get("/:id/all", readAllUser);
router.get("/:id/one",readOneUser);
router.post("/one",readOneUserForProfile);
router.delete("/:id/delete",deleteUser);


export default router;
