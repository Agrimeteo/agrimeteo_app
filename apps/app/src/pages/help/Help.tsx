import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, MessageCircle, Phone, Mail, Book, HelpCircle, ChevronRight, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const Help: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'How do I add a new crop?',
      answer: 'Go to the Crops section from the bottom navigation, tap the "+" button, fill in the crop details including name, region, area, and planting date. The system will automatically generate a cultivation plan.',
      category: 'Crops'
    },
    {
      id: '2',
      question: 'What regions are supported?',
      answer: 'We support all 10 regions of Cameroon: Adamawa, Centre, East, Far North, Littoral, North, North-West, South, South-West, and West. Each region has specific climate data and crop recommendations.',
      category: 'Regions'
    },
    {
      id: '3',
      question: 'How does the weather alert system work?',
      answer: 'Our system integrates with weather APIs to provide real-time alerts. You\'ll receive notifications about rainfall, temperature changes, and optimal farming times based on your location.',
      category: 'Weather'
    },
    {
      id: '4',
      question: 'Can I edit my crop information?',
      answer: 'Currently, you can view crop details and cultivation plans, but editing is not yet available. This feature is planned for a future update.',
      category: 'Crops'
    },
    {
      id: '5',
      question: 'How do I use the AI chatbot?',
      answer: 'Tap the "AgroBot" icon in the bottom navigation. Ask questions about crops, weather, farming techniques, or any agricultural topic. The AI is trained on farming best practices.',
      category: 'AI Assistant'
    },
    {
      id: '6',
      question: 'What should I do if I forget my password?',
      answer: 'On the login screen, tap "Forgot Password?" and enter your email address. You\'ll receive instructions to reset your password.',
      category: 'Account'
    }
  ];

  const contactMethods = [
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our support team',
      action: 'Start Chat',
      available: true
    },
    {
      icon: Mail,
      title: 'Email Support',
      description: 'support@agrosmart.com',
      action: 'Send Email',
      available: true
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: '+237 123 456 789',
      action: 'Call Now',
      available: false
    }
  ];

  const quickLinks = [
    {
      icon: Book,
      title: 'User Guide',
      description: 'Complete guide to using AgroSmart',
      action: 'View Guide'
    },
    {
      icon: HelpCircle,
      title: 'Video Tutorials',
      description: 'Step-by-step video guides',
      action: 'Watch Videos'
    }
  ];

  const filteredFAQs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white"
    >
      {/* Header */}
      <header className="flex items-center bg-white p-4 pb-2 justify-between sticky top-0 z-10 border-b border-primary/10">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-slate-900 text-lg font-bold flex-1 ml-4">Help & Support</h2>
      </header>

      <main className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Contact Methods */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Contact Support</h3>
          <div className="space-y-3">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <method.icon size={20} className="text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{method.title}</h4>
                      <p className="text-sm text-slate-500">{method.description}</p>
                    </div>
                  </div>
                  <button 
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      method.available 
                        ? 'bg-primary text-white hover:bg-primary/90' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={!method.available}
                  >
                    {method.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Quick Links</h3>
          <div className="grid grid-cols-1 gap-3">
            {quickLinks.map((link, index) => (
              <div key={index} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <link.icon size={20} className="text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{link.title}</h4>
                      <p className="text-sm text-slate-500">{link.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <span className="text-sm font-medium">{link.action}</span>
                    <ExternalLink size={16} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs */}
        <section>
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
            Frequently Asked Questions
          </h3>
          <div className="space-y-3">
            {filteredFAQs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        {faq.category}
                      </span>
                    </div>
                    <h4 className="font-semibold text-slate-800 text-sm">{faq.question}</h4>
                  </div>
                  <ChevronRight 
                    size={20} 
                    className={`text-slate-400 transition-transform ${expandedFAQ === faq.id ? 'rotate-90' : ''}`}
                  />
                </button>
                
                {expandedFAQ === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 pb-4"
                  >
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
          
          {filteredFAQs.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <HelpCircle size={48} className="text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No FAQs found for "{searchQuery}"</p>
              <p className="text-slate-400 text-sm mt-1">Try different keywords or contact support</p>
            </div>
          )}
        </section>

        {/* App Info */}
        <section className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <div className="text-center">
            <h4 className="font-semibold text-primary mb-2">AgroSmart v1.0.0</h4>
            <p className="text-sm text-slate-600 mb-3">
              Your smart agriculture assistant for Cameroon farmers
            </p>
            <div className="flex justify-center gap-4 text-xs text-slate-500">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Service</span>
              <span>•</span>
              <span>About</span>
            </div>
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default Help;