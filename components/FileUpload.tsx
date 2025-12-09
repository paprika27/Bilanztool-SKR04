import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface Props {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<Props> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer"
         onClick={() => fileInputRef.current?.click()}>
      <input 
        type="file" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleChange}
        accept=".xlsx,.xls,.xlsm"
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Upload className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {isLoading ? 'Verarbeite Daten...' : 'Excel-Datei hier ablegen'}
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        Unterstützt .xlsx, .xlsm (DATEV Format).<br/>
        Die Daten werden lokal im Browser verarbeitet.
      </p>
    </div>
  );
};

export default FileUpload;