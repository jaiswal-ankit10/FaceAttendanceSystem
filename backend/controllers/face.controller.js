import { User } from "../models/user.model.js";

export const registerFace = async (req, res) => {
  try {
    const { name, empId, descriptors } = req.body;

    if (!name || !empId || !descriptors?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await User.findOne({ empId });

    if (!user) {
      user = new User({
        name,
        empId,
        faceDescriptors: [],
      });
    }

    descriptors.forEach((d) => {
      if (user.faceDescriptors.length < 5) {
        user.faceDescriptors.push({ descriptor: d });
      }
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
