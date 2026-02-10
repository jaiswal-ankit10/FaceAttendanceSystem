import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { formatDate, formatTime } from "../utils/dateAndTimeFormatter";

const API_URL = `${import.meta.env.VITE_API_INSTANCE}/attendance/list`;

export default function AttendanceList() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await axios.get(API_URL);
        setAttendance(res.data);
      } catch (err) {
        console.error("Failed to load attendance");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  if (loading) {
    return <p className="text-center mt-10">Loading attendance...</p>;
  }

  return (
    <>
      <nav className="fixed z-10 bg-white w-full flex justify-between items-center px-6 py-4 ">
        <div>Logo</div>
        <ul>
          <li className="bg-green-300 p-2 rounded cursor-pointer">
            <Link to={"/attendance"}>Attendance</Link>
          </li>
        </ul>
      </nav>
      <div className="min-h-screen bg-gray-100 p-6 pt-50">
        <div className="max-w-5xl mx-auto bg-white shadow rounded-lg p-4">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            Attendance List
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Employee ID</th>
                  <th className="border px-3 py-2">Date</th>
                  <th className="border px-3 py-2">Check-In Time</th>
                  <th className="border px-3 py-2">Check-Out Time</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      No attendance records
                    </td>
                  </tr>
                ) : (
                  attendance.map((item, index) => (
                    <tr key={index} className="text-center">
                      <td className="border px-3 py-2">{item.user.name}</td>
                      <td className="border px-3 py-2">{item.user.empId}</td>
                      <td className="border px-3 py-2">
                        {formatDate(item.date)}
                      </td>
                      <td className="border px-3 py-2">
                        {formatTime(item.checkInTime)}
                      </td>
                      <td className="border px-3 py-2">
                        {formatTime(item.checkOutTime)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
