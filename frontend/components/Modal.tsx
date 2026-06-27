import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { lenisInstance } from '../lib/lenis';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  headerContent?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  zIndex?: number;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  headerContent, 
  children, 
  footer, 
  className = 'max-w-lg',
  bodyClassName = 'p-6',
  zIndex = 100 
}) => {

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (lenisInstance) lenisInstance.stop();
    } else {
      document.body.style.overflow = '';
      if (lenisInstance) lenisInstance.start();
    }
    
    // Keydown for ESC
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.body.style.overflow = '';
      if (lenisInstance) lenisInstance.start();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm flex items-center justify-center p-4`}
          style={{ zIndex }}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {/* Overlay Click Handler */}
          <div className="absolute inset-0 z-0" onClick={onClose} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`glass-card relative z-10 w-full max-h-[90vh] overflow-hidden flex flex-col ${className}`}
            style={{ background: 'var(--bg-secondary)' }}
          >
            {/* Optional Custom Header or Built-in Title */}
            {headerContent ? (
              headerContent
            ) : title ? (
              <div className="p-6 border-b border-[var(--border)] flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-[var(--text-primary)] font-display flex items-center gap-2">
                  {title}
                </h2>
                <button 
                  onClick={onClose} 
                  className="w-8 h-8 rounded-full bg-[var(--surface)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  ×
                </button>
              </div>
            ) : null}

            {/* Scrollable Body */}
            <div 
              className={`overflow-y-auto overflow-x-hidden flex-1 ${bodyClassName}`}
              style={{ 
                overscrollBehavior: 'contain', 
                WebkitOverflowScrolling: 'touch', 
                touchAction: 'pan-y', 
                pointerEvents: 'auto' 
              }}
            >
              {children}
            </div>

            {/* Optional Footer */}
            {footer && (
              <div className="shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default Modal;
