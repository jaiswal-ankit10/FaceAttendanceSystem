import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { loadFaceModels } from "./services/loadModels";
import FaceRegister from "./pages/FaceRegister";
import FaceAttendance from "./pages/FaceAttendance";
import AttendanceList from "./pages/AttendanceList";
import AttendancePage from "./pages/AttendancePage";
import RegisterPage from "./pages/RegisterEmployee";
import RegisterEmployee from "./pages/RegisterEmployee";

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
        <Route path="/" element={<Navigate to="/attendance" />} />

        <Route path="/register" element={<RegisterEmployee />} />
        {/* <Route path="/attendance" element={<FaceAttendance />} /> */}
        <Route path="/attendance" element={<AttendancePage />} />

        <Route path="/attendance-list" element={<AttendanceList />} />
        {/* cloudfare.exe tunnel --url http://localhost:5173 command for tunnel creation */}

        <Route path="*" element={<h2>Page Not Found</h2>} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
