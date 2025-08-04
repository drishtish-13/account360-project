import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  ChevronDown,
  X,
  Filter,
  Calendar,
  HelpCircle,
  MessageSquare,
  Home,
  Menu,
  Plus
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const getPathLabel = (pathname) => {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length > 0
    ? segments.map((seg, i) => (
        <span key={i} className="capitalize">
          {seg.replace(/-/g, ' ')}
          {i < segments.length - 1 ? ' / ' : ''}
        </span>
      ))
    : 'Dashboard';
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New message received',
      description: 'You have a new message from John Doe',
      time: '2 minutes ago',
      type: 'message',
      read: false
    },
    {
      id: 2,
      title: 'Document uploaded',
      description: 'Q4_Report_2024.pdf has been uploaded',
      time: '15 minutes ago',
      type: 'document',
      read: false
    },
    {
      id: 3,
      title: 'System update',
      description: 'System maintenance completed successfully',
      time: '1 hour ago',
      type: 'system',
      read: true
    }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const { user } = useUser();
  const { updateUser } = useUser();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    updateUser('', '', '');
    navigate('/');
    window.location.reload();
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const profilePic =
    user.profilePic ||
    localStorage.getItem('profilePic') ||
    '/default-avatar.png';

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
    setShowSearch(false);
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - Mobile menu and breadcrumb */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb */}
            <div className="hidden sm:block">
              <nav className="flex items-center space-x-2 text-sm">
                <Link to="/dashboard" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Home size={16} />
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-700 font-medium">{getPathLabel(location.pathname)}</span>
              </nav>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-4 hidden md:block">
            <div className="relative" ref={searchRef}>
              {showSearch ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSearch(false)}
                    className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white hover:border-gray-300 transition-all duration-200"
                >
                  <Search size={16} className="mr-3 text-gray-400" />
                  <span>Search...</span>
                </button>
              )}
            </div>
          </div>

          {/* Right side - Actions and profile */}
          <div className="flex items-center space-x-3">
            {/* Search button for mobile */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <Search size={20} />
            </button>

            {/* Quick actions */}
            <div className="hidden sm:flex items-center space-x-2">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Plus size={20} />
              </button>
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
                <Calendar size={20} />
              </button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                <Bell size={20} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {unreadNotifications}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Notifications</h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {notification.type === 'message' && <MessageSquare size={16} className="text-blue-600" />}
                              {notification.type === 'document' && <Calendar size={16} className="text-green-600" />}
                              {notification.type === 'system' && <Settings size={16} className="text-orange-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center">
                        <Bell size={24} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">No notifications</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <Link
                      to="/notifications"
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
              >
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 group-hover:border-blue-300 transition-colors"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                    {user.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-500 truncate max-w-[120px]">
                    {user.email || 'user@example.com'}
                  </div>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform duration-200 ${
                    showDropdown ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                      <img
                        src={profilePic}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name || 'User'}</p>
                        <p className="text-xs text-gray-500">{user.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <User size={16} />
                      <span>Profile</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Settings size={16} />
                      <span>Settings</span>
                    </Link>
                    <Link
                      to="/help"
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <HelpCircle size={16} />
                      <span>Help & Support</span>
                    </Link>
                  </div>
                  <div className="border-t border-gray-200 py-2">
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                    >
                      <LogOut size={16} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile search bar */}
        {showSearch && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="flex items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => setShowSearch(false)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Mobile menu */}
      {showMobileMenu && (
        <div className="lg:hidden border-t border-gray-200 bg-gray-50" ref={mobileMenuRef}>
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/dashboard"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Profile
            </Link>
            <Link
              to="/settings"
              className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              onClick={() => setShowMobileMenu(false)}
            >
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;