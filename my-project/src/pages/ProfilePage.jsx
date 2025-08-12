import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { 
  User, 
  Mail, 
  Phone, 
  Camera, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  AlertCircle, 
  CheckCircle, 
  Shield,
  Settings,
  Key,
  LogOut
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useUser();
  const [formData, setFormData] = useState({ name: '', email: '', contact: '' });
  const [profilePic, setProfilePic] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [modal, setModal] = useState({ type: '', open: false });
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const fetchProfile = async () => {
    if (!token) {
      navigate('/');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = res.data;
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        contact: profileData.contact || '',
      });
      setProfilePic(profileData.profilePic || '');
      updateUser(profileData.name || '', profileData.email || '', profileData.profilePic || '');
    } catch (err) {
      setFeedback('Session expired or unauthorized. Please login again.');
      setModal({ type: 'error', open: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result);
        setUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/profile`,
        { ...formData, profilePic },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedData = res.data;
      setFormData({
        name: updatedData.name || '',
        email: updatedData.email || '',
        contact: updatedData.contact || '',
      });
      setProfilePic(updatedData.profilePic || '');
      updateUser(updatedData.name || '', updatedData.email || '', updatedData.profilePic || '');
      localStorage.setItem('name', updatedData.name || 'User');
      localStorage.setItem('email', updatedData.email || '');
      localStorage.setItem('profilePic', updatedData.profilePic || '');
      setEditMode(false);
      setFeedback('Profile updated successfully.');
      setModal({ type: 'success', open: true });
    } catch (err) {
      setFeedback('Failed to update profile. Please try again.');
      setModal({ type: 'error', open: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      updateUser('', '', '');
      navigate('/');
      window.location.reload();
    } catch (err) {
      setFeedback('Failed to delete account. Please try again.');
      setModal({ type: 'error', open: true });
      setLoading(false);
    }
  };

  const confirmAction = () => {
    if (modal.type === 'delete') handleDelete();
    else if (modal.type === 'error') {
      localStorage.clear();
      navigate('/');
      window.location.reload();
    }
    setModal({ ...modal, open: false });
  };

  if (loading && !editMode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 text-sm mt-1">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      <img
                        src={profilePic || '/default-avatar.png'}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {editMode && (
                      <label className="absolute bottom-0 right-0 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors">
                        <Camera size={12} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePicChange}
                          className="hidden"
                        />
                      </label>
                    )}
                    {uploading && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{formData.name || 'User'}</h3>
                    <p className="text-gray-600 text-sm">{formData.email || 'user@example.com'}</p>
                    {editMode && (
                      <p className="text-xs text-gray-500 mt-1">Click the camera icon to change photo</p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                        editMode 
                          ? 'border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      disabled={!editMode}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 cursor-not-allowed text-sm"
                      disabled
                      placeholder="your.email@example.com"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                        editMode 
                          ? 'border-gray-300 focus:ring-1 focus:ring-gray-400 focus:border-gray-400' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                      disabled={!editMode}
                      placeholder="Enter your contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Account Status
                    </label>
                    <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleUpdate}
                          disabled={loading}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          ) : (
                            <Save size={14} className="mr-2" />
                          )}
                          Save Changes
                        </button>
                        <button
                          onClick={() => setEditMode(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                        >
                          <X size={14} className="mr-2" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setEditMode(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        <Edit size={14} className="mr-2" />
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Account Actions */}
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Account Actions</h3>
              </div>
              <div className="p-4 space-y-2">
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <Settings size={14} className="mr-3 text-gray-500" />
                  Account Settings
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <Key size={14} className="mr-3 text-gray-500" />
                  Change Password
                </button>
                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                  <Shield size={14} className="mr-3 text-gray-500" />
                  Privacy Settings
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white border border-gray-200 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-sm font-medium text-gray-900">Danger Zone</h3>
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-600 mb-3">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => setModal({ type: 'delete', open: true })}
                  className="w-full flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 shadow-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                {modal.type === 'delete' && (
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                )}
                {modal.type === 'error' && (
                  <div className="p-2 bg-red-100 rounded-full">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                )}
                {modal.type === 'success' && (
                  <div className="p-2 bg-green-100 rounded-full">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                )}
                <h3 className="text-lg font-medium text-gray-900">
                  {modal.type === 'delete'
                    ? 'Delete Account'
                    : modal.type === 'error'
                    ? 'Error'
                    : 'Success'}
                </h3>
              </div>
              <p className="text-gray-600 text-sm mb-6">{feedback}</p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setModal({ ...modal, open: false })}
                >
                  Cancel
                </button>
                <button
                  className={`flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white transition-colors ${
                    modal.type === 'delete' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : modal.type === 'error'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                  onClick={confirmAction}
                >
                  {modal.type === 'delete' ? 'Delete' : 'OK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}