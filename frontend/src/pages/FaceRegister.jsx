import { useState } from "react";
import axios from "axios";
import WebCamCapture from "../components/WebCamCapture";
import { Link } from "react-router-dom";

const API = `${import.meta.env.VITE_API_INSTANCE}/face/register`;

export default function FaceRegister() {
  const POSES = ["FRONT", "LEFT", "RIGHT"];

  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [descriptors, setDescriptors] = useState([]);
  const [capturedPoses, setCapturedPoses] = useState([]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const handleCapture = (descriptor, pose) => {
    if (capturedPoses.includes(pose)) return;

    setDescriptors((prev) => [...prev, descriptor]);
    setCapturedPoses((prev) => [...prev, pose]);
    setCurrentPoseIndex((prev) => prev + 1);
  };

  const submit = async () => {
    if (descriptors.length < 3) {
      alert("Capture all face directions");
      return;
    }

    await axios.post(API, {
      name,
      empId,
      descriptors,
    });

    alert("Face registered successfully!");
    setDescriptors([]);
    setCapturedPoses([]);
    setCurrentPoseIndex(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Face Registration
        </h2>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm mb-4 text-center">
          <p className="font-medium">Capture Instruction</p>
          <p>
            Please look <strong>{POSES[currentPoseIndex] ?? "DONE"}</strong> and
            capture
          </p>
        </div>

        <div className="space-y-4">
          <input
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Employee ID"
            value={empId}
            onChange={(e) => setEmpId(e.target.value)}
          />
        </div>

        <div className="mt-5 flex justify-center">
          {currentPoseIndex < POSES.length && (
            <WebCamCapture
              key={POSES[currentPoseIndex]}
              onCapture={handleCapture}
              requiredPose={POSES[currentPoseIndex]}
              cameraEnabled={cameraEnabled}
              setCameraEnabled={setCameraEnabled}
            />
          )}
        </div>

        <p className="text-center text-sm text-gray-600 mt-4">
          Captured:{" "}
          <span className="font-medium">
            {capturedPoses.join(", ") || "None"}
          </span>
        </p>

        <button
          onClick={submit}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Register Face
        </button>

        <p className="pt-3 text-center text-sm">
          Already a employee?{" "}
          <Link to="/attendance" className="text-blue-600 underline ">
            Go to attendance
          </Link>
        </p>
      </div>
    </div>
  );
}
