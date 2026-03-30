import React from 'react';
import { motion } from 'motion/react';
import { Sprout } from 'lucide-react';

const SplashScreen: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  React.useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-[#134E5E] to-[#71B280]">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 flex h-40 w-40 items-center justify-center rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-2xl"
      >
        <img src="/logo.png" alt="AgriMétéo Logo" className="h-32 w-32 rounded-full" />
      </motion.div>
      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-white tracking-tight text-5xl font-bold leading-tight mb-2"
      >
        AgriMétéo
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="text-white/90 text-lg font-light leading-normal mb-12"
      >
        Your Smart Agriculture Assistant
      </motion.p>
      
      <div className="w-64 space-y-4">
        <div className="flex justify-between items-center mb-1">
          <p className="text-white/80 text-sm font-medium">Initializing systems...</p>
          <p className="text-white/80 text-sm font-medium">100%</p>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2 }}
            className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-white/50 text-xs font-medium tracking-widest uppercase">
          Precision Tech Solutions
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
