import { useRef } from 'react';
import type { ChangeEvent } from 'react';

interface ImportPDFButtonProps {
  onImport: (file: File) => Promise<void>;
}

const ImportPDFButton: React.FC<ImportPDFButtonProps> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is a PDF
    if (!file.type.includes('pdf')) {
      alert('Vui lòng chọn file PDF');
      return;
    }

    try {
      await onImport(file);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('Có lỗi xảy ra khi xử lý file PDF. Vui lòng thử lại.');
    }
  };

  return (
    <div style={{ marginRight: '16px' }}>
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button 
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          background: 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        Nhập từ PDF
      </button>
    </div>
  );
};

export default ImportPDFButton;
