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
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all font-medium ${activeTab === tab
        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
        : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'}`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="dark:block hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-purple-500/6 rounded-full blur-[120px]" />
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 glass-sidebar p-6 flex flex-col fixed h-full z-10 hidden lg:flex">
        <div className="mb-10 px-2">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2 font-display">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
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
        <div className="text-xs text-[var(--text-tertiary)] text-center">
          v2.5.0 (Stable)
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-8 relative z-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] capitalize font-display">{activeTab.toLowerCase()}</h2>
          <p className="text-[var(--text-secondary)] text-sm">Real-time platform insights and controls.</p>
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
                  <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                        <kpi.icon className="text-white" size={24} />
                      </div>
                      <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full flex items-center gap-1">
                        <TrendingUp size={12} /> +4.5%
                      </span>
                    </div>
                    <p className="text-[var(--text-secondary)] text-sm font-medium">{kpi.label}</p>
                    <h3 className="text-3xl font-bold text-[var(--text-primary)] mt-1">{kpi.value}</h3>
                  </motion.div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass-card p-6">
                  <h3 className="font-bold text-[var(--text-primary)] mb-6 font-display">Financial Performance</h3>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyTrends}>
                        <defs>
                          <linearGradient id="colorRevAdmin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-tertiary)' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-primary)' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRevAdmin)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-bold text-[var(--text-primary)] mb-6 font-display">Top Performers</h3>
                  <div className="space-y-4">
                    {topWriters.map((w, i) => (
                      <div key={w.id} className="flex items-center gap-3 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                        <span className="font-bold text-[var(--text-tertiary)] w-4">{i + 1}</span>
                        <img src={w.avatar} className="w-10 h-10 rounded-full border border-[var(--border)]" />
                        <div className="flex-1">
                          <p className="font-bold text-[var(--text-primary)] text-sm">{w.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)]">{w.completed} orders</p>
                        </div>
                        <span className="font-bold text-[var(--accent)] text-sm">₹{w.earnings}</span>
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
              <div className="glass-card overflow-hidden flex flex-col font-mono text-sm" style={{ background: 'var(--bg-secondary)' }}>
                <div className="bg-[var(--surface)] p-3 flex justify-between items-center border-b border-[var(--border)]">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-[var(--text-tertiary)] text-xs flex items-center gap-2"><Terminal size={12} /> server.log</span>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 text-[var(--text-secondary)]">
                  {logs.map((log, i) => (
                    <div key={i} className="flex gap-3 hover:bg-[var(--surface)] p-1 rounded">
                      <span className="text-[var(--text-tertiary)] shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                      <span className={`font-bold ${log.method === 'GET' ? 'text-cyan-500' : 'text-emerald-500'}`}>{log.method}</span>
                      <span className="break-all">{log.endpoint}</span>
                      <span className={`ml-auto font-bold ${log.statusCode >= 400 ? 'text-red-500' : 'text-emerald-500'}`}>{log.statusCode}</span>
                      <span className="text-[var(--text-tertiary)] w-16 text-right">{log.duration}ms</span>
                    </div>
                  ))}
                  <div className="animate-pulse text-[var(--accent)]">_</div>
                </div>
              </div>

              {/* Transactions */}
              <div className="glass-card overflow-hidden flex flex-col">
                <div className="p-4 border-b border-[var(--border)] bg-[var(--surface)]">
                  <h3 className="font-bold text-[var(--text-primary)] font-display">Escrow Ledger</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-[var(--surface)] text-xs uppercase text-[var(--text-tertiary)] sticky top-0">
                      <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-sm">
                      {transactions.map(tr => (
                        <tr key={tr.id} className="hover:bg-[var(--surface)] transition-colors">
                          <td className="px-6 py-3 font-mono text-[var(--text-tertiary)]">#{tr.id.slice(-6)}</td>
                          <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${tr.type === 'PAYMENT' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{tr.type}</span></td>
                          <td className="px-6 py-3 font-bold text-[var(--text-primary)]">₹{tr.amount}</td>
                          <td className="px-6 py-3 text-emerald-500 font-bold text-xs">{tr.status}</td>
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
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
                  <input type="text" placeholder="Search users..." value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl glass-input" />
                </div>
                <select value={userFilter} onChange={(e) => setUserFilter(e.target.value as any)}
                  className="px-4 py-3.5 rounded-xl glass-input">
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="WRITER">Writers</option>
                </select>
              </div>

              <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[var(--surface)] text-xs font-bold text-[var(--text-tertiary)] uppercase">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-[var(--surface)] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} className="w-10 h-10 rounded-full border border-[var(--border)]" />
                            <div>
                              <p className="font-bold text-[var(--text-primary)]">{u.name}</p>
                              <p className="text-xs text-[var(--text-tertiary)]">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded text-xs font-bold ${u.role === 'ADMIN' ? 'bg-violet-500/10 text-[var(--accent)]' :
                            u.role === 'WRITER' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-violet-500/10 text-[var(--accent)]'
                            }`}>{u.role}</span>
                        </td>
                        <td className="px-6 py-4">
                          {u.is_verified ? <span className="text-emerald-500 font-bold text-xs">Verified</span> : <span className="text-[var(--text-tertiary)] font-bold text-xs">Unverified</span>}
                        </td>
                        <td className="px-6 py-4">
                          {u.id !== user.id && (
                            <button onClick={() => handleDeleteUser(u.id)} className="p-2 hover:bg-red-500/10 text-red-500 dark:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && <div className="p-8 text-center text-[var(--text-tertiary)]">No users found.</div>}
              </div>
            </div>
          )}

          {activeTab === 'COMMUNICATION' && (
            <div className="glass-card p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                <Bell size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] font-display">Broadcast Center</h3>
              <p className="text-[var(--text-secondary)] mt-2">Send announcements and notifications to all users.</p>
              <div className="mt-6 max-w-lg mx-auto space-y-4">
                <input type="text" placeholder="Subject" className="w-full px-4 py-3.5 glass-input rounded-xl" />
                <textarea placeholder="Message..." className="w-full px-4 py-3 glass-input rounded-xl h-32 resize-none"></textarea>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-violet-500/30 ripple">
                  Send Broadcast
                </motion.button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Delete Modal */}
      <AnimatePresence>
        {userToDelete && (
          <div className="fixed inset-0 bg-[var(--overlay)] z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-6 max-w-sm w-full text-center" style={{ background: 'var(--bg-secondary)' }}>
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="text-red-500 dark:text-red-400" size={28} />
              </div>
              <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 font-display">Confirm Deletion</h3>
              <p className="text-[var(--text-secondary)] mb-6">Permanently remove this user?</p>
              <div className="flex gap-3">
                <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 glass text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--surface-hover)] transition-colors">Cancel</button>
                <button onClick={confirmDeleteUser} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
