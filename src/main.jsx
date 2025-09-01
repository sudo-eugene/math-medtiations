import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import GeometryGallery from '../geometry_web_gallery_500_presets.jsx';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GeometryGallery />
  </React.StrictMode>
);
