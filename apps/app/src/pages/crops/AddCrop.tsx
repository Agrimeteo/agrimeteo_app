import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Save, Info, Sprout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface CropTypeOption {
  id: string;
  name: string;
}

const AddCrop: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    cropName: '',
    region: '',
    area: '',
    plantingDate: '',
    harvestDate: '',
    notes: '',
  });
  const [cropTypes, setCropTypes] = useState<CropTypeOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      return;
    }

    const fetchCropTypes = async () => {
      try {
        const response = await api.get('/crops/types');
        setCropTypes(response.data.data ?? []);
      } catch (error) {
        const message =
          (error as { response?: { data?: { error?: string } }; message?: string }).response?.data?.error ||
          (error as { message?: string }).message ||
          'Unknown error';
        console.error('Error fetching crop types:', message);
      }
    };

    fetchCropTypes();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await api.post('/crops', formData);

      if (response.data.success) {
        navigate('/crops', {
          state: {
            createdCropId: response.data.data?.id ?? null,
            openPlanId: response.data.plan?.id ?? null,
            successMessage: `${response.data.data?.name || formData.cropName || 'Your crop'} was created successfully.`,
          },
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
      <div className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-xl bg-primary/5">
        <div className="z-10 flex flex-col items-center">
          <Sprout size={48} className="mb-2 text-primary" />
          <p className="text-sm font-medium text-primary/60">Register your next harvest</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="ml-1 block text-sm font-semibold text-primary/80">Crop Name</label>
          <div className="relative">
            <input
              type="text"
              required
              list="crop-type-suggestions"
              value={formData.cropName}
              onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
              className="h-14 w-full rounded-xl border border-primary/20 bg-white px-4 outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. Maïs, Cacao, Plantain"
            />
            <datalist id="crop-type-suggestions">
              {cropTypes.map((cropType) => (
                <option key={cropType.id} value={cropType.name} />
              ))}
            </datalist>
          </div>
          <p className="ml-1 text-xs text-slate-500">
            Choose an existing crop or type a new one. Agrimeteo will create it automatically if needed.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-primary/80">Region</label>
            <select
              required
              value={formData.region}
              onChange={(e) => setFormData({ ...formData, region: e.target.value })}
              className="h-14 w-full rounded-xl border border-primary/20 bg-white px-4 outline-none focus:ring-2 focus:ring-primary"
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

          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-primary/80">Area (hectares)</label>
            <input
              type="number"
              required
              min="0.1"
              step="0.1"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="h-14 w-full rounded-xl border border-primary/20 bg-white px-4 outline-none focus:ring-2 focus:ring-primary"
              placeholder="e.g. 2.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-primary/80">Planting Date</label>
            <input
              type="date"
              required
              value={formData.plantingDate}
              onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
              className="h-14 w-full rounded-xl border border-primary/20 bg-white px-4 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 block text-sm font-semibold text-primary/80">Expected Harvest Date</label>
            <input
              type="date"
              required
              value={formData.harvestDate}
              onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
              className="h-14 w-full rounded-xl border border-primary/20 bg-white px-4 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="ml-1 block text-sm font-semibold text-primary/80">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full resize-none rounded-xl border border-primary/20 bg-white p-4 outline-none focus:ring-2 focus:ring-primary"
            placeholder="Add details about soil quality, seed variety, or fertilizer plan..."
            rows={4}
          />
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
          <Info className="mt-0.5 text-primary" size={20} />
          <p className="text-xs leading-relaxed text-primary/70">
            By adding this crop, AgroSmart will begin tracking weather conditions and soil moisture specifically for this variety in your region.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
    </motion.div>
  );
};

export default AddCrop;
