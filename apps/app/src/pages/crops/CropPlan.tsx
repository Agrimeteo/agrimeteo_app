import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../../services/api';
import CropRecommendationsWidget from '../../components/CropRecommendationsWidget';

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
  crop?: {
    id: string;
    name?: string | null;
  } | null;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

const CropPlan: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plan, setPlan] = useState<CropPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await api.get(`/crop-plans/${id}`);
        setPlan(response.data.data);
      } catch (error) {
        console.error('Error fetching plan:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPlan();
  }, [id]);

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      await api.patch(`/crop-plans/${plan?.id}/task/${taskId}`, { status });
      setPlan((currentPlan) =>
        currentPlan
          ? {
              ...currentPlan,
              tasks: currentPlan.tasks.map((task) =>
                task.id === taskId ? { ...task, status: status as Task['status'] } : task,
              ),
            }
          : currentPlan,
      );
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!plan) return <div>Plan not found</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/crops')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Crop Plan</h2>
          <p className="text-slate-500 text-sm">
            Track your farming activities and follow the latest recommendations.
          </p>
        </div>
      </div>

      <CropRecommendationsWidget
        planId={plan.id}
        cropName={plan.crop?.name ?? null}
      />

      <div className="space-y-4">
        {plan.tasks.map((task) => (
          <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {task.status === 'completed' ? (
                  <CheckCircle className="text-green-500" size={20} />
                ) : task.status === 'overdue' ? (
                  <AlertCircle className="text-red-500" size={20} />
                ) : (
                  <Clock className="text-slate-400" size={20} />
                )}
                <div>
                  <h3 className="font-medium text-slate-900">{task.name}</h3>
                  <p className="text-sm text-slate-500">Due: {new Date(task.date).toLocaleDateString()}</p>
                  {task.notes && <p className="text-sm text-slate-400">{task.notes}</p>}
                </div>
              </div>
              <select
                value={task.status}
                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                className="px-3 py-1 border border-slate-200 rounded-lg text-sm"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CropPlan;
