import React from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ForecastDay {
  date: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

interface ForecastCardProps {
  forecast: ForecastDay;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const navigate = useNavigate();
  const date = new Date(forecast.date);
  const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleClick = () => {
    navigate(`/forecast/${date.toISOString().split('T')[0]}`, { state: { forecast } });
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-glass hover:shadow-glass-hover transition-all duration-300 group cursor-pointer transform hover:scale-105"
    >
      <div className="text-sm font-medium text-gray-600 mb-2">{formattedDate}</div>
      <div className="flex items-center justify-between">
        <img 
          src={`https://openweathermap.org/img/wn/${forecast.icon}@2x.png`} 
          alt={forecast.condition} 
          className="w-12 h-12 group-hover:animate-float"
        />
        <div className="text-2xl font-bold text-black">
          {Math.round(forecast.temperature)}°C
        </div>
      </div>
      <div className="text-sm text-gray-600 mt-2">{forecast.condition}</div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-xs text-gray-600">
          <Droplets className="w-4 h-4 mr-1 text-sunset-400" />
          <span>{forecast.humidity}%</span>
        </div>
        <div className="flex items-center text-xs text-gray-600">
          <Wind className="w-4 h-4 mr-1 text-sunset-400" />
          <span>{forecast.windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}