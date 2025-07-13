import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ManagerPanel() {
  const [tab, setTab] = useState('review');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [mappedEmployees, setMappedEmployees] = useState([]);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const endpoint = tab === 'review'
          ? '/training-request/manager-review'
          : '/training-request/my-requests';
        const res = await API.get(endpoint);
        setRequests(res.data);
      } catch {
        alert('Failed to fetch requests');
      }
    };
    fetchRequests();
  }, [tab]);

  useEffect(() => {
    const fetchManagerInfo = async () => {
      try {
        const res = await API.get('/auth/me');
        setCurrentUser(res.data);
        setMappedEmployees(res.data.mappedEmployees || []);
      } catch {
        alert('Failed to load manager info');
      }
    };
    fetchManagerInfo();
  }, []);

  const handleDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/manager-review/${id}`, { decision });
      setRequests((prev) => prev.filter((r) => r._id !== id));
      setSelectedRequest(null);
    } catch {
      alert('Failed to update request');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
  
        <div className="flex items-center gap-4">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" alt="IGL Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold">Manager Dashboard</h1>
            {currentUser && (
              <p className="text-sm text-gray-300">Welcome, {currentUser.name}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium"
          >
            👤 Profile
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium"
          >
            Logout
          </button>
        </div>
      </header>


      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setTab('review')}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              tab === 'review' ? 'bg-blue-600 shadow' : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            📝 Review Requests
          </button>
          <button
            onClick={() => navigate('/training-request')}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium shadow"
          >
            ➕ New Training Request
          </button>
          <button
            onClick={() => setTab('submitted')}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              tab === 'submitted' ? 'bg-blue-600 shadow' : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            📤 My Submitted Requests
          </button>
        </div>

        {/* Mapped Employees */}
        <div className="mb-10 bg-white shadow p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">👥 Employees Assigned to You</h2>
          {mappedEmployees.length === 0 ? (
            <p className="text-gray-500 italic">No employees Assinged yet.</p>
          ) : (
            <ul className="list-disc pl-6 text-gray-800">
              {mappedEmployees.map((emp) => (
                <li key={emp._id}>{emp.name} ({emp.department})</li>
              ))}
            </ul>
          )}
        </div>

        {/* Requests */}
        {requests.length === 0 ? (
          <p className="text-center text-gray-500 italic">No training requests found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="bg-white shadow-lg rounded-xl border p-6 flex flex-col justify-between"
              >
                <div>
                  <p><strong>Name:</strong> {req.user?.name || 'You'}</p>
                  <p><strong>Request No:</strong> {req.requestNumber}</p>
                  <p><strong>Department:</strong> {req.user?.department}</p>
                  <p><strong>Submitted On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                  <p className="mb-3"><strong>Status:</strong>
                    <span className="ml-2 inline-block px-2 py-1 text-sm rounded bg-blue-100 text-blue-700">
                      {req.status}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  {tab === 'review' && (
                    <>
                      <button
                        onClick={() => handleDecision(req._id, 'approve')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(req._id, 'reject')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              🗂️ Training Request Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Employee:</strong> {selectedRequest.user?.name || 'You'}</p>
              <p><strong>Department:</strong> {selectedRequest.user?.department}</p>
              <p><strong>Location:</strong> {selectedRequest.user?.location}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
              <p><strong>Submitted On:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
              <p><strong>General Skills:</strong> {selectedRequest.generalSkills}</p>
              <p><strong>Tools Training:</strong> {selectedRequest.toolsTraining}</p>
              <p><strong>Soft Skills:</strong> {selectedRequest.softSkills}</p>
              <p><strong>Technical Skills:</strong> {selectedRequest.technicalSkills}</p>
              <p><strong>Data Training:</strong> {selectedRequest.dataTraining}</p>
              <p><strong>Role Challenges:</strong> {selectedRequest.roleChallenges}</p>
              <p><strong>Efficiency Training:</strong> {selectedRequest.efficiencyTraining}</p>
              <p><strong>Certifications:</strong> {selectedRequest.certifications}</p>
              <p><strong>Career Goals:</strong> {selectedRequest.careerGoals}</p>
              <p><strong>Training Format:</strong> {selectedRequest.trainingFormat}</p>
              <p><strong>Duration:</strong> {selectedRequest.trainingDuration}</p>
              <p><strong>Learning Preference:</strong> {selectedRequest.learningPreference}</p>
              <p><strong>Past Training:</strong> {selectedRequest.pastTraining}</p>
              <p><strong>Feedback:</strong> {selectedRequest.pastTrainingFeedback}</p>
              <p><strong>Improvement:</strong> {selectedRequest.trainingImprovement}</p>
              <p><strong>Area Needed:</strong> {selectedRequest.areaNeed}</p>
              <p><strong>Frequency:</strong> {selectedRequest.trainingFrequency}</p>
            </div>
            <div className="text-right mt-6">
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
