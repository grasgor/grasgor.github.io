import frontMatter from 'front-matter';

export interface BlogPost {
    id: string;
    date: string;
    title: string;
    snippet: string;
    readTime: string;
    content: string;
    tags: string[];
}

interface FrontMatterAttributes {
    id: string;
    title: string;
    date: string;
    snippet: string;
    tags?: string[];
}

function calcReadTime(text: string): string {
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
}

export const loadPosts = (): BlogPost[] => {
    const modules = import.meta.glob('../posts/*.md', { as: 'raw', eager: true }) as Record<string, string>;

    const posts = Object.values(modules).map((content) => {
        const { attributes, body } = frontMatter<FrontMatterAttributes>(content);
        return {
            ...attributes,
            tags: attributes.tags ?? [],
            readTime: calcReadTime(body),
            content: body,
        };
    });

    // Sort by date descending (assuming date string is parseable or just string comparison if format YYYY-MM-DD, but here we have Dec 20, 2024)
    // For now, let's just reverse to show newest first if we assume file order or just basic sort.
    // Ideally parse date, but for this simple version let's just return them.
    // Actually, let's try to sort by date.
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
