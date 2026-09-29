import { SHELF } from '@/lib/poems';
import { ScrollStrip } from '@/ui/ScrollStrip';

export default function Home() {
  const open = SHELF.filter((s) => s.available).length;

  return (
    <main className="shelf-page">
      <header className="masthead">
        <h1 className="masthead__title">卧游</h1>
        <p className="masthead__roman">Wandering in the Landscape</p>
        <p className="masthead__lede">
          宗炳老去，不能遍历名山，便将所见画于四壁，卧以游之。
          <br />
          这里是同样的事：选一首诗，走进去，把句子一句一句捡回来。
        </p>
      </header>

      <section className="shelf" aria-label="诗卷">
        {SHELF.map((entry) => (
          <ScrollStrip key={entry.id} entry={entry} />
        ))}
      </section>

      <footer className="shelf-foot">
        已绘 {open} 卷 · 余者待笔 — 悬停展卷，点击入山
      </footer>
    </main>
  );
}
