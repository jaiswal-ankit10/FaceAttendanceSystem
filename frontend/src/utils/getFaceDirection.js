export const getFaceDirection = (landmarks) => {
  const leftEye = landmarks.getLeftEye();
  const rightEye = landmarks.getRightEye();
  const nose = landmarks.getNose();

  const leftEyeX = leftEye[0].x;
  const rightEyeX = rightEye[3].x;
  const noseX = nose[3].x;

  const midEyeX = (leftEyeX + rightEyeX) / 2;
  const diff = noseX - midEyeX;

  if (Math.abs(diff) < 8) return "FRONT";
  if (diff > 8) return "LEFT";
  if (diff < -8) return "RIGHT";

  return "UNKNOWN";
};
