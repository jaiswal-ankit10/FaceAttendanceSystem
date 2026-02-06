import { User } from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-faceDescriptors");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
