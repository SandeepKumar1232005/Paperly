import { Eye, EyeOff, ArrowLeft, UserPlus, BookOpen, PenTool, User, Mail, Lock, AtSign } from 'lucide-react';
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole, User as UserType } from '../types';
import { api } from '../services/api';

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
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading('google');
      try {
        const user = await api.socialLogin('google', tokenResponse.access_token);
        if (onSocialLoginSuccess) {
          await onSocialLoginSuccess(user);
        }
      } catch (err: any) {
        setError(err.message || 'Google signup failed');
      } finally {
        setIsLoading(null);
      }
    },
    onError: () => setError('Google signup Failed'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    <div className="min-h-screen flex bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--bg-primary)]" />
        <div className="dark:block hidden">
          <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[150px]" />
          <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="dark:hidden block">
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
      <div className="hidden lg:flex flex-1 items-center justify-center relative z-10 p-12">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-black text-3xl mb-8 shadow-lg shadow-violet-500/30">
            <UserPlus size={32} />
          </div>
          <h2 className="text-4xl font-black text-[var(--text-primary)] leading-tight mb-4 font-display">
            Join the <span className="gradient-text">Paperly</span> community
          </h2>
          <p className="text-lg text-[var(--text-secondary)] mb-8 leading-relaxed">
            Whether you're a student needing help or a writer ready to earn — your journey starts here.
          </p>

          {/* Role Preview Cards */}
          <div className="space-y-3">
            {(['STUDENT', 'WRITER'] as const).map((r) => {
              const config = roleConfig[r];
              return (
                <motion.div key={r} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: r === 'STUDENT' ? 0.5 : 0.65 }}
                  className={`glass-card p-4 !rounded-xl flex items-center gap-4 cursor-pointer transition-all ${role === r ? 'ring-2 ring-[var(--accent)]' : ''}`}
                  onClick={() => setRole(r)}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                    <config.icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--text-primary)] text-sm">{r === 'STUDENT' ? 'Student' : 'Writer'}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{config.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center relative z-10 px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
          className="w-full max-w-md">
          <div className="glass-card p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-5 shadow-lg shadow-violet-500/30 lg:hidden">
                <UserPlus size={28} />
              </div>
              <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">Create Account</h1>
              <p className="text-[var(--text-secondary)]">Join thousands of students & writers</p>
            </div>

            {/* Role Selector (mobile) */}
            <div className="flex p-1 glass rounded-2xl gap-1 mb-6 lg:hidden">
              {(['STUDENT', 'WRITER'] as const).map((r) => {
                const config = roleConfig[r];
                return (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === r ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg` : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                    <config.icon size={16} /> {r === 'STUDENT' ? 'Student' : 'Writer'}
                  </button>
                );
              })}
            </div>

            {/* Google Signup */}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => loginWithGoogle()} disabled={!!isLoading}
              className="w-full flex items-center justify-center gap-3 glass-card !rounded-xl py-3.5 font-semibold text-[var(--text-primary)] hover:bg-[var(--surface-hover)] transition-all mb-5">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              <span>{isLoading === 'google' ? 'Connecting...' : 'Sign up with Google'}</span>
            </motion.button>

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
                    className="bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 p-3 rounded-xl text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" /> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="John Doe" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="john@example.com" />
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
                    placeholder="johndoe123" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={8} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 rounded-xl glass-input" placeholder="Min 8 characters" />
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

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={!!isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2 ripple bg-gradient-to-r ${roleConfig[role].gradient} text-white ${roleConfig[role].shadow}`}>
                {isLoading === 'email' ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </motion.button>
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
    </div>
  );
};

export default Register;
