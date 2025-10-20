import React, { useState } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DiseaseDetector from './components/DiseaseDetector';
import FarmingChatbot from './components/FarmingChatbot';
import SoilScanner from './components/SoilScanner';
import Dashboard from './components/Dashboard';
import LocationPermission from './components/LocationPermission';
import { View } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  const handlePermissionGranted = () => {
    setLocationPermissionGranted(true);
  };

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard setActiveView={setActiveView} />;
      case 'disease':
        return <DiseaseDetector />;
      case 'chat':
        return <FarmingChatbot />;
      case 'planting':
        return <SoilScanner />;
      default:
        return <Dashboard setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="flex flex-col h-screen font-sans text-gray-800 bg-gray-50 max-w-md mx-auto shadow-2xl">
      <Header />
      <main className="flex-1 p-4 overflow-y-auto">
        {renderContent()}
      </main>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
      {!locationPermissionGranted && (
        <LocationPermission onPermissionGranted={handlePermissionGranted} />
      )}
    </div>
  );
};

export default App;