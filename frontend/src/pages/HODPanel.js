import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useLocation } from 'react-router-dom';


export default function HODPanel() {
  const location = useLocation();
  const [tab, setTab] = useState(location.state?.defaultTab || 'review');
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({
    generalSkills: '', toolsTraining: '', softSkills: '', confidenceLevel: '',
    technicalSkills: '', dataTraining: '', roleChallenges: '', efficiencyTraining: '',
    certifications: '', careerGoals: '', careerTraining: '', trainingFormat: '',
    trainingDuration: '', learningPreference: '', pastTraining: '', pastTrainingFeedback: '',
    trainingImprovement: '', areaNeed: '', trainingFrequency: '',
  });
  const [mappedEmployees, setMappedEmployees] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [feedbacks, setFeedbacks] = useState([]);
  const navigate = useNavigate();
  

  useEffect(() => {
    if (tab === 'review') fetchHODRequests();
    if (tab === 'my') fetchMyRequests();
    if (tab === 'map') fetchUsersForMapping();
  }, [tab]);
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

  const fetchHODRequests = () => {
    API.get('/training-request/hod-review')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load HOD review requests'));
  };

  const fetchMyRequests = () => {
    API.get('/training-request/my-requests')
      .then(res => setRequests(res.data))
      .catch(() => alert('Failed to load your training requests'));
  };

  const fetchMappedEmployees = async (managerId) => {
    try {
        const res = await API.get(`/auth/users/manager/${managerId}`);
        setMappedEmployees(res.data);
    } catch (err) {
        console.error('Failed to fetch mapped employees:', err);
        setMappedEmployees([]);
    }
    };


  const fetchUsersForMapping = async () => {
    try {
      const usersRes = await API.get('/auth/users');
      const currentDepartment = localStorage.getItem('department');
      const nonHODs = usersRes.data.filter(u => u.department === currentDepartment);
      setEmployees(nonHODs.filter(u => u.role === 'employee'));
      setManagers(nonHODs.filter(u => u.role === 'manager'));
    } catch (err) {
      alert('Failed to fetch users');
    }
  };

  const handleDecision = async (id, decision) => {
    try {
      await API.patch(`/training-request/hod-review/${id}`, { decision });
      fetchHODRequests();
    } catch {
      alert('Failed to update status');
    }
  };

  const handleMapping = async (employeeId, managerId) => {
  try {
    const employee = employees.find(emp => emp._id === employeeId);
    
    if (employee.manager) {
      alert(`${employee.name} is already assigned to a manager.`);
      return;
    }

    await API.patch(`/auth/users/${employeeId}/assign-manager`, { managerId });
    alert('Mapping updated');
    fetchUsersForMapping();
    fetchMappedEmployees(managerId);
  } catch {
    alert('Mapping failed');
  }
};


const handleUnmapping = async (employeeId) => {
  try {
    await API.patch(`/auth/users/${employeeId}/unassign-manager`, { managerId: selectedManager._id });
    alert('Employee unmapped from manager');

    fetchUsersForMapping(); 
    if (selectedManager?._id) {
      fetchMappedEmployees(selectedManager._id);
    }
  } catch {
    alert('Failed to unmap employee');
  }
};


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/training-request/submit', formData);
      alert('✅ Training request submitted successfully!');
      setFormData({
        generalSkills: '', toolsTraining: '', softSkills: '', confidenceLevel: '',
        technicalSkills: '', dataTraining: '', roleChallenges: '', efficiencyTraining: '',
        certifications: '', careerGoals: '', careerTraining: '', trainingFormat: '',
        trainingDuration: '', learningPreference: '', pastTraining: '', pastTrainingFeedback: '',
        trainingImprovement: '', areaNeed: '', trainingFrequency: '',
      });
      setTab('my');
    } catch {
      alert('❌ Error submitting training request.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  const fields = [
    { label: 'What skills do you feel you need to improve?', name: 'generalSkills', type: 'textarea' },
    { label: "Tools or software you'd like to get trained on?", name: 'toolsTraining' },
    { label: 'Need training in communication, leadership, or soft skills?', name: 'softSkills' },
    { label: 'Confidence level with tools (Excel, SAP, etc.)?', name: 'confidenceLevel' },
    { label: "Technical skills you'd like to learn?", name: 'technicalSkills' },
    { label: 'Need training in data analysis or reporting?', name: 'dataTraining' },
    { label: 'Challenges in your current role?', name: 'roleChallenges', type: 'textarea' },
    { label: 'Training to perform your job better?', name: 'efficiencyTraining' },
    { label: "Certifications you're interested in?", name: 'certifications' },
    { label: 'Where do you see yourself in 2 years?', name: 'careerGoals', type: 'textarea' },
    { label: 'Training needed to reach your goals?', name: 'careerTraining' },
    { label: 'Preferred training format?', name: 'trainingFormat', type: 'select', options: ['', 'In-person', 'Online Live', 'Self-paced'] },
    { label: 'Preferred duration?', name: 'trainingDuration', type: 'select', options: ['', '1 Day', '1 Week', 'Short Sessions'] },
    { label: 'Learning preference?', name: 'learningPreference', type: 'select', options: ['', 'Individual', 'Team-based'] },
    { label: 'Attended any training in the last 6 months?', name: 'pastTraining' },
    { label: 'Was it relevant and helpful?', name: 'pastTrainingFeedback' },
    { label: 'Suggestions for improvement?', name: 'trainingImprovement', type: 'textarea' },
    { label: 'Area you need most training in:', name: 'areaNeed', type: 'select', options: ['', 'Technical Skills', 'Communication', 'Leadership', 'Time Management', 'Other'] },
    { label: 'Training frequency preferred:', name: 'trainingFrequency', type: 'select', options: ['', 'Monthly', 'Quarterly', 'Bi-annually', 'Annually'] },
  ];

  const statusBadge = (status) => {
  const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold';

  switch (status) {
    case 'Pending_Manager':
      return `${base} bg-yellow-100 text-yellow-700`;
    case 'Approved_By_Manager':
      return `${base} bg-blue-100 text-blue-700`;
    case 'Rejected_By_Manager':
      return `${base} bg-red-100 text-red-700`;
    case 'Pending_HOD':
      return `${base} bg-yellow-200 text-yellow-800`;
    case 'Approved_By_HOD':
      return `${base} bg-blue-200 text-blue-800`;
    case 'Rejected_By_HOD':
      return `${base} bg-red-200 text-red-800`;
    case 'Pending_HR':
      return `${base} bg-yellow-300 text-yellow-900`;
    case 'Approved_By_HR':
      return `${base} bg-blue-300 text-blue-900`;
    case 'Rejected_By_HR':
      return `${base} bg-red-300 text-red-900`;
    case 'Pending_Admin':
      return `${base} bg-yellow-400 text-yellow-900`;
    case 'Approved_By_Admin':
      return `${base} bg-green-100 text-green-700`;
    case 'Rejected_By_Admin':
      return `${base} bg-red-100 text-red-700`;
    default:
      return `${base} bg-gray-100 text-gray-700`;
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
  
        <div className="flex items-center gap-4">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" alt="IGL Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold leading-tight">HOD Dashboard</h1>
            <p className="text-sm text-gray-300">Indraprastha Gas Limited</p>
          </div>
        </div>

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

        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded font-medium"
          >
            👤 Profile
          </button>
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium"
          >
            Logout
          </button>
        </div>
      </header>


      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-4 mb-6">
          <button onClick={() => setTab('review')} className={`px-4 py-2 rounded ${tab === 'review' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Review Requests</button>
          <button onClick={() => setTab('submit')} className={`px-4 py-2 rounded ${tab === 'submit' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Submit Training Request</button>
          <button onClick={() => setTab('my')} className={`px-4 py-2 rounded ${tab === 'my' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>My Requests</button>
          <button onClick={() => setTab('map')} className={`px-4 py-2 rounded ${tab === 'map' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}>Assign Employees</button>
        </div>

        {tab === 'map' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Assign Employees to Managers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-center">Managers</h3>
                {managers.map(mgr => (
                  <div key={mgr._id} className="flex justify-between items-center mb-3">
                    <span>{mgr.name}</span>
                    <button onClick={() => {setSelectedManager(mgr);fetchMappedEmployees(mgr._id);}} className="bg-blue-500 text-white px-4 py-1 rounded">Select</button>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-center">Employees</h3>
                {employees.map(emp => (
                  <div key={emp._id} className="flex justify-between items-center mb-3">
                    <span>{emp.name}</span>
                    {emp.manager ? (
                      <span className="text-xs text-gray-400 italic">Already Assigned</span>
                    ) : (
                      <button
                        onClick={() => handleMapping(emp._id, selectedManager?._id)}
                        className="bg-green-500 text-white px-4 py-1 rounded"
                        disabled={!selectedManager}
                      >
                        Map
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 rounded shadow">
                <h3 className="text-xl font-bold mb-4 text-center">
                    {selectedManager ? `Mapped to ${selectedManager.name}` : 'Mapped to Selected Manager'}
                </h3>

                {selectedManager ? (
                    mappedEmployees.length > 0 ? (
                        mappedEmployees.map(e => (
                        <div key={e._id} className="flex justify-between items-center mb-2">
                            <span>{e.name}</span>
                            <button
                            onClick={() => handleUnmapping(e._id)}
                            className="text-sm bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                            >
                            Unmap
                            </button>
                        </div>
                        ))
                    ) : (
                        <p className="text-center italic text-gray-500">No employees Assigned yet.</p>
                    )
                    ) : (
                    <p className="text-center italic text-gray-500">Select a manager to view mappings.</p>
                    )}

              </div>
            </div>
          </div>
        )}
        {tab === 'review' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Training Requests - Review</h2>
            {requests.length === 0 ? (
              <p className="text-center text-gray-500">No requests pending HOD review.</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="bg-white p-6 rounded-lg shadow mb-5 border">
                  <div className="flex justify-between mb-3">
                    <div>
                      <p><strong>Employee:</strong> {req.user?.name}</p>
                      <p><strong>Department:</strong> {req.user?.department}</p>
                      <p><strong>Status:</strong> {req.status}</p>
                      <p><strong>Submitted On:</strong> {new Date(req.createdAt).toLocaleDateString()}</p>
                      <p><strong>Request No:</strong> {req.requestNumber}</p>
                      <button
                        onClick={() => { setSelectedRequest(req); setShowModal(true); }}
                        className="text-blue-600 mt-2 hover:underline flex items-center gap-1"
                      >
                        🔍 View Full Details
                      </button>
                    </div>
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleDecision(req._id, 'approve')}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleDecision(req._id, 'reject')}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        
        {tab === 'submit' && (
          <div className="bg-white p-8 shadow rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Submit Training Request</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              {fields.map((field, index) => (
                <div key={index}>
                  <label className="block font-semibold mb-1 text-gray-700">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  ) : field.type === 'select' ? (
                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt || 'Select'}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  )}
                </div>
              ))}
              <div className="md:col-span-2 flex justify-center mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-8 py-2 rounded hover:bg-blue-700"
                >
                  🚀 Submit Training Request
                </button>
              </div>
            </form>
          </div>
        )}
        
        {tab === 'my' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">My Training Requests</h2>
            {requests.length === 0 ? (
              <p className="text-center text-gray-500">No requests submitted yet.</p>
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
                      <p className="mb-3">
                        <strong>Status:</strong>
                        <span className={`ml-2 ${statusBadge(req.status)}`}>
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-4">
                      <button
                        onClick={() => {setSelectedRequest(req);setShowModal(true);}}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                      >
                        👁️ View
                      </button>
                      <button
                        onClick={() => navigate(`/training-form/${req._id}`)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this request?')) {
                            try {
                              await API.delete(`/training-request/${req._id}`);
                              setRequests(prev => prev.filter(r => r._id !== req._id));
                            } catch {
                              alert('Failed to delete request');
                            }
                          }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}



      </div>
      {showModal && selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">📝 Training Request Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <p><strong>Employee:</strong> {selectedRequest.user?.name}</p>
                <p><strong>Department:</strong> {selectedRequest.user?.department}</p>
                <p><strong>Location:</strong> {selectedRequest.user?.location}</p>
                <p><strong>Request No:</strong> {selectedRequest.requestNumber}</p>
                <p><strong>Status:</strong> {selectedRequest.status}</p>
                <p><strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}</p>

                {[
                  ['Skills to Improve', 'generalSkills'],
                  ['Tools for Training', 'toolsTraining'],
                  ['Soft Skills Training', 'softSkills'],
                  ['Tool Confidence Level', 'confidenceLevel'],
                  ['Technical Skills to Learn', 'technicalSkills'],
                  ['Data/Reporting Training', 'dataTraining'],
                  ['Current Role Challenges', 'roleChallenges'],
                  ['Job Efficiency Training', 'efficiencyTraining'],
                  ['Interested Certifications', 'certifications'],
                  ['2-Year Career Goal', 'careerGoals'],
                  ['Training for Career Goal', 'careerTraining'],
                  ['Preferred Format', 'trainingFormat'],
                  ['Preferred Duration', 'trainingDuration'],
                  ['Learning Style', 'learningPreference'],
                  ['Past Trainings', 'pastTraining'],
                  ['Feedback on Past Trainings', 'pastTrainingFeedback'],
                  ['Suggested Improvements', 'trainingImprovement'],
                  ['Urgent Training Areas', 'areaNeed'],
                  ['Training Frequency', 'trainingFrequency']
                ].map(([label, key]) => (
                  <p key={key}><strong>{label}</strong> {selectedRequest[key] || '—'}</p>
                ))}
              </div>

              <div className="text-center mt-6">
                <button onClick={() => setShowModal(false)} className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}




