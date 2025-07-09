import React, { useEffect, useState } from 'react';
import API from '../services/api';

export default function MyTrainingRequests() {
  const [myRequests, setMyRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    API.get('/training-request/my-requests')
      .then((res) => setMyRequests(res.data))
      .catch(() => alert('Failed to fetch your training requests'));
  }, []);

  const statusBadge = (status) => {
    const base = 'inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'Approved_By_Admin':
        return `${base} bg-green-100 text-green-700`;
      case 'Rejected_By_Manager':
      case 'Rejected_By_Admin':
        return `${base} bg-red-100 text-red-700`;
      case 'Pending_Manager':
        return `${base} bg-yellow-100 text-yellow-700`;
      case 'Approved_By_Manager':
      case 'Pending_Admin':
        return `${base} bg-blue-100 text-blue-700`;
      default:
        return `${base} bg-gray-100 text-gray-700`;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">📋 My Training Requests</h2>

      {myRequests.length === 0 ? (
        <p className="text-gray-500 text-center">You haven’t submitted any training requests yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white text-sm text-left border">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b">
              <tr>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Submitted On</th>
                <th className="px-5 py-3">trans_no</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {myRequests.map((req) => (
                <tr key={req._id} className="hover:bg-gray-50 border-b">
                  <td className="px-5 py-3">
                    <span className={statusBadge(req.status)}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-5 py-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                  <td className="text-sm text-gray-500">
                    <strong>🆔 Req. No:</strong> {req.requestNumber}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="text-blue-600 hover:underline hover:text-blue-800 font-medium"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-2xl max-w-5xl w-full overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">📑 Training Request Details</h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ✖ Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <p><strong>Status:</strong> {selectedRequest.status.replace(/_/g, ' ')}</p>
              <p><strong>General Skills:</strong> {selectedRequest.generalSkills}</p>
              <p><strong>Tools Training:</strong> {selectedRequest.toolsTraining}</p>
              <p><strong>Soft Skills:</strong> {selectedRequest.softSkills}</p>
              <p><strong>Confidence Level:</strong> {selectedRequest.confidenceLevel}</p>
              <p><strong>Technical Skills:</strong> {selectedRequest.technicalSkills}</p>
              <p><strong>Data Training:</strong> {selectedRequest.dataTraining}</p>
              <p><strong>Role Challenges:</strong> {selectedRequest.roleChallenges}</p>
              <p><strong>Efficiency Training:</strong> {selectedRequest.efficiencyTraining}</p>
              <p><strong>Certifications:</strong> {selectedRequest.certifications}</p>
              <p><strong>Career Goals:</strong> {selectedRequest.careerGoals}</p>
              <p><strong>Career Training:</strong> {selectedRequest.careerTraining}</p>
              <p><strong>Training Format:</strong> {selectedRequest.trainingFormat}</p>
              <p><strong>Training Duration:</strong> {selectedRequest.trainingDuration}</p>
              <p><strong>Learning Preference:</strong> {selectedRequest.learningPreference}</p>
              <p><strong>Past Training:</strong> {selectedRequest.pastTraining}</p>
              <p><strong>Feedback:</strong> {selectedRequest.pastTrainingFeedback}</p>
              <p><strong>Improvement Suggestions:</strong> {selectedRequest.trainingImprovement}</p>
              <p><strong>Area Needed:</strong> {selectedRequest.areaNeed}</p>
              <p><strong>Frequency:</strong> {selectedRequest.trainingFrequency}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
