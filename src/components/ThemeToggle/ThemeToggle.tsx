import React from "react";

interface ThemeToggleProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
  return (
    <div
      className={`theme-toggle-container ${theme}`}
      onClick={toggleTheme}
    >
      {/* Background Track Icons */}
      <span className="toggle-icon-placeholder left"></span>
      <span className="toggle-icon-placeholder right"></span>

      {/* Sliding Circle */}
      <div className="theme-toggle-circle">
        {theme === "light" ? (
          // Sun Icon (Orange/Yellow)
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ff9800"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ padding: '3px', boxSizing: 'border-box' }}
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          // Moon Icon (Yellow)
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 24 24"
            fill="#ffeb3b"
            stroke="#ffeb3b"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ padding: '3px', boxSizing: 'border-box' }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;