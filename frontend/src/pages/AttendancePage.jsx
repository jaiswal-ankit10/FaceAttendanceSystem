import { useState } from "react";
import axios from "axios";
import WebcamCapture from "../components/WebCamCapture";
import { Check, Clock, Power } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_INSTANCE}/attendance/mark`;

function AttendancePage() {
  const now = new Date();
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

      toast.success("Attendance marked successfully");
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || "Face not recognized",
      });

      toast.error("Attendance failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <ToastContainer />
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="AJWA Projects" className="h-10" />
        </div>

        <div className="flex items-center gap-4">
          <button className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
            <Power size={18} />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            Face Recognition Attendance
          </h1>
          <p className="text-gray-500 mt-2">
            Please look into the camera to mark your attendance.
          </p>
        </div>

        {/* Attendance Card */}
        <div className="bg-white min-h-[60vh] rounded-2xl shadow-lg p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Camera Section */}
          <div className="relative bg-gray-50 rounded-xl p-2 flex flex-col items-center">
            <div className="relative  rounded-xl overflow-hidden">
              <WebcamCapture
                onCapture={handleCapture}
                cameraEnabled={cameraEnabled}
                setCameraEnabled={setCameraEnabled}
              />
            </div>
          </div>

          {/* Status Section */}
          {result && result.success && (
            <div className="flex flex-col justify-between">
              {/* Time */}
              <div className="flex justify-end">
                <div className="flex items-center gap-2 border border-gray-200 px-4 py-2 rounded-lg text-gray-700">
                  <Clock size={18} /> {result?.checkInTime}
                </div>
              </div>

              {/* Success Card */}
              <div className="mt-6 bg-green-50  rounded-xl p-5">
                <div className="flex items-center gap-3 text-green-700">
                  <div className="w-10 h-10 rounded-full bg-green-400 flex items-center justify-center text-white text-xl">
                    <Check />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">Attendance Marked</p>
                    <p className="text-sm text-green-600">
                      {result?.checkInTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="mt-6 bg-white  rounded-xl p-5 flex items-center gap-4 shadow-sm">
                <img
                  src="/avatar.png"
                  alt="Employee"
                  className="w-14 h-14 rounded-full object-cover"
                />

                <div>
                  <p className="font-semibold text-gray-800">{result.name}</p>
                  <p className="text-sm text-gray-500">
                    Employee ID: {result.employeeId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Branch: {result?.branch}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AttendancePage;
