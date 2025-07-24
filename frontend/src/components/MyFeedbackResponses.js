import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function MyFeedbackResponses() {
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResponses = async () => {
      try {
        const res = await API.get('/survey/my-responses');
        setResponses(res.data);
      } catch {
        alert('Failed to load feedback responses');
      }
    };

    fetchResponses();
  }, []);

  const handleDelete = async (surveyId) => {
    if (!window.confirm('Are you sure you want to delete this response?')) return;
    try {
      await API.delete(`/survey/response/${surveyId}`);
      alert('Deleted successfully!');
      setResponses((prev) => prev.filter((r) => r.surveyId !== surveyId));
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate(-1)} // navigates back to previous page
        className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Back
      </button>
      <h2 className="text-2xl font-bold mb-6">📄 My Feedback Form Responses</h2>
      {responses.length === 0 ? (
        <p className="text-gray-500 italic">No feedback responses submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {responses.map((res, idx) => (
            <div key={idx} className="bg-white border rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-indigo-700 font-bold text-lg">{res.title}</h3>
                  <p className="text-sm text-gray-500">
                    📅 Submitted on: {new Date(res.submittedAt).toLocaleDateString() || '—'}
                  </p>
                </div>
                <div className="flex gap-3 text-lg">
                  <button
                    title="View"
                    onClick={() => setSelectedResponse(res)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    👁️
                  </button>
                  <button
                    title="Edit"
                    onClick={() => navigate(`/survey/${res.surveyId}?mode=edit`)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    ✏️
                  </button>
                  <button
                    title="Delete"
                    onClick={() => handleDelete(res.surveyId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for view */}
      {selectedResponse && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center px-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedResponse.title}</h3>
              <button onClick={() => setSelectedResponse(null)} className="text-gray-500 hover:text-gray-800">
                ✖
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              📅 Submitted on: {new Date(selectedResponse.submittedAt).toLocaleDateString()}
            </p>
            <div className="space-y-4">
              {selectedResponse.questions.map((q, i) => (
                <div key={i}>
                  <p className="font-semibold">{q}</p>
                  <p className="bg-gray-100 p-2 rounded text-gray-700">
                    {selectedResponse.answers[i] || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
