import React from 'react';
import { Crown, TrendingUp, Map, Wind, Sun, CloudRain } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface PremiumFeaturesProps {
  currentTier: string;
  onUpgrade: () => void;
}

export function PremiumFeatures({ currentTier, onUpgrade }: PremiumFeaturesProps) {
  const features = {
    free: [
      { icon: <CloudRain className="w-5 h-5" />, name: 'Basic Weather Data' },
      { icon: <Wind className="w-5 h-5" />, name: '5-Day Forecast' },
      { icon: <Sun className="w-5 h-5" />, name: 'Email Alerts' },
    ],
    premium: [
      { icon: <Map className="w-5 h-5" />, name: 'Interactive Weather Maps' },
      { icon: <TrendingUp className="w-5 h-5" />, name: 'Historical Data (30 Days)' },
      { icon: <Wind className="w-5 h-5" />, name: 'Air Quality Index' },
      { icon: <Sun className="w-5 h-5" />, name: 'UV Index Tracking' },
      { icon: <CloudRain className="w-5 h-5" />, name: 'Hourly Forecasts' },
    ],
    professional: [
      { icon: <Map className="w-5 h-5" />, name: 'Advanced Weather Maps' },
      { icon: <TrendingUp className="w-5 h-5" />, name: 'Historical Data (1 Year)' },
      { icon: <Wind className="w-5 h-5" />, name: 'Severe Weather Alerts' },
      { icon: <Sun className="w-5 h-5" />, name: 'API Access' },
      { icon: <CloudRain className="w-5 h-5" />, name: 'Custom Alert Rules' },
    ],
  };

  const prices = {
    premium: '$9.99/month',
    professional: '$19.99/month',
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in first');

      // In a real app, this would integrate with a payment processor
      const { error } = await supabase
        .from('users')
        .update({ subscription_tier: tier })
        .eq('id', user.id);

      if (error) throw error;

      toast.success(`Upgraded to ${tier} successfully!`);
      onUpgrade();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-gray-200 shadow-glass">
      <div className="flex items-center space-x-3 mb-8">
        <Crown className="w-8 h-8 text-sunset-400" />
        <h2 className="text-2xl font-bold text-black">Premium Features</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Free Tier */}
        <div className="bg-white/90 rounded-xl p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Free</h3>
          <ul className="space-y-4">
            {features.free.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                {feature.icon}
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              disabled
              className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg"
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* Premium Tier */}
        <div className="bg-gradient-to-br from-sunset-50 to-white rounded-xl p-6 border border-sunset-200 transform hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-2">Premium</h3>
          <div className="text-sunset-600 mb-4">{prices.premium}</div>
          <ul className="space-y-4">
            {features.premium.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                {feature.icon}
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              onClick={() => handleUpgrade('premium')}
              disabled={currentTier === 'premium'}
              className="w-full px-4 py-2 bg-sunset-500 text-white rounded-lg hover:bg-sunset-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTier === 'premium' ? 'Current Plan' : 'Upgrade to Premium'}
            </button>
          </div>
        </div>

        {/* Professional Tier */}
        <div className="bg-gradient-to-br from-midnight-50 to-white rounded-xl p-6 border border-midnight-200 transform hover:scale-105 transition-transform duration-300">
          <h3 className="text-xl font-semibold mb-2">Professional</h3>
          <div className="text-midnight-600 mb-4">{prices.professional}</div>
          <ul className="space-y-4">
            {features.professional.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3">
                {feature.icon}
                <span>{feature.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <button
              onClick={() => handleUpgrade('professional')}
              disabled={currentTier === 'professional'}
              className="w-full px-4 py-2 bg-midnight-500 text-white rounded-lg hover:bg-midnight-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentTier === 'professional' ? 'Current Plan' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}