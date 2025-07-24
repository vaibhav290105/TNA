import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';


export default function HRPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    fetchAssignedFeedbacks();
  }, []);

  const fetchAssignedFeedbacks = async () => {
    try {
      const res = await API.get('/survey/assigned-with-status');
      setFeedbacks(res.data);
      const pending = res.data.filter(s => s.status === 'Pending');
      setPendingCount(pending.length);
    } catch (err) {
      console.error('Failed to fetch assigned feedback forms');
    }
  };

  const [formData, setFormData] = useState({
    generalSkills: '',
    toolsTraining: '',
    softSkills: '',
    confidenceLevel: '',
    technicalSkills: '',
    dataTraining: '',
    roleChallenges: '',
    efficiencyTraining: '',
    certifications: '',
    careerGoals: '',
    careerTraining: '',
    trainingFormat: '',
    trainingDuration: '',
    learningPreference: '',
    pastTraining: '',
    pastTrainingFeedback: '',
    trainingImprovement: '',
    areaNeed: '',
    trainingFrequency: ''
  });

  const navigate = useNavigate();
  const fieldLabels = {
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


const dropdownOptions = {
  confidenceLevel: ['Low', 'Medium', 'High'],
  trainingFormat: ['Online', 'In-person', 'Blended'],
  trainingDuration: ['1 week', '2 weeks', '1 month', '3 months'],
  learningPreference: ['Self-paced', 'Instructor-led', 'Peer learning'],
  trainingFrequency: ['Monthly', 'Quarterly', 'Yearly'],
};


  useEffect(() => {
    if (tab === 'review') fetchPendingHRRequests();
    if (tab === 'my') fetchMyRequests();
  }, [tab]);

  const fetchPendingHRRequests = async () => {
    try {
      const res = await API.get('/training-request/hr-review');
      setRequests(res.data);
    } catch (err) {
      alert('Failed to load HR review requests');
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await API.get('/training-request/my-requests');
      setRequests(res.data);
    } catch (err) {
      alert('Failed to fetch your requests');
    }
  };

  const handleHRDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/hr-review/${id}`, { decision });
      fetchPendingHRRequests();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/training-request/submit', formData);
      alert('✅ Training request submitted by HR');
      setFormData({
        generalSkills: '',
        toolsTraining: '',
        softSkills: '',
        confidenceLevel: '',
        technicalSkills: '',
        dataTraining: '',
        roleChallenges: '',
        efficiencyTraining: '',
        certifications: '',
        careerGoals: '',
        careerTraining: '',
        trainingFormat: '',
        trainingDuration: '',
        learningPreference: '',
        pastTraining: '',
        pastTrainingFeedback: '',
        trainingImprovement: '',
        areaNeed: '',
        trainingFrequency: ''
      });
      setTab('my');
    } catch {
      alert('❌ Error submitting request');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    try {
      await API.delete(`/training-request/${id}`);
      alert('Request deleted successfully');
      fetchMyRequests(); 
    } catch {
      alert('Failed to delete request');
    }
  };


  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white p-4 flex justify-between">
        <h1 className="text-xl font-bold">HR Dashboard</h1>
        <div className="relative">
          <button
            onClick={() => {
              if (feedbacks.length === 0) {
                alert('No feedback forms assigned.');
                return;
              }

              const pendingForms = feedbacks.filter(f => f.status === 'Pending');

              
              if (pendingForms.length === 1) {
                navigate(`/feedback`);
              } else {
                // Optional: Navigate to first pending or show a modal list
                navigate(`/feedback`);
              }
            }}
            className="px-4 py-2 rounded bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-200"
          >
            📝 Feedback Form
          </button>
          {pendingCount > 0 && (
            <span className="absolute -top-2 -left-2 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/my-feedback-responses')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          📄 View My Feedback Responses
        </button>
        <button onClick={logout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded">Logout</button>
        

      </header>

      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('review')} className={`px-4 py-2 rounded ${tab === 'review' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Review Requests</button>
          <button onClick={() => setTab('submit')} className={`px-4 py-2 rounded ${tab === 'submit' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>Submit Request</button>
          <button onClick={() => setTab('my')} className={`px-4 py-2 rounded ${tab === 'my' ? 'bg-indigo-600 text-white' : 'bg-gray-200'}`}>My Requests</button>
        </div>

        {tab === 'review' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending HR Review</h2>
            {requests.length === 0 ? (
              <p className="text-gray-500 italic">No pending requests.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded">
                  <thead className="bg-gray-100 text-gray-700 text-left text-sm uppercase">
                    <tr>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Submitted On</th>
                      <th className="px-4 py-2">Request_No</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800">
                    {requests.map((req) => (
                      <tr key={req._id} className="border-t">
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${req.status.includes('Rejected') ? 'bg-red-100 text-red-600' :
                              req.status.includes('Approved') ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'}
                          `}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-purple-700 font-medium">
                          🆔 : {req.requestNumber}
                        </td>
                        <td className="px-4 py-2 flex gap-3">
                          <button onClick={() => { setSelectedRequest(req); setShowModal(true); }} title="View">
                            👁️
                          </button>
                          <button
                            onClick={() => handleHRDecision(req._id, 'approve')}
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button
                            onClick={() => handleHRDecision(req._id, 'reject')}
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
            )}
          </div>
        )}


        {tab === 'submit' && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Submit Training Request (as HR)</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(formData).map((key) => (
                    <div key={key}>
                        <label className="block font-medium mb-1">
                        {fieldLabels[key] || key}
                        </label>
                        {dropdownOptions[key] ? (
                        <select
                            name={key}
                            value={formData[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            className="w-full border p-2 rounded"
                        >
                            <option value="">Select</option>
                            {dropdownOptions[key].map((option) => (
                            <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        ) : (
                        <input
                            name={key}
                            value={formData[key]}
                            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                            className="w-full border p-2 rounded"
                        />
                        )}
                    </div>
                    ))}

              <div className="md:col-span-2 text-center mt-4">
                <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded">🚀 Submit Request</button>
              </div>
            </form>
          </div>
        )}

        {tab === 'my' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">My Submitted Requests</h2>
            {requests.length === 0 ? (
              <p className="text-gray-500 italic">No requests submitted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow rounded">
                  <thead className="bg-gray-100 text-gray-700 text-left text-sm uppercase">
                    <tr>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Submitted On</th>
                      <th className="px-4 py-2">Request_No</th>
                      <th className="px-4 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-800">
                    {requests.map((req) => (
                      <tr key={req._id} className="border-t">
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${req.status.includes('Rejected') ? 'bg-red-100 text-red-600' :
                              req.status.includes('Approved') ? 'bg-green-100 text-green-600' :
                              'bg-blue-100 text-blue-600'}
                          `}>
                            {req.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="px-4 py-2">{new Date(req.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-2 text-purple-700 font-medium">
                          🆔 : {req.requestNumber}
                        </td>
                        <td className="px-4 py-2 flex gap-3">
                          <button onClick={() => { setSelectedRequest(req); setShowModal(true); }} title="View">
                            👁️
                          </button>
                          <button onClick={() => navigate(`/training-form/${req._id}`)} title="Edit">
                            ✏️
                          </button>
                          <button onClick={() => handleDelete(req._id)} title="Delete">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-2xl max-w-5xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">📑 Training Request Details</h3>
                <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-500 hover:text-gray-700"
                >
                ✖ Close
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3 text-sm text-gray-700 leading-6">
                <div><strong>Status:</strong> {selectedRequest.status.replace(/_/g, ' ')}</div>
                <div><strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}</div>
                <div><strong>Request No:</strong> {selectedRequest.requestNumber}</div>

                {Object.entries(fieldLabels).map(([key, label]) => (
                <div key={key}>
                    <strong>{label}:</strong> {selectedRequest[key] || '—'}
                </div>
                ))}
            </div>

            {/* Only show buttons if in review tab */}
            {tab === 'review' && (
                <div className="flex justify-end mt-6 gap-4">
                <button
                    onClick={() => {
                    handleHRDecision(selectedRequest._id, 'approve');
                    setShowModal(false);
                    }}
                    className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                >
                    ✅ Approve
                </button>
                <button
                    onClick={() => {
                    handleHRDecision(selectedRequest._id, 'reject');
                    setShowModal(false);
                    }}
                    className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-700"
                >
                    ❌ Reject
                </button>
                </div>
            )}
            </div>
        </div>
        )}


    </div>
  );
}

