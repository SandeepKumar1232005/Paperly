import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, KeyRound, Check, Lock, Shield } from 'lucide-react';
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
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] relative overflow-hidden px-4">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-[var(--bg-primary)]" />
                <div className="dark:block hidden">
                    <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-amber-600/12 rounded-full blur-[150px]" />
                    <div className="absolute bottom-20 right-1/3 w-[400px] h-[400px] bg-orange-500/8 rounded-full blur-[120px]" />
                </div>
                <div className="dark:hidden block">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50" />
                </div>
            </div>

            {/* Back Button */}
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => onNavigate('LOGIN')}
                className="absolute top-6 left-6 z-20 p-3 rounded-xl glass hover:bg-[var(--surface-hover)] transition-all group">
                <ArrowLeft className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            </motion.button>

            {/* Card */}
            <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md">
                <div className="glass-card p-8">
                    {/* Step Indicator */}
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 1
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-[var(--surface)] text-[var(--text-tertiary)]'}`}>
                            1
                        </div>
                        <div className={`w-12 h-0.5 rounded-full transition-all ${step >= 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-[var(--surface)]'}`} />
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step >= 2
                            ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                            : 'bg-[var(--surface)] text-[var(--text-tertiary)]'}`}>
                            2
                        </div>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div key={step} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring" }}
                            className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg shadow-amber-500/30">
                            {step === 1 ? <Mail size={28} /> : <KeyRound size={28} />}
                        </motion.div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2 font-display">
                            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
                        </h1>
                        <p className="text-[var(--text-secondary)]">
                            {step === 1 ? 'Enter your email to receive a reset code' : 'Enter the code sent to your email'}
                        </p>
                    </div>

                    {/* Message */}
                    <AnimatePresence>
                        {message && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${message.type === 'success'
                                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400'}`}>
                                {message.type === 'success' ? <Check size={16} /> : <span className="w-2 h-2 rounded-full bg-red-500" />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.form key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                                onSubmit={handleRequestOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="you@example.com" />
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 ripple">
                                    {isLoading ? 'Sending...' : 'Send OTP'}
                                </motion.button>
                            </motion.form>
                        ) : (
                            <motion.form key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleResetPassword} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">Email</label>
                                    <div className="relative">
                                        <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        <input type="email" disabled value={email}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input opacity-60 cursor-not-allowed" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">OTP Code</label>
                                    <div className="relative">
                                        <Shield size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        <input type="text" required maxLength={6} value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input tracking-[0.4em] text-center font-mono text-xl"
                                            placeholder="000000" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-[var(--text-secondary)] mb-2">New Password</label>
                                    <div className="relative">
                                        <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                                        <input type="password" required minLength={8} value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full pl-11 pr-4 py-3.5 rounded-xl glass-input" placeholder="Min 8 characters" />
                                    </div>
                                </div>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 ripple">
                                    {isLoading ? 'Resetting...' : 'Set New Password'}
                                </motion.button>
                                <button type="button" onClick={() => setStep(1)}
                                    className="w-full text-[var(--text-tertiary)] text-sm font-semibold hover:text-[var(--text-primary)] transition-colors">
                                    Change Email
                                </button>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <p className="text-center text-[var(--text-secondary)] mt-6">
                        <button onClick={() => onNavigate('LOGIN')} className="font-bold text-amber-500 hover:text-amber-400 transition-colors">
                            Back to Login
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
