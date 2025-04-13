import React from 'react';
import { Cloud, Droplets, Wind } from 'lucide-react';

interface WeatherCardProps {
  city: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  icon: string;
}

export function WeatherCard({ city, temperature, humidity, windSpeed, condition, icon }: WeatherCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 max-w-sm w-full border border-gray-200 shadow-glass hover:shadow-glass-hover transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">{city}</h2>
        <img 
          src={`https://openweathermap.org/img/wn/${icon}@2x.png`} 
          alt={condition} 
          className="w-16 h-16 animate-float"
        />
      </div>
      
      <div className="text-6xl font-bold text-black mb-6">
        {Math.round(temperature)}°C
      </div>
      
      <div className="text-gray-700 mb-6">{condition}</div>
      
      <div className="space-y-4">
        <div className="flex items-center text-black bg-gray-50 p-3 rounded-xl">
          <Droplets className="w-5 h-5 mr-3 text-sunset-400" />
          <span>Humidity: {humidity}%</span>
        </div>
        <div className="flex items-center text-black bg-gray-50 p-3 rounded-xl">
          <Wind className="w-5 h-5 mr-3 text-sunset-400" />
          <span>Wind: {windSpeed} km/h</span>
        </div>
      </div>
    </div>
  );
}