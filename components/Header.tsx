
import React, { useState } from 'react';
import type { Page, Theme } from '../App';
import { SunIcon, MoonIcon, HomeIcon, MenuIcon, XIcon } from './icons';

interface HeaderProps {
  currentPage: Page;
  setPage: (page: Page) => void;
  theme: Theme;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, setPage, theme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-[9999] px-6 py-4 md:px-12 md:py-10 pointer-events-none ${currentPage === 'blogs' ? 'bg-white/95 dark:bg-dark/95 backdrop-blur-sm md:bg-transparent md:dark:bg-transparent md:backdrop-blur-none border-b border-slate-100/80 dark:border-slate-800/80 md:border-none' : ''}`}>
        <div className="max-w-[1800px] mx-auto flex justify-between items-center pointer-events-none">

          {/* Home Icon Container - Solid high contrast for home button */}
          <button
            onClick={() => {
              setPage('home');
              closeMenu();
            }}
            type="button"
            className={`pointer-events-auto p-2 rounded-full transition-all duration-300 group flex items-center justify-center cursor-pointer ${currentPage === 'blogs' && theme === 'light' ? 'text-slate-900 hover:text-slate-600' : 'text-white hover:text-slate-200'
              } ${isMenuOpen ? '!text-slate-900 dark:!text-white' : ''}`}
            aria-label="Go to Home"
          >
            <HomeIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3 md:gap-4 pointer-events-none">
            {/* Theme Toggle Button - Enhanced hit area and clearer light mode styling */}
            <button
              onClick={(e) => {
                // Ensure the click doesn't propagate in ways that might trigger other events
                e.stopPropagation();
                toggleTheme();
              }}
              type="button"
              className={`pointer-events-auto p-2.5 rounded-full ${currentPage === 'home' && theme === 'light' ? 'text-white' : 'text-slate-400'} ${theme === 'light' ? 'hover:text-black' : 'hover:text-white'} transition-all active:scale-95 flex items-center justify-center cursor-pointer min-w-[40px] min-h-[40px]`}
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5 stroke-[2]" />
              ) : (
                <SunIcon className="w-5 h-5 stroke-[2]" />
              )}
            </button>

            {/* Navigation Bar - Refined light mode aesthetic for "Blog" button */}
            <nav className="pointer-events-auto flex items-center border border-white/10 bg-white/10 backdrop-blur-md rounded-full shadow-sm overflow-hidden">
              <button
                onClick={() => setPage('blogs')}
                type="button"
                className={`px-8 py-2.5 text-[10px] uppercase font-black tracking-[0.3em] transition-all duration-300 cursor-pointer ${currentPage === 'blogs'
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10'
                  : currentPage === 'home' && theme === 'light'
                    ? 'text-white hover:text-slate-200'
                    : 'text-slate-400 hover:text-slate-950 dark:text-slate-500 dark:hover:text-slate-100'
                  }`}
              >
                Blog
              </button>
            </nav>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={handleMenuClick}
            className={`md:hidden pointer-events-auto p-2 rounded-full transition-colors cursor-pointer ${currentPage === 'blogs' && theme === 'light' ? 'text-slate-900' : 'text-white'} ${isMenuOpen ? '!text-slate-900 dark:!text-white' : ''}`}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? (
              <XIcon className="w-6 h-6" />
            ) : (
              <MenuIcon className="w-6 h-6" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-white/95 dark:bg-dark/95 backdrop-blur-xl flex flex-col justify-center items-center md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-8">
            <button
              onClick={() => {
                setPage('blogs');
                closeMenu();
              }}
              className={`text-2xl font-black uppercase tracking-[0.3em] transition-colors ${currentPage === 'blogs' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}
            >
              Blog
            </button>

            <button
              onClick={() => {
                toggleTheme();
                // Don't close menu logic may vary, usually nice to keep open or close? User didn't specify. Let's keep open for rapid toggling or close? 
                // Usually toggle fits better if it stays, but since it's a full overlay, maybe let it stay.
                // Actually, let's just toggle.
              }}
              className="flex items-center gap-3 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <span className="text-sm font-bold uppercase tracking-widest">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
