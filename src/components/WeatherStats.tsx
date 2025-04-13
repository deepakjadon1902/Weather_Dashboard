import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { format } from 'date-fns';
import { TrendingUp, Wind, Droplets, Sun } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeatherStatsProps {
  hourlyData: Array<{
    time: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    uvIndex?: number;
  }>;
  isPremium: boolean;
}

export function WeatherStats({ hourlyData, isPremium }: WeatherStatsProps) {
  const chartData = {
    labels: hourlyData.map(data => format(new Date(data.time), 'HH:mm')),
    datasets: [
      {
        label: 'Temperature (°C)',
        data: hourlyData.map(data => data.temperature),
        borderColor: 'rgb(255, 145, 55)',
        backgroundColor: 'rgba(255, 145, 55, 0.1)',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Humidity (%)',
        data: hourlyData.map(data => data.humidity),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-gray-200 shadow-glass">
      <div className="flex items-center space-x-3 mb-6">
        <TrendingUp className="w-6 h-6 text-sunset-400" />
        <h3 className="text-xl font-bold text-black">Weather Statistics</h3>
      </div>

      <div className="mb-8">
        <Line data={chartData} options={options} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Wind className="w-5 h-5 text-sunset-400" />
            <span className="font-medium">Wind Speed</span>
          </div>
          <div className="text-2xl font-bold">
            {hourlyData[0].windSpeed} km/h
          </div>
        </div>

        <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
          <div className="flex items-center space-x-2 mb-2">
            <Droplets className="w-5 h-5 text-sunset-400" />
            <span className="font-medium">Humidity</span>
          </div>
          <div className="text-2xl font-bold">
            {hourlyData[0].humidity}%
          </div>
        </div>

        {isPremium && (
          <div className="bg-white/90 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-2">
              <Sun className="w-5 h-5 text-sunset-400" />
              <span className="font-medium">UV Index</span>
            </div>
            <div className="text-2xl font-bold">
              {hourlyData[0].uvIndex || 'N/A'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}