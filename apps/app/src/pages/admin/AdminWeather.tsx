import React from 'react';

const AdminWeather: React.FC = () => {
  const weatherData = [
    { location: 'Field A', temperature: 24, humidity: 65, rainfall: 2.5, status: 'Normal' },
    { location: 'Field B', temperature: 26, humidity: 70, rainfall: 1.8, status: 'Normal' },
    { location: 'Greenhouse 1', temperature: 22, humidity: 75, rainfall: 0, status: 'Optimal' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Weather Monitoring</h1>
        <p className="text-slate-600">Real-time weather data and alerts</p>
      </div>

      {/* Current Weather Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Temperature</p>
              <p className="text-2xl font-bold text-slate-900">24°C</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-orange-600">thermostat</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Humidity</p>
              <p className="text-2xl font-bold text-slate-900">68%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">water_drop</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Rainfall</p>
              <p className="text-2xl font-bold text-slate-900">2.1 mm</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600">rainy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location-specific Weather */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Location Monitoring</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Temperature</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Humidity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rainfall</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {weatherData.map((data, index) => (
                <tr key={index} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{data.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{data.temperature}°C</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{data.humidity}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{data.rainfall} mm</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      data.status === 'Optimal' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {data.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Weather Alerts */}
      <div className="mt-6 bg-yellow-50 rounded-xl p-6 border border-yellow-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-yellow-600">warning</span>
          </div>
          <h3 className="text-lg font-bold text-yellow-800">Weather Alerts</h3>
        </div>
        <div className="space-y-2">
          <p className="text-sm text-yellow-700">• Heavy rainfall expected in Field A tomorrow</p>
          <p className="text-sm text-yellow-700">• Temperature drop forecast for Greenhouse 1</p>
        </div>
      </div>
    </div>
  );
};

export default AdminWeather;