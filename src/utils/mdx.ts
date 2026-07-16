import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import remarkGfm from 'remark-gfm';

import type { ITocItem } from '@/types';

function getContentDir(locale?: string): string {
  const loc = locale === 'en' ? 'en' : 'az';
  return path.join(process.cwd(), 'src', 'content', loc);
}

export function getAllContentPaths(locale?: string): string[][] {
  const contentDir = getContentDir(locale);
  const paths: string[][] = [];

  function walk(dir: string, segments: string[]) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        walk(path.join(dir, entry.name), [...segments, entry.name]);
      } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
        const slug = entry.name.replace(/\.(md|mdx)$/, '');
        paths.push([...segments, slug]);
      }
    }
  }

  walk(contentDir, []);
  return paths;
}

export async function getContentByPath(slugParts: string[], locale?: string) {
  const contentDir = getContentDir(locale);
  const tryExtensions = ['.md', '.mdx'];
  let filePath: string | null = null;

  for (const ext of tryExtensions) {
    const candidate = path.join(contentDir, ...slugParts) + ext;
    if (fs.existsSync(candidate)) {
      filePath = candidate;
      break;
    }
  }

  if (!filePath) {
    return null;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const lineCount = raw.split('\n').length;
  const { content, data } = matter(raw);

  const toc = extractToc(content);

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      format: 'mdx',
    },
    scope: data,
  });

  return {
    mdxSource,
    meta: {
      title: (data.title as string) || slugParts[slugParts.length - 1],
      description: (data.description as string) || '',
    },
    toc,
    lineCount,
  };
}

function extractToc(content: string): ITocItem[] {
  const toc: ITocItem[] = [];
  const headingRegex = /^(#{2,4})\s+(.+?)(?:\s*\{\/\*[\w-]+\*\/\})?\s*$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    let text = match[2].trim();
    text = text.replace(/\{\/\*.*?\*\/\}/g, '').trim();
    const id = slugify(text);
    toc.push({ id, text, level });
  }

  return toc;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
