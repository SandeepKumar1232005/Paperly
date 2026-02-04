
import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import { User } from '../types';
import HandwritingUpload from './HandwritingUpload';

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

  // Cropping State
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in duration-300 shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-slate-50 flex-none">
          <h2 className="text-xl font-bold text-slate-900">{isCropping ? 'Adjust Photo' : 'Edit Profile'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-3xl">&times;</button>
        </div>

        <div className="flex flex-col overflow-hidden h-full">
          {isCropping ? (
            <div className="flex-1 relative bg-slate-900 w-full h-full flex flex-col">
              <div className="relative flex-1 w-full h-[500px] bg-slate-900">
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
                  classes={{
                    containerClassName: "h-full"
                  }}
                />
              </div>

              <div className="flex-none p-6 bg-white space-y-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Zoom</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Rotate</span>
                <input
                  type="range"
                  value={rotation}
                  min={0}
                  max={360}
                  step={1}
                  aria-labelledby="Rotation"
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCropCancel}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCropSave}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                >
                  Apply Crop
                </button>
              </div>
            </div>

          ) : (
            <>
              <div className="p-8 overflow-y-auto">
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className={`w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 ${isUploading ? 'opacity-50' : ''}`}>
                      <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full shadow-lg hover:bg-indigo-700 transition-all border-2 border-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">Profile Picture</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*"
                  />

                  {/* Avatar Selection */}
                  <div className="mt-6 w-full">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 text-center">Or Choose an Avatar</p>
                    <div className="flex gap-3 justify-center">
                      {['Felix', 'Aneka', 'Zoro', 'Luffy', 'Naruto'].map((seed) => {
                        const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
                        return (
                          <button
                            key={seed}
                            type="button"
                            onClick={() => setAvatar(url)}
                            className={`w-10 h-10 rounded-full overflow-hidden border-2 transition-transform hover:scale-110 ${avatar === url ? 'border-indigo-600 ring-2 ring-indigo-100 scale-110' : 'border-white shadow-sm'}`}
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
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email (Read Only)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
                    />
                  </div>

                  {user.username && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Username (Read Only)</label>
                      <input
                        type="text"
                        disabled
                        value={user.username}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed outline-none"
                      />
                    </div>
                  )}

                  {/* Address Field - Hide for Admin */}
                  {user.role !== 'ADMIN' && (
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Address (For Courier)</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your full physical address..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white text-slate-700 min-h-[80px]"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-700 leading-relaxed">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Profile changes will be reflected across all your active assignments and chat windows.
                  </div>

                  {/* Handwriting Analysis Section - Hide for Admin */}
                  {user.role !== 'ADMIN' && (
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

                  {/* Closing the space-y-6 div */}
                </div>
              </div>

              <div className="p-6 border-t bg-slate-50 flex gap-3 flex-none mt-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
                >
                  Save Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div >
  );
};

export default ProfileModal;
