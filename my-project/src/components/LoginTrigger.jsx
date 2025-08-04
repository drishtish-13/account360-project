import React from 'react';
import { useNavigate } from 'react-router-dom';  // ✅ Import useNavigate

export default function LoginTrigger({ onLoginClick }) {
  const navigate = useNavigate();  // ✅ Initialize navigate

  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    navigate('/login');  // ✅ Navigate to the correct login route
  };

  return (
    <div className="text-white max-w-md w-full p-10 text-center bg-black/50 rounded-xl shadow-xl">
      <h1 className="text-3xl font-semibold mb-6">AI Console</h1>
      <button
        onClick={handleLoginClick}  // ✅ Updated to use handleLoginClick
        className="bg-white text-black px-6 py-3 font-bold rounded hover:bg-gray-300 transition-all"
      >
        Login ↪
      </button>
    </div>
  );
}
