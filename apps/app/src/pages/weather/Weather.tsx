import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, Wind, Droplets, Map as MapIcon, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../services/api';

type WeatherOverview = {
  temperature: number;
  humidity: number;
  condition: string;
  location: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
  rainfallProbability: number;
  uvIndex: string;
};

type WeatherAlert = {
  id: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  date: string;
  cropName?: string | null;
  regionName?: string | null;
};

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherOverview | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const [weatherResult, alertsResult] = await Promise.allSettled([
          api.get('/weather'),
          api.get('/weather/alerts'),
        ]);

        if (weatherResult.status === 'fulfilled') {
          setWeatherData(weatherResult.value.data?.data ?? null);
        } else {
          console.error('Weather overview fetch error:', weatherResult.reason);
          setWeatherData(null);
        }

        if (alertsResult.status === 'fulfilled') {
          setAlerts(alertsResult.value.data?.data ?? []);
        } else {
          console.error('Weather alerts fetch error:', alertsResult.reason);
          setAlerts([]);
        }
      } catch (error) {
        console.error('Weather Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition: string) => {
    const value = condition.toLowerCase();
    if (value.includes('rain') || value.includes('shower')) return <CloudRain size={48} />;
    if (value.includes('wind')) return <Wind size={48} />;
    if (value.includes('clear') || value.includes('sun')) return <Sun size={48} />;
    return <Cloud size={48} />;
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-medium text-slate-500">Fetching local weather...</p>
      </div>
    );
  }

  if (!weatherData) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-amber-500" size={42} />
        <p className="font-medium text-slate-600">Unable to load weather details right now.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Sun size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs text-primary/20 backdrop-blur-sm">
                Current Weather
              </p>
              <h2 className="text-4xl font-bold">{Math.round(weatherData.temperature)} C</h2>
              <p className="text-lg font-medium opacity-90">{weatherData.condition}</p>
              <p className="mt-2 text-sm text-white/80">{weatherData.location}</p>
            </div>
            {getWeatherIcon(weatherData.condition)}
          </div>
          <div className="mt-6 flex gap-4 border-t border-white/10 pt-4 text-sm">
            <div className="flex items-center gap-1">
              <Droplets size={16} />
              <span>{weatherData.humidity}% Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <CloudRain size={16} />
              <span>{weatherData.rainfallProbability}% Rainfall chance</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <CloudRain size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Rainfall Prob.</span>
          </div>
          <p className="text-2xl font-bold">{weatherData.rainfallProbability}%</p>
        </div>
        <div className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm">
          <div className="mb-1 flex items-center gap-2 text-primary">
            <Sun size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">UV Index</span>
          </div>
          <p className="text-2xl font-bold">{weatherData.uvIndex}</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between px-1">
          <h3 className="flex items-center gap-2 text-lg font-bold">
            <AlertTriangle className="text-red-500" size={20} />
            Active Warnings
          </h3>
          <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-500">
            {alerts.length} Alerts
          </span>
        </div>
        <div className="space-y-3">
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className={`flex gap-4 rounded-xl border p-4 ${
                  alert.severity === 'high'
                    ? 'border-red-100 bg-red-50'
                    : alert.severity === 'medium'
                      ? 'border-orange-100 bg-orange-50'
                      : 'border-blue-100 bg-blue-50'
                }`}
              >
                <div
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                    alert.severity === 'high'
                      ? 'bg-red-100 text-red-600'
                      : alert.severity === 'medium'
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {alert.severity === 'high' ? <CloudRain size={20} /> : <Wind size={20} />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{alert.title}</h4>
                  <p className="mt-1 text-xs text-slate-700">{alert.description}</p>
                  <p className="mt-2 text-[11px] text-slate-500">
                    {new Date(alert.date).toLocaleString()}
                    {alert.cropName ? ` - ${alert.cropName}` : ''}
                    {alert.regionName ? ` - ${alert.regionName}` : ''}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl border border-primary/10 bg-white p-4 text-sm text-slate-500 shadow-sm">
              No weather alerts at the moment for your active crop regions.
            </div>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 px-1 text-lg font-bold">Forecast</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {weatherData.forecast.map((item) => (
            <div key={item.day} className="rounded-xl border border-primary/5 bg-white p-4 shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{item.day}</div>
              <div className="mt-2 text-2xl font-bold text-slate-900">{item.temp} C</div>
              <div className="mt-1 text-sm text-slate-600">{item.condition}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 px-1 text-lg font-bold">Alert Coverage</h3>
        <div className="relative h-48 overflow-hidden rounded-xl border border-primary/10 shadow-sm">
          <img
            className="h-full w-full object-cover"
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80"
            alt="Regional weather coverage"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
            <button className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-bold shadow-lg backdrop-blur-sm">
              <MapIcon size={16} className="text-primary" />
              Crop Region Coverage
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Weather;
