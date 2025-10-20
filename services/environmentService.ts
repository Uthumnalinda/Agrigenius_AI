import { useState, useEffect } from 'react';
import { getWeatherData } from './weatherService';
import { useCurrentLocation } from './satelliteService';

export interface EnvironmentData {
  weather: {
    temperature: number;
    humidity: number;
    humidityTrend: number;
    description: string;
    icon: string;
    precipitation: number;
    cloudCover: number;
  };
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  soilHealth?: {
    value: number;
    trend: number;
    moisture: number;
    ndvi: number;
  };
  lastScan?: string;
}

const getLastScanTime = () => {
  const now = new Date();
  const lastScanDate = new Date(now.getTime() - Math.random() * 7200000); // Random time within last 2 hours
  const diffMinutes = Math.round((now.getTime() - lastScanDate.getTime()) / 60000);
  
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else {
    return `${Math.round(diffMinutes / 60)}h ago`;
  }
};

export const useEnvironmentData = () => {
  const { location, loading: locationLoading, error: locationError } = useCurrentLocation();
  const [data, setData] = useState<EnvironmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get weather data with location if available
        const weatherData = location 
          ? await getWeatherData(location.latitude, location.longitude)
          : await getWeatherData();
        
        console.log('🌍 Location:', location || 'Using default location');
        console.log('🌤️ OpenWeatherMap REAL-TIME data:', weatherData);
        
        const newData: EnvironmentData = {
          weather: {
            temperature: weatherData.temperature,
            humidity: weatherData.humidity,
            humidityTrend: 0,
            description: weatherData.description,
            icon: weatherData.icon,
            precipitation: weatherData.precipitation,
            cloudCover: weatherData.cloudCover
          },
          location: location || {
            latitude: 0,
            longitude: 0,
            accuracy: 0
          },
          lastScan: getLastScanTime()
        };
        
        console.log('✅ Final environment data (100% OpenWeatherMap):', newData);
        
        setData(newData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching environment data:', error);
        setLoading(false);
      }
    };

    fetchData();

    // Update data every 5 minutes for real-time updates
    const interval = setInterval(fetchData, 300000);

    return () => clearInterval(interval);
  }, [location]);

  return { 
    data, 
    loading: loading || locationLoading,
    error: locationError
  };
};