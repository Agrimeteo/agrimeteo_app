import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Calendar, CalendarCheck, Edit, Trash2, X, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { usePermissions } from '../../context/PermissionsContext';
import { getCropImage } from '../../utils/cropImages';
import CropRecommendationsWidget from '../../components/CropRecommendationsWidget';

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

interface Task {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

interface CropPlan {
  id: string;
  crop_id: string;
  crop?: Crop | null;
  tasks: Task[];
  created_at?: string;
  updated_at?: string;
}

interface LocationState {
  createdCropId?: string | null;
  openPlanId?: string | null;
  successMessage?: string;
}

const CropManagement: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const routeState = (location.state ?? {}) as LocationState;
  const [crops, setCrops] = useState<Crop[]>([]);
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(routeState.openPlanId ?? null);
  const [successMessage, setSuccessMessage] = useState(routeState.successMessage ?? '');
  const [errorMessage, setErrorMessage] = useState('');
  const [generatingPlanForCropId, setGeneratingPlanForCropId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrops = async () => {
      try {
        const [cropsResult, plansResult] = await Promise.allSettled([
          api.get('/crops'),
          api.get('/crop-plans'),
        ]);

        if (cropsResult.status === 'fulfilled') {
          const cropsData = cropsResult.value.data.data ?? [];
          const cropsWithImages = cropsData.map((crop: Crop) => ({
            ...crop,
            image: getCropImage(crop.name),
          }));
          setCrops(cropsWithImages);
        } else {
          console.error('Error fetching crops:', cropsResult.reason);
        }

        if (plansResult.status === 'fulfilled') {
          const planData = plansResult.value.data.data ?? [];
          setPlans(planData);
        } else {
          console.error('Error fetching crop plans:', plansResult.reason);
          setPlans([]);
        }
      } catch (error) {
        console.error('Error fetching crops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCrops();
  }, []);

  useEffect(() => {
    if (routeState.successMessage || routeState.openPlanId) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, navigate, routeState.openPlanId, routeState.successMessage]);

  const cropPlansByCropId = useMemo(
    () =>
      plans.reduce<Record<string, CropPlan>>((acc, plan) => {
        if (plan.crop_id) {
          acc[plan.crop_id] = plan;
        }
        return acc;
      }, {}),
    [plans]
  );

  const selectedPlan = plans.find((plan) => plan.id === selectedPlanId) ?? null;

  const openPlanModal = async (cropId: string) => {
    setErrorMessage('');

    const plan = cropPlansByCropId[cropId];
    if (plan) {
      setSelectedPlanId(plan.id);
      return;
    }

    setGeneratingPlanForCropId(cropId);

    try {
      const response = await api.post(`/crop-plans/${cropId}`);
      const createdPlan = response.data?.data as CropPlan | undefined;

      if (createdPlan?.id) {
        setPlans((currentPlans) => {
          const nextPlans = currentPlans.filter((currentPlan) => currentPlan.crop_id !== cropId);
          return [...nextPlans, createdPlan];
        });
        setSelectedPlanId(createdPlan.id);
      } else {
        setErrorMessage('The crop was created, but its follow-up plan could not be opened yet.');
      }
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Unknown error';
      console.error('Error generating crop plan:', message);
      setErrorMessage(message);
    } finally {
      setGeneratingPlanForCropId(null);
    }
  };

  if (loading) return <div>Loading crops...</div>;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">My Crops</h2>
            <p className="text-sm text-slate-500">Manage and track your active plantation</p>
          </div>
          <button
            onClick={() => navigate('/add-crop')}
            disabled={!hasPermission('crops.create')}
            className="rounded-xl bg-primary p-2.5 text-white shadow-lg shadow-primary/20 transition-transform hover:scale-[1.05]"
          >
            <Plus size={24} />
          </button>
        </div>

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            {successMessage}
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6">
          {crops.map((crop) => {
            const plan = cropPlansByCropId[crop.id];

            return (
              <div
                key={crop.id}
                className="cursor-pointer overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all hover:shadow-md"
                onClick={() => void openPlanModal(crop.id)}
              >
                <div className="flex flex-col sm:flex-row">
                  <div
                    className="h-40 w-full bg-cover bg-center sm:w-40"
                    style={{ backgroundImage: `url(${crop.image})` }}
                  />
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="text-xl font-bold">{crop.name}</h3>
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
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
                      <div className="flex gap-1" onClick={(event) => event.stopPropagation()}>
                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-primary/5 hover:text-primary">
                          <Edit size={18} />
                        </button>
                        <button className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="mt-6">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Suitability Score</span>
                        <span className="text-sm font-bold text-primary">{crop.suitability_score}/10</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-1000"
                          style={{ width: `${crop.suitability_score * 10}%` }}
                        />
                      </div>
                      <p className="mt-3 text-xs font-medium text-primary">
                        {plan
                          ? 'Click to open follow-up plan'
                          : generatingPlanForCropId === crop.id
                            ? 'Generating follow-up plan...'
                            : 'Click to generate follow-up plan'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {crops.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
              No crops yet. Add your first crop to start tracking it.
            </div>
          )}
        </div>
      </motion.div>

      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Follow-up Plan{selectedPlan.crop?.name ? ` for ${selectedPlan.crop.name}` : ''}
                </h3>
                <p className="text-sm text-slate-500">Track the essential actions for this crop.</p>
              </div>
              <button
                onClick={() => setSelectedPlanId(null)}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[calc(85vh-140px)] overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <CropRecommendationsWidget
                  planId={selectedPlan.id}
                  cropName={selectedPlan.crop?.name ?? null}
                  compact
                />

                {selectedPlan.tasks.map((task, index) => (
                  <div key={task.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-slate-900">{task.name}</h4>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                              task.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : task.status === 'overdue'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {task.status}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                          {task.status === 'completed' ? (
                            <CheckCircle size={16} className="text-green-500" />
                          ) : task.status === 'overdue' ? (
                            <AlertCircle size={16} className="text-red-500" />
                          ) : (
                            <Clock size={16} className="text-slate-400" />
                          )}
                          <span>{new Date(task.date).toLocaleDateString()}</span>
                        </div>
                        {task.notes && <p className="mt-2 text-sm text-slate-600">{task.notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedPlanId(null)}
                className="rounded-xl bg-slate-100 px-4 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-200"
              >
                Close
              </button>
              <button
                onClick={() => navigate(`/crop-plan/${selectedPlan.id}`)}
                className="rounded-xl bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary/90"
              >
                Open Full Plan
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default CropManagement;
