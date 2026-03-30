import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RoleSelection = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'beginner' | 'farmer'>('farmer');

  const handleContinue = () => {
    localStorage.setItem('userRole', selectedRole);
    navigate('/register');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#f6f8f8] group/design-root overflow-x-hidden max-w-md mx-auto">
      {/* Top App Bar */}
      <div className="flex items-center p-4 pb-2 justify-between">
        <div className="text-[#13515e] flex size-12 shrink-0 items-center justify-center cursor-pointer">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </div>
        <h2 className="text-[#13515e] text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">AgroSmart</h2>
      </div>

      {/* Header Section */}
      <div className="px-6 pt-10 pb-6">
        <h1 className="text-slate-900 tracking-tight text-3xl font-bold leading-tight text-center">Tell us about yourself</h1>
        <p className="text-slate-500 text-center mt-2 text-sm">Choose the profile that best describes your agricultural journey.</p>
      </div>

      {/* Role Options Container */}
      <div className="flex flex-col gap-4 p-6 grow">
        {/* Farmer Card */}
        <label className="relative cursor-pointer group">
          <input
            checked={selectedRole === 'farmer'}
            className="peer sr-only"
            name="role"
            type="radio"
            value="farmer"
            onChange={() => setSelectedRole('farmer')}
          />
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white border-2 border-transparent shadow-sm peer-checked:border-[#13515e] peer-checked:ring-2 peer-checked:ring-[#13515e]/20 transition-all">
            <div className="w-full bg-[#13515e]/10 aspect-video rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#13515e] via-transparent to-transparent"></div>
              <span className="material-symbols-outlined text-[#13515e] text-6xl">agriculture</span>
            </div>
            <div className="text-center">
              <p className="text-slate-900 text-xl font-bold leading-tight mb-1">I am a Farmer</p>
              <p className="text-slate-500 text-sm leading-normal">Manage your crops, track weather patterns, and optimize your yield with advanced tools.</p>
            </div>
            <div className="absolute top-4 right-4 text-[#13515e] opacity-0 peer-checked:opacity-100 transition-opacity">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </label>

        {/* Beginner Card */}
        <label className="relative cursor-pointer group">
          <input
            checked={selectedRole === 'beginner'}
            className="peer sr-only"
            name="role"
            type="radio"
            value="beginner"
            onChange={() => setSelectedRole('beginner')}
          />
          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-white border-2 border-transparent shadow-sm peer-checked:border-[#13515e] peer-checked:ring-2 peer-checked:ring-[#13515e]/20 transition-all">
            <div className="w-full bg-[#71B280]/10 aspect-video rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#71B280] via-transparent to-transparent"></div>
              <span className="material-symbols-outlined text-[#71B280] text-6xl">potted_plant</span>
            </div>
            <div className="text-center">
              <p className="text-slate-900 text-xl font-bold leading-tight mb-1">I am a Beginner</p>
              <p className="text-slate-500 text-sm leading-normal">Learn the basics of gardening, discover plant care tips, and start your first green project.</p>
            </div>
            <div className="absolute top-4 right-4 text-[#13515e] opacity-0 peer-checked:opacity-100 transition-opacity">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
          </div>
        </label>
      </div>

      {/* Footer Button */}
      <div className="sticky bottom-0 bg-[#f6f8f8] p-6 pt-2">
        <button
          onClick={handleContinue}
          className="w-full h-14 bg-[#13515e] hover:bg-[#13515e]/90 text-white rounded-xl font-bold text-lg shadow-lg shadow-[#13515e]/20 flex items-center justify-center transition-colors"
        >
          Continue
          <span className="material-symbols-outlined ml-2">arrow_forward</span>
        </button>
        <div className="mt-4 flex justify-center items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
          <div className="h-1.5 w-4 rounded-full bg-[#13515e]"></div>
          <div className="h-1.5 w-1.5 rounded-full bg-slate-300"></div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

