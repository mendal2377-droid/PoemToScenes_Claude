import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '卧游 · 古诗山水',
  description: '在唐诗宋词的山水里走一走，一句一句把诗捡回来。A walkable Chinese landscape painting, one poem at a time.',
};

export const viewport: Viewport = {
  themeColor: '#efe4c8',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <div className="vignette" aria-hidden />
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
