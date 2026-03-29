import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { User } from '../types';
import HandwritingUpload from './HandwritingUpload';
import { X, Camera, Info } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: Partial<User>) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onSave }) => {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [address, setAddress] = useState(user.address || '');
  const [handwritingStyle, setHandwritingStyle] = useState(user.handwriting_style || '');
  const [handwritingConfidence, setHandwritingConfidence] = useState(user.handwriting_confidence || 0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [tempImg, setTempImg] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempImg(event.target?.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (tempImg && croppedAreaPixels) {
      try {
        const croppedImage = await getCroppedImg(tempImg, croppedAreaPixels, rotation);
        if (croppedImage) {
          setAvatar(croppedImage);
          setIsCropping(false);
          setTempImg(null);
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImg(null);
  };

  const handleSave = () => {
    onSave({
      name,
      avatar,
      address,
      handwriting_style: handwritingStyle,
      handwriting_confidence: handwritingConfidence
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-sm z-[200] flex items-start justify-center p-4 pt-16 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center flex-none">
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-display">{isCropping ? 'Adjust Photo' : 'Edit Profile'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-[var(--surface)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col overflow-hidden h-full">
          {isCropping ? (
            <div className="flex-1 relative bg-[var(--bg-primary)] w-full flex flex-col">
              <div className="relative w-full" style={{ height: '320px' }}>
                <Cropper
                  image={tempImg!}
                  crop={crop}
                  zoom={zoom}
                  rotation={rotation}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  onRotationChange={setRotation}
                />
              </div>

              <div className="flex-none p-4 bg-[var(--bg-secondary)] space-y-3 border-t border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest w-14">Zoom</span>
                  <input
                    type="range" value={zoom} min={1} max={3} step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest w-14">Rotate</span>
                  <input
                    type="range" value={rotation} min={0} max={360} step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                    className="flex-1 h-2 bg-[var(--surface)] rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleCropCancel}
                    className="flex-1 px-4 py-2.5 rounded-xl glass text-[var(--text-secondary)] font-semibold text-sm hover:bg-[var(--surface-hover)] transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleCropSave}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold text-sm shadow-lg shadow-violet-500/30 transition-all">
                    Apply Crop
                  </button>
                </div>
              </div>
            </div>

          ) : (
            <>
              <div className="p-8 overflow-y-auto">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-2 border-[var(--border)] bg-[var(--surface)] ${isUploading ? 'opacity-50' : ''}`}>
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white p-2.5 rounded-full shadow-lg hover:scale-105 transition-all border-2 border-[var(--bg-secondary)]"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mt-4">Profile Picture</p>
                  <input
                    type="file" ref={fileInputRef} onChange={handleFileChange}
                    className="hidden" accept="image/*"
                  />

                  <div className="mt-6 w-full">
                    <p className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-3 text-center">Or Choose an Avatar</p>
                    <div className="flex gap-3 justify-center">
                      {['Felix', 'Aneka', 'Zoro', 'Luffy', 'Naruto'].map((seed) => {
                        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                        return (
                          <button
                            key={seed} type="button"
                            onClick={() => setAvatar(url)}
                            className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-transform hover:scale-110 ${avatar === url ? 'border-violet-500 ring-2 ring-violet-500/20 scale-110' : 'border-[var(--border)]'}`}
                          >
                            <img src={url} alt={seed} className="w-full h-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl glass-input" />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 ml-1">Email (Read Only)</label>
                    <input type="email" disabled value={user.email}
                      className="w-full px-4 py-3.5 rounded-xl glass-input opacity-60 cursor-not-allowed" />
                  </div>

                  {user.username && (
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 ml-1">Username (Read Only)</label>
                      <input type="text" disabled value={user.username}
                        className="w-full px-4 py-3.5 rounded-xl glass-input opacity-60 cursor-not-allowed" />
                    </div>
                  )}

                  {user.role !== 'ADMIN' && (
                    <div>
                      <label className="block text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 ml-1">Address (For Courier)</label>
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full physical address..."
                        className="w-full px-4 py-3.5 rounded-xl glass-input min-h-[80px] resize-none" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-[var(--accent-muted)] rounded-2xl border border-[var(--accent)]/20 text-xs text-[var(--text-secondary)] leading-relaxed">
                    <Info size={18} className="flex-shrink-0 text-[var(--accent)]" />
                    Profile changes will be reflected across all your active assignments and chat windows.
                  </div>

                  {user.role === 'WRITER' && (
                    <HandwritingUpload
                      onAnalysisComplete={(style, confidence) => {
                        setHandwritingStyle(style);
                        setHandwritingConfidence(confidence);
                      }}
                      currentStyle={handwritingStyle}
                      currentConfidence={handwritingConfidence}
                      currentSampleUrl={user.handwriting_sample_url}
                    />
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-[var(--border)] flex gap-3 flex-none mt-auto">
                <button type="button" onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-xl text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors">
                  Cancel
                </button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="button" onClick={handleSave} disabled={isUploading}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-violet-500/30 disabled:opacity-50 ripple">
                  Save Changes
                </motion.button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ProfileModal;
