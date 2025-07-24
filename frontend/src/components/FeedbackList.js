import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function FeedbackList() {
  const [surveys, setSurveys] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const res = await API.get('/survey/assigned-with-status');
      setSurveys(res.data);
    };
    fetch();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📋 Assigned Feedback Forms</h2>
      <button
          onClick={() => navigate(-1)} // go back to previous page
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow"
      >
          🔙 Back
      </button>
      {surveys.length === 0 ? (
        <p className="text-gray-500 italic">No feedback forms assigned.</p>
      ) : (
        <ul className="space-y-3">
          {surveys.map((s) => (
            <li
              key={s._id}
              className="flex justify-between items-center border p-3 rounded shadow-sm bg-white"
            >
              <div>
                <h3 className="font-semibold text-gray-800">{s.title}</h3>
                <p
                  className={`text-sm font-medium ${
                    s.status === 'Completed' ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  Status: {s.status}
                </p>
              </div>

              {s.status === 'Pending' && (
                <button
                  className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                  onClick={() => navigate(`/survey/${s._id}`)}
                >
                  ✏️ Fill
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
