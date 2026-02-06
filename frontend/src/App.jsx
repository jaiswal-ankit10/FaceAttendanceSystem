import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { loadFaceModels } from "./services/loadModels";
import FaceRegister from "./pages/FaceRegister";
import FaceAttendance from "./pages/FaceAttendance";
import AttendanceList from "./pages/AttendanceList";

const App = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    loadFaceModels()
      .then(() => setModelsLoaded(true))
      .catch(console.error);
  }, []);

  if (!modelsLoaded) {
    return <p>Loading face recognition models...</p>;
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" />} />

        <Route path="/register" element={<FaceRegister />} />
        <Route path="/attendance" element={<FaceAttendance />} />

        <Route path="/attendance-list" element={<AttendanceList />} />

        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
