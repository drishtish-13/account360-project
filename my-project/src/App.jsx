// File: src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import LoginTrigger from './components/LoginTrigger';
import FullLogin from './components/fullLogin';
import Dashboard from './pages/Dashboard';
import Configuration from './pages/Configuration';
import UploadDocuments from './pages/UploadDocuments';
import Labels from './pages/Labels';
import Messages from './pages/Messages';
import ReleaseNotes from './pages/ReleaseNotes';
import Services from './pages/Services';
import AppConfiguration from './pages/AppConfiguration';
import AI from './pages/AI.jsx';
import SyncLogs from './pages/SyncLogs';
import Utility from './pages/Utility';
import Ticket from './pages/Ticket';
import Report from './pages/Report';
import Support from './pages/Support';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Profile from './pages/ProfilePage.jsx';
import Contacts from './pages/Contacts';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// 👇 New AI assistant components
import AIAssistantButton from './components/AIAssistantButton';
import ChatSidebar from './components/ChatSidebar';

import './App.css';

const AppLayout = ({ children }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleSendMessage = async (input) => {
  try {
    const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/ai/ask`, { question: input });
    return response.data.answer;
  } catch (error) {
    console.error('❌ Error sending message to AI:', error);
    return 'Something went wrong while contacting the AI.';
  }
};

  return (
    <div className="flex h-screen relative">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="flex-1 overflow-auto bg-gray-100 p-6">
          {children}
        </div>
      </div>

      {/* 👇 AI assistant floating button and chat sidebar */}
      <AIAssistantButton onClick={() => setIsChatOpen(true)} />
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/master/configuration" element={<AppLayout><Configuration /></AppLayout>} />
      <Route path="/master/labels" element={<AppLayout><Labels /></AppLayout>} />
      <Route path="/master/messages" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/master/releasenotes" element={<AppLayout><ReleaseNotes /></AppLayout>} />
      <Route path="/master/services" element={<AppLayout><Services /></AppLayout>} />
      <Route path="/master/appconfiguration" element={<AppLayout><AppConfiguration /></AppLayout>} />
      <Route path="/report/uploaddocuments" element={<AppLayout><UploadDocuments /></AppLayout>} />
      <Route path="/ai" element={<AppLayout><AI /></AppLayout>} />
      <Route path="/synclogs" element={<AppLayout><SyncLogs /></AppLayout>} />
      <Route path="/utility" element={<AppLayout><Utility /></AppLayout>} />
      <Route path="/ticket" element={<AppLayout><Ticket /></AppLayout>} />
      <Route path="/report" element={<AppLayout><Report /></AppLayout>} />
      <Route path="/support" element={<AppLayout><Support /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      <Route path="/contacts" element={<AppLayout><Contacts /></AppLayout>} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token?" element={<ResetPassword />} />
    </Routes>
  );
}

function GoogleHandler({ onGoogleLogin }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('name', name || 'User');
      localStorage.setItem('email', email || '');
      console.log('✅ Google login complete. Moving to dashboard.');
      onGoogleLogin();
      navigate('/dashboard', { replace: true });
    }
  }, [location, onGoogleLogin, navigate]);

  return null;
}

function MainApp() {
  const [stage, setStage] = useState('trigger');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const path = location.pathname;

    if (token) {
      setStage('dashboard');
    } else if (
      path === '/google-continue' ||
      path === '/login' ||
      path === '/forgot-password' ||
      path.startsWith('/reset-password')
    ) {
      setStage('login');
    } else {
      setStage('trigger');
    }
  }, [location]);

  if (stage === 'trigger') {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
        <LoginTrigger onLoginClick={() => setStage('login')} />
      </div>
    );
  }

  if (stage === 'login') {
    return (
      <Routes>
        <Route path="/login" element={
          <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
            <FullLogin onLoginSuccess={() => {
              setStage('dashboard');
              navigate('/dashboard', { replace: true });
            }} />
          </div>
        } />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  if (stage === 'dashboard') {
    return <AppRoutes />;
  }

  return null;
}

export default function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/google-continue" element={<GoogleHandler onGoogleLogin={() => {}} />} />
          <Route path="*" element={<MainApp />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}
