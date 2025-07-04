import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('survey');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [success, setSuccess] = useState('');
  const [trainingRequests, setTrainingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab === 'survey') {
      API.get('/auth/users')
        .then((res) => {
          const nonAdmins = res.data.filter((user) => user.role !== 'admin');
          setUsers(nonAdmins);
        })
        .catch(() => alert('Failed to fetch users'));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'survey') {
      API.get('/survey/created')
        .then((res) => setSurveys(res.data))
        .catch(() => console.error('Failed to load created surveys'));
    }
  }, [success, activeTab]);

  useEffect(() => {
    if (activeTab === 'training') {
      API.get('/training-request/all')
        .then((res) => setTrainingRequests(res.data))
        .catch(() => alert('Failed to fetch training requests'));
    }
  }, [activeTab]);

  const addQuestion = () => setQuestions([...questions, '']);
  const updateQuestion = (index, value) => {
    const copy = [...questions];
    copy[index] = value;
    setQuestions(copy);
  };

  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]
    );
  };

  const createSurvey = async () => {
    if (!title || questions.some((q) => !q)) return alert('Fill all fields');
    try {
      await API.post('/survey/create', {
        title,
        questions,
        assignedTo: selectedUsers,
      });
      setTitle('');
      setQuestions(['']);
      setSelectedUsers([]);
      setSuccess('Survey created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      alert('Survey creation failed');
    }
  };

  const updateStatus = async (id, decision) => {
    try {
      await API.patch(`/training-request/admin-review/${id}`, { decision });
      const updated = trainingRequests.map((r) =>
        r._id === id
          ? {
              ...r,
              status:
                decision === 'approve' ? 'Approved_By_Admin' : 'Rejected_By_Admin',
            }
          : r
      );
      setTrainingRequests(updated);
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case 'Approved_By_Admin':
        return { label: 'Approved by Admin', color: 'bg-green-100 text-green-700' };
      case 'Rejected_By_Admin':
        return { label: 'Rejected by Admin', color: 'bg-red-100 text-red-700' };
      case 'Approved_By_Manager':
        return { label: 'Approved by Manager', color: 'bg-blue-100 text-blue-700' };
      case 'Rejected_By_Manager':
        return { label: 'Rejected by Manager', color: 'bg-orange-100 text-orange-700' };
      case 'Pending_Manager':
        return { label: 'Pending Manager Review', color: 'bg-yellow-100 text-yellow-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium"
        >
          Logout
        </button>
      </header>

      {/* Tabs */}
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-center mb-8 gap-6">
            <button
              onClick={() => setActiveTab('survey')}
              className={`px-5 py-2 rounded text-white ${
                activeTab === 'survey' ? 'bg-blue-600' : 'bg-gray-400'
              }`}
            >
              📋 Feedback Form Management
            </button>
            <button
              onClick={() => setActiveTab('training')}
              className={`px-5 py-2 rounded text-white ${
                activeTab === 'training' ? 'bg-green-600' : 'bg-gray-400'
              }`}
            >
              📝 View Training Requests
            </button>
          </div>

          {/* Survey Tab */}
          {activeTab === 'survey' && (
            <>
              {success && (
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">
                  {success}
                </div>
              )}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Form Title"
                className="w-full border p-2 mb-4 rounded"
              />
              {questions.map((q, i) => (
                <input
                  key={i}
                  value={q}
                  onChange={(e) => updateQuestion(i, e.target.value)}
                  placeholder={`Question ${i + 1}`}
                  className="w-full border p-2 mb-2 rounded"
                />
              ))}
              <button onClick={addQuestion} className="bg-gray-200 px-3 py-1 rounded mr-3 mb-4">
                + Add Question
              </button>

              <h3 className="text-lg font-semibold mb-2">Assign to Users by Role & Department:</h3>
              <div className="max-h-40 overflow-y-auto border p-2 mb-6 rounded">
                {users.map((user) => (
                  <label key={user._id} className="block mb-1">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                      className="mr-2"
                    />
                    {user.name} — {user.role} ({user.department})
                  </label>
                ))}
              </div>

              <button
                onClick={createSurvey}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded"
              >
                ✅ Create Feedback Form
              </button>

              <hr className="my-8" />
              <h2 className="text-2xl font-semibold mb-4">📄 Created Feedback Forms</h2>
              <ul className="space-y-3">
                {surveys.map((survey) => (
                  <li key={survey._id} className="border p-3 rounded flex justify-between items-center bg-white">
                    <div>
                      <div className="text-lg font-medium text-gray-800">{survey.title}</div>
                      <div className="text-sm text-gray-600">
                        Assigned: {survey.assignedTo?.length || 0} | Responses: {survey.responseCount || 0}
                      </div>
                    </div>
                    <Link to={`/survey/${survey._id}/responses`} className="text-sm text-blue-600 hover:underline">
                      View Responses
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Training Tab */}
          {activeTab === 'training' && (
          <>
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📋 Employee Training Requests
            </h2>
            {trainingRequests.length === 0 ? (
              <p className="text-gray-500 italic text-center">No training requests submitted yet.</p>
            ) : (
              <div className="overflow-x-auto shadow rounded-lg">
                <table className="min-w-full bg-white text-sm text-gray-800 border border-gray-200">
                  <thead className="bg-gray-100 text-xs uppercase font-semibold tracking-wide text-gray-600">
                    <tr>
                      <th className="px-5 py-3 text-left border-b">Employee</th>
                      <th className="px-5 py-3 text-left border-b">Department</th>
                      <th className="px-5 py-3 text-left border-b">Role</th>
                      <th className="px-5 py-3 text-left border-b">Status</th>
                      <th className="px-5 py-3 text-left border-b">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingRequests.map((req) => {
                      const { label, color } = formatStatus(req.status);
                      return (
                        <tr key={req._id} className="hover:bg-gray-50 transition">
                          <td className="px-5 py-3 border-b">{req.user?.name}</td>
                          <td className="px-5 py-3 border-b">{req.user?.department}</td>
                          <td className="px-5 py-3 border-b">{req.user?.role}</td>
                          <td className="px-5 py-3 border-b">
                            <span className={`px-3 py-1 text-xs rounded-full font-semibold ${color}`}>
                              {label}
                            </span>
                          </td>
                          <td className="px-5 py-3 border-b space-x-2">
                            <button
                              onClick={() => updateStatus(req._id, 'approve')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow-sm transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(req._id, 'reject')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transition"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => setSelectedRequest(req)}
                              className="text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
      )}
      </div>

      {/* Modal for Request Details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              📝 Training Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Employee:</strong> {selectedRequest.user?.name}</p>
              <p><strong>Department:</strong> {selectedRequest.user?.department}</p>
              <p><strong>Location:</strong> {selectedRequest.user?.location}</p>
              <p><strong>Status:</strong> {formatStatus(selectedRequest.status).label}</p>
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
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
