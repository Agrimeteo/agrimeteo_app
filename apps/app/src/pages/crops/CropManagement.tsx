import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Calendar, CalendarCheck, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Crop {
  id: string;
  name: string;
  region: string;
  area: number;
  planting_date: string;
  harvest_date: string;
  suitability_score: number;
  image?: string;
}

const cropImages: { [key: string]: string } = {
  'Maïs': 'https://images.unsplash.com/photo-1551730459-92db2a308d6a?auto=format&fit=crop&w=300&q=80',
  'Cacao': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=300&q=80',
  'Café': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=300&q=80',
  'Blé': 'https://images.unsplash.com/photo-1501436513145-30f24e19fcc8?auto=format&fit=crop&w=300&q=80',
  'default': 'https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&w=300&q=80'
};

const CropManagement: React.FC = () => {
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/v1/crops', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const cropsWithImages = response.data.data.map((crop: Crop) => ({
          ...crop,
          image: cropImages[crop.name] || cropImages.default
        }));
        setCrops(cropsWithImages);
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  if (loading) return <div>Loading crops...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Crops</h2>
          <p className="text-slate-500 text-sm">Manage and track your active plantation</p>
        </div>
        <button 
          onClick={() => navigate('/add-crop')}
          className="bg-primary text-white p-2.5 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.05] transition-transform"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid gap-6">
        {crops.map((crop) => (
          <div 
            key={crop.id} 
            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 transition-all hover:shadow-md cursor-pointer"
            onClick={() => navigate(`/crop-plan/${crop.id}`)}
          >
            <div className="flex flex-col sm:flex-row">
              <div className="w-full sm:w-40 h-40 bg-cover bg-center" style={{ backgroundImage: `url(${crop.image})` }} />
              <div className="flex-1 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{crop.name}</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-wider">
                        {crop.region}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Calendar size={14} />
                        <span>Planting: {new Date(crop.planting_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarCheck size={14} />
                        <span>Area: {crop.area} ha</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-700">Suitability Score</span>
                    <span className="text-sm font-bold text-primary">{crop.suitability_score}/10</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${crop.suitability_score * 10}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CropManagement;
