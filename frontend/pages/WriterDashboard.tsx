import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Assignment, AssignmentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { checkAssignmentQuality } from '../services/gemini';
import { api } from '../services/api';
import EmptyState from '../components/EmptyState';
import { Search, Briefcase, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle, Upload, X, Filter, FileText, Sparkles, Star, Zap, MessageSquare } from 'lucide-react';
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

  // Profile completion check - Writers must have handwriting sample AND QR code
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
    <div className="min-h-screen bg-[#050508]">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">

        {/* Header Section */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-2xl border-2 border-emerald-500/30" />
                <div>
                  <h1 className="text-2xl font-bold text-white">Welcome, {user.name.split(' ')[0]}!</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex text-yellow-400 text-xs gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => <Star key={s} size={12} fill="currentColor" />)}
                    </div>
                    <span className="text-white/40 text-xs">Top Writer</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setActiveTab('MARKETPLACE')}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'MARKETPLACE' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
                >
                  <Search size={16} /> Marketplace ({availableAssignments.length})
                </button>
                <button
                  onClick={() => setActiveTab('ACTIVE')}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${activeTab === 'ACTIVE' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'}`}
                >
                  <Briefcase size={16} /> My Work ({myAssignments.length})
                </button>
              </div>
            </motion.div>
          </div>

          {/* Earnings Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 text-emerald-400/20">
              <DollarSign size={60} />
            </div>
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Total Earnings</p>
            <h2 className="text-4xl font-bold text-white mt-2">₹{totalEarnings.toLocaleString()}</h2>
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
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode='wait'>
              {activeTab === 'MARKETPLACE' ? (
                <motion.div
                  key="market"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-white">Available Jobs</h2>
                    </div>
                  </div>

                  {/* Profile Incomplete Warning */}
                  {!isProfileComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-r from-fuchsia-600/20 to-orange-600/20 border border-fuchsia-500/30 rounded-2xl p-5 mb-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-fuchsia-500/20 rounded-xl flex-shrink-0">
                          <AlertCircle className="w-6 h-6 text-fuchsia-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-white text-lg mb-1">Complete Your Profile</h3>
                          <p className="text-white/60 text-sm mb-3">
                            You must upload your handwriting sample and payment QR code before you can accept orders from students.
                          </p>
                          <div className="flex flex-wrap gap-3 mb-4">
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${hasHandwritingSample ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                              {hasHandwritingSample ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              Handwriting Sample
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold ${hasQRCode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white/40'}`}>
                              {hasQRCode ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                              Payment QR Code
                            </div>
                          </div>
                          <button
                            onClick={() => setIsEditingProfile(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 transition-all"
                          >
                            Complete Profile Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {availableAssignments.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
                      <Search className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">No Jobs Available</h3>
                      <p className="text-white/50">Check back later for new opportunities</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-5">
                      <AnimatePresence>
                        {availableAssignments.map((asgn, i) => (
                          <motion.div
                            layout
                            key={asgn.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:border-emerald-500/30 transition-all"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <span className="px-3 py-1 bg-white/10 text-white/60 text-xs font-semibold rounded-lg uppercase">{asgn.subject}</span>
                              <span className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-lg text-sm">₹{asgn.budget}</span>
                            </div>
                            <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{asgn.title}</h3>
                            <p className="text-sm text-white/50 mb-4 line-clamp-2">{asgn.description}</p>
                            <div className="flex items-center text-xs text-white/30 mb-4 gap-4">
                              <span className="flex items-center gap-1"><Clock size={14} /> {new Date(asgn.deadline).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><FileText size={14} /> {asgn.pages || 1} Pages</span>
                            </div>

                            {quoteData?.id === asgn.id ? (
                              <div className="space-y-2 bg-white/5 p-4 rounded-xl border border-white/10">
                                <input
                                  type="number"
                                  className="w-full text-sm p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500"
                                  placeholder="Your Offer (₹)"
                                  value={quoteData.amount}
                                  onChange={e => setQuoteData({ ...quoteData, amount: e.target.value })}
                                />
                                <textarea
                                  className="w-full text-sm p-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 outline-none focus:border-emerald-500 resize-none h-16"
                                  placeholder="Pitch yourself..."
                                  value={quoteData.comment}
                                  onChange={e => setQuoteData({ ...quoteData, comment: e.target.value })}
                                />
                                <div className="flex gap-2">
                                  <button onClick={submitQuote} className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm py-2.5 rounded-lg font-bold">Send Quote</button>
                                  <button onClick={() => setQuoteData(null)} className="flex-1 bg-white/5 border border-white/10 text-white/60 text-sm py-2.5 rounded-lg font-semibold">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  if (!isProfileComplete) {
                                    setIsEditingProfile(true);
                                  } else {
                                    setQuoteData({ id: asgn.id, amount: String(asgn.budget), comment: '' });
                                  }
                                }}
                                className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all ${isProfileComplete
                                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/20 hover:shadow-emerald-500/30'
                                  : 'bg-white/10 border border-white/20 text-white/50 cursor-not-allowed'
                                  }`}
                              >
                                {isProfileComplete ? 'Submit Quote' : 'Complete Profile to Quote'}
                              </button>
                            )}

                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">Your Projects</h2>
                  </div>

                  {myAssignments.length === 0 ? (
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 text-center">
                      <Briefcase className="w-12 h-12 text-white/20 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">No Active Projects</h3>
                      <p className="text-white/50">Browse the marketplace to find work</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {myAssignments.map((asgn, i) => (
                          <motion.div
                            layout
                            key={asgn.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ scale: 1.01 }}
                            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center hover:border-violet-500/30 transition-all"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-white">{asgn.title}</h3>
                                <StatusBadge status={asgn.status} />
                              </div>
                              <p className="text-sm text-white/40 mb-2">Deadline: {new Date(asgn.deadline).toLocaleDateString()}</p>
                              {(asgn.status === AssignmentStatus.IN_PROGRESS || asgn.status === AssignmentStatus.COMPLETED) && (
                                <div className="flex gap-4 text-xs font-mono text-white/40 mt-2">
                                  <span>Budget: ₹{asgn.budget}</span>
                                  <span className="text-red-400">Fee: -₹{asgn.platform_fee || (asgn.budget * 0.1).toFixed(0)}</span>
                                  <span className="text-emerald-400 font-bold">Net: ₹{asgn.net_earnings || (asgn.budget * 0.9).toFixed(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button onClick={() => onOpenChat(asgn)} className="px-4 py-2.5 bg-violet-500/10 text-violet-400 rounded-xl font-semibold text-sm flex items-center gap-2">
                                <MessageSquare size={16} /> Chat
                              </button>
                              {asgn.status !== AssignmentStatus.COMPLETED && (
                                <button onClick={() => setSelectedAsgn(asgn)} className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/20">
                                  Submit Work
                                </button>
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
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <img src={user.avatar} className="w-20 h-20 rounded-2xl border-2 border-white/10 mb-3" />
                  <button onClick={() => setIsEditingProfile(true)} className="absolute -bottom-1 -right-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-2 rounded-xl shadow-lg">
                    <Upload size={12} />
                  </button>
                </div>
                <h3 className="font-bold text-white">{user.name}</h3>
                <div className="flex justify-center gap-0.5 text-yellow-400 text-sm mt-1">★★★★★</div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Availability</p>
                <div className="grid grid-cols-3 gap-2">
                  {['ONLINE', 'BUSY', 'OFFLINE'].map((status) => (
                    <button
                      key={status}
                      onClick={() => onUpdateProfile({ availability_status: status as any })}
                      className={`py-2 rounded-xl text-[10px] font-bold transition-all border ${user.availability_status === status
                        ? (status === 'ONLINE' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : status === 'BUSY' ? 'bg-fuchsia-500/20 border-fuchsia-500/30 text-fuchsia-400' : 'bg-white/10 border-white/20 text-white/60')
                        : 'border-transparent text-white/30 hover:bg-white/5'
                        }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
              <h3 className="font-bold text-lg mb-2 relative z-10">💡 Pro Tip</h3>
              <p className="text-emerald-100 text-sm relative z-10">Upload verified handwriting samples to increase your hire rate by 30%.</p>
              <button onClick={() => setIsEditingProfile(true)} className="mt-4 px-4 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-colors w-full relative z-10">
                Manage Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedAsgn && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#0a0a12] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-bold text-white">Submitting: {selectedAsgn.title}</h2>
                <button onClick={() => setSelectedAsgn(null)} className="p-2 hover:bg-white/10 rounded-xl text-white/60">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid md:grid-cols-2 gap-6">
                <textarea
                  value={submissionText}
                  onChange={e => setSubmissionText(e.target.value)}
                  className="w-full h-full min-h-[300px] p-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 font-mono text-sm focus:border-violet-500 outline-none resize-none"
                  placeholder="Paste your final work here..."
                />

                <div className="space-y-6">
                  <div className="bg-violet-500/10 p-6 rounded-2xl border border-violet-500/20">
                    <h3 className="font-bold text-violet-400 mb-2 flex items-center gap-2"><Sparkles size={18} /> AI Quality Check</h3>
                    <p className="text-xs text-violet-400/60 mb-4">Validate your submission before sending.</p>

                    {!aiResult ? (
                      <button onClick={handleAiCheck} disabled={!submissionText || isChecking} className="w-full py-3 bg-violet-600 text-white rounded-xl font-bold disabled:opacity-50">
                        {isChecking ? 'Analyzing...' : 'Run Analysis'}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                          <span className="text-sm font-semibold text-white/60">Score</span>
                          <span className="text-xl font-bold text-violet-400">{aiResult.score}/100</span>
                        </div>
                        <p className="text-xs italic text-white/50 p-3 bg-white/5 rounded-lg">"{aiResult.feedback}"</p>
                        <button onClick={() => setAiResult(null)} className="text-xs text-violet-400 font-semibold">Reset</button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => { onUploadSubmission(selectedAsgn.id, submissionText); setSelectedAsgn(null); }}
                    disabled={!submissionText}
                    className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-bold shadow-lg shadow-violet-500/20 disabled:opacity-50"
                  >
                    Submit Final Work
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) setIsEditingProfile(false); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#0a0a12] border border-white/10 p-6 rounded-2xl max-w-lg w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold text-xl text-white">Edit Profile</h2>
              <button onClick={() => setIsEditingProfile(false)} className="p-2 hover:bg-white/10 rounded-xl text-white/60">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Handwriting Samples - Multiple allowed */}
              <div>
                <p className="text-sm font-semibold text-white/70 mb-2">
                  Handwriting Samples {user.handwriting_samples && user.handwriting_samples.length > 0 && (
                    <span className="text-emerald-400 ml-2">({user.handwriting_samples.length} uploaded)</span>
                  )}
                </p>

                {/* Gallery of uploaded samples */}
                {user.handwriting_samples && user.handwriting_samples.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {user.handwriting_samples.map((sample, idx) => (
                      <div key={idx} className="relative group/sample">
                        <img
                          src={sample}
                          alt={`Sample ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-white/20"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/sample:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-bold">#{idx + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <div className="border-2 border-dashed border-white/20 rounded-xl p-4 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
                  <div className="flex items-center justify-center gap-2">
                    <Upload className="text-emerald-400 group-hover:scale-110 transition-transform" size={20} />
                    <p className="text-xs text-white/60">
                      {user.handwriting_samples && user.handwriting_samples.length > 0 ? 'Add more samples' : 'Upload sample image'}
                    </p>
                  </div>
                  <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={async (e) => {
                    if (e.target.files?.[0]) {
                      const url = await api.uploadFile(e.target.files[0]);
                      onUpdateProfile({ handwriting_samples: [...(user.handwriting_samples || []), url] });
                      alert('Handwriting Sample Uploaded!');
                    }
                  }} />
                </div>
              </div>



              {/* QR Code */}
              <div>
                <p className="text-sm font-semibold text-white/70 mb-2">Payment QR Code</p>
                <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative group">
                  {user.qr_code_url ? (
                    <div className="relative z-10">
                      <img src={user.qr_code_url} alt="QR" className="mx-auto h-24 object-contain mb-2 rounded-lg" />
                      <p className="text-xs text-emerald-400 font-semibold">QR Code Active</p>
                      <p className="text-[10px] text-white/30">Click to replace</p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <DollarSign className="text-emerald-400" size={20} />
                      </div>
                      <p className="text-xs text-white/40">Upload Payment QR (UPI)</p>
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

              <button onClick={() => setIsEditingProfile(false)} className="w-full py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20">
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




