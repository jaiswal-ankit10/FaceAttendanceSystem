const FACE_MATCH_THRESHOLD = 0.5;

function euclideanDistance(d1, d2) {
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    const diff = d1[i] - d2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Match incoming face descriptor with stored users
 * @param {number[]} incomingDescriptor
 * @param {Array} users - users with faceDescriptors
 */
function matchFace(incomingDescriptor, users) {
  let bestMatch = null;
  let minDistance = Infinity;

  for (const user of users) {
    for (const fd of user.faceDescriptors) {
      const distance = euclideanDistance(incomingDescriptor, fd.descriptor);

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = user;
      }
    }
  }

  if (minDistance <= FACE_MATCH_THRESHOLD) {
    return {
      user: bestMatch,
      distance: Number(minDistance.toFixed(4)),
    };
  }

  return null;
}

export default matchFace;
