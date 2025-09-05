import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  const getLinkClassName = ({ isActive }) =>
    `text-neutral-300 hover:text-white transition ${isActive ? 'font-bold text-white' : ''}`;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-neutral-950/80 border-b border-neutral-900">
      <div className="mx-auto px-4 py-3 flex items-center gap-6">
        <div className="text-lg font-semibold tracking-wide text-neutral-100">Gratitude Meditations</div>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink to="/book/1" className={getLinkClassName}>
            Book
          </NavLink>
          <NavLink to="/gallery" className={getLinkClassName}>
            Gallery
          </NavLink>
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
