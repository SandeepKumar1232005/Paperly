import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, KeyRound, Check } from 'lucide-react';
import { api } from '../services/api';

interface ForgotPasswordProps {
    onNavigate: (view: 'LOGIN') => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleRequestOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            await api.requestPasswordReset(email);
            setMessage({ type: 'success', text: `OTP sent to ${email}. Check your email.` });
            setStep(2);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to send OTP.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);
        try {
            if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.");
            await api.resetPassword(email, otp, newPassword);
            setMessage({ type: 'success', text: 'Password reset successfully! Redirecting...' });
            setTimeout(() => onNavigate('LOGIN'), 2000);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || 'Failed to reset password.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a] relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#1a1a3a] to-[#0a0a1a]" />
                <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-amber-600/15 rounded-full blur-[150px]" />
                <div className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-orange-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Back Button */}
            <button
                onClick={() => onNavigate('LOGIN')}
                className="absolute top-6 left-6 z-20 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
            >
                <ArrowLeft className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
            </button>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-amber-500/30">
                            {step === 1 ? <Mail size={28} /> : <KeyRound size={28} />}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p className="text-white/50">
                            {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email'}
                        </p>
                    </div>

                    {/* Message */}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-400'
                                }`}
                        >
                            {message.type === 'success' ? <Check size={16} /> : <span className="w-2 h-2 rounded-full bg-red-500" />}
                            {message.text}
                        </motion.div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleRequestOTP} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-white/70 mb-2">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </motion.button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-white/70 mb-2">Email</label>
                                <input
                                    type="email"
                                    disabled
                                    value={email}
                                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white/50 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-white/70 mb-2">OTP Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-amber-500 outline-none tracking-[0.5em] text-center font-mono text-xl"
                                    placeholder="000000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-white/70 mb-2">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={8}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:border-amber-500 outline-none transition-all"
                                    placeholder="Min 8 characters"
                                />
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
                            >
                                {isLoading ? 'Resetting...' : 'Set New Password'}
                            </motion.button>
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="w-full text-white/40 text-sm font-semibold hover:text-white transition-colors"
                            >
                                Change Email
                            </button>
                        </form>
                    )}

                    {/* Back to Login */}
                    <p className="text-center text-white/50 mt-6">
                        <button onClick={() => onNavigate('LOGIN')} className="font-bold text-amber-400 hover:text-amber-300 transition-colors">
                            Back to Login
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
