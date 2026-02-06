import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";

await connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"],
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded());

//routes
import healthCheckRoute from "./routes/healthcheck.routes.js";
import faceRoute from "./routes/face.routes.js";
import attendanceRoute from "./routes/attendance.routes.js";
import userRoute from "./routes/auth.routes.js";

app.use("/", healthCheckRoute);
app.use("/api/v1/face", faceRoute);
app.use("/api/v1/attendance", attendanceRoute);
app.use("/api/v1/users", userRoute);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
