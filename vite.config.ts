import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const publicBlogDir = path.resolve(__dirname, 'public/blog');

const postsDir = path.resolve(__dirname, 'src/posts');

function blogEditorPlugin() {
  return {
    name: 'blog-editor',
    configureServer(server: any) {
      server.middlewares.use('/api/posts', (req: any, res: any, next: any) => {
        const slug = req.url.replace(/^\//, '').replace(/\/$/, '');

        if (req.method === 'GET' && !slug) {
          const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(files.map(f => f.replace('.md', ''))));
          return;
        }

        if (req.method === 'GET' && slug) {
          const file = path.join(postsDir, `${slug}.md`);
          if (!fs.existsSync(file)) { res.statusCode = 404; res.end(); return; }
          res.setHeader('Content-Type', 'text/plain');
          res.end(fs.readFileSync(file, 'utf-8'));
          return;
        }

        if (req.method === 'POST' && slug) {
          const file = path.join(postsDir, `${slug}.md`);
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', () => {
            fs.writeFileSync(file, body, 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true }));
          });
          return;
        }

        next();
      });

      server.middlewares.use('/api/new-post', (req: any, res: any, next: any) => {
        if (req.method !== 'POST') { next(); return; }
        let body = '';
        req.on('data', (chunk: any) => { body += chunk; });
        req.on('end', () => {
          const { title } = JSON.parse(body);
          const slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          const file = path.join(postsDir, `${slug}.md`);
          const dir = path.join(publicBlogDir, slug);
          if (fs.existsSync(file)) {
            res.statusCode = 409;
            res.end(JSON.stringify({ error: 'already exists' }));
            return;
          }
          const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const frontmatter = `---\nid: ${slug}\ntitle: ${title}\ndate: ${today}\nsnippet: \ntags: []\n---\n\n`;
          fs.writeFileSync(file, frontmatter, 'utf-8');
          fs.mkdirSync(dir, { recursive: true });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ slug }));
        });
      });
    },
  };
}

export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react(), blogEditorPlugin()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      optimizeDeps: {
        include: ['@blocknote/core', '@blocknote/react', '@blocknote/mantine'],
      }
    };
});
