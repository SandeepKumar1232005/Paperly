import { Eye, EyeOff, ArrowLeft, UserPlus, BookOpen, PenTool, User, Mail, Lock, AtSign } from 'lucide-react';
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, User as UserType } from '../types';
import { api, UsernameTakenError } from '../services/api';
import GlowButton from '../components/GlowButton';
import Modal from '../components/Modal';

interface RegisterProps {
  onRegister: (name: string, email: string, username: string, password: string, role: UserRole) => Promise<void>;
  onSocialLoginSuccess?: (user: UserType) => Promise<void>;
  onNavigate: (view: 'LANDING' | 'LOGIN') => void;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onSocialLoginSuccess, onNavigate }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>('');


  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading('google');
      setError('');
      try {
        const user = await api.socialLogin('google', tokenResponse.access_token);
        if (onSocialLoginSuccess) {
          await onSocialLoginSuccess(user);
        }
      } catch (err: any) {
        if (err.name === 'UsernameTakenError') {
          setPendingGoogleToken(tokenResponse.access_token);
          setUsernameSuggestions(err.suggestions || []);
          setSelectedUsername(err.suggestions?.[0] || '');
          setShowUsernamePrompt(true);
        } else {
          setError(err.message || 'Google signup failed');
        }
      } finally {
        setIsLoading(null);
      }
    },
    onError: (errResp: any) => {
      console.warn("Google OAuth Popup Error:", errResp);
      setError('Google Popup failed or closed. Please try again.');
      setIsLoading(null);
    },
  });

  const handleUsernameSubmit = async () => {
    if (!pendingGoogleToken || !selectedUsername) return;
    setIsLoading('google');
    setError('');
    try {
      const user = await api.socialLogin('google', pendingGoogleToken, selectedUsername);
      setShowUsernamePrompt(false);
      if (onSocialLoginSuccess) await onSocialLoginSuccess(user);
    } catch (err: any) {
      if (err.name === 'UsernameTakenError') {
        setUsernameSuggestions(err.suggestions || []);
        setError('That username is also taken. Please try another.');
      } else {
        setError(err.message || 'Google signup failed');
        setShowUsernamePrompt(false);
      }
    } finally {
      setIsLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!role) {
      setError('Please select whether you are registering as a Student or a Writer.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    setIsLoading('email');
    try {
      await onRegister(name, email, username.toLowerCase(), password, role);
    } catch (e: any) {
      setError(e.message || "Registration failed");
      setIsLoading(null);
    }
  };

  const roleConfig = {
    STUDENT: { gradient: 'from-violet-600 to-fuchsia-600', shadow: 'shadow-violet-500/30', icon: BookOpen, desc: 'Post assignments, hire writers, and track progress' },
    WRITER: { gradient: 'from-emerald-600 to-teal-600', shadow: 'shadow-emerald-500/30', icon: PenTool, desc: 'Find work, submit and earn from your writing skills' },
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] relative overflow-hidden mesh-gradient">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--bg-primary)]" />
        <div className="block hidden">
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px] animate-blob" />
          <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px] animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] bg-indigo-500/8 rounded-full blur-[100px] animate-blob" style={{ animationDelay: '4s' }} />
        </div>
        <div className="hidden block">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-fuchsia-50/30 to-blue-50" />
        </div>
      </div>

      {/* Back Button */}
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        onClick={() => onNavigate('LANDING')}
        className="absolute top-6 left-6 z-20 p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all group">
        <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
      </motion.button>

      {/* Left Panel - Brand (hidden on mobile) */}
      <div className="hidden lg:flex flex-1 items-start justify-center relative z-10 p-8 lg:p-12 pt-20 lg:pt-24">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-md w-full">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-6 shadow-lg shadow-violet-500/30">
            <UserPlus size={32} />
          </div>
          <h2 className="text-4xl font-black text-[var(--text-primary)] leading-tight mb-4 font-display">
            Join the <span className="gradient-text">Paperly</span> community
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-6 leading-relaxed">
            Whether you're a student needing help or a writer ready to earn — your journey starts here.
          </p>

          {/* Role Preview Cards */}
          <div className="space-y-3">
            {(['STUDENT', 'WRITER'] as const).map((r) => {
              const config = roleConfig[r];
              const isSelected = role === r;
              return (
                <motion.div
                  key={r}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setRole(r);
                    }
                  }}
                  onClick={() => setRole(r)}
                  className={`relative p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] ${
                    isSelected
                      ? 'bg-[#13111C] border-2 border-[#8B5CF6] shadow-[0_0_20px_rgba(139,92,246,0.35)]'
                      : 'glass-card border border-[var(--border)] hover:bg-[var(--surface-hover)] shadow-sm'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <config.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{r === 'STUDENT' ? 'Student' : 'Writer'}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{config.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-start justify-center relative z-10 px-4 py-12 pt-20 lg:pt-24">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <div className="glass-card-premium p-8 animated-border">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-violet-500/30 lg:hidden">
                <UserPlus size={28} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">Create Account</h1>
              <p className="text-[var(--text-secondary)]">Join thousands of students & writers</p>
            </div>

            {/* Role Selector (mobile) */}
            <div className="mb-6 lg:hidden">
              <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Select Your Role</label>
              <div className="grid grid-cols-2 gap-3">
                {(['STUDENT', 'WRITER'] as const).map((r) => {
                  const isSelected = role === r;
                  const config = roleConfig[r];
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`relative p-3.5 rounded-xl text-left transition-all duration-300 flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] ${
                        isSelected
                          ? 'bg-[#13111C] border-2 border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.35)]'
                          : 'glass-card border border-[var(--border)] hover:bg-[var(--surface-hover)] shadow-sm'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white flex-shrink-0`}>
                        <config.icon size={16} />
                      </div>
                      <p className="font-bold text-xs text-[var(--text-primary)]">{r === 'STUDENT' ? 'Student' : 'Writer'}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Google Signup */}
            <div className="mb-5">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => loginWithGoogle()} disabled={!!isLoading}
                className="w-full flex items-center justify-center gap-3 glass-card !rounded-xl py-3.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                <span>{isLoading === 'google' ? 'Connecting...' : 'Sign up with Google'}</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-4 mb-5">
              <div className="h-px bg-[var(--border)] flex-1" />
              <span className="text-xs text-[var(--text-tertiary)] font-semibold uppercase tracking-widest">or</span>
              <div className="h-px bg-[var(--border)] flex-1" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="Enter your full name" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="Enter your Gmail address" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Username</label>
                <div className="relative">
                  <AtSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="text" required value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (/[A-Z]/.test(e.target.value)) {
                        setError('Username will be converted to lowercase automatically.');
                      } else {
                        setError('');
                      }
                    }}
                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl glass-input ${/[A-Z]/.test(username) ? '!border-fuchsia-500/50' : ''}`}
                    placeholder="Choose a username" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl glass-input" placeholder="Enter your password" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div key={level} className={`h-1 flex-1 rounded-full transition-all ${password.length >= level * 3
                        ? level <= 1 ? 'bg-red-500' : level <= 2 ? 'bg-yellow-500' : level <= 3 ? 'bg-blue-500' : 'bg-emerald-500'
                        : 'bg-[var(--surface)]'
                        }`} />
                    ))}
                  </div>
                )}
              </div>

              <GlowButton type="submit" disabled={!!isLoading} variant={role === 'WRITER' ? 'emerald' : 'primary'} className="w-full" size="lg">
                {isLoading === 'email' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </GlowButton>
            </form>

            <p className="text-center text-[var(--text-secondary)] mt-6">
              Already have an account?{' '}
              <button onClick={() => onNavigate('LOGIN')} className="font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors">
                Sign In
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Username Prompt Modal */}
      {showUsernamePrompt && (
        <Modal
          isOpen={showUsernamePrompt}
          onClose={() => setShowUsernamePrompt(false)}
          title="Choose a Username"
        >
          <div className="space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              Your default username is already taken. Please choose one from below or type a custom one.
            </p>
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Suggestions</label>
              <div className="flex flex-wrap gap-2">
                {usernameSuggestions.map((sugg) => (
                  <button
                    key={sugg}
                    onClick={() => setSelectedUsername(sugg)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedUsername === sugg
                        ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50'
                        : 'bg-[var(--surface-hover)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--text-tertiary)]'
                    }`}
                  >
                    {sugg}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider">Custom Username</label>
              <input
                type="text"
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl glass-input"
                placeholder="Type your username..."
              />
            </div>

            <GlowButton onClick={handleUsernameSubmit} disabled={!selectedUsername || !!isLoading} className="w-full mt-4" size="lg">
              {isLoading === 'google' ? 'Saving...' : 'Confirm'}
            </GlowButton>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Register;
