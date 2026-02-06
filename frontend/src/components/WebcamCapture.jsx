import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { getFaceDirection } from "../utils/getFaceDirection";

export default function WebcamCapture({
  onCapture,
  requiredPose,
  cameraEnabled,
  setCameraEnabled,
  autoCapture = true,
  captureDelay = 800,
}) {
  const webcamRef = useRef(null);
  const captureLock = useRef(null);
  const intervalRef = useRef(null);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!cameraEnabled || !autoCapture) return;

    intervalRef.current = setInterval(runDetection, captureDelay);

    return () => clearInterval(intervalRef.current);
  }, [cameraEnabled, requiredPose]);

  const runDetection = async () => {
    if (captureLock.current) return;
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const img = await faceapi.fetchImage(imageSrc);

    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {
      setMessage("No face detected");
      return;
    }

    if (detections.length > 1) {
      setMessage(" Multiple faces detected");
      return;
    }

    const detection = detections[0];
    const direction = getFaceDirection(detection.landmarks);

    if (requiredPose && direction !== requiredPose) {
      setMessage(`Please turn your face ${requiredPose}`);
      return;
    }

    captureLock.current = true;
    setMessage("Face captured");

    onCapture(Array.from(detection.descriptor), direction);

    setTimeout(() => {
      captureLock.current = false;
    }, 1500);
  };

  const captureFace = async () => {
    if (!webcamRef.current) return;

    setProcessing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setProcessing(false);
      return;
    }

    const img = await faceapi.fetchImage(imageSrc);

    const detection = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    setProcessing(false);

    if (!detection || detection.length === 0) {
      alert("No face detected. Try again.");
      return;
    }

    if (detection.length > 1) {
      setMessage(
        "Multiple faces detected. Please ensure only one person is visible.",
      );
      return;
    }
    const direction = getFaceDirection(detection.landmarks);
    if (requiredPose && direction !== requiredPose) {
      setMessage(`Please turn your face ${requiredPose}`);
      return;
    }

    setMessage("Sample captured");

    onCapture(Array.from(detection.descriptor), direction);
  };

  return (
    <div>
      {!cameraEnabled ? (
        <button
          onClick={() => setCameraEnabled(true)}
          className="border border-gray-300 rounded p-2 cursor-pointer text-gray-800"
        >
          Enable Camera
        </button>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={320}
            videoConstraints={{ facingMode: "user" }}
          />

          <div className="mt-2 flex justify-center items-center gap-4">
            <button
              onClick={captureFace}
              disabled={processing}
              className="border border-gray-300 rounded p-2 cursor-pointer text-gray-800 "
            >
              {processing ? "Processing..." : "Capture Face"}
            </button>
            <button
              onClick={() => setCameraEnabled(false)}
              className="border border-gray-300 rounded p-2 cursor-pointer text-gray-800"
            >
              Disable Camera
            </button>
          </div>
          {message && <p className="text-sm text-gray-600 mt-2">{message}</p>}
        </>
      )}
    </div>
  );
}
