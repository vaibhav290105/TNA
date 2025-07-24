import React from 'react';
import { Link } from 'react-router-dom';

export default function EmployeeNavbar({ fetchSurveys, onLogout }) {
  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo and Title */}
      <div className="flex items-center gap-4">
        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s" alt="IGL Logo" className="h-10 w-auto" />
        <div>
          <h1 className="text-xl font-bold leading-tight">Employee Dashboard</h1>
          <p className="text-sm text-gray-300">Indraprastha Gas Limited</p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 items-center">
        <Link
            to="/my-feedback-responses"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          📄 View My Feedback Responses
        </Link>
        <Link
          to="/training-request"
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded"
        >
          Training Request
        </Link>
        <Link
          to="/my-training-requests"
          className="bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded"
        >
          My Requests
        </Link>
        <Link
          to="/profile"
          className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded"
        >
          Profile
        </Link>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
