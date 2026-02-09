import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { PaymentModal } from '../components/PaymentModal';
import { api } from '../services/api';
import { mockUsers } from '../mockData';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import { ClipboardList, Plus, Sparkles, Clock, BookOpen, AlertCircle, MessageSquare, Trash2, CheckCircle, FileText, Users, Zap, ArrowRight, Calendar } from 'lucide-react';
import { calculateSuggestedPrice } from '../utils/pricing';

interface StudentDashboardProps {
  user: User;
  assignments: Assignment[];
  onCreateAssignment: (data: Partial<Assignment>, file?: File) => void;
  onRespondToQuote: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onOpenChat: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onNavigate: (view: any) => void;
  onUpdateStatus: (id: string, status: AssignmentStatus, feedback?: string) => void;
  preSelectedWriterId?: string | null;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, assignments, onCreateAssignment, onRespondToQuote, onOpenChat, onDeleteAssignment, onNavigate, onUpdateStatus, preSelectedWriterId }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [paymentAssignment, setPaymentAssignment] = useState<Assignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAsgn, setNewAsgn] = useState({ title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1 });
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);

  React.useEffect(() => {
    if (preSelectedWriterId) setShowCreateModal(true);
  }, [preSelectedWriterId]);

  React.useEffect(() => {
    if (newAsgn.subject && newAsgn.deadline) {
      setSuggestedPrice(calculateSuggestedPrice(newAsgn.subject, newAsgn.deadline, newAsgn.pages));
    }
  }, [newAsgn.subject, newAsgn.deadline, newAsgn.pages]);

  const recommendedWriters = useMemo(() => {
    if (!newAsgn.subject || newAsgn.subject.length < 3) return [];
    return mockUsers.filter(u => u.role === 'WRITER').slice(0, 3);
  }, [newAsgn.subject]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssignment({ ...newAsgn }, selectedFile || undefined);
    setShowCreateModal(false);
    setNewAsgn({ title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1 });
    setSelectedFile(null);
  };

  const handleDownload = (asgn: Assignment) => {
    if (!asgn.submission) return;
    const blob = new Blob([asgn.submission], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${asgn.title.replace(/\s+/g, '_')}_Final_Submission.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-2xl border-2 border-violet-500/30" />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {getTimeGreeting()}, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-white/50 mt-1">Let's tackle your assignments today</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={() => onNavigate('WRITERS')}
                className="flex-1 md:flex-none px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Users size={18} /> Browse Writers
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={18} /> New Request
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Assignments', value: assignments.length, icon: FileText, color: 'from-blue-500 to-cyan-500' },
            { label: 'In Progress', value: assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length, icon: Clock, color: 'from-fuchsia-500 to-orange-500' },
            { label: 'Awaiting Review', value: assignments.filter(a => a.status === AssignmentStatus.QUOTED || a.status === AssignmentStatus.SUBMITTED).length, icon: AlertCircle, color: 'from-violet-500 to-purple-500' },
            { label: 'Completed', value: assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Assignments Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Your Assignments</h2>
          </div>

          {assignments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Assignments Yet</h3>
              <p className="text-white/50 mb-6">Create your first assignment to get started with expert help</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all inline-flex items-center gap-2"
              >
                <Plus size={18} /> Create First Assignment
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {assignments.map((asgn, i) => (
                <motion.div
                  key={asgn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/30 transition-all group"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-white/5">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-white truncate group-hover:text-violet-400 transition-colors">{asgn.title}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-white/40">
                          <span className="uppercase font-semibold">{asgn.subject}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {new Date(asgn.deadline).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={asgn.status} />
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-xs text-white/40 mb-2">
                        <span>Progress</span>
                        <span>
                          {asgn.status === AssignmentStatus.COMPLETED ? '100%' :
                            asgn.status === AssignmentStatus.IN_PROGRESS ? '75%' :
                              asgn.status === AssignmentStatus.CONFIRMED ? '50%' : '10%'}
                        </span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${asgn.status === AssignmentStatus.COMPLETED ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
                          style={{ width: asgn.status === AssignmentStatus.COMPLETED ? '100%' : asgn.status === AssignmentStatus.IN_PROGRESS ? '75%' : asgn.status === AssignmentStatus.CONFIRMED ? '50%' : '10%' }}
                        />
                      </div>
                    </div>

                    {/* Quote Info */}
                    {asgn.status === AssignmentStatus.QUOTED && (
                      <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-violet-400">Writer Quote</span>
                          <span className="font-bold text-lg text-white">₹{asgn.quoted_amount}</span>
                        </div>
                        <p className="text-xs text-white/50 italic mb-3">"{asgn.writer_comment || 'I can help with this.'}"</p>
                        <div className="flex gap-2">
                          <button onClick={() => onRespondToQuote(asgn.id, 'ACCEPT')} className="flex-1 bg-violet-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-violet-700">Accept</button>
                          <button onClick={() => onRespondToQuote(asgn.id, 'REJECT')} className="flex-1 bg-white/10 text-red-400 py-2 rounded-lg text-xs font-bold hover:bg-white/20">Decline</button>
                        </div>
                      </div>
                    )}

                    {/* Budget */}
                    {asgn.status !== AssignmentStatus.QUOTED && (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-white">₹{asgn.budget > 0 ? asgn.budget : '--'}</span>
                        <span className="text-xs text-white/30">budget</span>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 bg-white/5 border-t border-white/5 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setViewingAssignment(asgn)}
                      className="bg-white/5 border border-white/10 text-white/70 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      Details
                    </button>

                    {(asgn.status === AssignmentStatus.CONFIRMED || asgn.status === AssignmentStatus.PENDING) && asgn.paymentStatus !== 'PAID' ? (
                      <button onClick={() => setPaymentAssignment(asgn)} className="bg-emerald-500 text-white py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                        Pay Now
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenChat(asgn)}
                        disabled={['PENDING', 'PENDING_REVIEW'].includes(asgn.status)}
                        className={`py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 ${['PENDING', 'PENDING_REVIEW'].includes(asgn.status)
                          ? 'bg-white/5 text-white/20 cursor-not-allowed'
                          : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20'
                          }`}
                      >
                        <MessageSquare size={16} /> Chat
                      </button>
                    )}

                    {(asgn.status === AssignmentStatus.PENDING || asgn.status === AssignmentStatus.PENDING_REVIEW) && (
                      <button onClick={() => setDeleteConfirmId(asgn.id)} className="col-span-2 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center justify-center gap-1 py-2">
                        <Trash2 size={12} /> Delete Request
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#0a0a12] border border-white/10 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="text-violet-400" /> New Assignment
                </h2>
                <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 hover:text-white">×</button>
              </div>

              <div className="overflow-y-auto p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Assignment Title</label>
                    <input type="text" required value={newAsgn.title} onChange={e => setNewAsgn({ ...newAsgn, title: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 outline-none transition-all" placeholder="e.g. Research Paper on AI Ethics" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Subject</label>
                      <input type="text" required value={newAsgn.subject} onChange={e => setNewAsgn({ ...newAsgn, subject: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 outline-none" placeholder="e.g. History" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-white/70 mb-2">Deadline</label>
                      <input type="date" required value={newAsgn.deadline} onChange={e => setNewAsgn({ ...newAsgn, deadline: e.target.value })} className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-violet-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-white/70">Pages</label>
                      <span className="text-xs font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded">~{newAsgn.pages * 250} words</span>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl flex items-center justify-between border border-white/10">
                      <button type="button" onClick={() => setNewAsgn(p => ({ ...p, pages: Math.max(1, p.pages - 1) }))} className="w-10 h-10 bg-white/10 rounded-lg font-bold text-white hover:bg-white/20">-</button>
                      <span className="font-bold text-lg text-white">{newAsgn.pages}</span>
                      <button type="button" onClick={() => setNewAsgn(p => ({ ...p, pages: p.pages + 1 }))} className="w-10 h-10 bg-white/10 rounded-lg font-bold text-white hover:bg-white/20">+</button>
                    </div>
                  </div>

                  {recommendedWriters.length > 0 && (
                    <div className="bg-violet-500/10 p-4 rounded-xl border border-violet-500/20">
                      <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-3">AI Matched Experts</p>
                      <div className="flex gap-3">
                        {recommendedWriters.map(w => (
                          <div key={w.id} className="bg-white/5 p-2 rounded-lg border border-white/10 flex items-center gap-2 pr-3">
                            <img src={w.avatar} className="w-8 h-8 rounded-full" />
                            <span className="text-xs font-bold text-white">{w.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-white/70 mb-2">Description</label>
                    <textarea required value={newAsgn.description} onChange={e => setNewAsgn({ ...newAsgn, description: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 outline-none h-24 resize-none" placeholder="Detailed instructions..." />
                  </div>

                  {suggestedPrice && (
                    <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-xl text-white shadow-lg">
                      <div>
                        <p className="text-xs font-medium text-white/80">AI Price Suggestion</p>
                        <p className="font-bold text-xl">₹{suggestedPrice}</p>
                      </div>
                      <button type="button" onClick={() => setNewAsgn({ ...newAsgn, budget: suggestedPrice })} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">
                        Apply
                      </button>
                    </div>
                  )}

                  <button type="submit" className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2">
                    Post Assignment <ArrowRight size={18} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Assignment Modal */}
      {viewingAssignment && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">{viewingAssignment.title}</h2>
              <button onClick={() => setViewingAssignment(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20">×</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/40 font-semibold uppercase">Budget</p>
                  <p className="font-bold text-white text-lg">₹{viewingAssignment.budget}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/40 font-semibold uppercase">Status</p>
                  <StatusBadge status={viewingAssignment.status} />
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/40 font-semibold uppercase">Subject</p>
                  <p className="font-bold text-white">{viewingAssignment.subject}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                  <p className="text-xs text-white/40 font-semibold uppercase">Deadline</p>
                  <p className="font-bold text-white">{new Date(viewingAssignment.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white/60 mb-2">Description</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap bg-white/5 p-4 rounded-xl border border-white/10">{viewingAssignment.description}</p>
              </div>

              {viewingAssignment.submission && (
                <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-emerald-400">Final Submission</h3>
                    <button onClick={() => handleDownload(viewingAssignment)} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700">Download</button>
                  </div>
                  {(viewingAssignment.status === AssignmentStatus.PENDING_REVIEW || viewingAssignment.status === AssignmentStatus.SUBMITTED) && (
                    <div className="flex gap-3">
                      <button onClick={() => onUpdateStatus(viewingAssignment.id, AssignmentStatus.COMPLETED)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700">Approve & Pay</button>
                      <button onClick={() => {
                        const reason = prompt("Revision feedback:");
                        if (reason) onUpdateStatus(viewingAssignment.id, AssignmentStatus.REVISION, reason);
                      }} className="flex-1 bg-fuchsia-500/20 text-fuchsia-400 py-3 rounded-xl font-bold hover:bg-fuchsia-500/30">Request Revision</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {paymentAssignment && (
        <PaymentModal isOpen={true} assignment={paymentAssignment} onClose={() => setPaymentAssignment(null)} onSuccess={() => { setPaymentAssignment(null); window.location.reload(); }} />
      )}

      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/80 z-[120] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a12] border border-white/10 p-6 rounded-2xl max-w-sm w-full text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-400">
              <AlertCircle size={28} />
            </div>
            <h3 className="font-bold text-lg text-white mb-2">Delete Assignment?</h3>
            <p className="text-sm text-white/50 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20">Cancel</button>
              <button onClick={() => { onDeleteAssignment(deleteConfirmId); setDeleteConfirmId(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700">Delete</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;




