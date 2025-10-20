import React from 'react';
import { View } from '../types';
import { Icon } from './Icon';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: 'dashboard' | 'leaf' | 'chat' | 'sun';
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-lime-600';
  const inactiveClasses = 'text-gray-500 hover:text-lime-500';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      aria-label={label}
    >
      <Icon name={icon} className="w-7 h-7 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-lg max-w-md mx-auto">
      <nav className="flex justify-around items-center h-16 px-2">
        <NavItem
          view="dashboard"
          label="Dashboard"
          icon="dashboard"
          isActive={activeView === 'dashboard'}
          onClick={() => setActiveView('dashboard')}
        />
        <NavItem
          view="disease"
          label="Disease Scan"
          icon="leaf"
          isActive={activeView === 'disease'}
          onClick={() => setActiveView('disease')}
        />
        <NavItem
          view="chat"
          label="Farming Chat"
          icon="chat"
          isActive={activeView === 'chat'}
          onClick={() => setActiveView('chat')}
        />
        <NavItem
          view="planting"
          label="Soil Scan"
          icon="sun"
          isActive={activeView === 'planting'}
          onClick={() => setActiveView('planting')}
        />
      </nav>
    </footer>
  );
};

export default BottomNav;