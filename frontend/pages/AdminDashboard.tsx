import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assignment, AssignmentStatus, SystemLog, Transaction } from '../types';
import StatusBadge from '../components/StatusBadge';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, PieChart, Pie, ComposedChart, Line
} from 'recharts';
import { Activity, Users, DollarSign, Server, Bell, Settings, Terminal, Shield, Search, Trash2, TrendingUp } from 'lucide-react';

interface AdminDashboardProps {
  user: User;
  assignments: Assignment[];
  users: User[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, assignments, users }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HEALTH' | 'REPORTS' | 'COMMUNICATION' | 'SUPPORT' | 'SETTINGS' | 'USERS'>('OVERVIEW');
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userFilter, setUserFilter] = useState<'ALL' | 'STUDENT' | 'WRITER'>('ALL');
  const [userSearch, setUserSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'HEALTH') {
      api.getSystemLogs().then(setLogs);
      api.getTransactions().then(setTransactions);
    }
    if (activeTab === 'USERS') {
      loadUsers();
    }
  }, [activeTab, userFilter]);

  const loadUsers = async () => {
    const users = await api.getUsers(userFilter);
    setAllUsers(users);
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()));
  }, [allUsers, userSearch]);

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      await api.deleteUser(userToDelete);
      setAllUsers(prev => prev.filter(u => u.id !== userToDelete));
      setUserToDelete(null);
    }
  };

  const totalRevenue = assignments.reduce((sum, a) => sum + a.budget, 0);
  const totalStudents = users.filter(u => u.role === 'STUDENT').length;
  const totalWriters = users.filter(u => u.role === 'WRITER').length;

  const monthlyTrends = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: Record<string, { name: string, orders: number, revenue: number }> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = months[d.getMonth()];
      data[monthName] = { name: monthName, orders: 0, revenue: 0 };
    }
    assignments.forEach(asgn => {
      const date = new Date(asgn.createdAt);
      const monthName = months[date.getMonth()];
      if (data[monthName]) {
        data[monthName].orders += 1;
        data[monthName].revenue += asgn.budget;
      }
    });
    return Object.values(data);
  }, [assignments]);

  const topWriters = useMemo(() => {
    return users
      .filter(u => u.role === 'WRITER')
      .map(writer => {
        const writerAsgn = assignments.filter(a => a.writerId === writer.id);
        const completed = writerAsgn.filter(a => a.status === AssignmentStatus.COMPLETED).length;
        const earnings = writerAsgn.reduce((sum, a) => sum + a.budget, 0);
        return { ...writer, completed, earnings };
      })
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 5);
  }, [users, assignments]);

  const NavButton = ({ tab, icon: Icon, label }: { tab: string, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium ${activeTab === tab ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[#050508]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-white/5 backdrop-blur-xl border-r border-white/10 p-6 flex flex-col fixed h-full z-10 hidden lg:flex">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
              <Shield className="text-white" size={20} />
            </div>
            Admin
          </h1>
        </div>
        <div className="space-y-2 flex-1">
          <NavButton tab="OVERVIEW" icon={Activity} label="Overview" />
          <NavButton tab="USERS" icon={Users} label="User Management" />
          <NavButton tab="HEALTH" icon={Server} label="System Health" />
          <NavButton tab="COMMUNICATION" icon={Bell} label="Broadcasts" />
          <NavButton tab="SETTINGS" icon={Settings} label="Settings" />
        </div>
        <div className="text-xs text-white/30 text-center">
          v2.5.0 (Stable)
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white capitalize">{activeTab.toLowerCase()}</h2>
          <p className="text-white/50 text-sm">Real-time platform insights and controls.</p>
        </div>

        <AnimatePresence mode='wait'>
          {activeTab === 'OVERVIEW' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, color: 'from-violet-500 to-purple-500', icon: DollarSign },
                  { label: 'Active Students', value: totalStudents, color: 'from-blue-500 to-cyan-500', icon: Users },
                  { label: 'Writers Online', value: totalWriters, color: 'from-violet-500 to-purple-500', icon: Activity },
                  { label: 'Server Load', value: '12%', color: 'from-emerald-500 to-green-500', icon: Server }
                ].map((kpi, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center`}>
                        <kpi.icon className="text-white" size={24} />
                      </div>
                      <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} /> +4.5%
                      </span>
                    </div>
                    <p className="text-white/50 text-sm font-medium">{kpi.label}</p>
                    <h3 className="text-3xl font-bold text-white mt-1">{kpi.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-6">Financial Performance</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrends}>
                        <defs>
                          <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRevAdmin)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <h3 className="font-bold text-white mb-6">Top Performers</h3>
                  <div className="space-y-4">
                    {topWriters.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-3 pb-3 border-b border-white/5 last:border-0 last:pb-0">
                        <span className="font-bold text-white/30 w-4">{i + 1}</span>
                        <img src={w.avatar} className="w-10 h-10 rounded-full" />
                        <div className="flex-1">
                          <p className="font-bold text-white text-sm">{w.name}</p>
                          <p className="text-xs text-white/40">{w.completed} orders</p>
                        </div>
                        <span className="font-bold text-violet-400 text-sm">₹{w.earnings}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'HEALTH' && (
            <div className="grid lg:grid-cols-2 gap-6 h-[calc(100vh-140px)]">
              {/* Console */}
              <div className="bg-[#0d0d1a] rounded-2xl border border-white/10 overflow-hidden flex flex-col font-mono text-sm">
                <div className="bg-white/5 p-3 flex justify-between items-center border-b border-white/10">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-white/40 text-xs flex items-center gap-2"><Terminal size={12} /> server.log</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-white/70">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-white/5 p-1 rounded">
                      <span className="text-white/30 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`font-bold ${log.method === 'GET' ? 'text-cyan-400' : 'text-emerald-400'}`}>{log.method}</span>
                      <span className="break-all">{log.endpoint}</span>
                      <span className={`ml-auto font-bold ${log.statusCode >= 400 ? 'text-red-500' : 'text-emerald-400'}`}>{log.statusCode}</span>
                      <span className="text-white/30 w-16 text-right">{log.duration}ms</span>
                    </div>
                  ))}
                  <div className="animate-pulse text-violet-500">_</div>
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <h3 className="font-bold text-white">Escrow Ledger</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white/5 text-xs uppercase text-white/40 sticky top-0">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                      {transactions.map(tr => (
                        <tr key={tr.id} className="hover:bg-white/5">
                          <td className="px-6 py-3 font-mono text-white/40">#{tr.id.slice(-6)}</td>
                          <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${tr.type === 'PAYMENT' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{tr.type}</span></td>
                          <td className="px-6 py-3 font-bold text-white">₹{tr.amount}</td>
                          <td className="px-6 py-3 text-emerald-400 font-bold text-xs">{tr.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-violet-500"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value as any)}
                  className="px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                >
                  <option value="ALL" className="bg-slate-900">All Roles</option>
                  <option value="STUDENT" className="bg-slate-900">Students</option>
                  <option value="WRITER" className="bg-slate-900">Writers</option>
                </select>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-white/5 text-xs font-bold text-white/40 uppercase">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} className="w-10 h-10 rounded-full" />
                            <div>
                              <p className="font-bold text-white">{u.name}</p>
                              <p className="text-xs text-white/40">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-violet-500/10 text-violet-400' :
                            u.role === 'WRITER' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-violet-500/10 text-violet-400'
                            }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_verified ? <span className="text-emerald-400 font-bold text-xs">Verified</span> : <span className="text-white/30 font-bold text-xs">Unverified</span>}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="p-8 text-center text-white/30">No users found.</div>}
              </div>
            </div>
          )}

          {activeTab === 'COMMUNICATION' && (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Bell size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">Broadcast Center</h3>
              <p className="text-white/50 mt-2">Send announcements and notifications to all users.</p>
              <div className="mt-6 max-w-lg mx-auto space-y-4">
                <input type="text" placeholder="Subject" className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 outline-none focus:border-violet-500" />
                <textarea placeholder="Message..." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl h-32 text-white placeholder-white/30 outline-none focus:border-violet-500 resize-none"></textarea>
                <button className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-violet-500/30">Send Broadcast</button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a12] border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trash2 className="text-red-400" size={28} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Confirm Deletion</h3>
            <p className="text-white/50 mb-6">Permanently remove this user?</p>
            <div className="flex gap-3">
              <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20">Cancel</button>
              <button onClick={confirmDeleteUser} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;




