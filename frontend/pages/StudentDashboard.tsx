import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { PaymentModal } from '../components/PaymentModal';
import { api } from '../services/api';
import { mockUsers } from '../mockData';
import EmptyState from '../components/EmptyState';
import ProgressBar from '../components/ProgressBar';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import { ClipboardList, Plus, Sparkles, Clock, BookOpen, AlertCircle, MessageSquare, Trash2, CheckCircle, FileText, Users, Zap, ArrowRight, Calendar, Search, Download, Eye } from 'lucide-react';
import { calculateSuggestedPrice } from '../utils/pricing';
import { Modal } from '../components/Modal';

interface StudentDashboardProps {
  user: User;
  assignments: Assignment[];
  messages: import('../types').ChatMessage[];
  onCreateAssignment: (data: Partial<Assignment>, file?: File) => void;
  onRespondToQuote: (id: string, action: 'ACCEPT' | 'REJECT') => void;
  onOpenChat: (assignment: Assignment) => void;
  onDeleteAssignment: (id: string, reason?: string) => void;
  onNavigate: (view: any) => void;
  onUpdateStatus: (id: string, status: AssignmentStatus, feedback?: string) => void;
  preSelectedWriterId?: string | null;
  users?: User[];
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, assignments, messages = [], onCreateAssignment, onRespondToQuote, onOpenChat, onDeleteAssignment, onNavigate, onUpdateStatus, preSelectedWriterId, users = [] }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAssignment, setViewingAssignment] = useState<Assignment | null>(null);
  const [paymentAssignment, setPaymentAssignment] = useState<Assignment | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [newAsgn, setNewAsgn] = useState<{
    title: string; subject: string; budget: number; deadline: string; description: string; pages: number;
    preferredHandwritingStyles: string[]; visibility: 'ALL_WRITERS' | 'SELECTED_STYLES';
  }>({ 
    title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1,
    preferredHandwritingStyles: [], visibility: 'ALL_WRITERS'
  });
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return assignments;
    return assignments.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.subject.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [assignments, searchQuery]);

  const activeAssignments = useMemo(() => filteredAssignments.filter(a => a.status !== AssignmentStatus.COMPLETED), [filteredAssignments]);
  const completedAssignments = useMemo(() => filteredAssignments.filter(a => a.status === AssignmentStatus.COMPLETED), [filteredAssignments]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateAssignment({ 
      ...newAsgn,
      assignedWriterId: preSelectedWriterId || undefined
    }, selectedFile || undefined);
    setShowCreateModal(false);
    setNewAsgn({ title: '', subject: '', budget: 50, deadline: '', description: '', pages: 1, preferredHandwritingStyles: [], visibility: 'ALL_WRITERS' });
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

  const stats = [
    { label: 'Total', value: assignments.length, icon: FileText, color: 'from-blue-500 to-cyan-500' },
    { label: 'In Progress', value: assignments.filter(a => a.status === AssignmentStatus.IN_PROGRESS).length, icon: Clock, color: 'from-fuchsia-500 to-orange-500' },
    { label: 'Awaiting Review', value: assignments.filter(a => a.status === AssignmentStatus.QUOTED || a.status === AssignmentStatus.SUBMITTED || a.status === AssignmentStatus.PENDING_REVIEW).length, icon: AlertCircle, color: 'from-violet-500 to-purple-500' },
    { label: 'Completed', value: assignments.filter(a => a.status === AssignmentStatus.COMPLETED).length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' }
  ];

  const getProgress = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.COMPLETED: return 100;
      case AssignmentStatus.SUBMITTED: return 90;
      case AssignmentStatus.IN_PROGRESS: return 75;
      case AssignmentStatus.CONFIRMED: return 50;
      case AssignmentStatus.QUOTED: return 35;
      case AssignmentStatus.PENDING_REVIEW: return 20;
      case AssignmentStatus.PENDING_WRITER_ACCEPTANCE: return 20;
      case AssignmentStatus.REJECTED: return 0;
      default: return 10;
    }
  };

  const renderAssignmentCard = (asgn: Assignment, i: number) => {
    const unreadCount = messages.filter(m => m.assignmentId === asgn.id && !m.isRead && m.senderId !== user.id).length;
    return (
      <motion.div layout key={asgn.id}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
        transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
        className="glass-card overflow-hidden group">
        {/* Card Header */}
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{asgn.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-[var(--text-tertiary)]">
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
          
          {/* Handwriting Styles */}
          {asgn.visibility === 'SELECTED_STYLES' && asgn.preferredHandwritingStyles && asgn.preferredHandwritingStyles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {asgn.preferredHandwritingStyles.map(style => (
                <span key={style} className="px-2 py-1 bg-[var(--surface-hover)] border border-white/5 rounded text-[10px] font-bold text-[var(--text-secondary)] uppercase flex items-center gap-1">
                  <Sparkles size={10} className="text-violet-400" />
                  {style}
                </span>
              ))}
            </div>
          )}

          {/* Progress */}
          <div>
            <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-2">
              <span>Progress</span>
              <span>{getProgress(asgn.status)}%</span>
            </div>
            <div className="h-2 bg-[var(--surface)] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${getProgress(asgn.status)}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-full rounded-full ${asgn.status === AssignmentStatus.COMPLETED ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-fuchsia-500'}`}
              />
            </div>
          </div>

          {/* Quote Info */}
          {asgn.status === AssignmentStatus.QUOTED && (
            <div className="bg-[var(--accent-muted)] border border-[var(--accent)]/20 p-4 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-[var(--accent)]">Writer Quote</span>
                <span className="font-bold text-lg text-[var(--text-primary)]">₹{asgn.quoted_amount}</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] italic mb-3">"{asgn.writer_comment || 'I can help with this.'}"</p>
              <div className="flex gap-2">
                <button onClick={() => onRespondToQuote(asgn.id, 'ACCEPT')} className="flex-1 bg-[var(--accent)] text-white py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Accept</button>
                <button onClick={() => onRespondToQuote(asgn.id, 'REJECT')} className="flex-1 bg-[var(--surface)] text-red-500 dark:text-red-400 py-2 rounded-lg text-xs font-bold hover:bg-[var(--surface-hover)]">Decline</button>
              </div>
            </div>
          )}

          {/* Direct Hire Pending */}
          {asgn.status === AssignmentStatus.PENDING_WRITER_ACCEPTANCE && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Awaiting Writer Response</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">Your hire request has been sent. The writer can accept, negotiate, or decline.</p>
            </div>
          )}

          {/* Direct Hire Rejected */}
          {asgn.status === AssignmentStatus.REJECTED && (
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle size={14} className="text-red-500" />
                <span className="text-xs font-bold text-red-600 dark:text-red-400">Request Declined</span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] mb-3">Unfortunately, the selected writer declined your assignment.</p>
              <div className="flex gap-2">
                <button onClick={() => onNavigate('WRITERS')} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Choose Another</button>
                <button onClick={() => onUpdateStatus(asgn.id, AssignmentStatus.PENDING)} className="flex-1 glass text-[var(--text-primary)] py-2 rounded-lg text-xs font-bold hover:bg-[var(--surface-hover)]">Publish to Marketplace</button>
              </div>
            </div>
          )}

          {/* Budget */}
          {asgn.status !== AssignmentStatus.QUOTED && (
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-[var(--text-primary)]">₹{asgn.budget > 0 ? asgn.budget : '--'}</span>
              <span className="text-xs text-[var(--text-tertiary)]">budget</span>
            </div>
          )}
        </div>
        {/* Card Footer */}
        <div className="p-4 bg-[var(--surface-elevated)] border-t border-[var(--border)] flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setViewingAssignment(asgn)}
              className="glass text-[var(--text-secondary)] py-2.5 rounded-xl text-sm font-semibold hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors flex items-center justify-center gap-1.5">
              <Eye size={14} /> Details
            </button>
            <button onClick={() => onOpenChat(asgn)}
              disabled={!asgn.writerId || [AssignmentStatus.PENDING, AssignmentStatus.QUOTED, AssignmentStatus.CANCELLED].includes(asgn.status)}
              className={`relative py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${!asgn.writerId || [AssignmentStatus.PENDING, AssignmentStatus.QUOTED, AssignmentStatus.CANCELLED].includes(asgn.status)
                ? 'bg-[var(--surface)] text-[var(--text-tertiary)] cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40'}`}>
              <MessageSquare size={14} /> Chat
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-[var(--surface)]">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {(asgn.status === AssignmentStatus.CONFIRMED) && asgn.paymentStatus !== 'PAID' && (
            <button onClick={() => setPaymentAssignment(asgn)}
              className="w-full bg-emerald-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]">
              Pay Now
            </button>
          )}

          {(asgn.status === AssignmentStatus.PENDING || asgn.status === AssignmentStatus.PENDING_REVIEW || asgn.status === AssignmentStatus.PENDING_WRITER_ACCEPTANCE || asgn.status === AssignmentStatus.REJECTED) && (
            <button onClick={() => setDeleteConfirmId(asgn.id)}
              className="col-span-2 text-xs text-red-500 dark:text-red-400 hover:text-red-400 dark:hover:text-red-300 font-semibold flex items-center justify-center gap-1 py-2">
              <Trash2 size={12} /> Delete Request
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="dark:block hidden">
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/6 rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card-premium p-8 mb-8 relative overflow-hidden noise-overlay">
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-lg">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)] font-display">
                  {getTimeGreeting()}, {user.name.split(' ')[0]}! 👋
                </h1>
                <p className="text-[var(--text-secondary)] mt-1">Let's tackle your assignments today</p>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <GlowButton onClick={() => onNavigate('WRITERS')} variant="secondary" size="sm" icon={<Users size={18} />}>
                Browse Writers
              </GlowButton>
              <GlowButton onClick={() => setShowCreateModal(true)} size="sm" icon={<Plus size={18} />}>
                New Request
              </GlowButton>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <TiltCard className="glass-card-premium p-5" tiltIntensity={8}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{stat.label}</p>
                    <p className="text-3xl font-bold text-[var(--text-primary)] mt-1">{stat.value}</p>
                  </div>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>

        {/* Assignments Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">Your Assignments</h2>
            </div>
            {assignments.length > 0 && (
              <div className="relative w-full sm:w-auto">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search assignments..." className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm" />
              </div>
            )}
          </div>

          {activeAssignments.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
                <ClipboardList className="w-10 h-10 text-[var(--accent)]" />
              </div>
              <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
                {assignments.length === 0 ? "No Assignments Yet" : "No Active Assignments"}
              </h3>
              <p className="text-[var(--text-secondary)] mb-6">
                {assignments.length === 0 
                  ? "Create your first assignment to get started with expert help" 
                  : "Create a new assignment to get started with expert help"}
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all inline-flex items-center gap-2 ripple">
                <Plus size={18} /> {assignments.length === 0 ? "Create First Assignment" : "Create New Assignment"}
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <AnimatePresence>
                {activeAssignments.map(renderAssignmentCard)}
              </AnimatePresence>
            </div>
          )}

          {/* Completed Assignments Section */}
          {completedAssignments.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">Completed Assignments</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <AnimatePresence>
                  {completedAssignments.map(renderAssignmentCard)}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)} 
        title={<><Sparkles className="text-[var(--accent)]" /> New Assignment</>}
        className="max-w-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
                  {preSelectedWriterId && (() => {
                    const selectedWriter = users.find(u => u.id === preSelectedWriterId);
                    if (!selectedWriter) return null;
                    return (
                      <div className="bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 border border-violet-500/20 p-4 rounded-xl mb-4 flex items-center gap-4">
                        <img src={selectedWriter.avatar} alt={selectedWriter.name} className="w-12 h-12 rounded-xl shadow-md border border-[var(--border)]" />
                        <div>
                          <h3 className="font-bold text-[var(--text-primary)] text-sm">Direct Hire Request</h3>
                          <p className="text-xs text-[var(--text-secondary)]">This assignment will be sent exclusively to <strong className="text-[var(--accent)]">{selectedWriter.name}</strong>.</p>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Assignment Title</label>
                    <input type="text" required value={newAsgn.title} onChange={e => setNewAsgn({ ...newAsgn, title: e.target.value })}
                      className="w-full px-4 py-3.5 rounded-xl glass-input" placeholder="e.g. Research Paper on AI Ethics" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Subject</label>
                      <input type="text" required value={newAsgn.subject} onChange={e => setNewAsgn({ ...newAsgn, subject: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl glass-input" placeholder="e.g. History" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Deadline</label>
                      <input type="date" required value={newAsgn.deadline} onChange={e => setNewAsgn({ ...newAsgn, deadline: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl glass-input" />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-[var(--text-secondary)]">Pages</label>
                      <span className="text-xs font-semibold text-[var(--accent)] bg-[var(--accent-muted)] px-2 py-0.5 rounded">~{newAsgn.pages * 250} words</span>
                    </div>
                    <div className="glass p-2 rounded-xl flex items-center justify-between">
                      <button type="button" onClick={() => setNewAsgn(p => ({ ...p, pages: Math.max(1, p.pages - 1) }))}
                        className="w-10 h-10 bg-[var(--surface)] rounded-lg font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">-</button>
                      <span className="font-bold text-lg text-[var(--text-primary)]">{newAsgn.pages}</span>
                      <button type="button" onClick={() => setNewAsgn(p => ({ ...p, pages: p.pages + 1 }))}
                        className="w-10 h-10 bg-[var(--surface)] rounded-lg font-bold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-colors">+</button>
                    </div>
                  </div>

                  {recommendedWriters.length > 0 && (
                    <div className="bg-[var(--accent-muted)] p-4 rounded-xl border border-[var(--accent)]/20">
                      <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-3">AI Matched Experts</p>
                      <div className="flex gap-3">
                        {recommendedWriters.map(w => (
                          <div key={w.id} className="glass p-2 rounded-lg flex items-center gap-2 pr-3">
                            <img src={w.avatar} className="w-8 h-8 rounded-full" />
                            <span className="text-xs font-bold text-[var(--text-primary)]">{w.name.split(' ')[0]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Budget (₹)</label>
                    <input type="number" required value={newAsgn.budget} onChange={e => setNewAsgn({ ...newAsgn, budget: Number(e.target.value) })}
                      className="w-full px-4 py-3.5 rounded-xl glass-input" placeholder="Enter your budget" />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Description</label>
                    <textarea required value={newAsgn.description} onChange={e => setNewAsgn({ ...newAsgn, description: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl glass-input h-24 resize-none" placeholder="Detailed instructions..." />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Optional Attachment (Image / PDF)</label>
                    <input 
                      type="file" 
                      accept="image/*,.pdf"
                      onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 rounded-xl glass-input text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[var(--accent-muted)] file:text-[var(--accent)] hover:file:bg-[var(--accent)] hover:file:text-white file:transition-colors file:cursor-pointer text-[var(--text-secondary)]" 
                    />
                  </div>

                  {/* Premium Handwriting Style Selection */}
                  <div className="bg-[var(--surface)]/50 border border-white/5 p-4 rounded-xl">
                    <label className="block text-sm font-bold text-[var(--text-primary)] mb-1">Preferred Handwriting Style</label>
                    <p className="text-xs text-[var(--text-secondary)] mb-3">Only writers with these verified styles will see your request. (Multiple selection allowed)</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['NEAT', 'CURSIVE', 'BOLD', 'MIXED'].map(style => {
                        const isSelected = newAsgn.preferredHandwritingStyles.includes(style);
                        return (
                          <button type="button" key={style}
                            onClick={() => {
                              const updated = isSelected 
                                ? newAsgn.preferredHandwritingStyles.filter(s => s !== style)
                                : [...newAsgn.preferredHandwritingStyles, style];
                              setNewAsgn({
                                ...newAsgn, 
                                preferredHandwritingStyles: updated,
                                visibility: updated.length > 0 ? 'SELECTED_STYLES' : 'ALL_WRITERS'
                              });
                            }}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${isSelected 
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white border-transparent shadow-lg shadow-violet-500/30' 
                              : 'glass text-[var(--text-secondary)] border-white/10 hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]'}`}>
                            {style.charAt(0) + style.slice(1).toLowerCase()}
                          </button>
                        );
                      })}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <input type="checkbox" id="noPref" 
                        checked={newAsgn.visibility === 'ALL_WRITERS' || newAsgn.preferredHandwritingStyles.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewAsgn({ ...newAsgn, preferredHandwritingStyles: [], visibility: 'ALL_WRITERS' });
                          }
                        }}
                        className="w-4 h-4 rounded text-violet-500 bg-[var(--surface-hover)] border-white/10 focus:ring-violet-500"
                      />
                      <label htmlFor="noPref" className="text-xs text-[var(--text-secondary)] cursor-pointer">
                        No Preference (Show to All Writers)
                      </label>
                    </div>
                  </div>

                  {suggestedPrice && (
                    <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 rounded-xl text-white shadow-lg">
                      <div>
                        <p className="text-xs font-medium text-white/80">AI Price Suggestion</p>
                        <p className="font-bold text-xl">₹{suggestedPrice}</p>
                      </div>
                      <button type="button" onClick={() => setNewAsgn({ ...newAsgn, budget: suggestedPrice })}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-bold backdrop-blur-sm transition-colors">Apply</button>
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all flex items-center justify-center gap-2 ripple">
                    Post Assignment <ArrowRight size={18} />
                  </motion.button>
                </form>
      </Modal>

      {/* View Assignment Modal */}
      <Modal 
        isOpen={!!viewingAssignment} 
        onClose={() => setViewingAssignment(null)} 
        title={viewingAssignment?.title} 
        className="max-w-2xl"
        bodyClassName="p-6 space-y-6"
      >
        {viewingAssignment && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Budget', value: `₹${viewingAssignment.budget}` },
                    { label: 'Status', value: null, badge: true },
                    { label: 'Subject', value: viewingAssignment.subject },
                    { label: 'Deadline', value: new Date(viewingAssignment.deadline).toLocaleDateString() },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 glass rounded-xl">
                      <p className="text-xs text-[var(--text-tertiary)] font-semibold uppercase">{item.label}</p>
                      {item.badge ? <StatusBadge status={viewingAssignment.status} /> : <p className="font-bold text-[var(--text-primary)] mt-1">{item.value}</p>}
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-[var(--text-secondary)] mb-2">Description</h3>
                  <p className="text-[var(--text-secondary)] text-sm whitespace-pre-wrap glass p-4 rounded-xl">{viewingAssignment.description}</p>
                </div>

                {viewingAssignment.submission && (
                  <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/20">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-emerald-500 dark:text-emerald-400">Package Shipped!</h3>
                      {viewingAssignment.submission.startsWith('http') ? (
                        <a href={viewingAssignment.submission} target="_blank" rel="noopener noreferrer" className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1.5">
                          Track Delivery
                        </a>
                      ) : (
                        <button onClick={() => handleDownload(viewingAssignment)} className="text-xs bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-1.5">
                          <Download size={14} /> Download
                        </button>
                      )}
                    </div>
                    {(viewingAssignment.status === AssignmentStatus.PENDING_REVIEW || viewingAssignment.status === AssignmentStatus.SUBMITTED) && (
                      <div className="flex gap-3">
                        <button onClick={() => onUpdateStatus(viewingAssignment.id, AssignmentStatus.COMPLETED)} className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors">Approve & Pay</button>
                        <button onClick={() => {
                          const reason = prompt("Revision feedback:");
                          if (reason) onUpdateStatus(viewingAssignment.id, AssignmentStatus.REVISION, reason);
                        }} className="flex-1 bg-fuchsia-500/20 text-fuchsia-500 dark:text-fuchsia-400 py-3 rounded-xl font-bold hover:bg-fuchsia-500/30 transition-colors">Request Revision</button>
                      </div>
                    )}
                  </div>
                )}
          </>
        )}
      </Modal>

      {paymentAssignment && (
        <PaymentModal isOpen={true} assignment={paymentAssignment} onClose={() => setPaymentAssignment(null)} onSuccess={() => { setPaymentAssignment(null); window.location.reload(); }} />
      )}

      {/* Delete/Cancel Confirm */}
      <Modal 
        isOpen={!!deleteConfirmId} 
        onClose={() => {
          setDeleteConfirmId(null);
          setCancellationReason('');
        }}
        className="max-w-sm text-center"
        zIndex={120}
      >
        {(() => {
          const asgnToDelete = assignments.find(a => a.id === deleteConfirmId);
          const isAcceptedOrInProgress = asgnToDelete && ['ASSIGNED', 'IN_PROGRESS', 'ACCEPTED', 'CONFIRMED'].includes(asgnToDelete.status);
          
          return (
            <div className="relative">
              {isAcceptedOrInProgress && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500" />
              )}

              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 ${isAcceptedOrInProgress ? 'bg-orange-500/10 text-orange-500 dark:text-orange-400' : 'bg-red-500/10 text-red-500 dark:text-red-400'}`}>
                <AlertCircle size={32} />
              </div>
              
              <h3 className="font-bold text-xl text-[var(--text-primary)] mb-2 font-display">
                {isAcceptedOrInProgress ? 'Cancel Assignment?' : 'Delete Assignment?'}
              </h3>
              
              <p className="text-sm text-[var(--text-secondary)] mb-6 leading-relaxed">
                {isAcceptedOrInProgress 
                  ? 'This assignment has already been accepted by a writer. Cancelling it will immediately notify the assigned writer and remove the assignment from their active work.'
                  : 'This action cannot be undone. Are you sure you want to permanently delete this request?'}
              </p>

              {isAcceptedOrInProgress && (
                <div className="mb-6 text-left">
                  <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Cancellation Reason</label>
                  <textarea
                    required
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="Briefly explain why you are cancelling..."
                    className="w-full px-4 py-3 rounded-xl glass-input h-24 resize-none text-sm text-[var(--text-primary)]"
                  />
                </div>
              )}
              
              <div className="flex gap-3">
                <button onClick={() => {
                  setDeleteConfirmId(null);
                  setCancellationReason('');
                }} className="flex-1 py-3 glass text-[var(--text-primary)] rounded-xl font-bold hover:bg-[var(--surface-hover)] transition-colors">
                  {isAcceptedOrInProgress ? 'No, Keep Assignment' : 'Cancel'}
                </button>
                <button 
                  onClick={() => { 
                    if (deleteConfirmId) {
                      if (isAcceptedOrInProgress && !cancellationReason.trim()) {
                        alert('Please provide a cancellation reason.');
                        return;
                      }
                      onDeleteAssignment(deleteConfirmId, isAcceptedOrInProgress ? cancellationReason : undefined); 
                      setDeleteConfirmId(null); 
                      setCancellationReason('');
                    }
                  }} 
                  className={`flex-1 py-3 text-white rounded-xl font-bold transition-all shadow-lg ${isAcceptedOrInProgress ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:shadow-red-500/30' : 'bg-red-600 hover:bg-red-700'}`}>
                  {isAcceptedOrInProgress ? 'Yes, Cancel Assignment' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
