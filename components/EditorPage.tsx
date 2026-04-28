import React, { useEffect, useState, useCallback } from 'react';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';
import '@blocknote/react/style.css';
import type { Theme } from '../App';

interface EditorPageProps {
  theme?: Theme;
}

const EditorPage: React.FC<EditorPageProps> = ({ theme = 'dark' }) => {
  const [posts, setPosts] = useState<string[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [loadedSlug, setLoadedSlug] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const editor = useCreateBlockNote();
  const frontmatterRef = React.useRef<string>('');

  const splitFrontmatter = (md: string): { frontmatter: string; body: string } => {
    if (!md.startsWith('---')) return { frontmatter: '', body: md };
    const end = md.indexOf('\n---', 3);
    if (end === -1) return { frontmatter: '', body: md };
    const frontmatter = md.slice(0, end + 4);
    const body = md.slice(end + 4).replace(/^\n/, '');
    return { frontmatter, body };
  };

  const fetchPosts = () =>
    fetch('/api/posts').then(r => r.json()).then((slugs: string[]) => {
      const sorted = slugs.sort();
      setPosts(sorted);
      return sorted;
    });

  useEffect(() => {
    fetchPosts().then(sorted => { if (sorted.length > 0) setSelectedSlug(sorted[0]); });
  }, []);

  useEffect(() => {
    if (!selectedSlug || selectedSlug === loadedSlug) return;
    fetch(`/api/posts/${selectedSlug}`)
      .then(r => r.text())
      .then(async md => {
        const { frontmatter, body } = splitFrontmatter(md);
        frontmatterRef.current = frontmatter;
        const blocks = await editor.tryParseMarkdownToBlocks(body);
        editor.replaceBlocks(editor.document, blocks);
        setLoadedSlug(selectedSlug);
      });
  }, [selectedSlug, editor]);

  const save = useCallback(async () => {
    if (!selectedSlug) return;
    setSaving(true);
    const body = editor.blocksToMarkdownLossy(editor.document);
    const full = frontmatterRef.current ? `${frontmatterRef.current}\n\n${body}` : body;
    await fetch(`/api/posts/${selectedSlug}`, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: full,
    });
    setSaving(false);
    setSaveMsg('Saved');
    setTimeout(() => setSaveMsg(''), 2000);
  }, [selectedSlug, editor]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [save]);

  const createPost = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch('/api/new-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const { slug } = await res.json();
    setCreating(false);
    setShowNewModal(false);
    setNewTitle('');
    await fetchPosts();
    setLoadedSlug('');
    setSelectedSlug(slug);
  };

  return (
    <div className="fixed inset-0 bg-white dark:bg-dark flex flex-col" style={{ zIndex: 10000 }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <a href="#/" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mr-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        </a>

        <select
          value={selectedSlug}
          onChange={e => { setLoadedSlug(''); setSelectedSlug(e.target.value); }}
          className="text-xs font-black uppercase tracking-widest bg-transparent border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-slate-900 dark:text-white cursor-pointer"
        >
          {posts.map(slug => <option key={slug} value={slug}>{slug}</option>)}
        </select>

        <button
          onClick={() => setShowNewModal(true)}
          className="text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-colors cursor-pointer"
        >
          + New
        </button>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-widest">⌘S</span>
          <button
            onClick={save}
            disabled={saving}
            className="text-[10px] font-black uppercase tracking-[0.3em] px-5 py-1.5 rounded-full bg-blue-600 text-white disabled:opacity-40 transition-opacity cursor-pointer"
          >
            {saving ? 'Saving…' : saveMsg || 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <div className="max-w-5xl mx-auto py-16">
          <BlockNoteView
            editor={editor}
            theme={theme === 'dark' ? 'dark' : 'light'}
          />
        </div>
      </div>

      {/* New Post Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001]" onClick={() => setShowNewModal(false)}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white mb-6">New Post</h2>
            <input
              autoFocus
              type="text"
              placeholder="Post title"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && createPost()}
              className="w-full bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors mb-2"
            />
            <p className="text-[10px] text-slate-400 mb-6">
              {newTitle ? `→ ${newTitle.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}.md` : 'filename will be generated from title'}
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowNewModal(false)} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer px-4 py-2">
                Cancel
              </button>
              <button onClick={createPost} disabled={creating || !newTitle.trim()} className="text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full bg-blue-600 text-white disabled:opacity-40 cursor-pointer">
                {creating ? 'Creating…' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
