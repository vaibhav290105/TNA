import React, { useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    location: ''
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      if (image) data.append('image', image);

      await API.post('/auth/register', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('User registered successfully');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.msg || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 flex items-center justify-center px-4">
      <form
        onSubmit={register}
        className="w-full max-w-lg bg-white shadow-2xl rounded-xl p-8 space-y-6"
        encType="multipart/form-data"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800">📝 Register</h2>

        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Profile Preview"
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
            />
          </div>
        )}

        <div className="space-y-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full border border-gray-300 px-4 py-2 rounded-md"
          />

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hod">HOD</option>
              <option value="hr">HR</option>
              <option value="admin">Admin</option>
            </select>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-md bg-white focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Department</option>
              <option value="HR">HR</option>
              <option value="Finance">Finance</option>
              <option value="IT">IT</option>
              <option value="Operations">Operations</option>
            </select>
          </div>

          <input
            type="text"
            name="location"
            placeholder="Enter Location"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-200"
        >
          Register
        </button>
      </form>
    </div>
  );
} 