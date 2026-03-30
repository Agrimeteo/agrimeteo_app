import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Play, Clock, User, BookOpen, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
  thumbnail: string;
  instructor: string;
  views: number;
}

const Tutorials: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const tutorials: Tutorial[] = [
    {
      id: '1',
      title: 'Getting Started with AgroSmart',
      description: 'Learn the basics of using AgroSmart for your farm management',
      duration: '5:30',
      level: 'Beginner',
      category: 'Getting Started',
      thumbnail: 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=300&q=80',
      instructor: 'Sarah Johnson',
      views: 1250
    },
    {
      id: '2',
      title: 'Adding Your First Crop',
      description: 'Step-by-step guide to adding crops and understanding suitability scores',
      duration: '8:15',
      level: 'Beginner',
      category: 'Crops',
      thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=300&q=80',
      instructor: 'Dr. Michael Chen',
      views: 890
    },
    {
      id: '3',
      title: 'Understanding Weather Alerts',
      description: 'How to interpret and act on weather notifications for better farming',
      duration: '6:45',
      level: 'Intermediate',
      category: 'Weather',
      thumbnail: 'https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=300&q=80',
      instructor: 'Emma Rodriguez',
      views: 654
    },
    {
      id: '4',
      title: 'Using the AI Assistant Effectively',
      description: 'Tips and tricks for getting the most out of AgroBot',
      duration: '7:20',
      level: 'Intermediate',
      category: 'AI Assistant',
      thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=300&q=80',
      instructor: 'Alex Thompson',
      views: 432
    },
    {
      id: '5',
      title: 'Advanced Crop Planning',
      description: 'Creating detailed cultivation plans with seasonal considerations',
      duration: '12:30',
      level: 'Advanced',
      category: 'Planning',
      thumbnail: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=300&q=80',
      instructor: 'Dr. Fatima Al-Zahra',
      views: 321
    },
    {
      id: '6',
      title: 'Regional Farming in Cameroon',
      description: 'Understanding climate patterns and crop suitability by region',
      duration: '10:45',
      level: 'Intermediate',
      category: 'Regions',
      thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&q=80',
      instructor: 'Pierre Dubois',
      views: 567
    }
  ];

  const categories = ['All', 'Getting Started', 'Crops', 'Weather', 'AI Assistant', 'Planning', 'Regions'];

  const filteredTutorials = tutorials.filter(tutorial => {
    const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tutorial.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || tutorial.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
      case 'Advanced': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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
        <h2 className="text-slate-900 text-lg font-bold flex-1 ml-4">Video Tutorials</h2>
      </header>

      <main className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tutorials Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredTutorials.map((tutorial) => (
            <motion.div
              key={tutorial.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="relative w-32 h-24 flex-shrink-0">
                  <img
                    src={tutorial.thumbnail}
                    alt={tutorial.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-2">
                      <Play size={16} className="text-primary ml-0.5" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded flex items-center gap-1">
                    <Clock size={10} />
                    {tutorial.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-slate-800 text-sm leading-tight flex-1">
                      {tutorial.title}
                    </h3>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getLevelColor(tutorial.level)}`}>
                      {tutorial.level}
                    </span>
                  </div>

                  <p className="text-slate-600 text-xs mb-3 line-clamp-2">
                    {tutorial.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        {tutorial.instructor}
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen size={12} />
                        {tutorial.views} views
                      </div>
                    </div>

                    <button className="text-primary hover:bg-primary/10 p-1 rounded transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg font-medium">No tutorials found</p>
            <p className="text-slate-400 text-sm mt-1">
              {searchQuery ? `No results for "${searchQuery}"` : 'Check back later for new content'}
            </p>
          </div>
        )}

        {/* Quick Tips Section */}
        <section className="bg-primary/5 rounded-xl p-4 border border-primary/10">
          <h3 className="font-semibold text-primary mb-3 flex items-center gap-2">
            <BookOpen size={18} />
            Quick Tips
          </h3>
          <div className="space-y-2 text-sm text-slate-600">
            <p>• Watch tutorials in order of difficulty level for best learning experience</p>
            <p>• Practice what you learn by adding crops and monitoring weather alerts</p>
            <p>• Use the AI assistant for specific questions about your farm</p>
            <p>• Check regional guides for location-specific farming advice</p>
          </div>
        </section>
      </main>
    </motion.div>
  );
};

export default Tutorials;