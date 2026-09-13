import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, Mail, User, X } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { useNavigate } from 'react-router-dom';

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const navigate = useNavigate();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  const getAvatarFallback = () => {
    return `https://ui-avatars.com/api/?name=${authUser.username}&background=3B82F6&color=fff&size=128`;
  };

  return (
    <div className="h-screen flex flex-col bg-background relative z-0">
      <Navbar />
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-8 pt-20 cursor-pointer"
        onClick={() => navigate('/')}
      >
        <div className="max-w-2xl mx-auto space-y-8 cursor-default" onClick={(e) => e.stopPropagation()}>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cards rounded-2xl p-6 sm:p-8 border border-borders shadow-sm relative overflow-hidden"
          >
            <button 
              onClick={() => navigate('/')}
              className="absolute top-4 lg:top-10 right-4 z-20 p-2 rounded-full bg-background/50 hover:bg-background border border-borders text-text-main transition-colors cursor-pointer backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 to-accent/10 z-0"></div>
            
            <div className="relative z-10">
              <div className="text-center mb-8 pt-4">
                <h1 className="text-2xl font-bold mb-2">Profile</h1>
                <p className="text-muted">Manage your account settings</p>
              </div>

              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="relative group">
                  <img
                    src={selectedImg || authUser.profilePic || getAvatarFallback()}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="w-32 h-32 rounded-full object-cover border-4 border-cards shadow-lg"
                  />

                  <label
                    htmlFor="avatar-upload"
                    className={`absolute bottom-0 right-0 bg-primary hover:bg-primary/90 p-2 rounded-full cursor-pointer transition-all shadow-md ${
                      isUpdatingProfile ? 'animate-pulse pointer-events-none' : ''
                    }`}
                  >
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUpdatingProfile}
                    />
                  </label>
                </div>
                <p className="text-sm text-muted">
                  {isUpdatingProfile ? 'Uploading...' : 'Click the camera icon to update your photo'}
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="text-sm text-muted flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </div>
                  <div className="px-4 py-3 bg-background border border-borders rounded-lg text-text-main">
                    {authUser.username}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-sm text-muted flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                  <div className="px-4 py-3 bg-background border border-borders rounded-lg text-text-main">
                    {authUser.email}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-borders">
                <h2 className="text-lg font-medium mb-4">Account Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-borders/50">
                    <span className="text-muted">Member Since</span>
                    <span>{authUser.createdAt?.split('T')[0]}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted">Account Status</span>
                    <span className="text-success flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
