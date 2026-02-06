import express from "express";
import {
  getAttendanceList,
  markAttendance,
} from "../controllers/attendance.controller.js";

const router = express.Router();

router.post("/mark", markAttendance);
router.get("/list", getAttendanceList);

export default router;
