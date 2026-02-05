import { Eye, EyeOff, ArrowLeft, Zap, Star, Shield } from 'lucide-react';
import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion } from 'framer-motion';

import { User } from '../types';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSocialLoginSuccess?: (user: User) => Promise<void>;
  onNavigate: (view: 'LANDING' | 'REGISTER' | 'FORGOT_PASSWORD') => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSocialLoginSuccess, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoading('google');
      try {
        const user = await api.socialLogin('google', tokenResponse.access_token);
        if (onSocialLoginSuccess) onSocialLoginSuccess(user);
      } catch (err: any) {
        setError(err.message || 'Google login failed');
        setIsLoading(null);
      }
    },
    onError: () => setError('Google login Failed'),
  });

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading('email');
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] relative overflow-hidden px-4">

      {/* Background Effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-violet-600/20 rounded-full blur-[150px]" />
        <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-fuchsia-500/15 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => onNavigate('LANDING')}
        className="absolute top-6 left-6 z-20 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
      </button>

      {/* Login Card */}
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
              P
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/50">Sign in to continue your journey</p>
          </div>

          {/* Google Login */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => loginWithGoogle()}
            disabled={!!isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mb-6"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span>{isLoading === 'google' ? 'Connecting...' : 'Continue with Google'}</span>
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-white/30 font-semibold uppercase tracking-widest">or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Form */}
          <form onSubmit={handleStandardSubmit} className="space-y-5">
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
              <label className="block text-sm font-semibold text-white/70 mb-2">Email</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-semibold text-white/70">Password</label>
                <button
                  type="button"
                  onClick={() => onNavigate('FORGOT_PASSWORD')}
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 outline-none transition-all pr-12"
                  placeholder="••••••••"
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
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isLoading === 'email' ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing In...
                </>
              ) : 'Sign In'}
            </motion.button>
          </form>

          {/* Register Link */}
          <p className="text-center text-white/50 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('REGISTER')}
              className="font-bold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Sign Up Free
            </button>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-6 text-white/30 text-xs">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-green-400" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-yellow-400" />
            <span>Fast</span>
          </div>
          <div className="flex items-center gap-2">
            <Star size={14} className="text-violet-400" />
            <span>Trusted</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
