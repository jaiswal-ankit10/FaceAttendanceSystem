import { prisma } from "../config/prisma.js";
import matchFace from "../services/faceMatcher.js";
import { formatDate, formatTime } from "../utils/dateFormatter.js";

export const markAttendance = async (req, res) => {
  const { descriptor } = req.body;

  const users = await prisma.user.findMany({
    include: { faceDescriptors: true },
  });

  const match = matchFace(descriptor, users);
  if (!match) {
    return res.status(401).json({ message: "Face not recognized" });
  }

  const today = new Date().toISOString().split("T")[0];

  const already = await prisma.attendance.findFirst({
    where: {
      userId: match.user.id,
      date: new Date(today),
    },
  });

  if (already) {
    return res.status(409).json({ message: "Attendance already marked" });
  }

  const attendance = await prisma.attendance.create({
    data: {
      userId: match.user.id,
      date: new Date(today),
      checkInTime: new Date(),
      confidence: match.distance,
    },
  });

  res.json({
    name: match.user.name,
    employeeId: match.user.empId,
    date: formatDate(attendance.date),
    checkInTime: formatTime(attendance.checkInTime),
  });
};

export const getAttendanceList = async (req, res) => {
  const data = await prisma.attendance.findMany({
    include: {
      user: { select: { name: true, empId: true } },
    },
    orderBy: { date: "desc" },
  });

  res.json(data);
};
