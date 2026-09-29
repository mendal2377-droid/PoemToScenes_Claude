# 卧游 · Wandering in the Landscape

A walkable Chinese landscape painting. Pick a classical poem, step into the world it
describes, and watch the text and the land come into agreement as you walk.

The whole poem is inscribed on the picture from the first moment, the way a 题款 sits on
a real scroll. Nothing is hidden and nothing is collected: a line you have not stood in
front of yet is written in 淡墨, pale and set back; reaching its place brings it up to
full ink.

Built with Next.js and React Three Fiber. Every surface is painted rather than lit —
there is not a single light source in the scene.

## What's here

**Two finished worlds.**

- **《山居秋暝》· 王维** — an autumn dusk after rain. Eight lines, eight places: the empty
  hilltop, the autumn maples, the moonlit pine grove, the spring over stones, the bamboo,
  the lotus pond with its boat, the withered flowers, the thatched pavilion.
- **《江雪》· 柳宗元** — twenty characters, almost all of them absences. A white world, a
  dark river, one boat. Turn the snow up and the paths disappear, which is the poem
  (万径人踪灭) doing its own work on the terrain shader.

Five more poems sit greyed out on the shelf as sketches.

**The inscription reads like a scholarly edition.**

- **对仗** — the matched couplets are bracketed together. In 山居秋暝 those are
  明月松间照/清泉石上流 and 竹喧归浣女/莲动下渔舟, where every character answers its
  opposite: 明月↔清泉, 松间↔石上, 照↔流.
- **韵脚** — rhyming characters wear a vermilion ring. 秋·流·舟·留 in 山居秋暝 (下平十一尤);
  绝·灭·雪 in 江雪, which rhymes on the 入声 and so marks three of its four lines.
- **平仄** — an optional toggle puts a hollow dot beside every 平 and a filled one beside
  every 仄, so the tonal pattern of a 五言律诗 runs down each column as a visible stripe.
  Tones are from 平水韵, which means 月, 石, 竹, 歇, 绝, 灭 and 雪 all count as 仄 even where
  modern Mandarin has flattened them.
- **注释** — a sentence on whichever line is under your eye.

**Sound, synthesised.** 竹喧 literally means *noise in the bamboo*, and 清泉石上流 is a line
you hear before you see; half the poem is sound and the scene was silent. Every layer is
filtered noise built in the Web Audio graph — no audio files ship. A bed of wind, 松风
through the pines, 泉声 over the stones, the hollow knock of bamboo culms, water at the
lotus pond. Layer gains follow the listener, so walking toward the stream brings it up.
Off until you ask for it, both because browsers forbid otherwise and because silence is a
legitimate way to read a poem.

**Three modes.**

- **自由观看** — orbit the valley the way you would walk around a hanging scroll.
- **漫游** — WASD to walk, Shift to run, drag to look. A figure in a straw hat and rain
  cape follows the ochre trail. Coming near a place stirs its line in the inscription;
  arriving inks it. Clicking a line in free view travels to the place it names.
- **落笔** — a painter's palette at the bottom of the screen. Take a pine, a bamboo, a
  stone or a cloud, drop it into the landscape, then tune the brushwork itself: stroke
  density, stroke length, curl, ink tone. Density and length regrow the geometry; curl
  and tone are uniforms.

**天时气象** — time of day, wind, mist and snow, live, on any scene.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

```bash
npm run build
```

Deploys to Vercel as-is — `vercel.json` is included and both scenes prerender as static
pages. There are no environment variables and no backend.

## How it's put together

```
src/
  lib/
    noise.ts        deterministic value noise, fbm, ridged noise, seeded RNG
    terrain.ts      the height field — one function, the single source of truth
    poems.ts        the poems, their palettes, terrain, flora and landmarks
    types.ts        the scene schema
    store.ts        zustand: mode, found lines, atmosphere, placed props
  three/
    glsl.ts         shared GLSL: noise, brush masks, 皴 hatching, pigment grain
    materials.ts    every material in the scene, off one shared uniform block
    geometry.ts     terrain, mountain rings, water, mist, snow
    flora.ts        pines, bamboo, broadleaf, grass, reeds, lotus, rocks
    props.ts        pavilion roof, boat hull, 斗笠 hat, 蓑衣 cape
    groundMask.ts   the trail and waterline, rasterised into a texture
    useWorld.ts     builds a whole world from a scene config, and tears it down
    World.tsx       the scenery
    Roam.tsx        the two camera rigs and the walking figure
    Labels.tsx      projects world anchors onto DOM labels
    Composer.tsx    props the visitor places, with live brush parameters
  ui/               landing shelf, panel, palette, poem sheet, scene shell
```

### A few decisions worth knowing about

**The poem is a 题款, not a pickup.** The first build scattered the lines across the
valley as floating seals you walked over to collect, which turned a scroll into a quest
map and meant a reader could not simply read the poem. Now the text is inscribed on the
picture in vertical columns, right to left, signed and sealed, and walking only changes
how dark the ink is. The landscape keeps its markers to faint rings on the ground that
fade up as you approach and are invisible from any distance.

**The thumbstick writes to a plain object, not state.** Same reasoning as the shared
uniform block: the walk loop reads it every frame, and re-rendering the tree at frame rate
to move a figure would be absurd. It only mounts for coarse pointers.

**留白 is a real field, not a look.** A low-resolution noise field marks where the
brush never went. The terrain shader washes those patches back to bare paper, and the
grass builder samples the *same array* through a matching bilinear filter, so nothing
gets planted in the emptiness. Painting every square metre is what made the first pass
read as a nature park rather than a scroll.

**明月松间照 is rendered, not implied.** The scene had a moon and it had pines, but not
the 照. The terrain shader now lays pools of moonlight on the ground beneath the pine
cluster, stretched along the moon's bearing and drifting slowly; foliage facing the moon
picks up a silver edge. Five of the poem's eight lines are verbs — this is the first one
to actually happen.

**The palette follows the season, and the evergreens don't.** 秋暝 is an autumn dusk, so
the ground cover turns gold while the pines and bamboo stay deep green. That contrast is
the poem's own: 明月松间照 and 竹喧 both lean on plants that keep their colour.

**The terrain is one function.** `terrainHeight(x, z, spec)` builds the mesh, drops every
pine and stone onto the ground, and glues the walking figure's feet to it. Nothing can
drift out of agreement because nothing has its own copy.

**Nothing is lit and nothing is instanced.** There are no lights — colour comes from
ramps, hatching and brush-shaped alpha. Plants are baked into merged buffers in world
space, each vertex carrying the anchor it should sway around and how far up the plant it
sits. One draw call per plant type, and every stroke gets to be its own shape.

**One uniform block, shared by reference.** `shared` in `materials.ts` is handed to every
material, so writing `uTime` once per frame moves the same gust through the grass, the
bamboo and the clouds.

**The trail is a texture, not vertex data.** It started as a distance query per terrain
vertex, which tied the path's resolution to the mesh — at 1.5 m per quad it came out as a
chain of lozenges. `groundMask.ts` rasterises the polyline into a 1024² texture instead.

**The labels are DOM.** Seals and verse slips are ordinary HTML, projected onto the screen
each frame. Chinese type then renders in the system's calligraphic font, which no
in-canvas text can do without shipping a multi-megabyte CJK font file. This replaced
drei's `Html`, which mounts a React root per label — under React 19 StrictMode that meant
a synchronous unmount during render for every marker.

**Type.** No web fonts. The stack prefers 楷体 / STKaiti and falls back through 宋体, so it
looks right offline and in mainland China without waiting on Google Fonts.

### Adding a poem

Add a `PoemScene` to `src/lib/poems.ts` and push it into `SCENES`. The landing shelf, the
route, the loading card and the poem sheet all read from that one object. A landmark's
`line` indexes into `lines`, so the collection loop wires itself up.

## Known limitations

- **Building a world costs ~0.6–0.7 s** of main-thread time. The loading card is painted
  first and covers it, but it is a blocking build, not a worker.
- **Placed props are session-only.** Nothing persists across a reload.
- The five greyed poems on the shelf are titles and palettes, not worlds.
- **江雪's river is a circular basin**, so its shoreline reads as a pond rather than a
  river running through. It wants an elongated or path-shaped basin.
- **平仄 is hand-encoded per poem**, not looked up. Adding a poem means writing its tones
  out; there is no 平水韵 table in the project.
- **吟诵 is missing.** The ambience is weather and water, not a voice reading the poem.
