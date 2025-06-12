// src/pages/MindMap.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MindMap from '../components/MindMap';

const MindMapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white p-6">
      <button
        onClick={() => navigate('/')}
        className="mb-4 px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      <MindMap />
    </div>
  );
};

export default MindMapPage;
