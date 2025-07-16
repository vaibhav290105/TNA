import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email, password });
      const token = res.data.token;
      localStorage.setItem('token', token);

      const decoded = jwtDecode(token);
      localStorage.setItem('role', decoded.role);
      localStorage.setItem('name', decoded.name);
      localStorage.setItem('department', decoded.department);


      if (decoded.role === 'admin') navigate('/admin');
      else if (decoded.role === 'manager') navigate('/manager');
      else if (decoded.role === 'hod') navigate('/hod');
      else if (decoded.role === 'hr') navigate('/hr');
      else navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md animate-fade-in">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">👤 Welcome Back</h2>

        <form onSubmit={login} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex justify-between items-center text-sm text-blue-500">
            <Link to="/forgot-password" className="hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold transition duration-200 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link to="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
