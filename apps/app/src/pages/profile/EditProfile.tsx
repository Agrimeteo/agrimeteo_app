import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Camera, User, MapPin, Mail, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const EditProfile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
    bio: '',
    avatar: user?.avatar || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get('/profile');
        const profile = response.data.data;

        setFormData({
          name: profile?.full_name || user?.name || '',
          email: profile?.email || user?.email || '',
          phone: profile?.phone || '',
          location: profile?.location || '',
          bio: profile?.bio || '',
          avatar: profile?.avatar_url || user?.avatar || '',
        });

        updateUser({
          name: profile?.full_name || user?.name || '',
          email: profile?.email || user?.email || '',
          avatar: profile?.avatar_url || user?.avatar || '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
      }
    };

    loadProfile();
  }, [updateUser, user?.avatar, user?.email, user?.name]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.put('/profile', {
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      });

      const updatedProfile = response.data.data;
      updateUser({
        name: updatedProfile?.full_name || formData.name,
        email: updatedProfile?.email || formData.email,
        avatar: updatedProfile?.avatar_url || formData.avatar,
      });

      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      alert('Failed to update profile');
      console.error('Profile update error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarPick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, avatar: previewUrl }));
    setIsUploadingAvatar(true);

    try {
      const payload = new FormData();
      payload.append('avatar', file);

      const response = await api.post('/profile/avatar', payload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const avatarUrl = response.data.data?.avatar_url;
      if (avatarUrl) {
        setFormData((prev) => ({ ...prev, avatar: avatarUrl }));
        updateUser({ avatar: avatarUrl });
      }
    } catch (error) {
      alert('Failed to upload avatar');
      console.error('Avatar upload error:', error);
      setFormData((prev) => ({ ...prev, avatar: user?.avatar || '' }));
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-primary/10 bg-white p-4 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="ml-4 flex-1 text-lg font-bold text-slate-900">Edit Profile</h2>
        <button
          onClick={() => void handleSubmit()}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
        >
          <Save size={16} />
          {isLoading ? 'Saving...' : 'Save'}
        </button>
      </header>

      <main className="space-y-6 p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative group">
            <div className="size-32 overflow-hidden rounded-full border-4 border-white bg-primary/20 shadow-xl flex items-center justify-center">
              {formData.avatar ? (
                <img className="h-full w-full object-cover" src={formData.avatar} alt="Profile" />
              ) : (
                <User size={64} className="text-primary" />
              )}
            </div>
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={isUploadingAvatar}
              className="absolute bottom-0 right-0 flex size-12 items-center justify-center rounded-full border-4 border-white bg-primary text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-60"
            >
              <Camera size={20} />
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <p className="text-sm text-slate-500">
            {isUploadingAvatar ? 'Uploading avatar...' : 'Tap to change profile picture'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Location</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your location"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tell us about yourself..."
            />
          </div>
        </form>

        <div className="space-y-4 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">Account Settings</h3>

          <button className="w-full flex items-center justify-between rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail size={20} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-slate-800">Change Password</p>
                <p className="text-xs text-slate-500">Update your account password</p>
              </div>
            </div>
            <ArrowLeft size={16} className="rotate-180 text-slate-400" />
          </button>

          <button className="w-full flex items-center justify-between rounded-lg bg-slate-50 p-4 transition-colors hover:bg-slate-100">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-red-100">
                <User size={20} className="text-red-500" />
              </div>
              <div className="text-left">
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-xs text-slate-500">Permanently delete your account</p>
              </div>
            </div>
            <ArrowLeft size={16} className="rotate-180 text-slate-400" />
          </button>
        </div>
      </main>
    </motion.div>
  );
};

export default EditProfile;
