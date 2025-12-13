import React from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme }) => {
  return (
    <nav className="navbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>Grade App</div>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
    </nav>
  );
};

export default Navbar;