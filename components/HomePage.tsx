
import React, { useState, useEffect } from 'react';
import DiffusionBackground from './WireframeGlobe';
import { GithubIcon } from './icons';
import type { Theme, Page } from '../App';

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

interface HomePageProps {
  theme: Theme;
  setPage: (page: Page) => void;
}

const HomePage: React.FC<HomePageProps> = ({ theme, setPage }) => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dateStr = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  const timeStr = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-white dark:bg-dark transition-colors duration-500">
      <DiffusionBackground theme={theme} />
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-8 md:px-24">
        <div className="max-w-5xl">
          <button
            onClick={() => setPage('home')}
            className="text-6xl md:text-[8rem] font-black tracking-tighter leading-[0.85] text-white mb-10 transition-all duration-500 text-left active:scale-[0.98] outline-none"
          >
            grasgor<br />
          </button>
          <div className="mt-4">
            <p className="max-w-lg text-lg text-white/80 leading-relaxed font-light">
              I like art and fast models.
            </p>
          </div>
        </div>
      </div>

      {/* Social Icons Fixed at Bottom */}
      <div className="absolute bottom-10 left-8 md:left-24 z-20 flex items-center space-x-10">
        <a href="https://github.com/grasgor" target="_blank" rel="noopener noreferrer" title="GitHub" className="group">
          <GithubIcon className={`w-5 h-5 text-white transition-all duration-300 ${theme === 'light' ? 'hover:text-black' : 'hover:text-blue-400'}`} />
        </a>
        <a href="https://x.com/grasgor" target="_blank" rel="noopener noreferrer" title="X / Twitter" className="group">
          <XIcon className={`w-5 h-5 text-white transition-all duration-300 ${theme === 'light' ? 'hover:text-black' : 'hover:text-blue-400'}`} />
        </a>
      </div>

      {/* Aesthetic Detail */}
      <div className="absolute bottom-10 right-8 md:right-24 z-20 hidden md:block">
        <p className="text-xs uppercase tracking-[0.3em] font-extrabold text-white">
          {dateStr} // {timeStr} IST
        </p>
      </div>
    </div>
  );
};

export default HomePage;
