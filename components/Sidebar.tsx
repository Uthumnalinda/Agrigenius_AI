import React from 'react';
import { View } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
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
  const activeClasses = 'bg-lime-100 text-lime-800 font-semibold';
  const inactiveClasses = 'text-gray-600 hover:bg-gray-100 hover:text-gray-900';

  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <Icon name={icon} className="w-6 h-6 mr-4" />
      <span>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
      <div className="h-20 flex items-center justify-center border-b border-gray-200 px-4">
        <Icon name="leaf" className="w-8 h-8 mr-2 text-lime-600" />
        <h1 className="text-xl font-bold tracking-tight text-gray-800">AgriGenius AI</h1>
      </div>
      <nav className="flex-grow p-4 space-y-2">
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
          label="Planting Advice"
          icon="sun"
          isActive={activeView === 'planting'}
          onClick={() => setActiveView('planting')}
        />
      </nav>
      <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="font-bold text-gray-600">G</span>
              </div>
              <div>
                  <p className="font-semibold text-sm text-gray-800">Guest User</p>
                  <p className="text-xs text-gray-500">Farmer</p>
              </div>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
