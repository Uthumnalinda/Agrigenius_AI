import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';

interface LocationPermissionProps {
  onPermissionGranted: () => void;
}

const LocationPermission: React.FC<LocationPermissionProps> = ({ onPermissionGranted }) => {
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | null>(null);

  useEffect(() => {
    // Check if browser supports permissions API
    if (navigator.permissions && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'geolocation' as PermissionName })
        .then(result => {
          setPermissionStatus(result.state);
          if (result.state === 'granted') {
            onPermissionGranted();
          }

          // Listen for permission changes
          result.addEventListener('change', () => {
            setPermissionStatus(result.state);
            if (result.state === 'granted') {
              onPermissionGranted();
            }
          });
        })
        .catch(() => {
          // Fallback for browsers that don't support the permissions API
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => {
                setPermissionStatus('granted');
                onPermissionGranted();
              },
              () => {
                setPermissionStatus('denied');
              }
            );
          } else {
            setPermissionStatus('denied');
          }
        });
    }
  }, [onPermissionGranted]);

  const requestPermission = () => {
    navigator.geolocation.getCurrentPosition(
      () => {
        setPermissionStatus('granted');
        onPermissionGranted();
      },
      () => {
        setPermissionStatus('denied');
      },
      { enableHighAccuracy: true }
    );
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-center w-16 h-16 bg-lime-100 rounded-full mx-auto">
          <Icon name="leaf" className="w-8 h-8 text-lime-600" />
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800">
          Enable Location Services
        </h2>
        
        <p className="text-gray-600 text-center">
          AgriGenius needs access to your location to provide accurate agricultural insights using satellite data and local weather conditions.
        </p>
        
        <div className="space-y-3 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="scan" className="w-5 h-5 mr-2 text-lime-600" />
            <span>Precise soil and weather analysis</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="sun" className="w-5 h-5 mr-2 text-lime-600" />
            <span>Local climate-based recommendations</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Icon name="chat" className="w-5 h-5 mr-2 text-lime-600" />
            <span>Region-specific farming advice</span>
          </div>
        </div>

        {permissionStatus === 'denied' && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-600">
            Location access was denied. Please enable location services in your browser settings to use all features.
          </div>
        )}
        
        <button
          onClick={requestPermission}
          className="w-full bg-gradient-to-r from-lime-600 to-green-600 text-white font-semibold py-3 px-4 rounded-lg
                   hover:from-lime-700 hover:to-green-700 transition-all duration-200 flex items-center justify-center"
        >
          Enable Location Access
          <Icon name="arrowRight" className="w-4 h-4 ml-2" />
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Your location data is only used to provide local agricultural insights and is never stored or shared.
        </p>
      </div>
    </div>
  );
};

export default LocationPermission;