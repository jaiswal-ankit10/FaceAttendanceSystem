import express from "express";
import { registerFace } from "../controllers/face.controller.js";
const router = express.Router();

router.post("/register", registerFace);

export default router;
