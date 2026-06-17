import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import InstallAppPrompt from '../components/InstallAppPrompt';
import Navbar from '../components/Navbar';
import PermissionPrompt from '../components/PermissionPrompt';

const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f8]">
      <Navbar />
      <PermissionPrompt />
      <InstallAppPrompt />
      <main className="flex-1 max-w-md mx-auto w-full p-4 space-y-6 pb-24">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default MainLayout;
