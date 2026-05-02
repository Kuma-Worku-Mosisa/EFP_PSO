import React from 'react';
import { BarChart3, Download, Calendar, Filter, TrendingUp, Users, Shield, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

export const AdminReports = () => {
  const data = [
    { name: 'Jan', revenue: 4000, apps: 24 },
    { name: 'Feb', revenue: 3000, apps: 13 },
    { name: 'Mar', revenue: 2000, apps: 98 },
    { name: 'Apr', revenue: 2780, apps: 39 },
    { name: 'May', revenue: 1890, apps: 48 },
    { name: 'Jun', revenue: 2390, apps: 38 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-primary">System Reports</h2>
          <p className="text-sm text-gray-500">Comprehensive analytics and performance reports.</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-6 py-3 bg-white border rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Calendar className="w-5 h-5" />
            <span>Last 30 Days</span>
          </button>
          <button className="flex items-center space-x-2 px-6 py-3 blue-gradient text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all">
            <Download className="w-5 h-5" />
            <span>Generate PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Revenue Growth</h3>
            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12.5%</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#003366" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#003366" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#003366" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Application Volume</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">Total: 482</span>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="apps" fill="#FFD700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Agencies", value: "482", icon: <Shield className="text-primary" />, trend: "+5 this month" },
          { label: "Pending Renewals", value: "12", icon: <TrendingUp className="text-amber-500" />, trend: "Due in 7 days" },
          { label: "Total Personnel", value: "12,482", icon: <Users className="text-purple-500" />, trend: "+124 this week" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-4">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{item.label}</p>
              <p className="text-3xl font-bold text-primary">{item.value}</p>
            </div>
            <p className="text-xs text-gray-400">{item.trend}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
