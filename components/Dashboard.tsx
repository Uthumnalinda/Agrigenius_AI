import React from 'react';
import { View } from '../types';
import { Icon } from './Icon';
import { useEnvironmentData } from '../services/environmentService';

interface DashboardProps {
    setActiveView: (view: View) => void;
}

const ActionCard: React.FC<{ 
    title: string; 
    description: string; 
    buttonText: string; 
    icon: 'scan' | 'chat' | 'lightbulb'; 
    onClick: () => void;
    stats?: { label: string; value: string }[];
}> = ({ title, description, buttonText, icon, onClick, stats }) => {
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="p-6">
                <div className="flex items-center mb-3">
                     <div className="p-2 rounded-lg bg-lime-50">
                         <Icon name={icon} className="w-6 h-6 text-lime-600" />
                     </div>
                     <h3 className="ml-3 text-lg font-bold text-gray-800">{title}</h3>
                </div>
                <p className="text-gray-600 text-sm mb-4">{description}</p>
                {stats && (
                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b border-gray-100 mb-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <p className="text-2xl font-bold text-lime-600">{stat.value}</p>
                                <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                )}
                <button 
                    onClick={onClick} 
                    className="w-full bg-gradient-to-r from-lime-600 to-green-600 text-white font-semibold py-3 px-4 rounded-lg 
                             hover:from-lime-700 hover:to-green-700 transition-all duration-200 
                             flex items-center justify-center group"
                >
                    {buttonText}
                    <Icon name="arrowRight" className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

const QuickStat: React.FC<{ label: string; value: string; trend?: number }> = ({ label, value, trend }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500">{label}</p>
            <p className="text-xl font-bold text-gray-900">{value}</p>
        </div>
        {trend !== undefined && (
            <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend >= 0 ? '+' : ''}{trend}%
            </span>
        )}
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ setActiveView }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  });

  const { data: environmentData, loading, error } = useEnvironmentData();

  // Show loading only on initial load
  if (loading && !environmentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-lime-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading Dashboard...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching real-time weather data</p>
        </div>
      </div>
    );
  }

  // If no data after loading, show error state
  if (!environmentData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <p className="text-gray-700 font-semibold text-lg mb-2">Unable to load data</p>
          <p className="text-sm text-gray-500">Please check your internet connection and refresh the page</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-lime-600 text-white px-6 py-2 rounded-lg hover:bg-lime-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
        {/* Modern Header Section */}
        <div className="bg-gradient-to-br from-lime-500 via-green-600 to-emerald-700 -mx-4 px-6 pt-6 pb-16 mb-8 relative overflow-hidden">
            {/* Decorative Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10">
                {/* App Title */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
                            <span className="text-3xl">🍃</span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-wide">AgriGenius AI</h2>
                            <p className="text-xs text-lime-100 font-medium">Smart Farming Assistant</p>
                        </div>
                    </div>
                    <div className="bg-green-400/30 backdrop-blur-sm px-3 py-1.5 rounded-full border border-green-300/50">
                        <p className="text-xs font-semibold text-white flex items-center">
                            <span className="w-2 h-2 bg-green-300 rounded-full mr-1.5 animate-pulse"></span>
                            Live
                        </p>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="mt-6">
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                        Welcome back! 👋
                    </h1>
                    <p className="text-lime-50 text-sm font-medium">{currentDate}</p>
                </div>

                {/* Location Card */}
                {environmentData.location.latitude !== 0 && (
                    <div className="mt-4 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-xl">📍</span>
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm mb-1">Current Location</p>
                                    <p className="text-lime-100 text-xs font-mono">
                                        {environmentData.location.latitude.toFixed(4)}°N, {environmentData.location.longitude.toFixed(4)}°E
                                    </p>
                                    <div className="flex items-center mt-2 space-x-2">
                                        <div className="flex items-center space-x-1">
                                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                                            <span className="text-xs text-lime-200">GPS Active</span>
                                        </div>
                                        <span className="text-lime-300">•</span>
                                        <span className="text-xs text-lime-200">
                                            Accuracy: ±{Math.round(environmentData.location.accuracy)}m
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-white/20 hover:bg-white/30 transition-colors p-2 rounded-lg">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="mt-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-3">
                        <p className="text-yellow-100 text-xs flex items-center">
                            <span className="mr-2">⚠️</span>
                            {error}
                        </p>
                    </div>
                )}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-3 -mt-12">
            <QuickStat 
                label="Temperature" 
                value={`${environmentData.weather.temperature}°C`} 
            />
            <QuickStat 
                label="Humidity" 
                value={`${environmentData.weather.humidity}%`} 
                trend={environmentData.weather.humidityTrend} 
            />
            <QuickStat 
                label="Precipitation" 
                value={environmentData.weather.precipitation > 0 
                  ? `${environmentData.weather.precipitation}mm` 
                  : 'None'
                } 
            />
            <QuickStat 
                label="Cloud Cover" 
                value={`${environmentData.weather.cloudCover}%`} 
            />
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                <span className="mr-2">📊</span>
                Real-Time Data Source
            </h3>
            <div className="space-y-1 text-blue-800">
                <div className="flex items-center">
                    <span className="w-32">All Data:</span>
                    <span className="font-medium">OpenWeatherMap API ☁️ (Real-Time)</span>
                </div>
                <div className="flex items-center text-xs mt-2 text-blue-600">
                    <span>✅ 100% current weather data from your location</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-blue-200">
                    <span className="text-xs">Last updated:</span>
                    <span className="text-xs font-medium">{new Date().toLocaleTimeString()}</span>
                </div>
            </div>
        </div>

        <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">AI Assistant Tools</h2>
            <div className="grid gap-4">
                <ActionCard 
                    title="Plant Disease Scanner"
                    description="Get instant AI-powered diagnosis and treatment recommendations for your crops."
                    buttonText="Scan Now"
                    icon="scan"
                    onClick={() => setActiveView('disease')}
                />
                <ActionCard 
                    title="Soil Scanner"
                    description="Scan your soil and get AI-powered crop recommendations with pictures."
                    buttonText="Scan Soil"
                    icon="lightbulb"
                    onClick={() => setActiveView('planting')}
                />
                <ActionCard 
                    title="AI Farming Expert"
                    description="Chat with your personal AI farming assistant for real-time guidance."
                    buttonText="Start Chat"
                    icon="chat"
                    onClick={() => setActiveView('chat')}
                />
            </div>
        </div>
    </div>
  );
};

export default Dashboard;