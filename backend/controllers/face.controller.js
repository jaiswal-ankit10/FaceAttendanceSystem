import { User } from "../models/user.model.js";
import matchFace from "../services/faceMatcher.js";

export const registerFace = async (req, res) => {
  try {
    const { name, empId, descriptors } = req.body;

    if (!name || !empId || !descriptors?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const empExists = await User.findOne({ empId });
    if (empExists) {
      return res
        .status(409)
        .json({ message: "Employee ID already registered" });
    }

    const users = await User.find({});

    for (const descriptor of descriptors) {
      const match = matchFace(descriptor, users);
      if (match) {
        return res.status(409).json({
          message: "This face is already registered",
        });
      }
    }

    const user = new User({
      name,
      empId,
      faceDescriptors: descriptors.map((d) => ({ descriptor: d })),
    });

    await user.save();

    res.status(201).json({
      message: "Face registered successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
