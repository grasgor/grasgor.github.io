
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Theme } from '../App';
import { loadLoqPosts, LoqPost, LoqSection } from '../src/utils/loadLoqPosts';

const loqPosts: LoqPost[] = loadLoqPosts();

const SECTIONS: LoqSection[] = ['Diffusion', 'World Models'];

interface LoqPageProps {
  theme: Theme;
  initialPostId?: string;
}

interface Heading {
  id: string;
  text: string;
  level: number;
}

const LoqPage: React.FC<LoqPageProps> = ({ theme, initialPostId }) => {
  const [selectedPost, setSelectedPost] = useState<LoqPost | null>(
    () => loqPosts.find(p => p.id === initialPostId) ?? null
  );
  const [toc, setToc] = useState<Heading[]>([]);
  const middleRef = useRef<HTMLDivElement>(null);

  const redirectScrollToMiddle = (e: React.WheelEvent) => {
    if (middleRef.current) {
      middleRef.current.scrollTop += e.deltaMode === 0 ? e.deltaY : e.deltaY * 20;
    }
  };

  const handleBack = () => {
    setSelectedPost(null);
    setToc([]);
    window.location.hash = '/loq';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedPost) {
      const headings: Heading[] = [];
      selectedPost.content.split('\n').forEach((line) => {
        const match = line.match(/^(#{1,3})\s+(.*)$/);
        if (match) {
          const level = match[1].length;
          const text = match[2].replace(/`([^`]+)`/g, '$1');
          const id = text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
          headings.push({ id, text, level });
        }
      });
      setToc(headings);
    }
  }, [selectedPost]);

  const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <SyntaxHighlighter
        style={theme === 'dark' ? oneDark : oneLight}
        language={match[1]}
        PreTag="div"
        customStyle={{ margin: 0, borderRadius: '0.375rem', fontSize: '0.875rem', lineHeight: '1.25rem', padding: '1rem' }}
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>{children}</code>
    );
  };

  const ImageRenderer = ({ src, alt, ...props }: any) => {
    const [currentSrc, setCurrentSrc] = useState(src);
    useEffect(() => {
      if (theme === 'light' || !src) { setCurrentSrc(src); return; }
      if (theme === 'dark' && src) {
        const lastDot = src.lastIndexOf('.');
        if (lastDot !== -1) {
          const darkSrc = `${src.substring(0, lastDot)}-dark${src.substring(lastDot)}`;
          const img = new Image();
          img.src = darkSrc;
          img.onload = () => setCurrentSrc(darkSrc);
          img.onerror = () => setCurrentSrc(src);
        } else { setCurrentSrc(src); }
      }
    }, [src, theme]);
    return <img src={currentSrc} alt={alt} className="rounded-lg my-8 w-full" {...props} />;
  };

  if (selectedPost) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-dark transition-colors duration-500 overflow-hidden" onWheel={redirectScrollToMiddle}>
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 md:gap-12 px-6 md:px-12 relative animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left Sidebar */}
          <div className="hidden lg:flex flex-col pt-40 h-full overflow-hidden shrink-0">
            <button
              onClick={handleBack}
              className="flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group uppercase tracking-[0.3em] text-[10px] font-black cursor-pointer mb-10"
            >
              <svg className="w-3.5 h-3.5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
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

          {/* Main Content */}
          <div ref={middleRef} className="min-w-0 h-full overflow-y-auto no-scrollbar scroll-smooth" onWheel={(e) => e.stopPropagation()}>
            <div className="pt-40 pb-32 flex flex-col items-center lg:block">
              <button
                onClick={handleBack}
                className="lg:hidden flex items-center text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8 group uppercase tracking-[0.3em] text-[10px] font-black cursor-pointer self-start"
              >
                <svg className="w-3.5 h-3.5 mr-3 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>

              <div className="mb-16 w-full">
                <span className="text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-[0.4em] uppercase mb-2 block">{selectedPost.section}</span>
                <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] tracking-[0.4em] uppercase mb-6 block">{selectedPost.date}</span>
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
                  components={{ code: CodeBlock, img: ImageRenderer }}
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

  return (
    <div className="min-h-screen pt-36 pb-16 px-6 md:px-12 bg-white dark:bg-dark transition-colors duration-500">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-700">

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-950 dark:text-white mb-4 uppercase">
          The Great Lock In
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 font-light mb-16 max-w-2xl">
          undertanding the most important ideas in generative modelling and predictive architectures.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 md:divide-x divide-slate-100 dark:divide-slate-800/60">
          {SECTIONS.map((section) => {
            const posts = loqPosts.filter(p => p.section === section);
            return (
              <div key={section} className="md:px-8 first:pl-0 last:pr-0 pb-12 md:pb-0">
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400 mb-8">
                  {section}
                </h2>

                {posts.length === 0 ? (
                  <p className="text-slate-300 dark:text-slate-700 text-sm font-light">No posts yet.</p>
                ) : (
                  <div className="flex flex-col gap-0">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 py-6 hover:border-blue-200 dark:hover:border-blue-900 transition-colors"
                        onClick={() => {
                          setSelectedPost(post);
                          window.location.hash = `/loq/${post.id}`;
                          window.scrollTo({ top: 0 });
                        }}
                      >
                        <span className="text-slate-400 dark:text-slate-500 font-black text-[10px] tracking-[0.3em] uppercase block mb-2">
                          {post.date}
                        </span>
                        <h3 className="text-lg font-black text-slate-950 dark:text-white tracking-tighter leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                          {post.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-light leading-relaxed line-clamp-2">
                          {post.snippet}
                        </p>
                        <span className="text-slate-300 dark:text-slate-600 text-[10px] uppercase font-bold tracking-widest mt-2 block">
                          {post.readTime}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoqPage;
