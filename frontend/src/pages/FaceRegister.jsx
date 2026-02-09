import { useEffect, useRef, useState } from "react";
import axios from "axios";
import WebCamCapture from "../components/WebCamCapture";
import { Link } from "react-router-dom";

const API = `${import.meta.env.VITE_API_INSTANCE}/face/register`;

export default function FaceRegister() {
  const poseLock = useRef();

  const POSES = ["FRONT", "RIGHT", "LEFT"];

  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  // const [descriptors, setDescriptors] = useState([]);
  const [captures, setCaptures] = useState([]);
  const [capturedPoses, setCapturedPoses] = useState([]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (captures.length === POSES.length) {
      setCameraEnabled(false);
    }
  }, [captures.length]);
  const handleCapture = (descriptor, pose, preview) => {
    if (captures.length >= POSES.length) return;

    if (!pose) return;
    if (poseLock.current) return;
    if (captures.some((c) => c.pose === pose)) return;
    // if (capturedPoses.includes(pose)) return;
    poseLock.current = true;

    setCaptures((prev) => [...prev, { pose, descriptor, preview }]);
    setCapturedPoses((prev) => [...prev, pose]);

    setCurrentPoseIndex((prev) => {
      const next = prev + 1;
      return next < POSES.length ? next : prev;
    });

    setTimeout(() => {
      poseLock.current = false;
    }, 1200);
  };

  const submit = async () => {
    if (captures.length < POSES.length) {
      setError("Capture all face directions (FRONT, LEFT, RIGHT)");
      return;
    }

    try {
      setError("");
      setSuccess("");

      await axios.post(API, {
        name,
        empId,
        descriptors: captures.map((c) => c.descriptor),
      });

      setSuccess("Face registered successfully");
      setCaptures([]);
      setCapturedPoses([]);
      setCurrentPoseIndex(0);
      setCameraEnabled(false);
    } catch (err) {
      setSuccess("");
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-4">
          Face Registration
        </h2>

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

        {error && (
          <div className="my-3 bg-red-100 text-red-700 border border-red-300 rounded-lg p-2 text-sm text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="my-3 bg-green-100 text-green-700 border border-green-300 rounded-lg p-2 text-sm text-center">
            {success}
          </div>
        )}

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

        {captures.length > 0 && (
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {captures.map((c) => (
              <div key={c.pose}>
                <img
                  src={c.preview}
                  alt={c.pose}
                  className="w-20 h-20 object-cover rounded "
                />
                <p className="text-xs mt-1 font-medium">{c.pose}</p>
              </div>
            ))}
          </div>
        )}

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
