// src/pages/CsvUploader.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CsvUploader from '../components/CsvUploader';

const CsvUploaderPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      <CsvUploader />
    </div>
  );
};

export default CsvUploaderPage;