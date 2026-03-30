import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, BookOpen, Leaf, Droplets, Thermometer, Info, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BeginnerDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <section>
        <h1 className="text-3xl font-bold text-slate-900">Hello, Farmer! 👋</h1>
        <p className="text-slate-600 mt-1">Ready to start your sustainable journey?</p>
      </section>

      <section>
        <div className="bg-primary rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-1">Chat with AI Expert</h3>
            <p className="text-white/80 text-sm mb-4">Ask anything about your crops or soil health.</p>
            <button 
              onClick={() => navigate('/chatbot')}
              className="bg-white text-primary px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2"
            >
              <span>Start Chatting</span>
              <MessageSquare size={16} />
            </button>
          </div>
          <MessageSquare size={120} className="absolute -right-4 -bottom-4 text-white/10 rotate-12 group-hover:rotate-0 transition-transform" />
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-slate-900 text-xl font-bold">How to start</h2>
          <a className="text-primary text-sm font-semibold" href="#" onClick={() => navigate('/tutorials')}>View All</a>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
          <div className="flex flex-col shrink-0 w-64 rounded-xl bg-white shadow-md border border-slate-100">
            <div className="w-full h-32 bg-primary/20 bg-cover bg-center rounded-t-xl" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=300&q=80')" }} />
            <div className="p-4 flex flex-col gap-3">
              <div>
                <h4 className="text-slate-900 font-bold">Complete Your Profile</h4>
                <p className="text-slate-500 text-xs">Personalize your farming experience.</p>
              </div>
              <button 
                onClick={() => navigate('/edit-profile')}
                className="w-full py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-colors"
              >
                Start Now
              </button>
            </div>
          </div>
          <div className="flex flex-col shrink-0 w-64 rounded-xl bg-white shadow-md border border-slate-100">
            <div className="w-full h-32 bg-primary/20 bg-cover bg-center rounded-t-xl" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=300&q=80')" }} />
            <div className="p-4 flex flex-col gap-3">
              <div>
                <h4 className="text-slate-900 font-bold">Add Your First Field</h4>
                <p className="text-slate-500 text-xs">Link your plot to start monitoring.</p>
              </div>
              <button 
                onClick={() => navigate('/add-crop')}
                className="w-full py-2 bg-primary/10 text-primary rounded-lg text-sm font-bold hover:bg-primary hover:text-white transition-colors"
              >
                Setup Field
              </button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-slate-900 text-xl font-bold mb-4">Recommended for you</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Lettuce', tag: 'Low Effort', icon: Leaf, color: 'text-green-600', bg: 'bg-green-100' },
            { name: 'Tomatoes', tag: 'High Yield', icon: Info, color: 'text-red-600', bg: 'bg-red-100' },
            { name: 'Carrots', tag: 'Beginner Friendly', icon: Sprout, color: 'text-orange-600', bg: 'bg-orange-100' },
            { name: 'Spinach', tag: 'Fast Growing', icon: Droplets, color: 'text-blue-600', bg: 'bg-blue-100' }
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
              <div className={`size-10 rounded-full ${item.bg} flex items-center justify-center ${item.color}`}>
                <item.icon size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[10px] text-slate-500">{item.tag}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-6">
        <h2 className="text-slate-900 text-xl font-bold mb-4">Learning Resources</h2>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-xl">
            <div className="shrink-0 size-16 bg-cover bg-center rounded-lg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=100&q=80')" }} />
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Soil Basics 101</h4>
              <p className="text-xs text-slate-500 mt-1">Learn how to identify healthy soil for your crops.</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">5 min read</span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold">Beginner</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default BeginnerDashboard;
