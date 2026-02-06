import * as faceapi from "face-api.js";

const MODEL_URL = "/models";

export const loadFaceModels = async () => {
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(`${MODEL_URL}/ssd_mobilenetv1`),
    faceapi.nets.faceLandmark68Net.loadFromUri(`${MODEL_URL}/face_landmark_68`),
    faceapi.nets.faceRecognitionNet.loadFromUri(
      `${MODEL_URL}/face_recognition`,
    ),
  ]);
};
