import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
import matchFace from "../services/faceMatcher.js";
import { formatDate, formatTime } from "../utils/dateFormatter.js";

export const markAttendance = async (req, res) => {
  try {
    const { descriptor } = req.body;
    if (!descriptor) {
      return res.status(400).json({ message: "Face descriptor required" });
    }

    const users = await User.find({ isActive: true });

    const match = matchFace(descriptor, users);
    if (!match) {
      return res.status(401).json({ message: "Face not recognized" });
    }

    const today = new Date().toISOString().split("T")[0];

    const alreadyMarked = await Attendance.findOne({
      user: match.user._id,
      date: today,
    });

    if (alreadyMarked) {
      return res.status(409).json({ message: "Attendance already marked" });
    }

    const attendance = new Attendance({
      user: match.user._id,
      date: today,
      checkInTime: new Date(),
      confidence: match.distance,
    });

    await attendance.save();

    res.status(201).json({
      message: "Attendance marked",
      name: match.user.name,
      employeeId: match.user.empId,
      confidence: match.distance,
      date: formatDate(attendance.date),
      checkInTime: formatTime(attendance.checkInTime),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttendanceList = async (req, res) => {
  try {
    const records = await Attendance.find()
      .populate("user", "name empId")
      .sort({ createdAt: -1 });

    const response = records.map((item) => ({
      name: item.user?.name,
      employeeId: item.user?.empId,
      date: formatDate(item.date),
      checkInTime: formatTime(item.checkInTime),
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch attendance list" });
  }
};
