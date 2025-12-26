import React from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import type { TabType } from '../../pages/Home';

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, activeTab, setActiveTab }) => {
  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div className="navbar-logo" style={{ fontWeight: '800', fontSize: '20px' }}>Quamon</div>
      
      <div className="tab-navigation" style={{ marginBottom: 0 }}>
        <button 
          className={`tab-button ${activeTab === 'grades' ? 'active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          Bảng điểm
        </button>
        <button 
          className={`tab-button ${activeTab === 'instructions' ? 'active' : ''}`}
          onClick={() => setActiveTab('instructions')}
        >
          Hướng dẫn
        </button>
      </div>

      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </nav>
  );
};

export default Navbar;