import React, { useState } from 'react';
import { Complaint, User } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Check, X, AlertTriangle, LayoutDashboard, ListTodo } from 'lucide-react';

interface AdminViewProps {
  user: User;
  complaints: Complaint[];
  onUpdateStatus: (id: string, status: Complaint['status']) => void;
  onLogout: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ user, complaints, onUpdateStatus, onLogout }) => {
  const [activeView, setActiveView] = useState<'dashboard' | 'complaints'>('dashboard');

  // Stats calculation
  const total = complaints.length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;

  const dataStatus = [
    { name: 'Resolved', value: resolved, color: '#10B981' },
    { name: 'Pending', value: pending, color: '#F59E0B' },
    { name: 'In Progress', value: inProgress, color: '#3B82F6' },
  ];

  // Category stats for bar chart
  const categoryCount: Record<string, number> = {};
  complaints.forEach(c => {
    const cat = c.aiAnalysis?.category || 'Uncategorized';
    categoryCount[cat] = (categoryCount[cat] || 0) + 1;
  });
  const dataCategory = Object.keys(categoryCount).map(key => ({
    name: key,
    count: categoryCount[key]
  }));

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      {/* Sidebar / Topbar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
             <LayoutDashboard size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">Municipal Admin <span className="text-blue-600">Pro</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden md:block">Logged in as {user.name}</span>
          <button onClick={onLogout} className="text-sm font-semibold text-gray-600 hover:text-red-600">Logout</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar (Desktop) */}
        <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col p-4 space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'dashboard' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveView('complaints')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeView === 'complaints' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            <ListTodo size={18} />
            <span>Manage Grievances</span>
          </button>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {activeView === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Total Grievances</p>
                  <h3 className="text-3xl font-bold text-gray-800">{total}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Pending Action</p>
                  <h3 className="text-3xl font-bold text-yellow-600">{pending}</h3>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Resolution Rate</p>
                  <h3 className="text-3xl font-bold text-green-600">{total > 0 ? Math.round((resolved / total) * 100) : 0}%</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Status Distribution</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dataStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {dataStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Grievances by Category</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dataCategory}>
                      <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {activeView === 'complaints' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaint</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category & Priority</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">AI Suggestion</th>
                      <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {complaints.map(complaint => (
                      <tr key={complaint.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded bg-gray-200 flex-shrink-0 overflow-hidden">
                              {complaint.imageBase64 ? <img src={complaint.imageBase64} className="w-full h-full object-cover"/> : null}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{complaint.title}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{complaint.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-1">
                            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">{complaint.aiAnalysis?.category || 'General'}</span>
                            <span className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                              complaint.aiAnalysis?.priority === 'High' ? 'text-red-600 border-red-200 bg-red-50' : 
                              complaint.aiAnalysis?.priority === 'Medium' ? 'text-yellow-600 border-yellow-200 bg-yellow-50' : 
                              'text-green-600 border-green-200 bg-green-50'
                            }`}>
                              {complaint.aiAnalysis?.priority || 'Low'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                             complaint.status === 'Resolved' ? 'bg-green-100 text-green-800' :
                             complaint.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                             'bg-blue-100 text-blue-800'
                          }`}>
                            {complaint.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                           <p className="text-xs text-gray-600 italic max-w-xs">{complaint.aiAnalysis?.suggestedAction || 'No suggestion.'}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                              {complaint.status !== 'Resolved' && (
                                <button 
                                  onClick={() => onUpdateStatus(complaint.id, 'Resolved')}
                                  className="p-1.5 rounded hover:bg-green-100 text-green-600 transition" 
                                  title="Mark Resolved"
                                >
                                  <Check size={16} />
                                </button>
                              )}
                              {complaint.status === 'Pending' && (
                                <button 
                                  onClick={() => onUpdateStatus(complaint.id, 'In Progress')}
                                  className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition" 
                                  title="Mark In Progress"
                                >
                                  <AlertTriangle size={16} />
                                </button>
                              )}
                              <button 
                                onClick={() => onUpdateStatus(complaint.id, 'Rejected')}
                                className="p-1.5 rounded hover:bg-red-100 text-red-600 transition" 
                                title="Reject"
                              >
                                <X size={16} />
                              </button>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
      
      {/* Mobile nav */}
      <div className="md:hidden bg-white border-t border-gray-200 flex justify-around p-3 fixed bottom-0 w-full z-20">
         <button onClick={() => setActiveView('dashboard')} className={`flex flex-col items-center text-xs ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}>
           <LayoutDashboard size={20} />
           <span>Overview</span>
         </button>
         <button onClick={() => setActiveView('complaints')} className={`flex flex-col items-center text-xs ${activeView === 'complaints' ? 'text-blue-600' : 'text-gray-500'}`}>
           <ListTodo size={20} />
           <span>Grievances</span>
         </button>
      </div>
    </div>
  );
};

export default AdminView;
