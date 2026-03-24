import React, { useState, useRef, useEffect, Suspense } from 'react';
import { User, Notification } from '../types';
import ProfileModal from './ProfileModal';
import Logo from './Logo';
import { Bell, LogOut, UserCircle, ArrowLeftRight, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import LocationPrompt from './LocationPrompt';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  user: User | null;
  unreadCount: number;
  notifications: Notification[];
  onLogout: () => void;
  onMarkRead: () => void;
  onUpdateProfile: (updatedUser: Partial<User>) => void;
  onNavigate?: (view: 'LOGIN' | 'REGISTER') => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  user,
  unreadCount,
  notifications,
  onLogout,
  onMarkRead,
  onUpdateProfile,
  onNavigate,
  children
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user && !sessionStorage.getItem('location_prompted')) {
      const timer = setTimeout(() => setShowLocationPrompt(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleLocationGranted = (coords: { lat: number; lon: number }) => {
    onUpdateProfile({
      // @ts-ignore
      coordinates: coords
    });
    sessionStorage.setItem('location_prompted', 'true');
    sessionStorage.setItem('user_coords', JSON.stringify(coords));
    setShowLocationPrompt(false);
    window.location.reload();
  };

  const handleLocationSkip = () => {
    sessionStorage.setItem('location_prompted', 'true');
    setShowLocationPrompt(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifs = () => {
    if (!showNotifDropdown && unreadCount > 0) {
      onMarkRead();
    }
    setShowNotifDropdown(!showNotifDropdown);
    setShowUserDropdown(false);
  };

  const handleToggleUserMenu = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowNotifDropdown(false);
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const roleColors: Record<string, string> = {
    STUDENT: 'from-violet-500 to-fuchsia-500',
    WRITER: 'from-emerald-500 to-teal-500',
    ADMIN: 'from-rose-500 to-orange-500',
  };

  const roleColor = user ? roleColors[user.role] || 'from-violet-500 to-fuchsia-500' : '';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] transition-colors duration-300">
      {user && (
        <header className="bg-[var(--bg-secondary)]/70 backdrop-blur-2xl border-b border-[var(--border)] sticky top-0 z-50 shadow-[0_4px_30px_-10px_rgba(139,92,246,0.08)]">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Logo */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2.5 group cursor-pointer">
                <Suspense fallback={
                  <div className={`w-9 h-9 bg-gradient-to-br ${roleColor} rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg`}>P</div>
                }>
                  {React.createElement(React.lazy(() => import('./Logo3D')))}
                </Suspense>
                <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] font-display hidden sm:block">Paperly</span>
              </div>

              {/* Role Badge */}
              <div className={`hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r ${roleColor} bg-opacity-10 text-xs font-bold uppercase tracking-widest`}>
                <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span className="text-white/90">{user.role}</span>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <motion.button
                whileTap={{ scale: 0.9, rotate: 180 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <AnimatePresence mode="wait">
                  {theme === 'dark' ? (
                    <motion.div key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Sun size={18} />
                    </motion.div>
                  ) : (
                    <motion.div key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Moon size={18} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Notifications */}
              <div className="relative" ref={notifDropdownRef}>
                <button
                  onClick={handleToggleNotifs}
                  className="relative p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                >
                  <Bell size={18} className={showNotifDropdown ? 'text-[var(--accent)]' : ''} />
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[var(--bg-secondary)]"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-80 bg-[var(--bg-secondary)] backdrop-blur-3xl shadow-2xl ring-1 ring-[var(--border)] rounded-2xl overflow-hidden z-[9999]"
                    >
                      <div className="p-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]">
                        <h3 className="font-bold text-sm text-[var(--text-primary)]">Notifications</h3>
                        <span className="text-[10px] bg-[var(--accent-muted)] text-[var(--accent)] px-2 py-0.5 rounded-full font-bold">
                          {notifications.length} Total
                        </span>
                      </div>
                      <div className="max-h-80 overflow-y-auto bg-[var(--bg-secondary)]">
                        {notifications.length === 0 ? (
                          <div className="p-10 text-center">
                            <Bell size={24} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
                            <p className="text-xs text-[var(--text-tertiary)] font-medium">No notifications yet</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--border)]">
                            {notifications.map((n) => (
                              <div key={n.id} className={`p-4 hover:bg-[var(--surface-hover)] transition-colors flex gap-3 ${!n.isRead ? 'bg-[var(--accent-muted)]' : ''}`}>
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-[var(--accent)]' : 'bg-transparent'}`}></div>
                                <div className="flex-1">
                                  <p className="text-xs text-[var(--text-secondary)] leading-normal">{n.message}</p>
                                  <p className="text-[10px] text-[var(--text-tertiary)] mt-1 font-medium">{formatTime(n.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Menu */}
              <div className="relative" ref={userDropdownRef}>
                <button
                  onClick={handleToggleUserMenu}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[var(--surface-hover)] transition-all"
                >
                  <div className="hidden md:flex flex-col items-end px-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] leading-tight">{user.name}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-widest font-bold">{user.role}</span>
                  </div>
                  <div className={`w-9 h-9 rounded-xl overflow-hidden border-2 border-[var(--border)] ring-2 ring-transparent hover:ring-[var(--accent-muted)] transition-all`}>
                    <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                  </div>
                </button>

                <AnimatePresence>
                  {showUserDropdown && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-56 bg-[var(--bg-secondary)] backdrop-blur-3xl shadow-2xl ring-1 ring-[var(--border)] rounded-2xl overflow-hidden z-[9999]"
                    >
                      <div className="p-4 border-b border-[var(--border)] flex items-center gap-3 bg-[var(--bg-secondary)]">
                        <img src={user.avatar} className="w-10 h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)]" alt="" />
                        <div className="overflow-hidden">
                          <p className="text-sm font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                          <p className="text-xs text-[var(--text-tertiary)] truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-2 bg-[var(--bg-secondary)]">
                        <button
                          onClick={() => { setShowProfileModal(true); setShowUserDropdown(false); }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors group"
                        >
                          <UserCircle size={18} />
                          Profile Settings
                          <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <button
                          onClick={() => {
                            onLogout();
                            onNavigate?.('LOGIN');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors group"
                        >
                          <ArrowLeftRight size={18} />
                          Switch Account
                          <ChevronRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                        <div className="my-1 border-t border-[var(--border)]" />
                        <button
                          onClick={onLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut size={18} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-secondary)]"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden border-t border-[var(--border)] overflow-hidden"
              >
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-3 p-3 glass-card">
                    <img src={user.avatar} className="w-10 h-10 rounded-xl" alt="" />
                    <div>
                      <p className="font-bold text-sm text-[var(--text-primary)]">{user.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)]">{user.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setShowProfileModal(true); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    <UserCircle size={18} /> Profile Settings
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            backdropFilter: 'blur(16px)',
          },
        }}
      />

      <footer className="bg-[var(--bg-secondary)]/70 backdrop-blur-xl border-t border-[var(--border)] py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-[var(--text-tertiary)]">
          <p>© {new Date().getFullYear()} Paperly. Digitalizing academic assistance.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-[var(--accent)] transition-colors relative group">
              Privacy Policy
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--accent)] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors relative group">
              Terms of Service
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--accent)] group-hover:w-full transition-all duration-300" />
            </a>
            <a href="#" className="hover:text-[var(--accent)] transition-colors relative group">
              Contact Support
              <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--accent)] group-hover:w-full transition-all duration-300" />
            </a>
          </div>
        </div>
      </footer>

      {
        showProfileModal && user && (
          <ProfileModal
            user={user}
            onClose={() => setShowProfileModal(false)}
            onSave={onUpdateProfile}
          />
        )
      }
      {showLocationPrompt && (
        <LocationPrompt
          onLocationGranted={handleLocationGranted}
          onSkip={handleLocationSkip}
        />
      )}
    </div>
  );
};

export default Layout;
