import React from 'react';

interface StatsCardProps {
  title: string;
  value: number;
  trend: string;
  trendColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, trend, trendColor }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <span className="material-symbols-outlined font-light text-lg">
            {title.includes('Users') ? 'group' :
             title.includes('Crops') ? 'potted_plant' :
             title.includes('Reports') ? 'description' :
             'warning'}
          </span>
        </div>
        <span className={`text-sm font-bold flex items-center ${trendColor}`}>
          {trend} <span className="material-symbols-outlined text-sm ml-0.5">
            {trend.startsWith('+') ? 'trending_up' : 'trending_down'}
          </span>
        </span>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold mt-1">{value.toLocaleString()}</p>
    </div>
  );
};

export default StatsCard;

