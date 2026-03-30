import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sun, Cloud, CloudRain, Wind, Droplets, Map as MapIcon, AlertTriangle, Loader2 } from 'lucide-react';

const Weather: React.FC = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Default to London coordinates if geolocation fails
        let lat = 51.5074;
        let lon = -0.1278;

        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            getWeatherData(lat, lon);
          }, () => {
            getWeatherData(lat, lon);
          });
        } else {
          getWeatherData(lat, lon);
        }
      } catch (error) {
        console.error("Weather Fetch Error:", error);
        setLoading(false);
      }
    };

    const getWeatherData = async (lat: number, lon: number) => {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`);
      const data = await response.json();
      setWeatherData(data);
      setLoading(false);
    };

    fetchWeather();
  }, []);

  const getWeatherIcon = (code: number) => {
    if (code === 0) return <Sun size={48} />;
    if (code <= 3) return <Cloud size={48} />;
    if (code >= 51) return <CloudRain size={48} />;
    return <Cloud size={48} />;
  };

  const getWeatherText = (code: number) => {
    if (code === 0) return "Clear Sky";
    if (code <= 3) return "Partly Cloudy";
    if (code >= 51) return "Rainy";
    return "Cloudy";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-slate-500 font-medium">Fetching local weather...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-white shadow-lg">
        <div className="absolute -right-4 -top-4 opacity-20">
          <Sun size={120} />
        </div>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-primary/20 bg-white/20 rounded-full px-3 py-1 text-xs inline-block mb-2 backdrop-blur-sm">Current Weather</p>
              <h2 className="text-4xl font-bold">{Math.round(weatherData?.current?.temperature_2m)}°C</h2>
              <p className="text-lg font-medium opacity-90">{getWeatherText(weatherData?.current?.weather_code)}</p>
            </div>
            {getWeatherIcon(weatherData?.current?.weather_code)}
          </div>
          <div className="mt-6 flex gap-4 text-sm border-t border-white/10 pt-4">
            <div className="flex items-center gap-1">
              <Droplets size={16} />
              <span>{weatherData?.current?.relative_humidity_2m}% Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <Wind size={16} />
              <span>{weatherData?.current?.wind_speed_10m} km/h Wind</span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-1">
            <CloudRain size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Rainfall Prob.</span>
          </div>
          <p className="text-2xl font-bold">15%</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-primary/5 shadow-sm">
          <div className="flex items-center gap-2 text-primary mb-1">
            <Sun size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">UV Index</span>
          </div>
          <p className="text-2xl font-bold">Moderate</p>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={20} />
            Active Warnings
          </h3>
          <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded-full">2 Alerts</span>
        </div>
        <div className="space-y-3">
          <div className="flex gap-4 p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
              <CloudRain size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-red-900">Heavy Rain Expected</h4>
              <p className="text-xs text-red-700 mt-1">Forecast for 18:00 today. Potential localized flooding in Sector B-12.</p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
              <Wind size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-orange-900">Strong Wind Gusts</h4>
              <p className="text-xs text-orange-700 mt-1">Winds up to 45km/h expected tonight. Secure lightweight field equipment.</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3 px-1">Hourly Forecast</h3>
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
          {weatherData?.hourly?.time?.slice(0, 12).map((time: string, i: number) => {
            const date = new Date(time);
            const hour = date.getHours();
            const temp = Math.round(weatherData.hourly.temperature_2m[i]);
            const code = weatherData.hourly.weather_code[i];
            
            const Icon = code === 0 ? Sun : (code <= 3 ? Cloud : CloudRain);

            return (
              <div 
                key={i} 
                className={`flex-shrink-0 w-20 p-3 rounded-xl flex flex-col items-center gap-2 shadow-sm transition-colors bg-white border border-primary/5`}
              >
                <span className="text-xs font-medium opacity-60">{hour}:00</span>
                <Icon size={20} className="text-primary" />
                <span className="font-bold">{temp}°</span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3 px-1">Rain Radar</h3>
        <div className="rounded-xl overflow-hidden border border-primary/10 shadow-sm relative h-48">
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCesv5VEdKG6ItTeRGd0GzHqW6RIqLeikYNxDyckwl1_PmLEk-M2flRcwCRNd9TEQCNWYZncSddIBPx2U3-H5sf-ioGS8T8rltuOKyNC9_9uJ1lAHI1FrSmxqBlTgSbDzrixxZHh3QvRumbvIeo1OPpPbQYLD5C0BR8BJxTyDTPUBXDn_L5sET0YW5KnORTj-bl1Kzu7_s2FfG7RVYkjCZt763RrKQ-9kVXmGIlA97XvZobNsDKMr5QlQ3xxNyYRgTDHb_caeqCzfH1" 
            alt="Rain Radar Map"
          />
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <button className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
              <MapIcon size={16} className="text-primary" />
              Expand Radar
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Weather;
