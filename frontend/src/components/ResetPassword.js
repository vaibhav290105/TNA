import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const { token } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMsg(res.data.msg);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setMsg(err.response?.data?.msg || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">🔑 Reset Password</h2>
        <input
          type="password"
          className="w-full p-2 border mb-4 rounded"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Reset Password
        </button>
        {msg && <p className="mt-4 text-center text-sm text-gray-600">{msg}</p>}
      </form>
    </div>
  );
}
