import { Eye, EyeOff, ArrowLeft, UserPlus, BookOpen, PenTool } from 'lucide-react';
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { UserRole, User } from '../types';
import { api } from '../services/api';

interface RegisterProps {
  onRegister: (name: string, email: string, username: string, password: string, role: UserRole) => Promise<void>;
  onSocialLoginSuccess?: (user: User) => Promise<void>;
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] relative overflow-hidden px-4 py-8">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <div className="absolute top-20 right-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-fuchsia-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('LANDING')}
        className="absolute top-6 left-6 z-20 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
      </button>

      {/* Register Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-lg shadow-violet-500/30">
              <UserPlus size={28} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join Paperly</h1>
            <p className="text-white/50">Create your account to get started</p>
          </div>

          {/* Role Selector */}
          <div className="flex p-1 bg-white/5 border border-white/10 rounded-2xl gap-1 mb-6">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'STUDENT' ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              <BookOpen size={16} /> Student
            </button>
            <button
              type="button"
              onClick={() => setRole('WRITER')}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${role === 'WRITER' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            >
              <PenTool size={16} /> Writer
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-red-500" />
                {error}
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (/[A-Z]/.test(e.target.value)) {
                    setError('Username will be converted to lowercase automatically.');
                  } else {
                    setError('');
                  }
                }}
                className={`w-full px-4 py-3.5 rounded-xl bg-white/5 border ${/[A-Z]/.test(username) ? 'border-amber-500/50' : 'border-white/10'} text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all`}
                placeholder="johndoe123"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/70 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all pr-12"
                  placeholder="Min 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={!!isLoading}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-70 flex items-center justify-center gap-2 ${role === 'WRITER'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-violet-500/30'
                }`}
            >
              {isLoading === 'email' ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : 'Create Account'}
            </motion.button>
          </form>

          {/* Login Link */}
          <p className="text-center text-white/50 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('LOGIN')}
              className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign In
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
