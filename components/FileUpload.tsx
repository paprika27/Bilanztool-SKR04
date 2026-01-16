import React, { useRef } from 'react';
import { Upload, Files } from 'lucide-react';

interface Props {
  onFileSelect: (files: File[]) => void;
  isLoading: boolean;
}

const FileUpload: React.FC<Props> = ({ onFileSelect, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(Array.from(e.target.files));
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
        multiple
      />
      <div className="bg-blue-100 p-4 rounded-full mb-4">
        <Files className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {isLoading ? 'Verarbeite Daten...' : 'Excel-Dateien hier ablegen'}
      </h3>
      <p className="text-gray-500 text-center max-w-sm">
        Unterstützt .xlsx, .xlsm (DATEV Format).<br/>
        Mehrere Dateien können gleichzeitig ausgewählt werden.
      </p>
    </div>
  );
};

export default FileUpload;