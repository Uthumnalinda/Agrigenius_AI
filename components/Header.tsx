import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-lime-600 to-green-600 text-white p-4 shadow-lg sticky top-0 z-10">
      <div className="flex items-center justify-center">
        {/* Modern Logo with Emoji + Letter */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
            <span className="text-2xl">🍃</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wide">AgriGenius AI</h1>
        </div>
      </div>
    </header>
  );
};

export default Header;