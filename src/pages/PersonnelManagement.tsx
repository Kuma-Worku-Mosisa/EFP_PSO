import React from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Shield, CheckCircle, Clock, XCircle, Download, Upload } from 'lucide-react';
import { motion } from 'motion/react';

export const PersonnelManagement = () => {
  const staff = [
    { id: 1, name: "Kassa Tekle", role: "Security Officer", status: "Active", fayda: "ET-1234-5678-9012", joined: "Jan 2023" },
    { id: 2, name: "Mulugeta B.", role: "Supervisor", status: "Active", fayda: "ET-9876-5432-1098", joined: "Mar 2022" },
    { id: 3, name: "Selamawit G.", role: "Security Officer", status: "On Leave", fayda: "ET-4567-8901-2345", joined: "Jun 2023" },
    { id: 4, name: "Dawit H.", role: "Security Officer", status: "Active", fayda: "ET-2345-6789-0123", joined: "Sep 2023" },
    { id: 5, name: "Tewodros M.", role: "Training Officer", status: "Active", fayda: "ET-6789-0123-4567", joined: "Feb 2021" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">Personnel Management</h2>
          <p className="text-sm text-gray-500">Manage your security staff, training records, and Fayda ID verification.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Download className="w-5 h-5" />
            <span>Export HRMS</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            <UserPlus className="w-5 h-5" />
            <span>Add Personnel</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Staff", value: "124", icon: <Users className="text-primary" />, color: "bg-blue-50" },
          { label: "Active Duty", value: "112", icon: <CheckCircle className="text-green-500" />, color: "bg-green-50" },
          { label: "Pending Verification", value: "8", icon: <Clock className="text-amber-500" />, color: "bg-amber-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <div className={`p-4 rounded-xl ${stat.color}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-xl font-bold text-primary">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by name or Fayda ID..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button className="p-4 bg-white border rounded-2xl text-gray-500 hover:bg-gray-50 transition-all">
          <Filter className="w-6 h-6" />
        </button>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-8 py-6 font-bold">Name</th>
                <th className="px-8 py-6 font-bold">Role</th>
                <th className="px-8 py-6 font-bold">Fayda ID</th>
                <th className="px-8 py-6 font-bold">Joined</th>
                <th className="px-8 py-6 font-bold">Status</th>
                <th className="px-8 py-6 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {staff.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary font-bold border-2 border-white shadow-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="font-bold text-primary text-sm">{person.name}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600">{person.role}</td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-mono font-bold text-gray-400">{person.fayda}</span>
                  </td>
                  <td className="px-8 py-6 text-sm text-gray-600">{person.joined}</td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      person.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {person.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-primary/5 text-primary rounded-lg transition-colors" title="View Profile">
                        <Shield className="w-5 h-5" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 text-gray-400 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
