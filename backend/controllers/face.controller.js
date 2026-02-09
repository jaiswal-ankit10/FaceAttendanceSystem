import { prisma } from "../config/prisma.js";
import matchFace from "../services/faceMatcher.js";

export const registerFace = async (req, res) => {
  const { name, empId, descriptors } = req.body;

  if (!name || !empId || !descriptors?.length) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const empExists = await prisma.user.findUnique({
    where: { empId },
  });

  if (empExists) {
    return res.status(409).json({ message: "Employee ID already exists" });
  }

  const users = await prisma.user.findMany({
    include: { faceDescriptors: true },
  });

  for (const d of descriptors) {
    const match = matchFace(d, users);
    if (match) {
      return res
        .status(409)
        .json({ message: "This face is already registered" });
    }
  }

  const user = await prisma.user.create({
    data: {
      name,
      empId,
      faceDescriptors: {
        create: descriptors.map((d) => ({
          descriptor: d,
        })),
      },
    },
  });

  res.json({ message: "Face registered successfully", userId: user.id });
};
