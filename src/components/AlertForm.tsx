import React, { useState, useEffect } from 'react';
import { Bell, Phone } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AlertFormProps {
  city: string;
}

export function AlertForm({ city }: AlertFormProps) {
  const [condition, setCondition] = useState('above');
  const [temperature, setTemperature] = useState('30');
  const [notificationMethod, setNotificationMethod] = useState('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          console.log('No user found');
          return;
        }
        
        setUser(user);
        
        // Create user record if it doesn't exist
        const { error: upsertError } = await supabase
          .from('users')
          .upsert({ id: user.id })
          .select()
          .single();
          
        if (upsertError) throw upsertError;
        
        // Fetch phone number
        const { data, error: phoneError } = await supabase
          .from('users')
          .select('phone_number')
          .eq('id', user.id)
          .single();
          
        if (phoneError) {
          if (phoneError.code === 'PGRST116') {
            // No phone number found, which is okay
            setPhoneNumber('');
          } else {
            throw phoneError;
          }
        } else if (data?.phone_number) {
          setPhoneNumber(data.phone_number);
        } else {
          setPhoneNumber('');
        }
      } catch (error: any) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
      }
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      toast.error('Please sign in to create alerts');
      return;
    }

    if (notificationMethod === 'sms' && !phoneNumber) {
      toast.error('Please enter a phone number for SMS notifications');
      return;
    }

    if (!temperature || isNaN(Number(temperature))) {
      toast.error('Please enter a valid temperature');
      return;
    }

    setLoading(true);

    try {
      // First ensure user record exists and update phone if needed
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({ 
          id: user.id,
          phone_number: notificationMethod === 'sms' ? phoneNumber : null 
        })
        .select()
        .single();
      
      if (upsertError) throw upsertError;

      // Then create the alert
      const { error: alertError } = await supabase
        .from('alerts')
        .insert({
          user_id: user.id,
          location: city,
          condition: `temperature ${condition} ${temperature}°C`,
          method: notificationMethod
        });

      if (alertError) throw alertError;
      
      toast.success('Alert created successfully! You will be notified when the condition is met.');
    } catch (error: any) {
      console.error('Error creating alert:', error);
      toast.error(error.message || 'Failed to create alert. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-md border border-gray-200 shadow-glass">
      <div className="flex items-center space-x-3 mb-6">
        <Bell className="w-6 h-6 text-sunset-400" />
        <h3 className="text-xl font-bold text-black">Set Weather Alert</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Alert me when temperature is
          </label>
          <div className="flex space-x-3">
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="block w-1/3 rounded-xl border border-gray-200 bg-white/80 text-black focus:border-sunset-400/50 focus:ring-2 focus:ring-sunset-400/20"
            >
              <option value="above">above</option>
              <option value="below">below</option>
            </select>
            <input
              type="number"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              min="-100"
              max="100"
              className="block w-1/3 rounded-xl border border-gray-200 bg-white/80 text-black focus:border-sunset-400/50 focus:ring-2 focus:ring-sunset-400/20"
              required
            />
            <span className="flex items-center text-black">°C</span>
          </div>
        </div>

        <div className="space-y-4">
          <label className="block text-sm font-medium text-black mb-2">
            Notification Method
          </label>
          <select
            value={notificationMethod}
            onChange={(e) => setNotificationMethod(e.target.value)}
            className="block w-full rounded-xl border border-gray-200 bg-white/80 text-black focus:border-sunset-400/50 focus:ring-2 focus:ring-sunset-400/20"
          >
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>

          {notificationMethod === 'sms' && (
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                className="block w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-white/80 text-black focus:border-sunset-400/50 focus:ring-2 focus:ring-sunset-400/20"
                required={notificationMethod === 'sms'}
                pattern="^\+[1-9]\d{1,14}$"
                title="Phone number must start with + and contain 1-15 digits"
              />
              <div className="mt-1 text-xs text-gray-500">
                Format: +[country code][number] (e.g., +12025550123)
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-sunset-500 text-white py-3 px-4 rounded-xl hover:bg-sunset-600 focus:outline-none focus:ring-2 focus:ring-sunset-400 focus:ring-offset-2 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Bell className="w-5 h-5" />
              <span>Create Alert</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}