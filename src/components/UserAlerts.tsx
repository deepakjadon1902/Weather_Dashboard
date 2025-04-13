import React, { useEffect, useState } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Alert {
  id: string;
  location: string;
  condition: string;
  method: string;
  created_at: string;
}

export function UserAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      
      if (!user) {
        setError('Please sign in to view alerts');
        return;
      }

      const { data, error: alertsError } = await supabase
        .from('alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (alertsError) throw alertsError;
      
      setAlerts(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load alerts. Please try again.');
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const deleteAlert = async (id: string) => {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setAlerts(alerts.filter(alert => alert.id !== id));
      toast.success('Alert deleted successfully');
    } catch (error: any) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-sunset-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 text-red-600 bg-red-50 rounded-lg">
        <AlertCircle className="w-5 h-5 mr-2" />
        <span>{error}</span>
      </div>
    );
  }

  if (alerts.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        No alerts set. Create one above!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-black">{alert.location}</div>
              <div className="text-sm text-gray-600 mt-1">{alert.condition}</div>
              <div className="text-xs text-gray-500 mt-2">
                Via {alert.method} • Created {new Date(alert.created_at).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => deleteAlert(alert.id)}
              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors duration-200"
              title="Delete alert"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}