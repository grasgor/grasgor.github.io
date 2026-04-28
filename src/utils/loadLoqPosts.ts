import frontMatter from 'front-matter';

export type LoqSection = 'VAE' | 'Diffusion' | 'World Models';

export interface LoqPost {
    id: string;
    date: string;
    title: string;
    snippet: string;
    readTime: string;
    content: string;
    section: LoqSection;
}

interface FrontMatterAttributes {
    id: string;
    title: string;
    date: string;
    snippet: string;
    section: LoqSection;
}

function calcReadTime(text: string): string {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

export const loadLoqPosts = (): LoqPost[] => {
    const modules = import.meta.glob('../loq/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

    const posts = Object.values(modules).map((content) => {
        const { attributes, body } = frontMatter<FrontMatterAttributes>(content);
        return {
            ...attributes,
            readTime: calcReadTime(body),
            content: body,
        };
    });

    return posts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
