import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLocation } from 'react-router-dom';
export default function ManagerPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
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
  const detailLabels = {
  generalSkills: "Skills to Improve",
  toolsTraining: "Tools for Training",
  softSkills: "Soft Skills Training",
  confidenceLevel: "Tool Confidence Level",
  technicalSkills: "Technical Skills to Learn",
  dataTraining: "Data/Reporting Training",
  roleChallenges: "Current Role Challenges",
  efficiencyTraining: "Job Efficiency Training",
  certifications: "Interested Certifications",
  careerGoals: "2-Year Career Goal",
  careerTraining: "Training for Career Goal",
  trainingFormat: "Preferred Format",
  trainingDuration: "Preferred Duration",
  learningPreference: "Learning Style",
  pastTraining: "Past Trainings",
  pastTrainingFeedback: "Feedback on Past Trainings",
  trainingImprovement: "Suggested Improvements",
  areaNeed: "Urgent Training Areas",
  trainingFrequency: "Training Frequency"
};

const statusBadge = (status) => {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold';

  switch (status) {
    case 'Pending_Manager':
      return `${base} bg-yellow-100 text-yellow-700`; // Employee submitted, awaiting Manager

    case 'Approved_By_Manager':
      return `${base} bg-blue-100 text-blue-700`; // Manager approved

    case 'Rejected_By_Manager':
      return `${base} bg-red-100 text-red-700`; // Manager rejected

    case 'Pending_HOD':
      return `${base} bg-yellow-200 text-yellow-800`; // Manager approved, waiting for HOD

    case 'Approved_By_HOD':
      return `${base} bg-blue-200 text-blue-800`; // HOD approved

    case 'Rejected_By_HOD':
      return `${base} bg-red-200 text-red-800`; // HOD rejected

    case 'Pending_HR':
      return `${base} bg-yellow-300 text-yellow-900`; // HOD approved, waiting for HR

    case 'Approved_By_HR':
      return `${base} bg-blue-300 text-blue-900`; // HR approved

    case 'Rejected_By_HR':
      return `${base} bg-red-300 text-red-900`; // HR rejected

    case 'Pending_Admin':
      return `${base} bg-yellow-400 text-yellow-900`; // HR approved, waiting for Admin

    case 'Approved_By_Admin':
      return `${base} bg-green-100 text-green-700`; // Admin approved

    case 'Rejected_By_Admin':
      return `${base} bg-red-100 text-red-700`; // Admin rejected

    case 'Cancelled':
      return `${base} bg-gray-300 text-gray-700`; // Request was cancelled

    default:
      return `${base} bg-gray-100 text-gray-700`; // Fallback for unknown
  }
};




  return (
  <div className="min-h-screen bg-gray-50">
    {/* Header */}
    <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div className="flex items-center gap-4">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s"
          alt="IGL Logo"
          className="h-10 w-auto"
        />
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

    {/* Main Container */}
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
      <div className="mb-10 bg-white shadow p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-gray-800">👥 Employees Assigned to You</h2>
        {mappedEmployees.length === 0 ? (
          <p className="text-gray-500 italic">No employees assigned yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mappedEmployees.map((emp) => (
              <div
                key={emp._id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{emp.name}</h3>
                <p className="text-sm text-gray-600">📧 {emp.email}</p>
                <p className="text-sm text-gray-600">🏢 {emp.department}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requests Section */}
      {requests.length === 0 ? (
        <p className="text-center text-gray-500 italic">No training requests found.</p>
      ) : (
        <>
          {tab === 'review' ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pending Requests for Review</h2>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white text-sm text-left border">
                  <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b">
                    <tr>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Submitted On</th>
                      <th className="px-5 py-3">Request No</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 border-b">
                        <td className="px-5 py-3">
                          <span className={statusBadge(req.status)}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-sm text-gray-500">
                          <strong>🆔:</strong> {req.requestNumber}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="text-blue-600 hover:text-blue-800 mx-2"
                            title="View"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDecision(req._id, 'approve')}
                            className="text-green-600 hover:text-green-800 mx-2"
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleDecision(req._id, 'reject')}
                            className="text-red-600 hover:text-red-800 mx-2"
                            title="Reject"
                          >
                            ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4">My Submitted Requests</h2>
              <div className="overflow-x-auto rounded-lg shadow">
                <table className="min-w-full bg-white text-sm text-left border">
                  <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b">
                    <tr>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Submitted On</th>
                      <th className="px-5 py-3">Request No</th>
                      <th className="px-5 py-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-gray-50 border-b">
                        <td className="px-5 py-3">
                          <span className={statusBadge(req.status)}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {new Date(req.createdAt).toLocaleDateString()}
                        </td>
                        <td className="text-sm text-gray-500">
                          <strong>🆔:</strong> {req.requestNumber}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="text-blue-600 hover:text-blue-800 mx-2"
                            title="View"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => navigate(`/training-form/${req._id}`)}
                            className="text-yellow-500 hover:text-yellow-700 mx-2"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                window.confirm(
                                  'Are you sure you want to delete this request?'
                                )
                              ) {
                                await API.delete(`/training-request/${req._id}`);
                                setRequests(
                                  requests.filter((r) => r._id !== req._id)
                                );
                              }
                            }}
                            className="text-red-500 hover:text-red-700 mx-2"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
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
            <p>
              <strong>Employee:</strong>{' '}
              {selectedRequest.user?.name || 'You'}
            </p>
            <p>
              <strong>Department:</strong>{' '}
              {selectedRequest.user?.department}
            </p>
            <p>
              <strong>Location:</strong>{' '}
              {selectedRequest.user?.location}
            </p>
            <p>
              <strong>Request No:</strong>{' '}
              {selectedRequest.requestNumber}
            </p>
            <p>
              <strong>Status:</strong> {selectedRequest.status}
            </p>
            <p>
              <strong>Date Submitted:</strong>{' '}
              {new Date(selectedRequest.createdAt).toLocaleDateString()}
            </p>

            {Object.entries(detailLabels).map(([key, label]) => (
              <p key={key}>
                <strong>{label}</strong> {selectedRequest[key] || '—'}
              </p>
            ))}
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
