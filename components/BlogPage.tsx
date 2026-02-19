import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Theme } from '../App';

import { loadPosts, BlogPost } from '../src/utils/loadPosts';

// Get posts from markdown files
const blogPosts: BlogPost[] = loadPosts();

interface BlogPageProps {
  theme?: Theme;
  initialPostId?: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

const BlogPage: React.FC<BlogPageProps> = ({ theme = 'light', initialPostId }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(
    () => blogPosts.find(p => p.id === initialPostId) ?? null
  );
  const [toc, setToc] = useState<Heading[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const middleRef = useRef<HTMLDivElement>(null);

  const redirectScrollToMiddle = (e: React.WheelEvent) => {
    if (middleRef.current) {
      middleRef.current.scrollTop += e.deltaMode === 0 ? e.deltaY : e.deltaY * 20;
    }
  };

  const handleBack = () => {
    setSelectedPost(null);
    setToc([]);
    window.location.hash = '/blog';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate TOC from markdown content
  useEffect(() => {
    if (selectedPost) {
      const headings: Heading[] = [];
      const lines = selectedPost.content.split('\n');
      lines.forEach((line) => {
        const match = line.match(/^(#{1,3})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].replace(/`([^`]+)`/g, '$1');
          // Simple slugify to match rehype-slug (approximate)
          const id = text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-');
          headings.push({ id, text, level });
        }
      });
      setToc(headings);
    }
  }, [selectedPost]);

  // Custom renderer for code blocks
  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={match[1]}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          lineHeight: '1.25rem',
          padding: '1rem',
        }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  // Custom renderer for images
  const ImageRenderer = ({ src, alt, ...props }: any) => {
    const [currentSrc, setCurrentSrc] = useState(src);

    useEffect(() => {
      // Reset to default src immediately when prop changes or theme changes to light
      // This prevents showing stale images or wrong theme images
      if (theme === 'light' || !src) {
        setCurrentSrc(src);
        return;
      }

      // If theme is dark, check for dark variant
      if (theme === 'dark' && src) {
        const lastDotIndex = src.lastIndexOf('.');
        if (lastDotIndex !== -1) {
          const darkSrc = `${src.substring(0, lastDotIndex)}-dark${src.substring(lastDotIndex)}`;
          const img = new Image();
          img.src = darkSrc;
          img.onload = () => setCurrentSrc(darkSrc);
          img.onerror = () => setCurrentSrc(src); // Fallback to original
        } else {
          setCurrentSrc(src);
        }
      }
    }, [src, theme]);

    return (
      <img
        src={currentSrc}
        alt={alt}
        className="rounded-lg my-8 w-full"
        {...props}
      />
    );
  };

  if (selectedPost) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark transition-colors duration-500 overflow-hidden" onWheel={redirectScrollToMiddle}>
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 md:gap-12 px-6 md:px-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left Sidebar: Back Button + TOC (Desktop) */}
          <div className="hidden lg:flex flex-col pt-40 h-full overflow-hidden shrink-0">
            <button
              onClick={handleBack}
              className="flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group uppercase tracking-[0.3em] text-[10px] font-black cursor-pointer mb-10"
            >
              <svg className="w-3.5 h-3.5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
              Back
            </button>
            <div className="overflow-y-auto max-h-[calc(100vh-14rem)] pr-2 no-scrollbar">
              <h4 className="text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-[0.2em] mb-6 sticky top-0 bg-white dark:bg-dark pb-2 z-10">On this page</h4>
              <nav className="flex flex-col space-y-3 pb-8">
                {toc.map((heading) => (
                  <a
                    key={heading.id}
                    href={`#${heading.id}`}
                    className={`text-sm hover:text-blue-600 dark:hover:text-blue-400 transition-colors block
                      ${heading.level === 1 ? 'font-bold text-slate-800 dark:text-slate-200' : 'text-slate-500 dark:text-slate-400'}
                      ${heading.level === 2 ? 'pl-4' : ''}
                      ${heading.level === 3 ? 'pl-8' : ''}
                    `}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content: Scrollable */}
          <div ref={middleRef} className="min-w-0 h-full overflow-y-auto no-scrollbar scroll-smooth" onWheel={(e) => e.stopPropagation()}>
            <div className="pt-40 pb-32 flex flex-col items-center lg:block">
              {/* Back Button (Mobile) */}
              <button
                onClick={handleBack}
                className="lg:hidden flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group uppercase tracking-[0.3em] text-[10px] font-black cursor-pointer self-start"
              >
                <svg className="w-3.5 h-3.5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
                Back
              </button>

              <div className="mb-16 w-full">
                <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-[0.4em] uppercase mb-6 block">{selectedPost.date}</span>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9] mb-8">
                  {selectedPost.title}
                </h1>
                <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">
                  {selectedPost.readTime}
                </div>
              </div>

              <article className="prose prose-slate dark:prose-invert prose-lg max-w-none w-full
                prose-headings:font-black prose-headings:tracking-tighter prose-headings:text-slate-950 dark:prose-headings:text-white
                prose-p:text-slate-700/90 dark:prose-p:text-slate-300/90 prose-p:font-light prose-p:leading-relaxed
                prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-blockquote:border-blue-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-900/50 prose-blockquote:py-2 prose-blockquote:px-8
                prose-code:text-blue-600 dark:prose-code:text-blue-400 prose-code:bg-blue-50 dark:prose-code:bg-blue-900/20 prose-code:px-1.5 prose-code:rounded-md
                [&_pre]:!bg-transparent [&_pre]:!p-0 [&_pre]:!m-0 [&_pre]:!border-0">
                <ReactMarkdown
                  remarkPlugins={[remarkMath, remarkGfm]}
                  rehypePlugins={[rehypeKatex, rehypeSlug]}
                  components={{
                    code: CodeBlock,
                    img: ImageRenderer
                  }}
                >
                  {selectedPost.content}
                </ReactMarkdown>
              </article>
            </div>
          </div>

        </div>
      </div>

    );
  }

  const allTags = Array.from(new Set(blogPosts.flatMap((p) => p.tags))).sort();

  const filteredPosts = blogPosts.filter((post) => {
    const matchesTag = !activeTag || post.tags.includes(activeTag);
    if (!matchesTag) return false;
    if (!searchQuery.trim()) return true;
    const haystack = `${post.title} ${post.snippet} ${post.tags.join(' ')}`.toLowerCase();
    return searchQuery.trim().toLowerCase().split(/\s+/).every((token) => haystack.includes(token));
  });

  return (
    <div className="min-h-screen pt-36 pb-16 px-6 md:px-12 bg-white dark:bg-dark transition-colors duration-500">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-700">
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-white mb-4 uppercase">Blog</h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-light mb-8 max-w-2xl">Short posts on certain topics that reflect my understanding.</p>

        {/* Search + Tag filters */}
        <div className="mb-10 space-y-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${!activeTag ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400'}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {filteredPosts.length === 0 && (
          <p className="text-slate-400 dark:text-slate-500 text-sm font-light py-12">No posts match your search.</p>
        )}

        <div className="grid grid-cols-1">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 py-8 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
              onClick={() => {
                setSelectedPost(post);
                window.location.hash = `/blog/${post.id}`;
                window.scrollTo({ top: 0 });
              }}
            >
              <div className="flex items-center space-x-4 mb-2">
                <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-[0.4em] uppercase">{post.date}</span>
                <span className="w-8 h-[1px] bg-slate-200 dark:bg-slate-800 group-hover:bg-blue-300 dark:group-hover:bg-blue-700 group-hover:w-14 transition-all duration-500"></span>
                <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-[0.3em]">{post.readTime}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-slate-950 dark:text-white leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 tracking-tighter">
                {post.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-light leading-relaxed max-w-3xl mb-3">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <>{children}</>,
                    code: ({ children }) => (
                      <code className="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-1.5 rounded-md">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {post.snippet}
                </ReactMarkdown>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span key={tag} className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;