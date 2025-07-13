import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', department: '', location: '', email: '' });
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('choose');
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();

  const fetchUser = () => {
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setFormData({
          name: res.data.name || '',
          department: res.data.department || '',
          location: res.data.location || '',
          email: res.data.email || ''
        });
        if (res.data.image) {
          setPreview(`http://localhost:5000/uploads/${res.data.image}`);
        }
      })
      .catch(() => alert('Failed to load profile'));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreview(URL.createObjectURL(file));
      setMode('save');
    }
  };

  const handleUpload = async () => {
    if (!newImage) return;
    const formDataImage = new FormData();
    formDataImage.append('image', newImage);
    setUploading(true);
    try {
      await API.patch('/auth/update-image', formDataImage, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Image updated successfully!');
      fetchUser();
      setNewImage(null);
      setMode('choose');
    } catch {
      alert('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProfileUpdate = async () => {
    try {
      await API.patch('/auth/update-profile', formData);
      alert('Profile updated successfully!');
      setEditMode(false);
      fetchUser();
    } catch {
      alert('Failed to update profile');
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500 text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg relative">
      <button
        onClick={() => {
          if (user.role === 'employee') navigate('/dashboard');
          else if (user.role === 'manager') navigate('/manager');
          else if (user.role === 'hod') navigate('/hod');
          else if (user.role === 'admin') navigate('/admin');
        }}
        className="absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-1 px-3 rounded"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col items-center">
        <img
          src={preview || 'https://via.placeholder.com/150'}
          alt="Profile"
          className="w-32 h-32 rounded-full object-cover border-4 border-blue-300"
        />
        <p className="mt-2 text-sm text-gray-600 italic">
          Role: <strong>{user.role}</strong>
        </p>

        <div className="mt-6 w-full text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">Update Profile Image:</label>
          {mode === 'choose' ? (
            <>
              <label
                htmlFor="upload"
                className="cursor-pointer inline-block bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 w-full"
              >
                Choose Image
              </label>
              <input
                id="upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </>
          ) : (
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md w-full"
            >
              {uploading ? 'Uploading...' : 'Save Image'}
            </button>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-4 text-gray-800 text-sm">
        {[
          { label: 'Name', name: 'name' },
          { label: 'Email', name: 'email' },
          { label: 'Department', name: 'department' },
          { label: 'Location', name: 'location' }
        ].map((field) => (
          <div className="flex items-center gap-4" key={field.name}>
            <label className="w-32 font-medium">{field.label}:</label>
            {editMode ? (
              <input
                type="text"
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="flex-1 border border-gray-300 rounded px-3 py-1"
              />
            ) : (
              <p className="text-gray-900 font-semibold">{formData[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        {editMode ? (
          <button
            onClick={handleProfileUpdate}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            💾 Save Changes
          </button>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
