
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import BlogPage from './components/BlogPage';

export type Page = 'home' | 'blogs';
export type Theme = 'light' | 'dark';

function getPageFromHash(): Page {
  return window.location.hash.startsWith('#/blog') ? 'blogs' : 'home';
}

function getPostIdFromHash(): string | undefined {
  const match = window.location.hash.match(/^#\/blog\/(.+)$/);
  return match?.[1];
}

const App: React.FC = () => {
  const [page, setPage] = useState<Page>(getPageFromHash);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme') as Theme;
      return saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });
  const [isContentVisible, setIsContentVisible] = useState(true);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSetPage = (newPage: Page) => {
    if (newPage !== page) {
      setIsContentVisible(false);
      setTimeout(() => {
        setPage(newPage);
        setIsContentVisible(true);
        window.scrollTo(0, 0);
        window.location.hash = newPage === 'home' ? '/' : '/blog';
      }, 300);
    }
  };

  const renderPage = () => {
    switch (page) {
      case 'home':
        return <HomePage theme={theme} setPage={handleSetPage} />;
      case 'blogs':
        return <BlogPage theme={theme} initialPostId={getPostIdFromHash()} />;
      default:
        return <HomePage theme={theme} setPage={handleSetPage} />;
    }
  };

  return (
    <div className="text-slate-900 dark:text-slate-100 min-h-screen font-sans selection:bg-blue-200 dark:selection:bg-blue-900 bg-white dark:bg-dark transition-colors duration-500 overflow-x-hidden">
      <Header currentPage={page} setPage={handleSetPage} theme={theme} toggleTheme={toggleTheme} />
      <div className={`transition-opacity duration-300 ${isContentVisible ? 'opacity-100' : 'opacity-0'}`}>
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
