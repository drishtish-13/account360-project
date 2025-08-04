// File: src/pages/Contacts.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Mail, 
  Phone, 
  Briefcase,
  X,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  MoreVertical,
  Check,
  AlertCircle
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePrompt } from '../hooks/usePrompt';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', contact: '', profession: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [contactsPerPage, setContactsPerPage] = useState(10);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filterProfession, setFilterProfession] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const [pendingPath, setPendingPath] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:3001/api/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (showForm) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [showForm]);

  useEffect(() => {
    if (pendingPath && !showForm) {
      navigate(pendingPath);
      setPendingPath(null);
    }
  }, [pendingPath, showForm]);

  const handleAddOrUpdate = async () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const nameRegex = /^[a-zA-Z\s]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Name is required.';
    } else if (!nameRegex.test(formData.name)) {
      errors.name = 'Name must contain only letters.';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }

    if (!formData.contact.trim()) {
      errors.contact = 'Contact is required.';
    } else if (!/^\d+$/.test(formData.contact)) {
      errors.contact = 'Contact must contain only digits.';
    } else if (formData.contact.length !== 10) {
      errors.contact = 'Contact must be exactly 10 digits.';
    }

    if (!formData.profession) {
      errors.profession = 'Profession is required.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`http://localhost:3001/api/contacts/${editingId}`, formData);
      } else {
        await axios.post('http://localhost:3001/api/contacts', formData);
      }

      fetchContacts();
      setShowForm(false);
      setFormData({ name: '', email: '', contact: '', profession: '' });
      setEditingId(null);
      setFormErrors({});
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (contact) => {
    setFormData(contact);
    setEditingId(contact._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await axios.delete(`http://localhost:3001/api/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = 
      (contact.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.contact || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contact.profession || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesProfession = !filterProfession || contact.profession === filterProfession;
    
    return matchesSearch && matchesProfession;
  });

  const sortBy = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedContacts = React.useMemo(() => {
    let sortableContacts = [...filteredContacts];
    if (sortConfig.key !== null) {
      sortableContacts.sort((a, b) => {
        const aVal = a[sortConfig.key] ? a[sortConfig.key].toString().toLowerCase() : '';
        const bVal = b[sortConfig.key] ? b[sortConfig.key].toString().toLowerCase() : '';
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableContacts;
  }, [filteredContacts, sortConfig]);

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    }
    return null;
  };

  const indexOfLastContact = currentPage * contactsPerPage;
  const indexOfFirstContact = indexOfLastContact - contactsPerPage;
  const currentContacts = sortedContacts.slice(indexOfFirstContact, indexOfLastContact);

  const professions = [
    'Software Engineer', 'Data Scientist', 'Product Manager',
    'UX Designer', 'Sales Executive', 'Marketing Specialist',
    'HR Manager', 'Business Analyst', 'DevOps Engineer',
    'Finance Manager', 'Customer Support'
  ];

  const totalPages = Math.ceil(sortedContacts.length / contactsPerPage);

  const handleSelectAll = () => {
    if (selectedContacts.length === currentContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(currentContacts.map(contact => contact._id));
    }
  };

  const handleSelectContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
              <p className="text-gray-600 mt-1">Manage your contacts and team members</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Filter size={16} className="mr-2" />
                Filters
              </button>
              <button
                onClick={() => {
                  setShowForm(true);
                  setFormData({ name: '', email: '', contact: '', profession: '' });
                  setEditingId(null);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus size={16} className="mr-2" />
                Add Contact
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, contact or profession..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {showFilters && (
                <div className="lg:w-64">
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={filterProfession}
                    onChange={(e) => setFilterProfession(e.target.value)}
                  >
                    <option value="">All Professions</option>
                    {professions.map((profession, index) => (
                      <option key={index} value={profession}>{profession}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-600">Total Contacts</p>
                  <p className="text-2xl font-bold text-blue-900">{contacts.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-600">With Email</p>
                  <p className="text-2xl font-bold text-green-900">{contacts.filter(c => c.email).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Phone className="w-5 h-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-purple-600">With Phone</p>
                  <p className="text-2xl font-bold text-purple-900">{contacts.filter(c => c.contact).length}</p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-600">Professions</p>
                  <p className="text-2xl font-bold text-orange-900">{new Set(contacts.map(c => c.profession)).size}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Contacts</h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Showing {indexOfFirstContact + 1} to {Math.min(indexOfLastContact, sortedContacts.length)} of {sortedContacts.length} entries</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedContacts.length === currentContacts.length && currentContacts.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => sortBy('name')}
                      >
                        <div className="flex items-center gap-2">
                          Name
                          {getSortIndicator('name')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => sortBy('email')}
                      >
                        <div className="flex items-center gap-2">
                          Email
                          {getSortIndicator('email')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => sortBy('contact')}
                      >
                        <div className="flex items-center gap-2">
                          Contact
                          {getSortIndicator('contact')}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => sortBy('profession')}
                      >
                        <div className="flex items-center gap-2">
                          Profession
                          {getSortIndicator('profession')}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentContacts.map((contact, index) => (
                      <tr key={contact._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(contact._id)}
                            onChange={() => handleSelectContact(contact._id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {contact.name ? contact.name.charAt(0).toUpperCase() : '?'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{contact.contact}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {contact.profession}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleEdit(contact)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50 transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setContactToDelete(contact._id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="bg-white px-6 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-gray-700">Rows per page:</label>
                    <select
                      value={contactsPerPage}
                      onChange={(e) => {
                        setContactsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {[5, 10, 15, 20, 30].map((size) => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      if (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(currentPage - page) <= 1
                      ) {
                        return (
                          <button
                            key={page}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                              currentPage === page 
                                ? 'bg-blue-600 text-white' 
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        (page === currentPage - 2 && page > 1) ||
                        (page === currentPage + 2 && page < totalPages)
                      ) {
                        return <span key={page} className="px-2 text-gray-500">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Contact Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingId ? 'Edit Contact' : 'Add New Contact'}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleAddOrUpdate(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.name}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^[a-zA-Z\s]*$/.test(value)) {
                      setFormData({ ...formData, name: value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: '' });
                    }
                  }}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="user@company.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                  }}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength="10"
                  placeholder="Enter 10-digit number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.contact ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.contact}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      setFormData({ ...formData, contact: value });
                      if (formErrors.contact) setFormErrors({ ...formErrors, contact: '' });
                    }
                  }}
                />
                {formErrors.contact && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.contact}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profession <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    formErrors.profession ? 'border-red-300' : 'border-gray-300'
                  }`}
                  value={formData.profession}
                  onChange={(e) => {
                    setFormData({ ...formData, profession: e.target.value });
                    if (formErrors.profession) setFormErrors({ ...formErrors, profession: '' });
                  }}
                >
                  <option value="">Select Profession</option>
                  {professions.map((profession, index) => (
                    <option key={index} value={profession}>{profession}</option>
                  ))}
                </select>
                {formErrors.profession && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {formErrors.profession}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    editingId ? 'Update Contact' : 'Add Contact'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this contact? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setContactToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    await handleDelete(contactToDelete);
                    setShowDeleteConfirm(false);
                    setContactToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
