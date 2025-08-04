import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { GoogleOAuthProvider } from '@react-oauth/google';

// ✅ Use createRoot as per React 18
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <GoogleOAuthProvider clientId="1049796310678-8pcp6u5vssfmemldnvulbc5tq83v4d63.apps.googleusercontent.com">
    <React.StrictMode>
      <App />
    </React.StrictMode>
  </GoogleOAuthProvider>
);

// Optional: For performance measuring
reportWebVitals();
