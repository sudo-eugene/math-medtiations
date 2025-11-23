import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import GeometryGallery from '../geometry_web_gallery_500_presets.jsx';
import DailyQuotes from './components/DailyQuotes.tsx';
import Root from './components/Root.tsx';
import PrintableBook from './components/PrintableBook.tsx';
import Snapshot from './components/Snapshot.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Navigate to="/daily-quotes/1" replace />,
      },
      {
        path: 'daily-quotes/:day',
        element: <DailyQuotes />,
      },
      {
        path: 'gallery',
        element: <GeometryGallery />,
      },
      {
        path: 'print',
        element: <PrintableBook />,
      },
    ],
  },
  {
    path: '/snapshot/:quoteId',
    element: <Snapshot />,
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
