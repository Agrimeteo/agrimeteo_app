import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle, Clock, Edit3, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';

interface Task {
  id: string;
  name: string;
  date: string;
  status: 'pending' | 'completed' | 'overdue';
  notes?: string;
}

interface CropPlan {
  id: string;
  crop: {
    name: string;
  };
  tasks: Task[];
}

const CropPlanning: React.FC<{ cropId: string }> = ({ cropId }) => {
  const [plans, setPlans] = useState<CropPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const { data } = await api.get('/crop-plans');
      setPlans(data);
    } catch (error) {
      console.error('Plans fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    try {
      await api.post(`/crop-plans/${cropId}`);
      fetchPlans();
    } catch (error) {
      console.error('Plan generation error:', error);
    }
  };

  const toggleTaskStatus = async (planId: string, taskId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    const task = plan.tasks.find(t => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.patch(`/crop-plans/${planId}/task/${taskId}`, {
        status: newStatus
      });
      fetchPlans();
    } catch (error) {
      console.error('Task update error:', error);
    }
  };

  if (loading) {
    return <div>Loading plans...</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/crops')}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-2xl font-bold text-slate-900">Crop Planning</h2>
      </div>

      <div className="grid gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-slate-900">{plan.crop.name} Plan</h3>
              <button
                onClick={() => generatePlan()}
                className="px-4 py-2 bg-primary/90 text-white rounded-lg hover:bg-primary text-sm font-medium transition-colors"
              >
                Regenerate Plan
              </button>
            </div>

            <div className="space-y-3">
              {plan.tasks.map((task) => {
                const isOverdue = new Date(task.date) < new Date() && task.status === 'pending';
                return (
                  <motion.div
                    key={task.id}
                    className={`p-4 rounded-lg border transition-all ${
                      isOverdue ? 'border-red-200 bg-red-50' :
                      task.status === 'completed' ? 'border-green-200 bg-green-50' :
                      'border-slate-200 hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={() => toggleTaskStatus(plan.id, task.id)}
                        className="p-2 rounded-lg bg-white border hover:scale-105 transition-transform"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle size={20} className="text-green-500" />
                        ) : (
                          <Clock size={20} className={isOverdue ? 'text-red-500' : 'text-slate-400'} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-slate-900 truncate">{task.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            isOverdue ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {task.status === 'completed' ? 'Done' : isOverdue ? 'Overdue' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Calendar size={14} />
                          <span>{task.date}</span>
                        </div>
                        {task.notes && <p className="text-xs text-slate-500 mt-1">{task.notes}</p>}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default CropPlanning;

