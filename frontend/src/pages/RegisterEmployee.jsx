import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import WebCamCapture from "../components/WebCamCapture";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Camera, Check } from "lucide-react";

const API = `${import.meta.env.VITE_API_INSTANCE}/face/register`;

const POSES = ["FRONT", "RIGHT", "LEFT"];
const LIVE_POSES = ["FRONT", "RIGHT", "LEFT"];

const showErrorToastOnce = (message) => {
  toast.error(message, {
    toastId: message,
  });
};

export default function RegisterEmployee() {
  const poseLock = useRef(false);

  const [useWebcam, setUseWebcam] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);

  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");

  const [captures, setCaptures] = useState([]);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);

  useEffect(() => {
    if (captures.length === POSES.length) {
      setCameraEnabled(false);
    }
  }, [captures]);

  const handleCapture = (descriptor, pose, preview) => {
    if (!pose) return;
    if (poseLock.current) return;
    if (captures.some((c) => c.pose === pose)) return;

    poseLock.current = true;

    setCaptures((prev) => [
      ...prev,
      {
        pose,
        descriptor,
        preview,
        source: "webcam",
      },
    ]);

    setCurrentPoseIndex((prev) => {
      const next = prev + 1;
      return next < POSES.length ? next : prev;
    });

    setTimeout(() => {
      poseLock.current = false;
    }, 1200);
  };

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    for (const file of files) {
      if (captures.length >= POSES.length) break;

      const nextPose = POSES.find(
        (pose) => !captures.some((c) => c.pose === pose),
      );
      if (!nextPose) break;

      const image = await faceapi.bufferToImage(file);
      const preview = URL.createObjectURL(file);

      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (!detections || detections.length === 0) {
        showErrorToastOnce(`No face detected for ${nextPose}`);
        continue;
      }

      if (detections.length > 1) {
        showErrorToastOnce("Multiple faces detected");
        return;
      }

      const detection = detections[0];

      setCaptures((prev) => [
        ...prev,
        {
          pose: nextPose,
          descriptor: Array.from(detection.descriptor),
          preview,
          source: "upload",
        },
      ]);

      setCurrentPoseIndex((prev) => prev + 1);
    }

    e.target.value = "";
  };

  const submit = async () => {
    const livePoses = captures.filter((c) => LIVE_POSES.includes(c.pose));

    if (livePoses.length < LIVE_POSES.length) {
      toast.error("Capture all poses: FRONT, RIGHT, LEFT");
      return;
    }

    try {
      await axios.post(API, {
        name,
        empId,
        descriptors: captures.map((c) => c.descriptor),
      });

      toast.success("Employee registered successfully");

      setCaptures([]);
      setCurrentPoseIndex(0);
      setCameraEnabled(false);
      setName("");
      setEmpId("");
    } catch (err) {
      showErrorToastOnce(err.response?.data?.message || "Registration failed");
    }
  };

  const webcamCaptures = captures.filter((c) => c.source === "webcam");
  const uploadCaptures = captures.filter((c) => c.source === "upload");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
      <ToastContainer />

      {/* HEADER - Adjusted for better spacing on mobile */}
      <div className="mb-8 flex flex-col items-center text-center">
        <img
          src="/logo.png"
          alt="AJWA Projects Limited"
          className="h-12 md:h-16 mb-3"
        />
        <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
          Register Employee
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create a new employee account
        </p>
      </div>

      {/* MAIN CONTAINER - Changed from fixed w-[900px] to max-w-4xl and flex-col for mobile */}
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl flex flex-col md:flex-row overflow-hidden">
        {/* LEFT PANEL: Camera/Upload Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col items-center justify-center bg-gray-50/50">
          {cameraEnabled && currentPoseIndex < POSES.length && (
            <div className="mb-4 w-full text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-center text-green-700 animate-pulse">
              Please look <strong>{POSES[currentPoseIndex]}</strong>
            </div>
          )}

          <div className="w-full flex flex-col items-center">
            {useWebcam ? (
              currentPoseIndex < POSES.length ? (
                <div className="w-full aspect-video md:aspect-square lg:aspect-video overflow-hidden rounded-xl">
                  <WebCamCapture
                    key={POSES[currentPoseIndex]}
                    onCapture={handleCapture}
                    requiredPose={POSES[currentPoseIndex]}
                    cameraEnabled={cameraEnabled}
                    setCameraEnabled={setCameraEnabled}
                  />
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-green-600 font-medium">
                    All poses captured! ✓
                  </p>
                </div>
              )
            ) : (
              <div className="py-6 flex flex-col items-center">
                <label className="bg-[#10b981] hover:bg-green-700 text-white px-4 py-3 rounded-lg cursor-pointer transition-colors shadow-sm flex justify-center items-center gap-2">
                  <Camera />
                  Upload Photos
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    hidden
                    onChange={handleUpload}
                  />
                </label>
                <p className="text-xs text-gray-400 mt-3">
                  Upload FRONT, RIGHT & LEFT SIDE
                </p>
              </div>
            )}
          </div>

          {/* PREVIEWS - Grid adjusted for small screens */}
          {(webcamCaptures.length > 0 || uploadCaptures.length > 0) && (
            <div className="mt-8 space-y-6 w-full border-t border-gray-100 pt-6">
              {webcamCaptures.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Webcam Captures
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {webcamCaptures.map((c) => (
                      <div key={c.pose} className="text-center">
                        <div className="relative group">
                          <img
                            src={c.preview}
                            className="w-full aspect-square rounded-lg object-cover border-2 border-green-500 shadow-sm"
                          />
                        </div>
                        <p className="text-[10px] mt-1 font-bold text-gray-500">
                          {c.pose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadCaptures.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                    Uploaded Photos
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {uploadCaptures.map((c) => (
                      <div key={c.pose} className="text-center">
                        <img
                          src={c.preview}
                          className="w-full aspect-square rounded-lg object-cover border-2 border-blue-500 shadow-sm"
                        />
                        <p className="text-[10px] mt-1 font-bold text-gray-500">
                          {c.pose}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Form Section */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
          {/* TOGGLE - Sticky style on mobile */}
          <div className="flex items-center justify-between md:justify-end gap-3 mb-8">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-tighter">
              Capture Mode
            </span>
            <div className="flex items-center gap-2">
              <span
                className={`text-sm ${useWebcam ? "text-green-600 font-semibold" : "text-gray-400"}`}
              >
                Webcam
              </span>
              <label className="relative inline-flex cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={!useWebcam}
                  onChange={() => setUseWebcam(!useWebcam)}
                />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer-checked:bg-green-500 transition-colors"></div>
                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:translate-x-5 transition-transform"></div>
              </label>
              <span
                className={`text-sm ${!useWebcam ? "text-green-600 font-semibold" : "text-gray-400"}`}
              >
                Upload
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">
                Full Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">
                Employee ID
              </label>
              <input
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="e.g. EMP-101"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <button
              onClick={submit}
              className="w-full bg-[#10b981] hover:bg-green-700 text-white font-semibold py-4 rounded-xl mt-6 transition-all shadow-md active:scale-[0.98] cursor-pointer flex justify-center items-center gap-2"
            >
              <Check />
              Register Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
