import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

const Root = () => {
  return (
    <div>
      <Navigation />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Root;
