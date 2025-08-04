import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const GoogleContinue = () => {
  const navigate = useNavigate();
  const { updateUser } = useUser();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const profilePic = params.get('profilePic');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('name', name);
      localStorage.setItem('email', email);

      // Only update profilePic if present and not empty
      if (profilePic && profilePic !== 'undefined' && profilePic !== '') {
        localStorage.setItem('profilePic', profilePic);
        updateUser(name, email, profilePic);
      } else {
        // Use existing profilePic from localStorage if available
        const existingPic = localStorage.getItem('profilePic') || '';
        updateUser(name, email, existingPic);
      }

      navigate('/dashboard');
    } else {
      alert('Google login failed!');
      navigate('/');
    }
  }, [navigate, updateUser]);

  return <div>Redirecting...</div>;
};

export default GoogleContinue;