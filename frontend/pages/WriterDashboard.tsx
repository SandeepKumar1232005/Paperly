import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { checkAssignmentQuality } from '../services/gemini';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import TiltCard from '../components/TiltCard';
import GlowButton from '../components/GlowButton';
import { Search, Briefcase, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Upload, X, Filter, FileText, Sparkles, Star, Zap, MessageSquare } from 'lucide-react';
import HandwritingSamplesManager from '../components/HandwritingSamplesManager';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface WriterDashboardProps {
  user: User;
  assignments: Assignment[];
  onUpdateAssignment: (id: string, updates: Partial<Assignment>) => void;
  onSubmitQuote: (id: string, amount: number, comment: string, writerId: string) => void;
  onUploadSubmission: (id: string, text: string) => void;
  onOpenChat: (assignment: Assignment) => void;
  onUpdateProfile: (updates: Partial<User>) => void;
  onRejectAssignment: (id: string) => void;
}

const WriterDashboard: React.FC<WriterDashboardProps> = ({ user, assignments, onUpdateAssignment, onSubmitQuote, onUploadSubmission, onOpenChat, onUpdateProfile, onRejectAssignment }) => {
  const [selectedAsgn, setSelectedAsgn] = useState<Assignment | null>(null);
  const [quoteData, setQuoteData] = useState<{ id: string, amount: string, comment: string } | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [aiResult, setAiResult] = useState<{ score: number, feedback: string, plagiarismLikelihood: string } | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState<'MARKETPLACE' | 'ACTIVE'>('MARKETPLACE');

  const hasHandwritingSample = user.handwriting_style || (user.handwriting_samples && user.handwriting_samples.length > 0);
  const hasQRCode = !!user.qr_code_url;
  const isProfileComplete = hasHandwritingSample && hasQRCode;

  const myAssignments = assignments.filter(a => a.writerId === user.id);
  const availableAssignments = assignments.filter(a =>
    (a.status === AssignmentStatus.PENDING || a.status === AssignmentStatus.PENDING_REVIEW) &&
    !a.writerId &&
    (!a.rejectedBy || !a.rejectedBy.includes(user.id))
  );

  const revenueData = useMemo(() => {
    const data = [
      { name: 'Mon', revenue: 0 }, { name: 'Tue', revenue: 0 },
      { name: 'Wed', revenue: 0 }, { name: 'Thu', revenue: 0 },
      { name: 'Fri', revenue: 0 }, { name: 'Sat', revenue: 0 }, { name: 'Sun', revenue: 0 }
    ];
    const completed = myAssignments.filter(a => a.status === AssignmentStatus.COMPLETED);
    completed.forEach((a, i) => {
      const day = i % 7;
      data[day].revenue += a.budget;
    });
    return data;
  }, [myAssignments]);

  const totalEarnings = myAssignments
    .filter(a => a.status === AssignmentStatus.COMPLETED)
    .reduce((sum, a) => sum + (a.net_earnings || a.budget * 0.9), 0);

  const handleAiCheck = async () => {
    if (!submissionText || !selectedAsgn) return;
    setIsChecking(true);
    const result = await checkAssignmentQuality(submissionText, selectedAsgn.subject);
    setAiResult(result);
    setIsChecking(false);
  };

  const submitQuote = () => {
    if (quoteData && quoteData.amount) {
      onSubmitQuote(quoteData.id, Number(quoteData.amount), quoteData.comment, user.id);
      setQuoteData(null);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="dark:block hidden">
          <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-500/6 rounded-full blur-[120px]" />
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="glass-card-premium p-8 relative overflow-hidden noise-overlay">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl" />
              <div className="relative flex items-center gap-4 mb-4">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl border-2 border-[var(--border)] shadow-md" />
                <div>
                  <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Welcome, {user.name.split(' ')[0]}!</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-[var(--text-tertiary)] text-xs">Top Writer</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setActiveTab('MARKETPLACE')}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'MARKETPLACE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <Search size={16} /> Marketplace ({availableAssignments.length})
                </button>
                <button onClick={() => setActiveTab('ACTIVE')}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'ACTIVE'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                    : 'glass text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  <Briefcase size={16} /> My Work ({myAssignments.length})
                </button>
              </div>
            </motion.div>
          </div>

          {/* Earnings Card */}
          <TiltCard tiltIntensity={6}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card-premium p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-emerald-500/10">
              <DollarSign size={60} />
            </div>
            <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Total Earnings</p>
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mt-2 font-display">₹{totalEarnings.toLocaleString()}</h2>
            <div className="h-[60px] mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            </motion.div>
          </TiltCard>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode='wait'>
              {activeTab === 'MARKETPLACE' ? (
                <motion.div key="market" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">Available Jobs</h2>
                    </div>
                  </div>

                  {/* Profile Incomplete Warning */}
                  {!isProfileComplete && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5 mb-6 border-l-4 border-fuchsia-500">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-fuchsia-500/10 rounded-xl flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-fuchsia-500" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-[var(--text-primary)] text-lg mb-1 font-display">Complete Your Profile</h3>
                          <p className="text-[var(--text-secondary)] text-sm mb-3">
                            You must upload your handwriting sample and payment QR code before you can accept orders.
                          </p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${hasHandwritingSample ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-[var(--surface)] text-[var(--text-tertiary)]'}`}>
                              {hasHandwritingSample ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              Handwriting Sample
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${hasQRCode ? 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400' : 'bg-[var(--surface)] text-[var(--text-tertiary)]'}`}>
                              {hasQRCode ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              Payment QR Code
                            </div>
                          </div>
                          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditingProfile(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all">
                            Complete Profile Now
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {availableAssignments.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface)] flex items-center justify-center">
                        <Search className="w-8 h-8 text-[var(--text-tertiary)]" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">No Jobs Available</h3>
                      <p className="text-[var(--text-secondary)]">Check back later for new opportunities</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                      <AnimatePresence>
                        {availableAssignments.map((asgn, i) => (
                          <motion.div layout key={asgn.id}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="glass-card p-5 group">
                            <div className="flex justify-between items-start mb-3">
                              <span className="px-3 py-1 bg-[var(--surface)] text-[var(--text-tertiary)] text-xs font-semibold rounded-lg uppercase">{asgn.subject}</span>
                              <span className="text-emerald-500 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">₹{asgn.budget}</span>
                            </div>
                            <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--accent)] transition-colors">{asgn.title}</h3>
                            <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{asgn.description}</p>
                            <div className="flex items-center text-xs text-[var(--text-tertiary)] mb-4 gap-4">
                              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(asgn.deadline).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><FileText size={14} /> {asgn.pages || 1} Pages</span>
                            </div>

                            {quoteData?.id === asgn.id ? (
                              <div className="space-y-2 glass p-4 rounded-xl">
                                <input type="number"
                                  className="w-full text-sm p-3 rounded-lg glass-input"
                                  placeholder="Your Offer (₹)" value={quoteData.amount}
                                  onChange={e => setQuoteData({ ...quoteData, amount: e.target.value })} />
                                <textarea
                                  className="w-full text-sm p-3 rounded-lg glass-input resize-none h-16"
                                  placeholder="Pitch yourself..." value={quoteData.comment}
                                  onChange={e => setQuoteData({ ...quoteData, comment: e.target.value })} />
                                <div className="flex gap-2">
                                  <button onClick={submitQuote} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm py-2.5 rounded-lg font-bold">Send Quote</button>
                                  <button onClick={() => setQuoteData(null)} className="flex-1 glass text-[var(--text-secondary)] text-sm py-2.5 rounded-lg font-semibold">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  if (!isProfileComplete) {
                                    setIsEditingProfile(true);
                                  } else {
                                    setQuoteData({ id: asgn.id, amount: String(asgn.budget), comment: '' });
                                  }
                                }}
                                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${isProfileComplete
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30'
                                  : 'glass text-[var(--text-tertiary)] cursor-not-allowed'}`}>
                                {isProfileComplete ? 'Submit Quote' : 'Complete Profile to Quote'}
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div key="active" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">Your Projects</h2>
                  </div>

                  {myAssignments.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--surface)] flex items-center justify-center">
                        <Briefcase className="w-8 h-8 text-[var(--text-tertiary)]" />
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-display">No Active Projects</h3>
                      <p className="text-[var(--text-secondary)]">Browse the marketplace to find work</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {myAssignments.map((asgn, i) => (
                          <motion.div layout key={asgn.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.01 }}
                            className="glass-card p-6 flex flex-col md:flex-row gap-6 items-start md:items-center group">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">{asgn.title}</h3>
                                <StatusBadge status={asgn.status} />
                              </div>
                              <p className="text-sm text-[var(--text-tertiary)] mb-2">Deadline: {new Date(asgn.deadline).toLocaleDateString()}</p>
                              {(asgn.status === AssignmentStatus.IN_PROGRESS || asgn.status === AssignmentStatus.COMPLETED) && (
                                <div className="flex gap-4 text-xs font-mono text-[var(--text-tertiary)] mt-2">
                                  <span>Budget: ₹{asgn.budget}</span>
                                  <span className="text-red-400">Fee: -₹{asgn.platform_fee || (asgn.budget * 0.1).toFixed(0)}</span>
                                  <span className="text-emerald-500 dark:text-emerald-400 font-bold">Net: ₹{asgn.net_earnings || (asgn.budget * 0.9).toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => onOpenChat(asgn)} className="px-4 py-2.5 bg-violet-500/10 text-[var(--accent)] rounded-xl font-semibold text-sm flex items-center gap-2 hover:bg-violet-500/20 transition-colors">
                                <MessageSquare size={16} /> Chat
                              </button>
                              {asgn.status !== AssignmentStatus.COMPLETED && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedAsgn(asgn)}
                                  className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20">
                                  Submit Work
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            <div className="glass-card p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={user.avatar} className="w-20 h-20 rounded-2xl border-2 border-[var(--border)] mb-3 shadow-md" />
                  <button onClick={() => setIsEditingProfile(true)} className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <Upload size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">{user.name}</h3>
                <div className="flex justify-center gap-0.5 text-yellow-400 text-sm mt-1">★★★★★</div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Availability</p>
                <div className="grid grid-cols-3 gap-2">
                  {['ONLINE', 'BUSY', 'OFFLINE'].map((status) => (
                    <button key={status}
                      onClick={() => onUpdateProfile({ availability_status: status as any })}
                      className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${user.availability_status === status
                        ? (status === 'ONLINE' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500 dark:text-emerald-400' : status === 'BUSY' ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--text-secondary)]')
                        : 'border-transparent text-[var(--text-tertiary)] hover:bg-[var(--surface)]'}`}>
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <h3 className="font-bold text-lg mb-2 relative z-10">💡 Pro Tip</h3>
              <p className="text-emerald-100 text-sm relative z-10">Upload verified handwriting samples to increase your hire rate by 30%.</p>
              <button onClick={() => setIsEditingProfile(true)} className="mt-4 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors w-full relative z-10 backdrop-blur-sm">
                Manage Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedAsgn && (
          <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl" style={{ background: 'var(--bg-secondary)' }}>
              <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)] font-display">Submitting: {selectedAsgn.title}</h2>
                <button onClick={() => setSelectedAsgn(null)} className="p-2 hover:bg-[var(--surface)] rounded-xl text-[var(--text-secondary)]">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
                <textarea value={submissionText} onChange={e => setSubmissionText(e.target.value)}
                  className="w-full h-full min-h-[300px] p-4 rounded-xl glass-input font-mono text-sm resize-none"
                  placeholder="Paste your final work here..." />

                <div className="space-y-6">
                  <div className="bg-[var(--accent-muted)] p-6 rounded-2xl border border-[var(--accent)]/20">
                    <h3 className="font-bold text-[var(--accent)] mb-2 flex items-center gap-2"><Sparkles size={18} /> AI Quality Check</h3>
                    <p className="text-xs text-[var(--text-tertiary)] mb-4">Validate your submission before sending.</p>
                    {!aiResult ? (
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={handleAiCheck} disabled={!submissionText || isChecking}
                        className="w-full py-3 bg-[var(--accent)] text-white rounded-xl font-bold disabled:opacity-50 ripple">
                        {isChecking ? 'Analyzing...' : 'Run Analysis'}
                      </motion.button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center glass p-3 rounded-lg">
                          <span className="text-sm font-semibold text-[var(--text-secondary)]">Score</span>
                          <span className="text-xl font-bold text-[var(--accent)]">{aiResult.score}/100</span>
                        </div>
                        <p className="text-xs italic text-[var(--text-secondary)] p-3 glass rounded-lg">"{aiResult.feedback}"</p>
                        <button onClick={() => setAiResult(null)} className="text-xs text-[var(--accent)] font-semibold">Reset</button>
                      </div>
                    )}
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { onUploadSubmission(selectedAsgn.id, submissionText); setSelectedAsgn(null); }}
                    disabled={!submissionText}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50 ripple">
                    Submit Final Work
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-[var(--overlay)] z-[110] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsEditingProfile(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-lg w-full shadow-2xl" style={{ background: 'var(--bg-secondary)' }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-[var(--text-primary)] font-display">Edit Profile</h2>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-[var(--surface)] rounded-xl text-[var(--text-secondary)]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Handwriting Samples */}
              <HandwritingSamplesManager user={user} onUpdateProfile={onUpdateProfile} />

              {/* QR Code */}
              <div>
                <p className="text-sm font-semibold text-[var(--text-secondary)] mb-2">Payment QR Code</p>
                <div className="border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center hover:bg-[var(--surface)] transition-colors cursor-pointer relative group">
                  {user.qr_code_url ? (
                    <div className="relative z-10">
                      <img src={user.qr_code_url} alt="QR" className="mx-auto h-24 object-contain mb-2 rounded-lg" />
                      <p className="text-xs text-emerald-500 font-semibold">QR Code Active</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <DollarSign className="text-emerald-500" size={20} />
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)]">Upload Payment QR (UPI)</p>
                    </>
                  )}
                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const url = await api.uploadFile(e.target.files[0]);
                      onUpdateProfile({ qr_code_url: url });
                      alert('QR Code Uploaded Successfully!');
                    }
                  }} />
                </div>
              </div>

              <button onClick={() => setIsEditingProfile(false)} className="w-full py-3 glass text-[var(--text-primary)] rounded-xl font-semibold hover:bg-[var(--surface-hover)] transition-colors">
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WriterDashboard;
