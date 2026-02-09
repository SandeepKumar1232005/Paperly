import React, { useState, useRef, useEffect } from 'react';
import { User, Notification } from '../types';
import ProfileModal from './ProfileModal';
import Logo from './Logo';
import { Bell, LogOut, Settings, UserCircle, ArrowLeftRight } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

import LocationPrompt from './LocationPrompt';

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

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a1a]">
      {user && (
        <header className="bg-[#0a0a1a]/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 group cursor-pointer">
                <Logo className="h-10 w-10 transition-transform group-hover:scale-110" />
                <span className="text-xl font-bold tracking-tight text-white">Paperly</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {user && (
                <>
                  <div className="relative" ref={notifDropdownRef}>
                    <button
                      onClick={handleToggleNotifs}
                      className="relative p-2.5 rounded-xl hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                    >
                      <Bell size={20} className={showNotifDropdown ? 'text-violet-400' : ''} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#0a0a1a]">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {showNotifDropdown && (
                      <div className="absolute right-0 mt-2 w-80 bg-[#12122a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center">
                          <h3 className="font-bold text-sm text-white">Notifications</h3>
                          <span className="text-[10px] bg-violet-500/10 text-violet-400 px-2 py-0.5 rounded-full font-bold">
                            {notifications.length} Total
                          </span>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-10 text-center">
                              <p className="text-xs text-white/40 font-medium">No notifications yet</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5">
                              {notifications.map((n) => (
                                <div key={n.id} className={`p-4 hover:bg-white/5 transition-colors flex gap-3 ${!n.isRead ? 'bg-violet-500/5' : ''}`}>
                                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? 'bg-violet-500' : 'bg-transparent'}`}></div>
                                  <div className="flex-1">
                                    <p className="text-xs text-white/70 leading-normal">{n.message}</p>
                                    <p className="text-[10px] text-white/30 mt-1 font-medium">{formatTime(n.timestamp)}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={userDropdownRef}>
                    <button
                      onClick={handleToggleUserMenu}
                      className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/10 transition-all"
                    >
                      <div className="hidden md:flex flex-col items-end px-2">
                        <span className="text-sm font-bold text-white leading-tight">{user.name}</span>
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{user.role}</span>
                      </div>
                      <img src={user.avatar} className="w-9 h-9 rounded-xl object-cover border-2 border-white/10" alt="Avatar" />
                    </button>

                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-56 bg-[#12122a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center gap-3">
                          <img src={user.avatar} className="w-10 h-10 rounded-xl border border-white/10" alt="" />
                          <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-white/50 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="p-2">
                          <button
                            onClick={() => { setShowProfileModal(true); setShowUserDropdown(false); }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <UserCircle size={18} />
                            Profile Settings
                          </button>
                          <button
                            onClick={onLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut size={18} />
                            Logout
                          </button>
                          <button
                            onClick={() => {
                              onLogout();
                              onNavigate?.('LOGIN');
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5 hover:text-white transition-colors"
                          >
                            <ArrowLeftRight size={18} />
                            Switch Account
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {children}
      </main>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#12122a',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
          },
        }}
      />

      <footer className="bg-[#0a0a1a] border-t border-white/10 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
          <p>© 2024 Paperly. Digitalizing academic assistance.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-violet-400 transition-colors">Contact Support</a>
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
