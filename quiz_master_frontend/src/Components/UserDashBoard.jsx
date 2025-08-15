import { useEffect, useState } from "react";
import axios from "axios";

export default function UserDashboard() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    // Fetch upcoming quizzes from backend
    axios.get("http://localhost:5000/api/user/upcoming-quizzes", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
    .then(res => setQuizzes(res.data))
    .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-3 flex justify-between">
        <div className="flex space-x-4">
          <a href="/" className="font-semibold">Home</a>
          <a href="/scores">Scores</a>
          <a href="/summary">Summary</a>
        </div>
        <div>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-1 rounded"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Search */}
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Welcome User</h1>
        <input
          type="text"
          placeholder="Search..."
          className="border p-2 rounded w-64"
        />
      </div>

      {/* Upcoming Quizzes Table */}
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">Upcoming Quizzes</h2>
        <table className="w-full border-collapse bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-200 text-left">
              <th className="p-3">#</th>
              <th className="p-3">Quiz Title</th>
              <th className="p-3">Date</th>
              <th className="p-3">Time</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {quizzes.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4">No upcoming quizzes</td>
              </tr>
            ) : (
              quizzes.map((quiz, index) => (
                <tr key={quiz.id} className="border-b">
                  <td className="p-3">{index + 1}</td>
                  <td className="p-3">{quiz.title}</td>
                  <td className="p-3">{quiz.date}</td>
                  <td className="p-3">{quiz.time}</td>
                  <td className="p-3 space-x-2">
                    <button className="bg-gray-500 text-white px-3 py-1 rounded">
                      View
                    </button>
                    <button
                      onClick={() => window.location.href = `/quiz/${quiz.id}`}
                      className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                      Start
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
