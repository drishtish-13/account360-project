// File: src/components/Sidebar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Settings, MessageSquare, Tag, FileText,
  Server, Sliders, Cpu, Database, Activity, HelpCircle, Ticket,
  ClipboardList, LifeBuoy, ChevronDown, ChevronRight, Shield, PenTool,
  Home, User, LogOut, Menu, X, Search, Bell, Plus, Sparkles
} from 'lucide-react';
import { useUser } from '../context/UserContext';

const SidebarSection = ({ title, links, isOpen, onToggle, isCollapsed }) => {
  return (
    <div className="mb-1">
      <div
        onClick={onToggle}
        className={`flex items-center justify-between cursor-pointer rounded-lg transition-all duration-200 group ${
          isCollapsed ? 'p-2 mx-2' : 'p-3 mx-2'
        } hover:bg-blue-50 hover:text-blue-700`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-all duration-200 ${
            isCollapsed ? 'p-1.5' : 'p-2'
          }`}>
            {React.cloneElement(links.icon, { 
              size: isCollapsed ? 16 : 18,
              className: "text-gray-600 group-hover:text-blue-600 transition-colors" 
            })}
          </div>
          {!isCollapsed && (
            <span className="font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              {title}
            </span>
          )}
        </div>
        {!isCollapsed && (
          <div className="transition-transform duration-200">
            {isOpen ? (
              <ChevronDown size={16} className="text-gray-500 group-hover:text-blue-500" />
            ) : (
              <ChevronRight size={16} className="text-gray-500 group-hover:text-blue-500" />
            )}
          </div>
        )}
      </div>
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className={`space-y-1 ${isCollapsed ? 'ml-2' : 'ml-11'}`}>
          {links.items.map(link => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `block rounded-lg transition-all duration-200 ${
                  isCollapsed 
                    ? 'p-2 mx-2' 
                    : 'px-3 py-2 mx-2'
                } ${
                  isActive 
                    ? 'bg-blue-100 text-blue-700 font-medium shadow-sm border-l-4 border-blue-500' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              {isCollapsed ? (
                <div className="flex justify-center">
                  {React.cloneElement(link.icon || <div />, { size: 16 })}
                </div>
              ) : (
                <span className="text-sm">{link.label}</span>
              )}
            </NavLink>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const [openSections, setOpenSections] = useState({
    master: true,
    ai: false,
    sync: false,
    utility: false,
    ticket: false,
    report: false,
    support: false,
    permissions: false,
    brand: false,
    contact: false
  });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useUser();

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const navigationItems = [
    {
      title: "Master",
      key: "master",
      links: {
        icon: <Settings />,
        items: [
          { path: '/master/configuration', label: 'Configuration', icon: <Sliders size={16} /> },
          { path: '/master/labels', label: 'Labels', icon: <Tag size={16} /> },
          { path: '/master/messages', label: 'Messages', icon: <MessageSquare size={16} /> },
          { path: '/master/releasenotes', label: 'Release Notes', icon: <FileText size={16} /> },
          { path: '/master/services', label: 'Services', icon: <Server size={16} /> },
          { path: '/master/appconfiguration', label: 'App Configuration', icon: <Settings size={16} /> },
        ]
      }
    },
    {
      title: "AI",
      key: "ai",
      links: {
        icon: <Cpu />,
        items: [{ path: '/ai', label: 'AI Assistant', icon: <Sparkles size={16} /> }]
      }
    },
    {
      title: "Sync & Logs",
      key: "sync",
      links: {
        icon: <Database />,
        items: [{ path: '/synclogs', label: 'Sync & Logs', icon: <Activity size={16} /> }]
      }
    },
    {
      title: "Utility",
      key: "utility",
      links: {
        icon: <Activity />,
        items: [{ path: '/utility', label: 'Utility', icon: <Settings size={16} /> }]
      }
    },
    {
      title: "Ticket",
      key: "ticket",
      links: {
        icon: <Ticket />,
        items: [{ path: '/ticket', label: 'Ticket Management', icon: <Ticket size={16} /> }]
      }
    },
    {
      title: "Report",
      key: "report",
      links: {
        icon: <ClipboardList />,
        items: [
          { path: '/report', label: 'Reports', icon: <ClipboardList size={16} /> },
          { path: '/report/uploaddocuments', label: 'Upload Documents', icon: <FileText size={16} /> },
        ]
      }
    },
    {
      title: "Support",
      key: "support",
      links: {
        icon: <LifeBuoy />,
        items: [{ path: '/support', label: 'Support Center', icon: <HelpCircle size={16} /> }]
      }
    },
    {
      title: "Permissions",
      key: "permissions",
      links: {
        icon: <Shield />,
        items: [{ path: '/permissions', label: 'User Permissions', icon: <Shield size={16} /> }]
      }
    },
    {
      title: "Brand Annotation",
      key: "brand",
      links: {
        icon: <PenTool />,
        items: [{ path: '/brand-annotation', label: 'Brand Annotation', icon: <PenTool size={16} /> }]
      }
    },
    {
      title: "Contact",
      key: "contact",
      links: {
        icon: <FileText />,
        items: [{ path: '/contacts', label: 'Contact Management', icon: <User size={16} /> }]
      }
    }
  ];

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 h-screen flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Home className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-gray-900">Account360</h1>
                <p className="text-xs text-gray-500">Console</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-gray-600 hover:text-gray-900"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-100">
          <div className="space-y-2">
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 text-gray-600">
              <div className="p-1.5 rounded-md bg-blue-100">
                <Search size={16} className="text-blue-600" />
              </div>
              <span className="text-sm font-medium">Quick Search</span>
            </button>
            <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-green-50 hover:text-green-700 transition-all duration-200 text-gray-600">
              <div className="p-1.5 rounded-md bg-green-100">
                <Plus size={16} className="text-green-600" />
              </div>
              <span className="text-sm font-medium">New Item</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-auto">
        <nav className="p-2 space-y-1">
          {/* Dashboard Link */}
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => 
              `flex items-center gap-3 rounded-lg transition-all duration-200 ${
                isCollapsed ? 'p-2 mx-2 justify-center' : 'p-3 mx-2'
              } ${
                isActive 
                  ? 'bg-blue-100 text-blue-700 font-medium shadow-sm border-l-4 border-blue-500' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
          >
            <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-blue-100 transition-colors">
              <LayoutDashboard size={isCollapsed ? 16 : 18} />
            </div>
            {!isCollapsed && <span>Dashboard</span>}
          </NavLink>

          {/* Navigation Sections */}
          {!isCollapsed && navigationItems.map((item) => (
            <SidebarSection
              key={item.key}
              title={item.title}
              links={item.links}
              isOpen={openSections[item.key]}
              onToggle={() => toggleSection(item.key)}
              isCollapsed={isCollapsed}
            />
          ))}

          {/* Collapsed Navigation Icons */}
          {isCollapsed && (
            <div className="space-y-2">
              {navigationItems.map((item) => (
                <div
                  key={item.key}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group mx-2"
                  title={item.title}
                  onClick={() => toggleSection(item.key)}
                >
                  <div className="p-1.5 rounded-md bg-gray-100 group-hover:bg-blue-100 transition-colors flex justify-center">
                    {React.cloneElement(item.links.icon, { 
                      size: 16,
                      className: "text-gray-600 group-hover:text-blue-600 transition-colors" 
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </div>

      {/* Footer - Simplified */}
      <div className="border-t border-gray-200 bg-gray-50">
        <div className="p-4 text-center">
          <div className="text-xs text-gray-500">
            <div className="font-medium text-gray-600 mb-1">V.S1.0.1.3</div>
            <div>Powered by Account360</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
