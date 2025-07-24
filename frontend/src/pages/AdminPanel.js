import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('training');
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState(['']);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [success, setSuccess] = useState('');
  const [trainingRequests, setTrainingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedManager, setSelectedManager] = useState('');
  const [managerMapDept, setManagerMapDept] = useState('');
  const [mappedEmployees, setMappedEmployees] = useState([]);
  const [searchId, setSearchId] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [filterName, setFilterName] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [surveySearch, setSurveySearch] = useState('');
  const [filterRole, setFilterRole] = useState('');



  const navigate = useNavigate();

  const fetchUsers = () => {
    API.get('/auth/users')
      .then((res) => {
        const nonAdmins = res.data.filter((user) => user.role !== 'admin');
        setUsers(nonAdmins);
        
      })
      .catch(() => alert('Failed to fetch users'));
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'survey') {
      API.get('/survey/created')
        .then((res) => setSurveys(res.data))
        .catch(() => console.error('Failed to load created surveys'));
    }
  }, [success, activeTab]);

  const fetchMappedEmployees = async (managerId) => {
    try {
      const res = await API.get(`/auth/users/manager/${managerId}`);
      setMappedEmployees(res.data);
    } catch (err) {
      console.error('Failed to fetch mapped employees:', err);
    }
};

  useEffect(() => {
    if (activeTab === 'training') {
      API.get('/training-request/all')
        .then((res) => setTrainingRequests(res.data))
        .catch(() => alert('Failed to fetch training requests'));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!searchId.trim()) {
      setSearchResult(null);
    }
  }, [searchId]);

  useEffect(() => {
  if (isSearchTriggered) {
    setSearchResult(null);
    setIsSearchTriggered(false);
  }
}, [filterDept, filterName, filterEmail, filterLocation]);




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

    // Update trainingRequests list
    const updated = trainingRequests.map((r) =>
      r._id === id
        ? {
            ...r,
            status: decision === 'approve' ? 'Approved_By_Admin' : 'Rejected_By_Admin',
          }
        : r
    );
    setTrainingRequests(updated);

   
    if (searchResult && searchResult._id === id) {
      setSearchResult({
        ...searchResult,
        status: decision === 'approve' ? 'Approved_By_Admin' : 'Rejected_By_Admin',
      });
    }

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

  const handleUnmap = async (employeeId) => {
  if (!selectedManager) {
    alert('Please select a manager first.');
    return;
  }

  try {
    await API.patch(`/auth/users/${employeeId}/unassign-manager`, {
      managerId: selectedManager,
    });
    alert('Unmapped successfully');
    await fetchUsers(); 
    await fetchMappedEmployees(selectedManager); 
  } catch (err) {
    alert('Failed to unmap');
  }
};





  const handleMap = async (employeeId) => {
    if (!selectedManager) {
      alert('Please select a manager first.');
      return;
    }

    try {
      const res = await API.patch(`/auth/users/${employeeId}/assign-manager`, {
        managerId: selectedManager,
      });
      alert('Mapped successfully');
      await fetchUsers(); 
      await fetchMappedEmployees(selectedManager); 
    } catch (err) {
      alert('Failed to map');
    }
};


  

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
     
        <div className="flex items-center gap-4">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" alt="IGL Logo" className="h-10 w-auto" />
          <div>
            <h1 className="text-xl font-bold leading-tight">Admin Dashboard</h1>
            <p className="text-sm text-gray-300">Indraprastha Gas Limited</p>
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
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded font-medium"
          >
            Logout
          </button>
        </div>
      </header>


      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center mb-8 gap-6">
          <button
            onClick={() => setActiveTab('survey')}
            className={`px-5 py-2 rounded text-white ${activeTab === 'survey' ? 'bg-blue-600' : 'bg-gray-400'}`}
          >
            📋 Feedback Form Management
          </button>
          <button
            onClick={() => setActiveTab('training')}
            className={`px-5 py-2 rounded text-white ${activeTab === 'training' ? 'bg-green-600' : 'bg-gray-400'}`}
          >
            📝 View Training Requests
          </button>
          <button
            onClick={() => setActiveTab('mapping')}
            className={`px-5 py-2 rounded text-white ${activeTab === 'mapping' ? 'bg-purple-600' : 'bg-gray-400'}`}
          >
            👥 Assign Employees to Managers
          </button>
        </div>

        {/* Mapping Tab */}
        {activeTab === 'mapping' && (
          <>
            <h2 className="text-2xl font-semibold mb-4">👥 Assign Employees to Managers</h2>
            <select onChange={(e) => setManagerMapDept(e.target.value)} className="border rounded p-2 mb-4">
              <option value="">Select Department</option>
              {[...new Set(users.map(u => u.department))].map(dep => (
                <option key={dep} value={dep}>{dep}</option>
              ))}
            </select>

            {managerMapDept && (
              <div className="grid grid-cols-3 gap-4">
                {/* Managers */}
                <div className="border rounded p-3 bg-white">
                  <h3 className="text-lg font-semibold mb-2 text-center">Managers</h3>
                  {users.filter(u => u.department === managerMapDept && u.role === 'manager').map(manager => (
                    <div key={manager._id} className="flex justify-between items-center py-1">
                      <span>{manager.name}</span>
                      <button
                        className="bg-blue-500 text-white px-2 py-1 text-xs rounded"
                        onClick={() => {
                          setSelectedManager(manager._id);
                          fetchMappedEmployees(manager._id); 
                        }}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>

                
                <div className="border rounded p-3 bg-white">
                  <h3 className="text-lg font-semibold mb-2 text-center">Employees</h3>
                  {users
                    .filter(u => u.department === managerMapDept && u.role === 'employee')
                    .map(employee => {
                      const assignedManager = users.find(m => m._id === employee.manager);
                      return (
                        <div key={employee._id} className="flex justify-between items-center py-1">
                          <span>
                            {employee.name}
                            {assignedManager && (
                              <span className="text-xs text-gray-500 ml-2">(Assigned to {assignedManager.name})</span>
                            )}
                          </span>
                          {!employee.manager ? (
                            <button
                              className="bg-green-500 text-white px-2 py-1 text-xs rounded"
                              onClick={() => handleMap(employee._id)}
                            >
                              Map
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Assigned</span>
                          )}
                        </div>
                      );
                    })}
                </div>


               
                <div className="border rounded p-3 bg-white">
                  <h3 className="text-xl font-bold mb-4 text-center">
                    {selectedManager
                      ? `Mapped to ${users.find(u => u._id === selectedManager)?.name || 'Selected Manager'}`
                      : 'Selected Manager'}
                  </h3>

                  {!selectedManager ? (
                    <p className="text-center text-gray-500 italic">Select a manager to view mappings.</p>
                  ) : mappedEmployees.length === 0 ? (
                    <p className="text-center text-gray-500 italic">No employees Assigned yet.</p>
                  ) : (
                    mappedEmployees.map(emp => (
                      <div key={emp._id} className="flex justify-between items-center py-1">
                        <span>{emp.name}</span>
                        <button
                          className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                          onClick={() => handleUnmap(emp._id)}
                        >
                          Unmap
                        </button>
                      </div>
                    ))
                  )}

                </div>
              </div>
            )}
          </>
        )}
        {activeTab === 'survey' && (
          <>
            {success && (
              <div className="bg-green-100 text-green-700 px-4 py-2 rounded mb-4 text-center">{success}</div>
            )}

            {/* Form Creation */}
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

            {/* Filter Controls */}
            <div className="flex gap-4 mb-4">
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="p-2 border rounded w-1/2"
              >
                <option value="">All Departments</option>
                {[...new Set(users.map(u => u.department))].map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="p-2 border rounded w-1/2"
              >
                <option value="">All Roles</option>
                {[...new Set(users.map(u => u.role))].map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Grouped Checkbox List */}
            <div className="max-h-40 overflow-y-auto border p-2 mb-6 rounded bg-white">
              {[...new Set(users.map(u => u.department))]
                .filter(dep => !filterDept || dep === filterDept)
                .map(dep => (
                  <div key={dep} className="mb-2">
                    <h4 className="font-semibold text-gray-700 mb-1">{dep}</h4>
                    {users
                      .filter(user =>
                        user.department === dep &&
                        (!filterRole || user.role === filterRole)
                      )
                      .map(user => (
                        <label key={user._id} className="block ml-4 mb-1">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => toggleUser(user._id)}
                            className="mr-2"
                          />
                          {user.name} — {user.role}
                        </label>
                      ))}
                  </div>
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

            {/* Survey Title Filter */}
            <input
              type="text"
              placeholder="Search feedback forms by title..."
              value={surveySearch}
              onChange={(e) => setSurveySearch(e.target.value)}
              className="border px-3 py-2 rounded mb-4 w-full sm:w-1/2"
            />

            <ul className="space-y-3">
              {surveys
                .filter((survey) =>
                  survey.title.toLowerCase().includes(surveySearch.toLowerCase())
                )
                .map((survey) => (
                  <li
                    key={survey._id}
                    className="border p-3 rounded flex justify-between items-center bg-white"
                  >
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


        
        {activeTab === 'training' && (
          <>
           
            <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 flex-1">
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="border rounded p-2 w-full bg-white"
                >
                  <option value="">All Departments</option>
                  {[...new Set(users.map(u => u.department))].map(dep => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Search by Name"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Search by Email"
                  value={filterEmail}
                  onChange={(e) => setFilterEmail(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded w-full"
                />
                <input
                  type="text"
                  placeholder="Search by Location"
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded w-full"
                />
              </div>

             
              <div className="flex gap-2 flex-col sm:flex-row items-center">
                <input
                  type="text"
                  placeholder="Enter Request ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded w-64"
                />
                <button
                  onClick={async () => {
                    if (!searchId.trim()) return;
                    try {
                      const res = await API.get(`/training-request/admin/${searchId}`);
                      setSearchResult(res.data);
                      setIsSearchTriggered(true);
                      
                    } catch {
                      alert('Request not found');
                      setSearchResult(null);
                      setIsSearchTriggered(false);
                    }
                  }}



                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
                >
                  🔍 Search
                </button>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              📋 Employee Training Requests
            </h2>

           
            {
              (() => {
                const baseList = isSearchTriggered && searchResult ? [searchResult] : trainingRequests;



                const filteredRequests = baseList.filter((r) => {
                  if (isSearchTriggered && searchResult) return true;


                  return (
                    (!filterDept || r.user?.department?.toLowerCase() === filterDept.toLowerCase()) &&
                    (!filterName || r.user?.name?.toLowerCase().includes(filterName.toLowerCase())) &&
                    (!filterEmail || r.user?.email?.toLowerCase().includes(filterEmail.toLowerCase())) &&
                    (!filterLocation || r.user?.location?.toLowerCase().includes(filterLocation.toLowerCase()))
                  );
                });

                return filteredRequests.length === 0 ? (
                  <p className="text-gray-500 italic text-center">No training requests found.</p>
                ) : (
                  <div className="overflow-x-auto shadow rounded-lg">
                    <table className="min-w-full bg-white text-sm text-gray-800 border border-gray-200">
                      <thead className="bg-gray-100 text-xs uppercase font-semibold tracking-wide text-gray-600">
                        <tr>
                          <th className="px-5 py-3 text-left border-b">Employee</th>
                          <th className="px-5 py-3 text-left border-b">Department</th>
                          <th className="px-5 py-3 text-left border-b">Role</th>
                          <th className="px-5 py-3 text-left border-b">Request ID</th>
                          <th className="px-5 py-3 text-left border-b">Status</th>
                          <th className="px-5 py-3 text-left border-b">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((req) => {
                          const { label, color } = formatStatus(req.status);
                          return (
                            <tr key={req._id} className="hover:bg-gray-50 transition">
                              <td className="px-5 py-3 border-b">{req.user?.name}</td>
                              <td className="px-5 py-3 border-b">{req.user?.department}</td>
                              <td className="px-5 py-3 border-b">{req.user?.role}</td>
                              <td className="px-5 py-3 border-b">{req.requestNumber}</td>
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
                );
              })()
            }
          </>
        )}



        
      </div>
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">
              📝 Training Request Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              {/* Meta Information (static fields) */}
              <p>
                <strong>Employee:</strong> {selectedRequest.user?.name}
              </p>
              <p>
                <strong>Department:</strong> {selectedRequest.user?.department}
              </p>
              <p>
                <strong>Location:</strong> {selectedRequest.user?.location}
              </p>
              <p>
                <strong>Status:</strong> {formatStatus(selectedRequest.status).label}
              </p>
              <p>
                <strong>Request No:</strong> {selectedRequest.requestNumber}
              </p>
              <p>
                <strong>Date Submitted:</strong> {new Date(selectedRequest.createdAt).toLocaleDateString()}
              </p>
              
             
              {(() => {
              
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

                
                return Object.entries(detailLabels).map(([key, label]) => (
                  <p key={key}>
                    <strong>{label}</strong> {selectedRequest[key] || '—'}
                  </p>
                ));
              })()}
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
  );
}
