import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { getFaceDirection } from "../utils/getFaceDirection";
import { toast } from "react-toastify";

const showErrorToastOnce = (message) => {
  toast.error(message, {
    toastId: message,
  });
};
export default function WebCamCapture({
  onCapture,
  requiredPose,
  cameraEnabled,
  setCameraEnabled,
  autoCapture = true,
  captureDelay = 1000,
}) {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const captureLock = useRef(false);

  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!cameraEnabled || !autoCapture) return;

    intervalRef.current = setInterval(runDetection, captureDelay);

    return () => clearInterval(intervalRef.current);
  }, [cameraEnabled, requiredPose]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const drawBox = (box, valid) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = valid ? "lime" : "red";
    ctx.lineWidth = 3;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  };

  const runDetection = async () => {
    if (!requiredPose) return;
    if (captureLock.current) return;
    if (!webcamRef.current) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return;

    const preview = webcamRef.current.getScreenshot();

    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors();

    if (!detections || detections.length === 0) {
      clearCanvas();
      toast.error("No face detected");
      return;
    }

    if (detections.length > 1) {
      clearCanvas();
      showErrorToastOnce("Multiple faces detected");
      return;
    }

    const detection = detections[0];

    const canvas = canvasRef.current;
    const displaySize = {
      width: canvas.width,
      height: canvas.height,
    };

    faceapi.matchDimensions(canvas, displaySize);
    const resized = faceapi.resizeResults(detection, displaySize);
    const box = resized.detection.box;

    const direction = getFaceDirection(detection.landmarks);
    const poseValid = !requiredPose || direction === requiredPose;

    drawBox(box, poseValid);

    if (!poseValid) {
      setMessage(`Turn face ${requiredPose}`);
      return;
    }

    captureLock.current = true;
    showErrorToastOnce("Face captured");

    onCapture(Array.from(detection.descriptor), direction, preview);

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

    const preview = imageSrc;
    const img = await faceapi.fetchImage(imageSrc);

    const detections = await faceapi
      .detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    setProcessing(false);

    if (!detections || detections.length === 0) {
      toast.error("No face detected");
      return;
    }

    if (detections.length > 1) {
      showErrorToastOnce("Multiple faces detected");
      return;
    }

    const detection = detections[0];
    const direction = getFaceDirection(detection.landmarks);

    if (requiredPose && direction !== requiredPose) {
      setMessage(`Turn face ${requiredPose}`);
      return;
    }

    toast.success("Face captured");
    onCapture(Array.from(detection.descriptor), direction, preview);
  };
  return (
    <div className="flex flex-col items-center w-full h-full">
      {!cameraEnabled ? (
        <button
          onClick={() => setCameraEnabled(true)}
          className="w-full sm:w-auto border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium cursor-pointer"
        >
          Enable Camera
        </button>
      ) : (
        <>
          <div className="relative w-full h-full min-h-75 bg-black rounded-xl overflow-hidden shadow-inner">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="absolute inset-0 w-full h-full object-cover rounded-lg"
            />

            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 z-10 pointer-events-none"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={captureFace}
              disabled={processing}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium cursor-pointer"
            >
              {processing ? "Processing..." : "Capture Face"}
            </button>

            <button
              onClick={() => setCameraEnabled(false)}
              className="w-full sm:w-auto border border-gray-300 rounded-lg px-6 py-2 text-sm font-medium cursor-pointer"
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
