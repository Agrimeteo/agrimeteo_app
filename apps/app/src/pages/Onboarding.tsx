import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';

const steps = [
  {
    title: "Welcome to AgroSmart",
    description: "Empowering farmers with smart technology. Monitor crops and get expert advice.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCCCokrMZjQ7-MZ31AGSpUW4aQ1j7QXR7-of74T0m-j-ML7Ri0OM27vgyj10MAGDQiSxM9CE8O2Sh7ch8WtLbxi7bq00YCMhJF95gU3aDdr5M7GQq_as3dbQfS8DdMlHF4FLlKlQ-APZPt5uj70fEqdFr-rZbJD4SnnR8z5hhDTGp4gthO2GsFW7ixrdN_tFXOSuiUUvJN-39zOeuHuDmyui9Q9QcVEVQryOym463h8WAqvFaLpC1Q1LM4MadgsfmeGbKXzsvYwlxn0"
  },
  {
    title: "Stay Informed",
    description: "Monitor your crop health in real-time and receive critical weather alerts to protect your harvest.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHwVHKnP_XKEcQc73d9adHF2VuS1Xhjnv-s1K5ctKYd9kBIVdKSMXooQAXbi34A5REj6i--VP1n5rgtE0b_abjEOMIxDtt3PH1Qj_DTB5nSBYlWy414NDxQMFpnqkdX_DaulZgvKgguFQe1IZmU83fstsL5OYLtFIMiX9Me6bF0qbmCYArfBaBISq7JJklkMl2osL4VfFkRFWbqM3e70K7wImnjfW__SREX9DeAFa5JIyKI93ud_LFlxXe67GFFQHPfyUeEmgJr25F"
  },
  {
    title: "Grow Smarter",
    description: "Get personalized agricultural advice and instant plant diagnosis from our AI assistant.",
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqdw9_yofu10RTtzhwM0irfwQuimSGy5vZ2N206It6ZtIG8YuvUEa2aRDJW01rID72LFFQSui6Eum0j2fOLQpQ4YCU1yTY3Sq6Nbu-Ra9oLU0be0xGoaWtxpf2QEr8Kdl4C4StQfLwFtrWreJ-UUw-27JerUyNkGtdViOpeF4uAcse28yRTGuaMoMChE4BDcKEBdcf9P2bIMOlWzIOj-PORca2ApCMyafUAp9_1v2Ils4SYY-NNtSXl44_AR8nCbKs8oGq7VZ4A1dX"
  }
];

const Onboarding: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8f8]">
      <div className="flex items-center justify-between p-4">
        <div className="w-12" />
        <h2 className="text-primary text-lg font-bold">AgroSmart</h2>
        <button 
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-primary/70 hover:text-primary"
        >
          Skip
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="w-full aspect-square relative rounded-xl overflow-hidden shadow-lg bg-primary/5">
              <img 
                src={steps[currentStep].image} 
                alt={steps[currentStep].title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="text-center space-y-4">
              <h1 className="text-slate-900 text-3xl font-bold tracking-tight">
                {steps[currentStep].title}
              </h1>
              <p className="text-slate-600 text-lg leading-relaxed max-w-sm mx-auto">
                {steps[currentStep].description}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex justify-center items-center gap-3">
          {steps.map((_, index) => (
            <div 
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep ? 'w-8 bg-primary' : 'w-2 bg-primary/20'
              }`}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={handleNext}
            className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
