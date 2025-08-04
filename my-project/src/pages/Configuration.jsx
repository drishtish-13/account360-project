// File: src/pages/Configuration.jsx
import React, { useState } from 'react';
import { Search, RefreshCcw, Eye, Edit, FileText } from 'lucide-react';

const originalData = new Array(30).fill(null).map((_, i) => ({
  client: 'All',
  group: 'Revamp App',
  groupType: 'Application Settings',
  application: 'All',
  key: `Key${i + 1}`,
  description: `Description for Key${i + 1}`,
  value: `${i + 1}`,
}));

export default function Configuration() {
  const [search, setSearch] = useState('');
  const [tenant, setTenant] = useState('All');
  const [data, setData] = useState(originalData);

  const handleRefresh = () => {
    setSearch('');
    setTenant('All');
    setData(originalData);
  };

  const filteredData = data.filter(row => {
    return (
      row.key.toLowerCase().includes(search.toLowerCase()) &&
      (tenant === 'All' || row.client === tenant)
    );
  });

  const handleActionClick = (action, row) => {
    alert(`${action} clicked for key: ${row.key}`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <div className="flex justify-between mb-4 items-end">
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-gray-500">1_Search</label>
            <div className="border rounded flex items-center px-2 bg-white shadow-sm">
              <Search size={16} className="text-gray-500" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="1_Search"
                className="outline-none text-sm px-2 py-1 w-40"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500">1_Tenant</label>
            <div className="flex items-center gap-1">
              <select
                value={tenant}
                onChange={e => setTenant(e.target.value)}
                className="border rounded px-3 py-1 text-sm w-40 shadow-sm"
              >
                <option>All</option>
                <option>Tenant A</option>
                <option>Tenant B</option>
              </select>
              <button
                onClick={handleRefresh}
                className="bg-blue-100 border border-blue-400 px-2 py-1 rounded flex items-center"
              >
                <RefreshCcw size={14} className="text-blue-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <table className="min-w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-2">Action</th>
            <th className="text-left px-4 py-2">Client</th>
            <th className="text-left px-4 py-2">Group</th>
            <th className="text-left px-4 py-2">Application</th>
            <th className="text-left px-4 py-2">Key</th>
            <th className="text-left px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((row, index) => (
            <tr key={index} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2 space-x-2">
                <button onClick={() => handleActionClick('View', row)}><Eye size={14} /></button>
                <button onClick={() => handleActionClick('Edit', row)}><Edit size={14} /></button>
                <button onClick={() => handleActionClick('Details', row)}><FileText size={14} /></button>
              </td>
              <td className="px-4 py-2">{row.client}</td>
              <td className="px-4 py-2">
                {row.group}
                <div className="text-xs text-gray-400">{row.groupType}</div>
              </td>
              <td className="px-4 py-2">{row.application}</td>
              <td className="px-4 py-2">
                {row.key}
                <div className="text-xs text-gray-400">{row.description}</div>
              </td>
              <td className="px-4 py-2">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">Showing 1 to {filteredData.length} of {originalData.length} entries</span>
        <div className="flex gap-1 items-center">
          <button className="px-2 py-1 border rounded">&laquo;</button>
          <button className="px-2 py-1 border rounded bg-blue-100">1</button>
          <button className="px-2 py-1 border rounded">2</button>
          <button className="px-2 py-1 border rounded">3</button>
          <span className="px-2">...</span>
          <button className="px-2 py-1 border rounded">30</button>
          <button className="px-2 py-1 border rounded">&raquo;</button>
          <select className="border rounded px-2 py-1 text-sm ml-2">
            <option>30</option>
            <option>50</option>
            <option>100</option>
          </select>
        </div>
      </div>
    </div>
  );
}
