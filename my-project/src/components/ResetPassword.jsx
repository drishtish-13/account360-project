import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token: paramToken } = useParams();
const queryToken = new URLSearchParams(window.location.search).get('token');
const token = paramToken || queryToken;

  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,20}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must meet complexity requirements');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3001/api/auth/reset-password/${token}`, { password });
      setMessage(res.data.message);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Reset Your Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New Password"
          className="border border-gray-300 p-2 rounded w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          className="border border-gray-300 p-2 rounded w-full"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}

        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
}
