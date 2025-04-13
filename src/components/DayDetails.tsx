import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Cloud, Sun, Wind, Droplets, Thermometer, CloudRain } from 'lucide-react';
import { WeatherStats } from './WeatherStats';

export function DayDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { forecast } = location.state || {};
  const date = new Date(forecast?.date);

  // Mock hourly data for the selected day
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const baseTemp = forecast?.temperature || 20;
    const variance = Math.sin((i / 24) * Math.PI * 2) * 5;
    
    return {
      time: `${date.toISOString().split('T')[0]}T${hour}:00:00`,
      temperature: baseTemp + variance,
      humidity: forecast?.humidity + Math.random() * 10 - 5,
      windSpeed: forecast?.windSpeed + Math.random() * 5 - 2.5,
      uvIndex: Math.floor(Math.random() * 11),
    };
  });

  if (!forecast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No forecast data available</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-sunset-500 text-white rounded-lg hover:bg-sunset-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 bg-weather-pattern bg-cover bg-center bg-blend-soft-light">
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />
      <div className="container mx-auto px-4 py-8 relative">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white/90 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-gray-200 shadow-glass">
          <h1 className="text-3xl font-bold mb-6">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Thermometer className="w-6 h-6 text-sunset-400" />
                <h3 className="text-lg font-semibold">Temperature</h3>
              </div>
              <div className="text-3xl font-bold">{Math.round(forecast.temperature)}°C</div>
            </div>

            <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Cloud className="w-6 h-6 text-sunset-400" />
                <h3 className="text-lg font-semibold">Condition</h3>
              </div>
              <div className="text-xl">{forecast.condition}</div>
            </div>

            <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Wind className="w-6 h-6 text-sunset-400" />
                <h3 className="text-lg font-semibold">Wind Speed</h3>
              </div>
              <div className="text-3xl font-bold">{forecast.windSpeed} km/h</div>
            </div>

            <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-3 mb-4">
                <Droplets className="w-6 h-6 text-sunset-400" />
                <h3 className="text-lg font-semibold">Humidity</h3>
              </div>
              <div className="text-3xl font-bold">{forecast.humidity}%</div>
            </div>
          </div>
        </div>

        <WeatherStats hourlyData={hourlyData} isPremium={true} />
      </div>
    </div>
  );
}