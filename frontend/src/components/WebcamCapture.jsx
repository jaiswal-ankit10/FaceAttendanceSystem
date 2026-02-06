import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import { useEffect, useRef, useState } from "react";
import { getFaceDirection } from "../utils/getFaceDirection";

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
      setMessage("No face detected");
      return;
    }

    if (detections.length > 1) {
      clearCanvas();
      setMessage("Multiple faces detected");
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
    setMessage("Face captured");

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
      setMessage("No face detected");
      return;
    }

    if (detections.length > 1) {
      setMessage("Multiple faces detected");
      return;
    }

    const detection = detections[0];
    const direction = getFaceDirection(detection.landmarks);

    if (requiredPose && direction !== requiredPose) {
      setMessage(`Turn face ${requiredPose}`);
      return;
    }

    setMessage("Face captured");
    onCapture(Array.from(detection.descriptor), direction, preview);
  };
  return (
    <div className="flex flex-col items-center">
      {!cameraEnabled ? (
        <button
          onClick={() => setCameraEnabled(true)}
          className="border border-gray-300 rounded px-4 py-2 cursor-pointer"
        >
          Enable Camera
        </button>
      ) : (
        <>
          <div className="relative w-[320px] h-60">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: "user" }}
              className="absolute top-0 left-0 w-full h-full rounded-lg"
            />

            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute top-0 left-0 z-10 pointer-events-none"
            />
          </div>

          <div className="mt-3 flex gap-3">
            <button
              onClick={captureFace}
              disabled={processing}
              className="border border-gray-300 rounded px-4 py-2 cursor-pointer"
            >
              {processing ? "Processing..." : "Capture Face"}
            </button>

            <button
              onClick={() => setCameraEnabled(false)}
              className="border border-gray-300 rounded px-4 py-2 cursor-pointer"
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
