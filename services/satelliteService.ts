import { useState, useEffect } from 'react';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export interface SatelliteData {
  ndvi: number;           // Normalized Difference Vegetation Index
  soilMoisture: number;   // Soil moisture percentage
  precipitation: number;  // Precipitation in mm
  cloudCover: number;     // Cloud cover percentage
}

export interface LocationData {
  location: GeoLocation;
  loading: boolean;
  error: string | null;
}

export const useCurrentLocation = (): LocationData => {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return { location: location as GeoLocation, loading, error };
};

export const useSatelliteData = (location: GeoLocation | null): { 
  satelliteData: SatelliteData | null;
  loading: boolean;
  error: string | null;
} => {
  const [satelliteData, setSatelliteData] = useState<SatelliteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSatelliteData = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Get date range - NASA POWER API works best with a range of dates
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // Get last 7 days of data
        
        const formatDate = (date: Date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        };

        // Fetch NASA POWER API data for agriculture with more reliable parameters
        // Using daily averaged data which is more reliable than single day
        const nasaUrl = `https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR,RH2M,T2M,CLOUD_AMT&community=RE&longitude=${location.longitude}&latitude=${location.latitude}&start=${formatDate(startDate)}&end=${formatDate(endDate)}&format=JSON`;
        
        console.log('Fetching NASA data from:', nasaUrl);
        
        const nasaResponse = await fetch(nasaUrl);
        
        if (!nasaResponse.ok) {
          throw new Error(`NASA API error: ${nasaResponse.status}`);
        }
        
        const nasaData = await nasaResponse.json();
        console.log('NASA API Response:', nasaData);

        // Extract the latest data point
        const parameters = nasaData.properties?.parameter;
        
        if (!parameters) {
          throw new Error('No parameter data in NASA response');
        }

        // Get the most recent valid value from the data
        const getLatestValidValue = (paramData: any, defaultValue: number = 0) => {
          if (!paramData) return defaultValue;
          const entries = Object.entries(paramData);
          // Filter out invalid values (-999) and get the most recent valid one
          for (let i = entries.length - 1; i >= 0; i--) {
            const value = entries[i][1] as number;
            if (value !== -999 && value >= 0) {
              return value;
            }
          }
          return defaultValue;
        };

        // Calculate average of valid values for more accurate data
        const getAverageValidValue = (paramData: any, defaultValue: number = 0) => {
          if (!paramData) return defaultValue;
          const values = Object.values(paramData) as number[];
          const validValues = values.filter(v => v !== -999 && v >= 0 && v <= 100);
          if (validValues.length === 0) return defaultValue;
          return validValues.reduce((a, b) => a + b, 0) / validValues.length;
        };

        const precipitation = getLatestValidValue(parameters.PRECTOTCORR, 0);
        const humidity = getAverageValidValue(parameters.RH2M, 65);
        const cloudCover = getAverageValidValue(parameters.CLOUD_AMT, 50);
        const temperature = getAverageValidValue(parameters.T2M, 24);

        // Calculate NDVI based on location and season
        const ndviValue = calculateSimulatedNDVI(location);

        // Calculate soil moisture from precipitation and humidity
        const soilMoisture = Math.min(100, Math.max(0, (precipitation * 5 + humidity * 0.3)));

        console.log('Processed NASA data:', {
          precipitation,
          humidity,
          cloudCover,
          temperature,
          ndvi: ndviValue,
          soilMoisture
        });

        // Set the satellite data
        setSatelliteData({
          ndvi: ndviValue,
          soilMoisture: Number(soilMoisture.toFixed(1)),
          precipitation: Number(precipitation.toFixed(2)),
          cloudCover: Number(cloudCover.toFixed(1))
        });

        setLoading(false);
        setError(null);
      } catch (err) {
        console.error('Error fetching satellite data:', err);
        // Fallback to simulated data if API fails
        const simulatedData = generateSimulatedData(location);
        setSatelliteData(simulatedData);
        setError('Using simulated data - NASA API temporarily unavailable');
        setLoading(false);
      }
    };

    fetchSatelliteData();
    // Update every 15 minutes
    const interval = setInterval(fetchSatelliteData, 900000);

    return () => clearInterval(interval);
  }, [location]);

  return { satelliteData, loading, error };
};

// Simulate NDVI calculation based on location and season
const calculateSimulatedNDVI = (location: GeoLocation): number => {
  const date = new Date();
  const month = date.getMonth();
  const baseNDVI = 0.6; // Healthy vegetation
  
  // Seasonal variation
  const seasonalFactor = Math.sin((month / 12) * 2 * Math.PI);
  // Latitude factor (vegetation varies with latitude)
  const latitudeFactor = Math.cos(location.latitude * Math.PI / 180);
  
  return Math.max(0, Math.min(1, baseNDVI + (seasonalFactor * 0.2) + (latitudeFactor * 0.1)));
};

// Generate realistic simulated data when API fails
const generateSimulatedData = (location: GeoLocation): SatelliteData => {
  return {
    ndvi: calculateSimulatedNDVI(location),
    soilMoisture: 65 + (Math.random() * 10 - 5),
    precipitation: 25 + (Math.random() * 10 - 5),
    cloudCover: Math.random() * 100
  };
};