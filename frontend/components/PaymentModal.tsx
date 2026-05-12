import React, { useState } from 'react';
import { Assignment } from '../types';
import { X, QrCode, CheckCircle, Wallet, Smartphone, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentModalProps {
    assignment: Assignment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ assignment, isOpen, onClose, onSuccess }) => {
    const [isConfirming, setIsConfirming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    const writerName = assignment.provider?.name || "Writer";
    const qrUrl = assignment.provider?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=writer@bank&pn=${encodeURIComponent(writerName)}&am=${assignment.budget}&cu=INR`;

    const handlePaymentConfirm = () => {
        setIsConfirming(true);
        setTimeout(() => {
            setIsConfirming(false);
            setShowSuccess(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--overlay)] backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-card shadow-2xl w-full max-w-md overflow-hidden"
                style={{ background: 'var(--bg-secondary)' }}
            >
                {/* Header */}
                <div className="relative p-6 bg-gradient-to-r from-emerald-600 to-teal-600">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white font-display">Secure Payment</h3>
                            <p className="text-sm text-white/70">Direct to {writerName}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {showSuccess ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="py-12 flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                                    <CheckCircle className="w-10 h-10 text-emerald-500 dark:text-emerald-400" />
                                </div>
                                <h4 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">Payment Verified!</h4>
                                <p className="text-[var(--text-secondary)] text-sm">Your payment has been confirmed successfully.</p>
                            </motion.div>
                        ) : (
                            <motion.div key="payment" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                {/* Amount Card */}
                                <div className="glass p-4 rounded-2xl mb-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[var(--text-tertiary)] text-sm">Total Amount</span>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-bold text-[var(--text-primary)]">₹{assignment.budget}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="flex flex-col items-center mb-6">
                                    <div className="bg-white p-3 rounded-2xl shadow-lg mb-3">
                                        <img src={qrUrl} alt="Payment QR" className="w-40 h-40 object-contain" />
                                    </div>
                                    <div className="flex items-center gap-2 text-emerald-500 dark:text-emerald-400 text-sm font-semibold">
                                        <QrCode size={16} />
                                        Scan with any UPI App
                                    </div>
                                </div>

                                {/* UPI Apps */}
                                <div className="flex justify-center gap-4 mb-6">
                                    {['GPay', 'PhonePe', 'Paytm'].map((app) => (
                                        <div key={app} className="flex flex-col items-center gap-1">
                                            <div className="w-10 h-10 glass rounded-xl flex items-center justify-center">
                                                <Smartphone size={18} className="text-[var(--text-secondary)]" />
                                            </div>
                                            <span className="text-[10px] text-[var(--text-tertiary)]">{app}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Confirm Button */}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handlePaymentConfirm}
                                    disabled={isConfirming}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ripple"
                                >
                                    {isConfirming ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Verifying Payment...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={18} />
                                            I have made the payment
                                        </>
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-[var(--surface)] border-t border-[var(--border)] flex items-center justify-center gap-2 text-[var(--text-tertiary)] text-xs">
                    <Shield size={12} />
                    Platform fee deducted from writer's earnings
                </div>
            </motion.div>
        </div>
    );
};
