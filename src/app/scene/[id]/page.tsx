import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { SCENES, getScene } from '@/lib/poems';
import { SceneView } from '@/ui/SceneView';

export function generateStaticParams() {
  return SCENES.map((s) => ({ id: s.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const scene = getScene(id);
  if (!scene) return { title: '卧游' };
  return {
    title: `${scene.title} · ${scene.author} — 卧游`,
    description: scene.note,
  };
}

export default async function ScenePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scene = getScene(id);
  if (!scene) notFound();
  return <SceneView scene={scene} />;
}
