import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Save, X, Calendar, Info, Sprout, CheckCircle, AlertTriangle, CloudRain, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SuitabilityResult {
  isSuitable: boolean;
  score: number;
  reasons: string[];
  areaWarning: boolean;
  maxArea: number;
}

interface CropPlan {
  id: string;
  tasks: Array<{
    id: string;
    name: string;
    date: string;
    status: string;
    notes?: string;
  }>;
}

const AddCrop: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    region: '',
    area: '',
    plantingDate: '',
    harvestDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    crop: any;
    plan: CropPlan | null;
    suitability: SuitabilityResult;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('agro_token');
      if (!token) {
        alert('Please log in first.');
        return;
      }
      
      const response = await axios.post('http://localhost:5000/api/v1/crops', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setResult({
          crop: {
            ...response.data.data,
            name: response.data.data.name || formData.name,
            region: response.data.data.region || formData.region,
          },
          plan: response.data.plan,
          suitability: response.data.suitability
        });
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Unknown error';
      console.error('Error creating crop:', message);
      alert(`Error creating crop: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="relative h-40 w-full rounded-xl overflow-hidden bg-primary/5 flex items-center justify-center">
        <div className="z-10 flex flex-col items-center">
          <Sprout size={48} className="text-primary mb-2" />
          <p className="text-primary/60 text-sm font-medium">Register your next harvest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary/80 ml-1">Crop Name</label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-400"
              placeholder="e.g. Organic Wheat, Sweet Corn"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary/80 ml-1">Region</label>
            <div className="relative">
              <select
                required
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">Select a region</option>
                <option value="Adamawa">Adamawa</option>
                <option value="Centre">Centre</option>
                <option value="East">East</option>
                <option value="Far North">Far North</option>
                <option value="Littoral">Littoral</option>
                <option value="North">North</option>
                <option value="North-West">North-West</option>
                <option value="South">South</option>
                <option value="South-West">South-West</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary/80 ml-1">Area (hectares)</label>
            <div className="relative">
              <input
                type="number"
                required
                min="0.1"
                step="0.1"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none placeholder:text-slate-400"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary/80 ml-1">Planting Date</label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-primary/80 ml-1">Expected Harvest Date</label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full h-14 px-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-primary/80 ml-1">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full p-4 rounded-xl border border-primary/20 bg-white focus:ring-2 focus:ring-primary outline-none resize-none placeholder:text-slate-400"
            placeholder="Add details about soil quality, seed variety, or fertilizer plan..."
            rows={4}
          />
        </div>

        <div className="bg-primary/5 p-4 rounded-xl flex gap-3 items-start">
          <Info className="text-primary mt-0.5" size={20} />
          <p className="text-xs text-primary/70 leading-relaxed">
            By adding this crop, AgroSmart will begin tracking weather conditions and soil moisture specifically for this variety in your region.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Crop
              </>
            )}
          </button>
        </div>
      </form>

      {/* Results Display */}
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <h3 className="text-lg font-bold text-green-800">Crop Successfully Created!</h3>
            </div>
            <p className="text-green-700">
              Your {result.crop.name} crop has been registered and is now being monitored.
            </p>
          </div>

          {/* Suitability Analysis */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-primary" size={24} />
              <h3 className="text-lg font-bold text-slate-900">Suitability Analysis</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Suitability Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          result.suitability.score >= 8 ? 'bg-green-500' :
                          result.suitability.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(result.suitability.score / 10) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-slate-900">
                      {result.suitability.score}/10
                    </span>
                  </div>
                </div>

                {result.suitability.reasons.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-600 mb-2">Analysis Details</h4>
                    <ul className="space-y-1">
                      {result.suitability.reasons.map((reason, index) => (
                        <li key={index} className="text-sm text-slate-700 flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suitability.areaWarning && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={16} />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Area Warning</p>
                      <p className="text-xs text-yellow-700">
                        Recommended max area: {result.suitability.maxArea} ha
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <CloudRain className="text-blue-600" size={20} />
                  <div>
                    <p className="text-sm font-medium text-blue-800">Weather Monitoring Active</p>
                    <p className="text-xs text-blue-700">
                      Real-time weather alerts for {result.crop.region}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Generated Crop Plan */}
          {result.plan && (
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="text-primary" size={24} />
                <h3 className="text-lg font-bold text-slate-900">Generated Crop Plan</h3>
              </div>
              
              <div className="space-y-4">
                {result.plan.tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{task.name}</h4>
                      <p className="text-sm text-slate-600">
                        {new Date(task.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      {task.notes && (
                        <p className="text-xs text-slate-500 mt-1">{task.notes}</p>
                      )}
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === 'completed' ? 'bg-green-100 text-green-800' :
                      task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {task.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 h-12 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors"
            >
              View Dashboard
            </button>
            <button 
              onClick={() => navigate('/crops')}
              className="flex-1 h-12 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
            >
              View All Crops
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AddCrop;
