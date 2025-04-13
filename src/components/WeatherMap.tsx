import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Map as MapIcon, Plus, Bookmark } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import 'leaflet/dist/leaflet.css';

interface WeatherMapProps {
  center: [number, number];
  locations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
  }>;
}

export function WeatherMap({ center, locations }: WeatherMapProps) {
  const [savedLocations, setSavedLocations] = React.useState(locations);
  const [newLocation, setNewLocation] = React.useState('');

  const handleSaveLocation = async (lat: number, lng: number) => {
    if (!newLocation.trim()) {
      toast.error('Please enter a location name');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please sign in first');

      const { data, error } = await supabase
        .from('weather_maps')
        .insert({
          user_id: user.id,
          location: newLocation,
          latitude: lat,
          longitude: lng,
          name: newLocation,
        })
        .select()
        .single();

      if (error) throw error;

      setSavedLocations([...savedLocations, data]);
      setNewLocation('');
      toast.success('Location saved successfully!');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 w-full max-w-4xl border border-gray-200 shadow-glass">
      <div className="flex items-center space-x-3 mb-6">
        <MapIcon className="w-6 h-6 text-sunset-400" />
        <h3 className="text-xl font-bold text-black">Weather Map</h3>
      </div>

      <div className="h-[400px] rounded-xl overflow-hidden">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {savedLocations.map((loc) => (
            <Marker key={loc.id} position={[loc.latitude, loc.longitude]}>
              <Popup>{loc.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-4 flex space-x-2">
        <input
          type="text"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
          placeholder="Enter location name..."
          className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sunset-400/20"
        />
        <button
          onClick={() => handleSaveLocation(center[0], center[1])}
          className="px-4 py-2 bg-sunset-500 text-white rounded-lg hover:bg-sunset-600 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Save Location</span>
        </button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-600 mb-2">Saved Locations</h4>
        <div className="space-y-2">
          {savedLocations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center space-x-2 text-sm text-gray-600"
            >
              <Bookmark className="w-4 h-4 text-sunset-400" />
              <span>{loc.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}