import React, { useState } from 'react';
import { Assignment } from '../types';

interface PaymentModalProps {
    assignment: Assignment;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ assignment, isOpen, onClose, onSuccess }) => {
    const [isConfirming, setIsConfirming] = useState(false);

    if (!isOpen) return null;

    // Simulate Writer UPI / QR
    // In real app, this comes from assignment.provider?.qr_code_url or similar
    // using a placeholder for demo
    const writerName = assignment.provider?.name || "Writer";
    const qrUrl = assignment.provider?.qr_code_url || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=writer@bank&pn=${encodeURIComponent(writerName)}&am=${assignment.budget}&cu=INR`;

    const handlePaymentConfirm = () => {
        setIsConfirming(true);
        // Simulate network delay
        setTimeout(() => {
            onSuccess();
            setIsConfirming(false);
            onClose();
        }, 1500);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 border border-slate-200">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-indigo-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Scan to Pay</h3>
                        <p className="text-xs text-indigo-600 font-semibold">Direct Payment to Writer</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-white rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center text-center">
                    <div className="bg-white p-2 rounded-xl border shadow-sm mb-4">
                        <img src={qrUrl} alt="Payment QR" className="w-48 h-48 object-contain" />
                    </div>

                    <div className="mb-6">
                        <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                        <div className="text-3xl font-bold text-slate-900">₹{assignment.budget}</div>
                    </div>

                    <div className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg w-full mb-6 border border-slate-100">
                        Scan this QR code with any UPI app (GPay, PhonePe, Paytm) to pay <strong>{writerName}</strong> directly.
                    </div>

                    <button
                        onClick={handlePaymentConfirm}
                        disabled={isConfirming}
                        className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all shadow-lg shadow-green-100 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                    >
                        {isConfirming ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Verifying Payment...
                            </>
                        ) : (
                            "I have made the payment"
                        )}
                    </button>
                </div>
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-[10px] text-slate-400">
                        Platform Fee will be deducted from writer's account automatically.
                    </p>
                </div>
            </div>
        </div>
    );
};
