import React from 'react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import ImportPDFButton from '../ImportPDFButton/ImportPDFButton';

interface NavbarProps {
  theme: "light" | "dark";
  toggleTheme: () => void;
  onImportPDF: (file: File) => Promise<void>;
}

const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, onImportPDF }) => {
  const handleImport = async (file: File) => {
    try {
      await onImportPDF(file);
    } catch (error) {
      console.error('Error importing PDF:', error);
    }
  };
  return (
    <nav className="navbar" style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '0 16px',
      height: '60px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Grade App</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ImportPDFButton onImport={handleImport} />
        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
};

export default Navbar;