import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/request-reset', { email });
      setMsg(res.data.msg);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">🔐 Forgot Password</h2>
        
        <input
          type="email"
          className="w-full p-2 border mb-4 rounded"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Send Reset Link
        </button>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 p-2 rounded"
        >
          ← Back to Login
        </button>

        {msg && <p className="mt-4 text-center text-sm text-gray-600">{msg}</p>}
      </form>
    </div>
  );
}
