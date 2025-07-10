import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState('choose');
  const navigate = useNavigate();

  const fetchUser = () => {
    API.get('/auth/me')
      .then((res) => {
        setUser(res.data);
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

    const formData = new FormData();
    formData.append('image', newImage);
    setUploading(true);

    try {
      await API.patch('/auth/update-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Image updated successfully!');
      fetchUser();
      setNewImage(null);
      setMode('choose');
    } catch (err) {
      alert('Failed to update image');
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return <div className="text-center mt-10 text-gray-500 text-lg">Loading...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg relative">
      {/* Back to Dashboard button */}
      <button
        onClick={() => navigate('/dashboard')}
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Update Profile Image:
          </label>

          {mode === 'choose' && (
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
          )}

          {mode === 'save' && (
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

      <div className="mt-6 space-y-2 text-gray-800 text-sm">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Department:</strong> {user.department}</p>
        <p><strong>Location:</strong> {user.location}</p>
      </div>
    </div>
  );
}
