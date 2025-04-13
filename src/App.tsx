import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SearchBar } from './components/SearchBar';
import { WeatherCard } from './components/WeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { AlertForm } from './components/AlertForm';
import { UserAlerts } from './components/UserAlerts';
import { AuthForm } from './components/AuthForm';
import { DayDetails } from './components/DayDetails';
import { Cloud, LogOut, Sun, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

function Dashboard() {
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData?.session?.user) {
          setUser(sessionData.session.user);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session?.user) {
            setUser(session.user);
          } else {
            setUser(null);
          }
        });

        return () => subscription.unsubscribe();
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        if (error.message !== 'Auth session missing!') {
          toast.error('Authentication error occurred');
        }
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  const handleSearch = async (city: string) => {
    if (!city.trim()) {
      toast.error('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const mockWeather = {
        city,
        temperature: 25,
        humidity: 65,
        windSpeed: 12,
        condition: 'Partly Cloudy',
        icon: '02d'
      };

      const mockForecast = Array.from({ length: 5 }, (_, i) => ({
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
        temperature: 20 + Math.random() * 10,
        humidity: 60 + Math.random() * 20,
        windSpeed: 10 + Math.random() * 5,
        condition: 'Partly Cloudy',
        icon: '02d'
      }));

      setWeather(mockWeather);
      setForecast(mockForecast);
      toast.success(`Weather data loaded for ${city}`);
    } catch (err: any) {
      setError('Failed to fetch weather data');
      toast.error('Failed to fetch weather data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setWeather(null);
      setForecast([]);
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 bg-weather-pattern bg-cover bg-center bg-blend-soft-light">
      <div className="absolute inset-0 bg-white/70 pointer-events-none" />
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8 relative">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center justify-between w-full max-w-4xl bg-white/80 backdrop-blur-xl rounded-2xl p-4 shadow-glass">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Cloud className="w-10 h-10 text-sunset-400 animate-float" />
                <Sun className="w-6 h-6 text-sunset-300 absolute -right-1 -top-1 animate-pulse-slow" />
              </div>
              <h1 className="text-4xl font-bold text-black">
                Weather Dashboard
              </h1>
            </div>
            {user && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-6 py-2.5 bg-white hover:bg-gray-50 backdrop-blur-sm rounded-xl transition-all duration-300 border border-gray-200 shadow-glass hover:shadow-glass-hover group"
              >
                <LogOut className="w-5 h-5 text-black group-hover:text-sunset-500 transition-colors" />
                <span className="text-black group-hover:text-sunset-500 transition-colors">Sign Out</span>
              </button>
            )}
          </div>

          {!user ? (
            <AuthForm onSuccess={() => toast.success('Welcome to Weather Dashboard!')} />
          ) : (
            <>
              <SearchBar onSearch={handleSearch} />
              
              {loading && (
                <div className="flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-glass">
                  <div className="w-6 h-6 border-2 border-sunset-400 border-t-transparent rounded-full animate-spin" />
                  <span className="text-black">Loading weather data...</span>
                </div>
              )}
              
              {error && (
                <div className="flex items-center justify-center space-x-2 bg-red-50 border border-red-200 text-red-600 p-6 rounded-xl w-full max-w-md backdrop-blur-xl shadow-glass">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              )}
              
              {weather && !loading && (
                <div className="w-full space-y-8">
                  <WeatherCard {...weather} />
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-gray-200 shadow-glass">
                    <h2 className="text-2xl font-bold text-black mb-8 flex items-center">
                      5-Day Forecast
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                      {forecast.map((day, index) => (
                        <ForecastCard key={index} forecast={day} />
                      ))}
                    </div>
                  </div>

                  <AlertForm city={weather.city} />
                  
                  <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-gray-200 shadow-glass">
                    <h2 className="text-2xl font-bold text-black mb-8">
                      Your Alerts
                    </h2>
                    <UserAlerts />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forecast/:date" element={<DayDetails />} />
      </Routes>
    </Router>
  );
}

export default App;