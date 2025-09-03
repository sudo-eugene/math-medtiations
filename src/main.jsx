import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import './index.css';
import GeometryGallery from '../geometry_web_gallery_500_presets.jsx';
import BookPage from './components/BookPage.jsx';
import Root from './components/Root.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        index: true,
        element: <Navigate to="/book/1" replace />,
      },
      {
        path: 'book/:day',
        element: <BookPage />,
      },
      {
        path: 'gallery',
        element: <GeometryGallery />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
