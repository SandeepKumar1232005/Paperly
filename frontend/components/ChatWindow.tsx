import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, ChatMessage, Assignment } from '../types';
import { X, Paperclip, Send, Reply, Copy, Check, FileText, File } from 'lucide-react';

interface ChatWindowProps {
  currentUser: User;
  otherUser?: User | null;
  assignment: Assignment;
  messages: ChatMessage[];
  isOtherTyping: boolean;
  error?: string | null;
  onSendMessage: (text: string, attachment?: ChatMessage['attachment'], replyTo?: ChatMessage['replyTo']) => void;
  onUserTyping: () => void;
  onClose: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  currentUser,
  otherUser,
  assignment,
  messages,
  isOtherTyping,
  error,
  onSendMessage,
  onUserTyping,
  onClose
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<ChatMessage['attachment'] | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOtherTyping, error]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedAttachment) || isProcessing) return;

    const replyContext = replyingTo ? {
      id: replyingTo.id,
      text: replyingTo.text || "Shared an attachment",
      senderId: replyingTo.senderId
    } : undefined;

    onSendMessage(inputText, selectedAttachment || undefined, replyContext);
    setInputText('');
    setSelectedAttachment(null);
    setReplyingTo(null);
    setUploadProgress(null);
  };

  const handleReply = (msg: ChatMessage) => {
    setReplyingTo(msg);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    onUserTyping();
  };

  const handleCopyText = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      setUploadProgress(0);

      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedAttachment({
              name: file.name,
              url: event.target?.result as string,
              type: file.type,
              size: file.size,
              file: file
            });
            setIsProcessing(false);
            setUploadProgress(100);
          };
          reader.readAsDataURL(file);
        } else {
          setUploadProgress(progress);
        }
      }, 200);
    }
    e.target.value = '';
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return (
        <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
          <FileText size={20} />
        </div>
      );
    }
    if (mimeType.includes('word') || mimeType.includes('officedocument.word') || mimeType.includes('text/plain')) {
      return (
        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
          <FileText size={20} />
        </div>
      );
    }
    return (
      <div className="p-2 bg-white/10 text-white/60 rounded-lg">
        <File size={20} />
      </div>
    );
  };

  const statusInfo = useMemo(() => {
    if (isOtherTyping) return { label: 'Typing...', color: 'bg-emerald-400 animate-pulse' };

    if (!otherUser || !otherUser.lastActive) return { label: 'Offline', color: 'bg-white/30' };

    const lastActive = new Date(otherUser.lastActive).getTime();
    const now = Date.now();
    const diffMins = Math.floor((now - lastActive) / 1000 / 60);

    if (diffMins < 1) return { label: 'Online', color: 'bg-emerald-500' };
    if (diffMins < 5) return { label: 'Away', color: 'bg-amber-400' };

    const lastSeen = diffMins > 60
      ? `Last seen ${Math.floor(diffMins / 60)}h ago`
      : `Last seen ${diffMins}m ago`;

    return { label: lastSeen, color: 'bg-white/30' };
  }, [otherUser, isOtherTyping]);

  const otherRoleLabel = currentUser.role === 'STUDENT' ? 'Writer' : 'Student';
  const otherInitials = otherUser?.name?.charAt(0) || otherRoleLabel.charAt(0);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div
      className="fixed bottom-6 right-6 w-96 h-[500px] bg-[#12122a] border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[200] overflow-hidden animate-in slide-in-from-bottom-4 duration-300"
      role="dialog"
      aria-label={`Chat for ${assignment.title}`}
    >
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white flex justify-between items-center shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-xs font-bold border border-white/10" aria-hidden="true">
              {otherInitials}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 border-2 border-violet-600 rounded-full ${statusInfo.color}`} aria-hidden="true"></span>
          </div>
          <div className="overflow-hidden">
            <h3 className="text-sm font-bold truncate w-40">{otherUser?.name || assignment.title}</h3>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] opacity-80 uppercase tracking-tighter font-bold">
                {statusInfo.label}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden lg:block text-right pr-2">
            <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">{otherRoleLabel}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Error Message Banner */}
      {error && (
        <div className="bg-red-500/10 text-red-400 px-4 py-2 text-[11px] font-medium border-b border-red-500/20 animate-in slide-in-from-top-2 flex items-center gap-2" role="alert">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#0a0a1a] scroll-smooth"
        role="log"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          const isCopied = copiedId === msg.id;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in duration-200`}>
              <div className={`max-w-[85%] flex flex-col gap-1.5 ${isMe ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group/msg transition-all ${isMe
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-none'
                    : 'bg-white/10 text-white border border-white/10 rounded-tl-none'
                    }`}
                >
                  {/* Reply Context within Bubble */}
                  {msg.replyTo && (
                    <div className={`mb-2 p-2 rounded-lg text-[11px] border-l-4 ${isMe ? 'bg-white/10 border-white/40 text-white/70' : 'bg-white/5 border-violet-400 text-white/50'
                      }`}>
                      <p className="font-bold opacity-70 mb-0.5">
                        {msg.replyTo.senderId === currentUser.id ? 'You' : otherRoleLabel}
                      </p>
                      <p className="line-clamp-2">{msg.replyTo.text}</p>
                    </div>
                  )}

                  {isCopied && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-[10px] px-2 py-0.5 rounded-md font-bold animate-in fade-in slide-in-from-bottom-1 duration-200 z-20 flex items-center gap-1">
                      <Check size={10} /> Copied!
                    </div>
                  )}

                  {msg.attachment && (
                    <div className="mb-2">
                      {msg.attachment.type.startsWith('image/') ? (
                        <div className="relative group">
                          <img src={msg.attachment.url} alt="" className="max-w-full rounded-lg border border-white/20 mb-1" />
                        </div>
                      ) : (
                        <div className={`flex items-center gap-3 p-2 rounded-xl border ${isMe ? 'bg-white/10 border-white/20' : 'bg-white/5 border-white/10'}`}>
                          {getFileIcon(msg.attachment.type)}
                          <span className="text-xs font-bold truncate">{msg.attachment.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                  {msg.text && (
                    <div className="relative">
                      <p className="leading-relaxed whitespace-pre-wrap pr-4">{msg.text}</p>

                      {/* Action buttons (Reply & Copy) */}
                      <div className={`absolute -top-1 -right-2 flex gap-1 transition-all opacity-0 group-hover/msg:opacity-100 group-focus-within/msg:opacity-100 focus:opacity-100`}>
                        <button
                          onClick={() => handleReply(msg)}
                          className={`p-1.5 rounded-lg ${isMe ? 'text-white/60 hover:bg-white/20' : 'text-white/40 hover:bg-white/10'} hover:text-white transition-all`}
                          title="Reply"
                        >
                          <Reply size={14} />
                        </button>
                        <button
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          className={`p-1.5 rounded-lg ${isMe ? 'text-white/60 hover:bg-white/20' : 'text-white/40 hover:bg-white/10'} hover:text-white transition-all`}
                          title="Copy"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <div className={`flex items-center gap-1.5 ${isMe ? 'text-violet-400' : 'text-white/30'}`}>
                  <span className="text-[9px] font-medium">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {isOtherTyping && (
          <div className="flex justify-start items-end gap-2 animate-in fade-in duration-300">
            <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-[10px] font-bold text-white/50" aria-hidden="true">{otherInitials}</div>
            <div className="bg-white/10 text-white/50 border border-white/10 px-3 py-2 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs">
              <span className="font-medium">{otherUser?.name || otherRoleLabel} is typing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Reply Preview Area */}
      {replyingTo && (
        <div className="px-4 py-2 border-t border-white/10 bg-violet-500/10 flex items-center justify-between animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-1 bg-violet-500 h-8 rounded-full"></div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
                Replying to {replyingTo.senderId === currentUser.id ? 'yourself' : (otherUser?.name || otherRoleLabel)}
              </p>
              <p className="text-xs text-white/50 truncate italic">"{replyingTo.text || 'Attachment shared'}"</p>
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="p-1 text-white/40 hover:text-violet-400 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* Attachment Preview Area */}
      {(selectedAttachment || isProcessing) && (
        <div className="px-4 py-3 border-t border-white/10 bg-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{isProcessing ? 'Processing...' : selectedAttachment?.name}</p>
                <p className="text-[10px] text-white/40">{isProcessing ? `${Math.round(uploadProgress || 0)}%` : formatFileSize(selectedAttachment?.size)}</p>
              </div>
            </div>
            {!isProcessing && (
              <button onClick={() => { setSelectedAttachment(null); setUploadProgress(null); }} className="p-1.5 hover:bg-white/10 rounded-lg text-white/40">
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-[#12122a] flex items-center gap-2">
        <input type="file" id="chat-file-input" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 text-white/40 hover:text-violet-400 transition-all rounded-lg hover:bg-white/5"
          title="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={replyingTo ? "Type your reply..." : "Type a message..."}
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 transition-all"
        />
        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedAttachment) || isProcessing}
          className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-3 rounded-xl transition-all shadow-lg shadow-violet-500/30 disabled:opacity-50"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
