import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function FullLogin({ onLoginSuccess }) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [contact, setContact] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    if (queryParams.get('verifyFirst') === 'true') {
      setInfoMessage('⚠️ Please verify your email. We have sent a verification link to your email address.');
    }
    if (queryParams.get('verified') === 'true') {
      setInfoMessage('✅ Your email has been successfully verified. Please log in.');
    }
    if (queryParams.get('error')) {
      setInfoMessage('❌ Google authentication failed. Please try again.');
    }
  }, [location]);

  const validateInputs = () => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{6,20}$/;

    if (!emailRegex.test(email)) {
      setError('Please enter a valid company email in the format: name@company.xyz');
      return false;
    }

    if (isSignup) {
      if (name.length < 3 || name.length > 30) {
        setError('Name must be between 3 and 30 characters.');
        return false;
      }

      if (!/^\d{10}$/.test(contact)) {
        setError('Contact must be exactly 10 digits.');
        return false;
      }
    }

    if (!passwordRegex.test(password)) {
      setError('Password must be 6-20 characters, include uppercase, lowercase, number, and special character.');
      return false;
    }

    return true;
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateInputs()) return;
    setLoading(true);

    try {
      const url = isSignup
        ? `${process.env.REACT_APP_BACKEND_URL}/api/auth/register`
        : `${process.env.REACT_APP_BACKEND_URL}/api/auth/login`;

      const payload = isSignup
        ? { name, email, password, contact, profilePic }
        : { email, password };

      const response = await axios.post(url, payload);

      if (isSignup) {
        alert('✅ Registration successful! Please check your email and verify before logging in.');
        setIsSignup(false);
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('name', response?.data?.user?.name || 'User');
        localStorage.setItem('email', response?.data?.user?.email || '');
        localStorage.setItem('profilePic', response?.data?.user?.profilePic || '');

        updateUser(
          response?.data?.user?.name || 'User',
          response?.data?.user?.email || '',
          response?.data?.user?.profilePic || ''
        );

        onLoginSuccess();
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      setError(err.response?.data?.message || `${isSignup ? 'Signup' : 'Login'} failed`);
    }

    setLoading(false);
  };

  return (
    <div className="bg-white text-black p-8 rounded shadow w-full max-w-2xl grid md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Sign in with your corporate ID</h2>
        <button className="bg-sky-400 text-white px-4 py-2 rounded mb-2 hover:bg-sky-500 w-full">
          Gallo-Azure
        </button>
        <button className="bg-sky-400 text-white px-4 py-2 rounded mb-4 hover:bg-sky-500 w-full">
          Droisys-Azure
        </button>
        <div className="border-t border-gray-300 my-2" />
        <h2 className="text-lg font-semibold mb-4">Sign in with your social account</h2>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-600 w-full"
          onClick={() => {
            window.location.href = `${process.env.REACT_APP_BACKEND_URL}/api/auth/google`;
          }}
        >
          <img src="https://www.google.com/favicon.ico" alt="G" className="w-5 h-5" />
          Continue with Google
        </button>
        <p className="text-xs text-gray-600 mt-2">
          We won't post to any of your accounts without asking first
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col justify-center">
        <h2 className="text-lg font-semibold mb-4">
          {isSignup ? 'Sign up with your details' : 'Sign in with your email and password'}
        </h2>

        {infoMessage && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 p-2 rounded mb-2 text-sm">
            {infoMessage}
          </div>
        )}

        {isSignup && (
          <>
            <label className="block text-sm font-medium mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Full Name"
              className="border border-gray-300 p-2 rounded mb-1 w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <p className="text-xs text-gray-500 mb-2">3 to 30 characters</p>

            <label className="block text-sm font-medium mb-1">
              Contact Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contact Number"
              className="border border-gray-300 p-2 rounded mb-1 w-full"
              value={contact}
              onChange={(e) => {
                const onlyDigits = e.target.value.replace(/\D/g, '');
                setContact(onlyDigits);
              }}
              required
            />
            <p className="text-xs text-gray-500 mb-2">Exactly 10 digits</p>

            <label className="block text-sm font-medium mb-1">
              Profile Picture
            </label>
            <input
              type="file"
              accept="image/*"
              className="mb-2"
              onChange={handleProfilePicChange}
            />
            {profilePic && (
              <img
                src={profilePic}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover mb-2"
              />
            )}
          </>
        )}

        <label className="block text-sm font-medium mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          placeholder="Email"
          className="border border-gray-300 p-2 rounded mb-1 w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mb-2">Format: username@company.xyz (e.g., john@droisys.com)</p>

        <label className="block text-sm font-medium mb-1">
          Password <span className="text-red-500">*</span>
        </label>
        <input
          type="password"
          placeholder="Password"
          className="border border-gray-300 p-2 rounded mb-1 w-full"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <p className="text-xs text-gray-500 mb-4">
          6–20 characters with uppercase, lowercase, digit, special character
        </p>

        {!isSignup && (
          <Link to="/forgot-password" className="text-right text-sm text-blue-600 mb-4 hover:underline">
            Forgot your password?
          </Link>
        )}

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

        <button
          type="submit"
          className={`bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? (isSignup ? 'Signing up...' : 'Signing in...') : isSignup ? 'Sign up' : 'Sign in'}
        </button>

        <p className="text-sm text-gray-600 mt-4 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? 'Login here' : 'Sign up here'}
          </span>
        </p>
      </form>
    </div>
  );
}