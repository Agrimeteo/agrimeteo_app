import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sprout, Calendar, CloudRain, PlusCircle, Camera, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

interface Crop {
  id: string;
  name: string;
  planting_date: string;
  harvest_date: string;
  region: string;
  area: number;
}

interface WeatherAlert {
  description: string;
  date: string;
}

interface CropPlan {
  id: string;
  crop_id: string;
  tasks: Array<{
    id: string;
    name: string;
    date: string;
    status: 'pending' | 'completed' | 'overdue';
    notes?: string;
  }>;
}

const FarmerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [weatherAlert, setWeatherAlert] = useState<WeatherAlert | null>(null);
  const [cropPlans, setCropPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/crops'),
        api.get('/weather/alerts'),
        api.get('/crop-plans'),
      ]);

      const [cropsResult, weatherResult, plansResult] = results;

      if (cropsResult.status === 'fulfilled') {
        setCrops(cropsResult.value.data.data || []);
      } else {
        console.error('Error fetching crops:', cropsResult.reason);
      }

      if (weatherResult.status === 'fulfilled') {
        const alerts = weatherResult.value.data.data;
        if (alerts && alerts.length > 0) {
          setWeatherAlert(alerts[0]);
        }
      } else {
        console.error('Error fetching weather alerts:', weatherResult.reason);
      }

      if (plansResult.status === 'fulfilled') {
        setCropPlans(plansResult.value.data.data || []);
      } else {
        console.error('Error fetching crop plans:', plansResult.reason);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Refresh every 5 minutes for real-time updates
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name}!</h1>
            <p className="text-slate-500 text-sm">Your farm is doing great today.</p>
          </div>
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 flex flex-col gap-1">
          <Sprout className="text-primary mb-1" size={24} />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Active Crops</p>
          <p className="text-2xl font-bold text-primary">{loading ? '...' : crops.length}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 flex flex-col gap-1">
          <Calendar className="text-primary mb-1" size={24} />
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">Next Harvest</p>
          <p className="text-2xl font-bold text-primary">
            {loading ? '...' : crops.length > 0 ? 
              Math.min(...crops.map(c => {
                const harvestDate = new Date(c.harvest_date);
                const today = new Date();
                const diffTime = harvestDate.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays > 0 ? diffDays : 999;
              })) + ' Days' : 'No crops'}
          </p>
        </div>
      </div>

      {weatherAlert && (
        <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 flex items-center gap-4">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <CloudRain className="text-primary" size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-primary font-bold text-sm">Weather Alert</p>
              <span className="text-[10px] font-bold text-primary uppercase">{new Date(weatherAlert.date).toLocaleDateString()}</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">{weatherAlert.description}</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Quick Actions</h3>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/add-crop')}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20"
          >
            <PlusCircle size={20} />
            Add Crop
          </button>
          <button 
            onClick={() => navigate('/plant-diagnosis')}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-primary border border-primary/20 py-3 rounded-xl font-bold"
          >
            <Camera size={20} />
            Upload Photo
          </button>
        </div>
      </section>

      {/* Upcoming Tasks */}
      {cropPlans.length > 0 && (
        <section className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-primary" />
              Upcoming Tasks
            </h3>
            <span className="text-xs text-slate-400 font-medium">Next 7 days</span>
          </div>
          <div className="space-y-3">
            {cropPlans.flatMap(plan => 
              plan.tasks
                .filter(task => {
                  const taskDate = new Date(task.date);
                  const today = new Date();
                  const diffTime = taskDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays >= 0 && diffDays <= 7 && task.status === 'pending';
                })
                .slice(0, 3)
                .map(task => ({
                  ...task,
                  cropName: crops.find(c => c.id === plan.crop_id)?.name || 'Unknown Crop'
                }))
            ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .slice(0, 3)
            .map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                <div className={`w-3 h-3 rounded-full ${
                  new Date(task.date).toDateString() === new Date().toDateString() 
                    ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{task.name}</p>
                  <p className="text-xs text-slate-600">{task.cropName} • {new Date(task.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    new Date(task.date).toDateString() === new Date().toDateString() 
                      ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {new Date(task.date).toDateString() === new Date().toDateString() ? 'Today' : 'Soon'}
                  </span>
                </div>
              </div>
            ))}
            {cropPlans.flatMap(plan => plan.tasks.filter(task => {
              const taskDate = new Date(task.date);
              const today = new Date();
              const diffTime = taskDate.getTime() - today.getTime();
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              return diffDays >= 0 && diffDays <= 7 && task.status === 'pending';
            })).length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">No upcoming tasks in the next 7 days</p>
            )}
          </div>
        </section>
      )}

      <section className="bg-white p-5 rounded-xl shadow-sm border border-primary/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" />
            Monthly Yield Trend
          </h3>
          <span className="text-xs text-slate-400 font-medium">Last 5 Months</span>
        </div>
        <div className="flex items-end justify-between h-32 px-2">
          {[
            { label: 'Apr', height: 'h-12', opacity: 'bg-primary/20' },
            { label: 'May', height: 'h-20', opacity: 'bg-primary/40' },
            { label: 'Jun', height: 'h-16', opacity: 'bg-primary/60' },
            { label: 'Jul', height: 'h-28', opacity: 'bg-primary/80' },
            { label: 'Aug', height: 'h-24', opacity: 'bg-primary' },
          ].map((bar, i) => (
            <div key={i} className={`w-8 ${bar.opacity} rounded-t-md ${bar.height} relative group`}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">
                {bar.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Active Monitoring</h3>
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-slate-500">Loading crops...</p>
          ) : crops.length > 0 ? (
            crops.slice(0, 2).map((crop) => (
              <div key={crop.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-primary/5">
                <div 
                  className="size-12 rounded-lg bg-cover bg-center" 
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-${crop.name === 'Maïs' ? '1592841200221-a6898f307baa' : '1566114169558-324817946d7d'}?auto=format&fit=crop&w=100&q=80)` }}
                />
                <div className="flex-1">
                  <p className="font-bold text-sm">{crop.name}</p>
                  <p className="text-slate-500 text-xs">{crop.region} • {crop.area} ha</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">Harvest</p>
                  <p className="font-bold text-primary text-sm">
                    {new Date(crop.harvest_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-500">No active crops. Add your first crop!</p>
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default FarmerDashboard;
