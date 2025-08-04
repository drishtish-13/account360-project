import React, { useState } from 'react';
import axios from 'axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://localhost:3001/api/auth/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link');
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded shadow text-black">
      <h2 className="text-xl font-semibold mb-4">Forgot Password</h2>
      <p className="text-sm text-gray-600 mb-4">Enter your registered email to receive a reset link.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 rounded w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
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
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
    </div>
  );
}
