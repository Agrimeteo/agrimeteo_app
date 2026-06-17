import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sprout, Calendar, CloudRain, PlusCircle, Camera, TrendingUp, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { getCropImage } from '../../utils/cropImages';

interface Crop {
  id: string;
  name: string;
  planting_date: string;
  harvest_date: string;
  region: string;
  area: number;
  image?: string;
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
  const firstName = user?.name?.trim().split(/\s+/)[0] || 'Farmer';

  const fetchData = async () => {
    try {
      const results = await Promise.allSettled([
        api.get('/crops'),
        api.get('/weather/alerts'),
        api.get('/crop-plans'),
      ]);

      const [cropsResult, weatherResult, plansResult] = results;

      if (cropsResult.status === 'fulfilled') {
        const cropData = (cropsResult.value.data.data || []).map((crop: Crop) => ({
          ...crop,
          image: getCropImage(crop.name),
        }));
        setCrops(cropData);
      } else {
        console.error('Error fetching crops:', cropsResult.reason);
      }

      if (weatherResult.status === 'fulfilled') {
        const alerts = weatherResult.value.data.data;
        if (alerts && alerts.length > 0) {
          setWeatherAlert(alerts[0]);
        } else {
          setWeatherAlert(null);
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
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    void fetchData();
  };

  const upcomingTasks = cropPlans
    .flatMap((plan) =>
      plan.tasks
        .filter((task) => {
          const taskDate = new Date(task.date);
          const today = new Date();
          const diffTime = taskDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7 && task.status === 'pending';
        })
        .map((task) => ({
          ...task,
          cropName: crops.find((crop) => crop.id === plan.crop_id)?.name || 'Unknown Crop',
        }))
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <section>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, {firstName}!</h1>
            <p className="text-sm text-slate-500">Your farm is doing great today.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="rounded-lg bg-primary/10 p-2 text-primary hover:bg-primary/20 disabled:opacity-50"
          >
            <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1 rounded-xl border border-primary/5 bg-white p-5 shadow-sm">
          <Sprout className="mb-1 text-primary" size={24} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Active Crops</p>
          <p className="text-2xl font-bold text-primary">{loading ? '...' : crops.length}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-xl border border-primary/5 bg-white p-5 shadow-sm">
          <Calendar className="mb-1 text-primary" size={24} />
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Next Harvest</p>
          <p className="text-2xl font-bold text-primary">
            {loading
              ? '...'
              : crops.length > 0
                ? `${Math.min(
                    ...crops.map((crop) => {
                      const harvestDate = new Date(crop.harvest_date);
                      const today = new Date();
                      const diffTime = harvestDate.getTime() - today.getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      return diffDays > 0 ? diffDays : 999;
                    })
                  )} Days`
                : 'No crops'}
          </p>
        </div>
      </div>

      {weatherAlert && (
        <div className="flex items-center gap-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
          <div className="rounded-lg bg-white p-3 shadow-sm">
            <CloudRain className="text-primary" size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-primary">Weather Alert</p>
              <span className="text-[10px] font-bold uppercase text-primary">
                {new Date(weatherAlert.date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">{weatherAlert.description}</p>
          </div>
        </div>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Quick Actions</h3>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/add-crop')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 font-bold text-white shadow-lg shadow-primary/20"
          >
            <PlusCircle size={20} />
            Add Crop
          </button>
          <button
            onClick={() => navigate('/plant-diagnosis')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-primary/20 bg-white py-3 font-bold text-primary"
          >
            <Camera size={20} />
            Upload Photo
          </button>
        </div>
      </section>

      {cropPlans.length > 0 && (
        <section className="space-y-4 rounded-xl border border-primary/5 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-slate-800">
              <Calendar size={18} className="text-primary" />
              Upcoming Tasks
            </h3>
            <span className="text-xs font-medium text-slate-400">Next 7 days</span>
          </div>
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <div
                  className={`h-3 w-3 rounded-full ${
                    new Date(task.date).toDateString() === new Date().toDateString() ? 'bg-red-500' : 'bg-yellow-500'
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{task.name}</p>
                  <p className="text-xs text-slate-600">
                    {task.cropName} - {new Date(task.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      new Date(task.date).toDateString() === new Date().toDateString()
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {new Date(task.date).toDateString() === new Date().toDateString() ? 'Today' : 'Soon'}
                  </span>
                </div>
              </div>
            ))}
            {upcomingTasks.length === 0 && (
              <p className="py-4 text-center text-sm text-slate-500">No upcoming tasks in the next 7 days</p>
            )}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-xl border border-primary/5 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-bold text-slate-800">
            <TrendingUp size={18} className="text-primary" />
            Monthly Yield Trend
          </h3>
          <span className="text-xs font-medium text-slate-400">Last 5 Months</span>
        </div>
        <div className="flex h-32 items-end justify-between px-2">
          {[
            { label: 'Apr', height: 'h-12', opacity: 'bg-primary/20' },
            { label: 'May', height: 'h-20', opacity: 'bg-primary/40' },
            { label: 'Jun', height: 'h-16', opacity: 'bg-primary/60' },
            { label: 'Jul', height: 'h-28', opacity: 'bg-primary/80' },
            { label: 'Aug', height: 'h-24', opacity: 'bg-primary' },
          ].map((bar, index) => (
            <div key={index} className={`relative w-8 rounded-t-md ${bar.height} ${bar.opacity} group`}>
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">
                {bar.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-700">Active Monitoring</h3>
        <div className="space-y-3">
          {loading ? (
            <p className="text-center text-slate-500">Loading crops...</p>
          ) : crops.length > 0 ? (
            crops.slice(0, 2).map((crop) => (
              <div key={crop.id} className="flex items-center gap-3 rounded-xl border border-primary/5 bg-white p-3">
                <div
                  className="size-12 rounded-lg bg-cover bg-center"
                  style={{ backgroundImage: `url(${crop.image || getCropImage(crop.name)})` }}
                />
                <div className="flex-1">
                  <p className="text-sm font-bold">{crop.name}</p>
                  <p className="text-xs text-slate-500">
                    {crop.region} - {crop.area} ha
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Harvest</p>
                  <p className="text-sm font-bold text-primary">{new Date(crop.harvest_date).toLocaleDateString()}</p>
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
