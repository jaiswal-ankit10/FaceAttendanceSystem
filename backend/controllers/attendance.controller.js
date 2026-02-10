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

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: match.user.id,
      date: new Date(today),
    },
  });

  if (!attendance) {
    const checkIn = await prisma.attendance.create({
      data: {
        userId: match.user.id,
        date: new Date(today),
        checkInTime: new Date(),
        confidence: match.distance,
      },
    });

    return res.json({
      type: "CHECK_IN",
      message: "Check-in successful",
      name: match.user.name,
      employeeId: match.user.empId,
      date: formatDate(checkIn.date),
      checkInTime: formatTime(checkIn.checkInTime),
    });
  }

  if (!attendance.checkOutTime) {
    const checkOut = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: new Date(),
      },
    });

    return res.json({
      type: "CHECK_OUT",
      message: "Check-out successful",
      name: match.user.name,
      employeeId: match.user.empId,
      date: formatDate(checkOut.date),
      checkInTime: formatTime(checkOut.checkInTime),
      checkOutTime: formatTime(checkOut.checkOutTime),
    });
  }

  return res.status(409).json({
    message: "Attendance already completed for today",
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
