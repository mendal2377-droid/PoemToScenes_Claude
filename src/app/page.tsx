import { SHELF } from '@/lib/poems';
import { HeroFilm } from '@/ui/HeroFilm';
import { ScrollStrip } from '@/ui/ScrollStrip';

export default function Home() {
  const open = SHELF.filter((s) => s.available).length;

  return (
    <main className="shelf-page">
      <HeroFilm />
      <header className="masthead">
        <h1 className="masthead__title">卧游</h1>
        <p className="masthead__roman">Wandering in the Landscape</p>
        <p className="masthead__lede">
          宗炳老病，画山水于四壁，卧而游之。
          <br />
          诗亦一境 — 一句一步，入此山中。
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
