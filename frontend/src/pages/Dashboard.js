import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import EmployeeNavbar from '../components/EmployeeNavbar';

export default function Dashboard() {
  const [surveys, setSurveys] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showSurveys, setShowSurveys] = useState(false);
  const navigate = useNavigate();

  const name = localStorage.getItem('name');
  const role = localStorage.getItem('role');
  const department = localStorage.getItem('department');

  // Fetch user details including assigned manager
  const fetchUserProfile = async () => {
    try {
      const res = await API.get('/auth/me');
      setUser(res.data);
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await API.get('/survey/assigned-with-status');
      setSurveys(res.data);
      setShowSurveys(true);
    } catch (err) {
      console.error('Failed to fetch surveys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchSurveys(); 
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar fetchSurveys={fetchSurveys} onLogout={handleLogout} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Welcome Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">👋 Welcome, {name || 'Employee'}!</h2>
          <p className="text-gray-600 mb-1">📂 Department: <strong>{department}</strong></p>
          <p className="text-gray-600 mb-1">🧑‍💻 Role: <strong>{role}</strong></p>

          {user?.manager ? (
            <div className="mt-4 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-semibold text-lg text-gray-800 mb-2">👨‍💼 Assigned Manager</h3>
              <p className="text-gray-700">
                <span className="font-semibold">{user.manager.name}</span> – {user.manager.email}
              </p>
            </div>
          ) : (
            <p className="mt-4 text-sm italic text-gray-500">No manager assigned yet.</p>
          )}


        </div>

        {/* Survey Section */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold text-gray-800">📑 Assigned Feedback Forms</h3>
            <button
              onClick={fetchSurveys}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded"
            >
              🔄 Refresh
            </button>
          </div>

          {/* Loading Spinner */}
          {loading && (
            <div className="text-center text-blue-500 font-medium">⏳ Loading feedback forms...</div>
          )}

          {/* Survey List */}
          {!loading && showSurveys && (
            <>
              {surveys.length === 0 ? (
                <p className="text-center text-gray-500">No feedback forms assigned to you yet.</p>
              ) : (
                <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {surveys.map((survey) => (
                    <li
                      key={survey._id}
                      className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition"
                    >
                      <a
                        href={`/survey/${survey._id}`}
                        className="block text-lg font-bold text-blue-600 hover:underline mb-2"
                      >
                        {survey.title}
                      </a>
                      <span
                        className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${
                          survey.status === 'Completed'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {survey.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
