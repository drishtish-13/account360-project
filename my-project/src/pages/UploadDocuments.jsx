// File: src/pages/Dashboard.jsx
import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-100">
      

      {/* Main content */}
      <div className="flex-1 flex flex-col">
      

        <div className="p-6 overflow-auto">
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-lg font-semibold mb-4">Upload Documents Report</h2>
            <div className="flex gap-4 mb-4">
              <select className="border px-3 py-2 rounded">
                <option>All</option>
              </select>
              <select className="border px-3 py-2 rounded">
                <option>All</option>
              </select>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                1. Generate Report
              </button>
              <button className="border px-3 py-2 rounded">🔍</button>
            </div>
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-4 py-2">Action</th>
                  <th className="border px-4 py-2">User</th>
                  <th className="border px-4 py-2">Pending/Upload</th>
                  <th className="border px-4 py-2">Account Photos</th>
                  <th className="border px-4 py-2">Notes</th>
                  <th className="border px-4 py-2">Objectives</th>
                  <th className="border px-4 py-2">Survey</th>
                  <th className="border px-4 py-2">Others</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 py-6">
                    🔍 Please adjust your filters & Click on generate report.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
