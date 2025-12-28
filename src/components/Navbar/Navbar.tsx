import React from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import type { TabType } from '../../pages/Home';

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

const Navbar: React.FC<NavbarProps> = ({
  theme,
  toggleTheme,
  activeTab,
  setActiveTab,
}) => {
  const logoSrc =
    theme === "light" ? "/logo_light.svg" : "/logo_dark.svg";

  return (
    <nav
      className="navbar"
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {/* LOGO */}
      <div
        className="navbar-logo"
        style={{ display: 'flex', alignItems: 'center' }}
      >
        <img
          src={logoSrc}
          alt="Quamon Logo"
          style={{ 
            height: 36,
            marginRight: 10,
            display: 'block',
          }}
        />
        <span
        className="navbar-logo-text"
          style={{
            fontWeight: 800,
            fontSize: '20px',
            color: 'var(--text-color)',
            lineHeight: 1,
          }}
        >
          Quamon
        </span>
      </div>
      

      {/* TABS */}
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

      {/* THEME TOGGLE */}
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </nav>
  );
};

export default Navbar;
