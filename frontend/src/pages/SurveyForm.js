import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import API from '../services/api';

export default function SurveyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [responseId, setResponseId] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(null); // null for initialization check

  // Set edit mode from query param
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    setIsEditMode(queryParams.get('mode') === 'edit');
  }, [location.search]);

  // Fetch survey and response data
  useEffect(() => {
    if (isEditMode === null) return; // Wait until editMode is initialized

    const fetchSurvey = async () => {
      try {
        const res = await API.get(`/survey/${id}/my-response`);
        const { title, questions, answers, status, responseId } = res.data;

        setSurvey({ title, questions });
        setAnswers(answers || []);
        setResponseId(responseId);

        // Only set submitted if not in edit mode
        if (status === 'Completed' && !isEditMode) {
          setSubmitted(true);
        }
      } catch (err) {
        console.error(err);
        alert('❌ Failed to load survey.');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id, isEditMode, navigate]);

  // Handle input change
  const handleChange = (index, value) => {
    const updated = [...answers];
    updated[index] = value;
    setAnswers(updated);
  };

  // Submit or update response
  const handleSubmit = async () => {
    try {
      if (isEditMode && responseId) {
        await API.patch(`/survey/update/${responseId}`, { answers });
        alert('✅ Response updated successfully!');
        setSubmitted(true);  // ✅ Set this to show thank you and trigger redirect
      } else {
        await API.post('/response/submit', { surveyId: id, answers });
        setSubmitted(true);
      }
    } catch (err) {
      alert(err.response?.data?.msg || '❌ Failed to submit/update.');
    }
  };

  // Redirect after submit (only on submit, not on edit)
  useEffect(() => {
    if (submitted) {
      const role = localStorage.getItem('role');
      const redirectPath =
        role === 'employee' ? '/dashboard' :
        role === 'manager' ? '/manager' :
        role === 'hod' ? '/hod' :
        role === 'admin' ? '/admin' :
        role === 'hr' ? '/hr' : '/';

      setTimeout(() => navigate(redirectPath), 2000);
    }
  }, [submitted, navigate]);


  if (loading) return <div className="p-4">⏳ Loading...</div>;
  if (!survey) return null;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">{survey.title}</h2>

      {survey.questions.map((q, i) => (
        <div key={i} className="mb-4">
          <label className="block mb-1 font-semibold">{q}</label>
          {(isEditMode || !submitted) ? (
            <input
              type="text"
              value={answers[i] || ''}
              onChange={(e) => handleChange(i, e.target.value)}
              className="w-full border p-2 rounded"
            />
          ) : (
            <p className="bg-gray-100 p-2 rounded">{answers[i]}</p>
          )}
        </div>
      ))}

      {(isEditMode || !submitted) && (
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {isEditMode ? '✏️ Update' : '🚀 Submit'}
        </button>
      )}

      {submitted && (
        <div className="mt-4 text-green-700 bg-green-100 p-3 rounded shadow">
          ✅ Thank you! Your response has been submitted.<br />
          Redirecting to dashboard...
        </div>
      )}
    </div>
  );
}
