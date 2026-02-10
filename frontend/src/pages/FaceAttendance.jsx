import { useState } from "react";
import axios from "axios";
import WebcamCapture from "../components/WebCamCapture";
import { Link } from "react-router-dom";

const API_URL = `${import.meta.env.VITE_API_INSTANCE}/attendance/mark`;

export default function FaceAttendance() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const handleCapture = async (descriptor) => {
    try {
      setLoading(true);
      setStatus("Processing face...");
      setResult(null);

      const res = await axios.post(API_URL, { descriptor });

      setResult({
        success: true,
        name: res.data.name,
        employeeId: res.data.employeeId,
        confidence: res.data.confidence,
        date: res.data.date,
        checkInTime: res.data.checkInTime,
        checkOutTime: res.data.checkOutTime,
      });

      setStatus("Attendance marked successfully");
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Face not recognized",
      });

      setStatus("Attendance failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="fixed z-10 bg-white w-full flex justify-between items-center px-6 py-4 ">
        <div>Logo</div>
        <ul>
          <li className="bg-green-300 p-2 rounded cursor-pointer">
            <Link to={"/attendance-list"}>Attendance List</Link>
          </li>
        </ul>
      </nav>
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-center mb-6">
            Face Attendance
          </h2>

          <div className="flex justify-center">
            <WebcamCapture
              onCapture={handleCapture}
              cameraEnabled={cameraEnabled}
              setCameraEnabled={setCameraEnabled}
            />
          </div>

          {loading && (
            <p className="text-center text-sm text-gray-500 mt-4">
              ⏳ Please wait...
            </p>
          )}

          {result && result.success && (
            <div className="mt-4 bg-green-100 text-green-700 rounded-lg p-3 text-sm">
              <p>
                <strong>Name:</strong> {result.name}
              </p>
              <p>
                <strong>EmployeeId:</strong> {result.employeeId}
              </p>
              <p>
                <strong>Date:</strong> {result.date}
              </p>
              <p>
                <strong>Check In Time:</strong> {result.checkInTime}
              </p>
              <p>
                <strong>Check Out Time:</strong> {result.checkOutTime}
              </p>
            </div>
          )}

          {result && !result.success && (
            <div className="mt-4 bg-red-100 text-red-700 rounded-lg p-3 text-sm">
              {result.message}
            </div>
          )}

          {status && (
            <p className="text-center text-sm text-gray-600 mt-4">{status}</p>
          )}
          <p className="pt-3 text-center text-sm">
            New Employee?{" "}
            <Link to="/register" className="text-blue-600 underline ">
              Go to register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
