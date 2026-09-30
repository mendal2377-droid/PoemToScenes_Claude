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

**Ten worlds**, each built around what its text is actually about, and each with a
different landform *and* a different emotion — not one valley re-tinted.

| | text | landform | feeling |
|---|---|---|---|
| 1 | **山居秋暝** · 王维 | wooded hills, a brook, a lotus pond; moonlight falls between the pines | 清幽 |
| 2 | **江雪** · 柳宗元 | a white plain, a wide dark river, mountains closing in, one tiny boat | 孤寂 |
| 3 | **鸟鸣涧** · 王维 | a steep night ravine, walls all round, a silver brook, falling osmanthus | 幽静 |
| 4 | **春江花月夜** · 张若虚 | a 170 m river with a huge low moon, its reflection running to you | 浩渺 |
| 5 | **西江月** · 辛弃疾 | golden paddies, a plank bridge, a hut with a lit window, a few drops of rain | 欣喜 |
| 6 | **饮酒·其五** · 陶渊明 | a bright meadow, a hedge, 南山 filling the horizon under a low sun | 淡远 |
| 7 | **登高** · 杜甫 | a brown gorge, a river rolling *toward* you, a terrace, a gale in the leaves | 悲壮 |
| 8 | **敕勒歌** · 佚名 | a steppe under a great sky; the grass parts to show cattle | 辽阔 |
| 9 | **桃花源记** · 陶渊明 | a stream through peach blossom to a mountain with one narrow slot; beyond it, a hidden valley of fields | 惊喜 |
| 10 | **游褒禅山记** · 王安石 | a mountain, a bright front cave, and a back cave that is truly dark — you carry a torch | 求索 |

The last two are prose. They are walked *in the order they are told* — the trail runs from
where you wake, through every place in the sequence of the text, and does not loop back —
and carry no 平仄 or rhyme apparatus, since a story is not scanned. In 桃花源记 the
mountain is a solid wall from outside and the valley cannot be seen until you are through
the slot: 豁然开朗 is a reveal, not a caption. In 游褒禅山记 the back cave goes to near
black, lit only by what your torch reaches, and the crystals get brighter and stranger the
deeper you go — 入之愈深，其进愈难，而其见愈奇 as an experience.

The shelf was first sketched with 桃花源记 in the sixth slot as a poem; it is prose, so it
now has its own world and 饮酒·其五 took the slot.

**The inscription reads like a scholarly edition.**

- **对仗** — the matched couplets are bracketed together. In 山居秋暝 those are
  明月松间照/清泉石上流 and 竹喧归浣女/莲动下渔舟, where every character answers its
  opposite: 明月↔清泉, 松间↔石上, 照↔流.
- **平仄 · 韵脚** — one optional toggle brings up the tonal apparatus: a hollow dot beside
  every 平, a filled one beside every 仄, so the pattern of a 五言律诗 runs down each column
  as a visible stripe, and a vermilion ring on the rhyming characters — 秋·流·舟·留 in
  山居秋暝 (下平十一尤), and 绝·灭·雪 in 江雪, which rhymes on the 入声 and so marks three
  of its four lines. Off by default: the poem reads better plain, and the apparatus is
  there for when you want it.
  Tones are from 平水韵, which means 月, 石, 竹, 歇, 绝, 灭 and 雪 all count as 仄 even where
  modern Mandarin has flattened them.
- **注释** — a sentence on whichever line is under your eye.

**Sound, synthesised** — and now it rains: a bright hiss with a lower patter under it, and thunder built from a sharp crack in front of a slow, uneven tail. 竹喧 literally means *noise in the bamboo*, and 清泉石上流 is a line
you hear before you see; half the poem is sound and the scene was silent. Every layer is
filtered noise built in the Web Audio graph — no audio files ship. A bed of wind, 松风
through the pines, 泉声 over the stones, the hollow knock of bamboo culms, water at the
lotus pond. Layer gains follow the listener, so walking toward the stream brings it up.
Off until you ask for it, both because browsers forbid otherwise and because silence is a
legitimate way to read a poem.

**Three modes.**

- **自由观看** — every scene opens **standing at the poet's eye**, at the place its first line
  was written, and 俯瞰 (or Esc) is how you rise to look at the whole valley from above.
  **Click a line and the camera moves to the poet's eye for that line**: it stands where the poem was written,
  at a person's eye height, and turns to what the line is about — the moon, the far bank,
  the washerwomen coming out of the bamboo. Drag to turn your head, wheel to look closer,
  and press 俯瞰 (or Esc) to rise back to the overview. A line that faces the sky keeps
  following the sun or moon as the clock turns. Every landmark carries a `look` target, and
  the build fails without one.
- **漫游** — WASD to walk, Shift to run, drag to look. A figure in a straw hat and rain
  cape follows the ochre trail. Coming near a place stirs its line in the inscription;
  arriving inks it. Clicking a line in free view travels to the place it names.
- **落笔** — a painter's palette at the bottom of the screen. Take a pine, a bamboo, a
  stone or a cloud, drop it into the landscape, then tune the brushwork itself: stroke
  density, stroke length, curl, ink tone. Density and length regrow the geometry; curl
  and tone are uniforms.

**时辰 and 天气** — a real day and a real sky, behind the 天时 button, on every scene.

- **The clock** is read the way the poems read it: as the twelve 时辰. It tells you 酉时正
  · 18:19 rather than just a time, and 山居秋暝 opens at 酉时正 because its 晚来秋 is late in
  酉. Drag the dial, jump to 拂晓 / 正午 / 黄昏 / 夜深, or press 流转 and let the day turn
  by itself (缓 · 常 · 疾; about three and a half minutes a day at the ordinary pace).
  The sun and moon travel arcs across the sky; the horizon warms on the sunward side at
  dawn and dusk; stars come out on a clear night, and the moonlight pooling under the
  pines follows the moon.
- **Each poem's own composition is kept.** The authored position of a scene's sun or moon
  is honoured at the scene's opening time and the sky is shifted to make that true, so
  moving the clock travels the arc from where the picture wants it rather than snapping
  to a generic one.
- **The weather** — 本景, 晴, 多云, 阴, 细雨, 雷雨, 雪, 雾, 大风. A preset is a *target*: the
  sky eases toward it over a few seconds, so clear turning to storm is a darkening rather
  than a cut. Overcast drains colour and value out of every surface, greys the sky and
  dims the sun and moon; rain falls as streaks driven sideways by the wind; snow
  accumulates on the ground and melts more slowly than it fell; 雷雨 adds lightning that
  lights the whole valley for a moment, and thunder that arrives late, because the
  farther the strike the longer the gap. 本景 restores the poem's own sky.
- **Precipitation follows the camera.** It used to sit at the origin with a fixed radius,
  so walking to the edge of the valley walked out from under the snow.
- 风势, 云雾 and 落雪/落叶/落花 stay as sliders and sit on top of the presets.

## The film behind the shelf

The home page plays a slow wander through nine of the poems under the paper. It is not
footage: `/scene/<id>?film` is a mode of the scene itself that takes the interface away,
lets the eye walk on at a stroller's pace, and hangs a sheet of paper in front of the
lens so a shot can be faded in and out *inside* the canvas. Each clip in `public/film/`
is three shots of one poem, about 13 seconds and under 2 MB.

Film mode renders on request rather than on animation frames (`window.__film.step()`),
so a recording does not depend on the window being on screen and comes out at exactly
30 fps; `scripts/record-film.js` steps the scene, downscales each frame, encodes it with
WebCodecs (H.264) and muxes an mp4. The player (`ui/HeroFilm.tsx`) plays the clips in turn
and loops. It stays out of the way: no film for people who ask for reduced motion, on a
data saver, or on a phone, where the shelf sits on plain paper.

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
    poems.ts        the shelf, derived from scenes/
    scenes/         one file per poem: text, tones, palette, terrain, flora, landmarks
    validate.ts     checks every scene at build time (see below)
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

### What a scene can be made of

Beyond text and palette, a `PoemScene` can carry:

- **`rivers`** — a river wide enough to be a landscape. Its `level` is an absolute water
  height (a river is flat across its width), the bed is carved below it, and the carve
  fades towards both ends so the river runs into rising ground rather than off the world.
- **`bumps`** — Gaussian hills, positive or negative. A row of them is a wall; a negative
  one is a hollow, and a chain of hollows is a cave passage.
- **`flats`** — pinned level ground, which is also how a passage through a wall is kept
  narrow: pin a short run of floor through the gap and the walls either side stay steep.
- **`massifs` / `skyline`** — a peak that dominates the horizon at a chosen bearing, and a
  height scale for every range (0.5 is a low horizon, 1.3 closes in).
- **`glows`, `huts`, `steles`, `bridges`, `boats`, `herd`** — set pieces.
- **`people`** — figures by role (washerwoman with her basket, scholar with a scroll, elder
  with a staff and a white beard, child, farmer with a hoe, herdsman, companion with a torch,
  fisher, ape). Each has a robe, sash, sleeves and hands, a head and a hat or hair, its own
  posture and its own small thing to hold, and a little idle motion (a breath, a swaying arm,
  a child's arms going). All primitives, no model files.
- **`animals`** — hens (pecking in flurries), dogs (tail going), frogs (throat swelling), egrets
  (standing still, head turning), oxen. **`herd`** is cattle with humps and horns and woolly
  sheep, and **`flocks`** are birds with a head, body, tail and bent wings. **`props`** are
  things like a jar of wine, **`sand`** paints a bar into the ground mask, and **`sounds`**
  are localized sources — frogs, cicadas, birdsong, a gibbon, poultry — that come up as you
  approach them.
- **Small rivers taper.** A river can narrow along its length (`taper`), so 山居秋暝 has a
  stream that widens into a river, not a pond. Trees, reeds and rocks keep out of the
  standing point of every line so the first thing the poet's eye meets is the view.
- **`cave`** and **`torch`** — the world goes dark round the camera, and only what the torch
  reaches stays lit. Without a torch it is merely dim, which is what the slot in 桃花源记 is.
- **`view`** — where the free view opens. A slot in a wall wants the camera high and back.
- **`journey`** — walk the text in order instead of looping.

### Adding a poem

Write a `PoemScene` in `src/lib/scenes/`, add it to `SCENES` in `scenes/index.ts`, and the
shelf, route, loading card and inscription all read from it. A landmark's `line` indexes
into `lines`, so the walk wires itself up.

**Every scene is validated at build time** (`validate.ts`), and a bad one fails `next build`
rather than the reader's walk. It checks that tone strings match their line lengths, that
every line has somewhere to stand, that no landmark, start point or pavilion sits inside
water, that the boat is actually afloat, and that scenery stays inside the terrain. Two
landmarks once reached production sitting in a pond, so walking to them put the camera
under the surface; the messages say how far to move the entry.

## Known limitations

- **Building a world costs roughly 0.2–0.7 s** of main-thread time. The loading card is painted
  first and covers it, but it is a blocking build, not a worker.
- **敕勒歌 is the heaviest world** — tens of thousands of grass blades — and takes the
  longest to build. Its grass reads mainly through strokes brushed into the ground shader.
- **Walls only block sight, not movement.** The walker follows the ground wherever it goes,
  so the mountain round 桃花源 and the cave walls in 游褒禅山记 can simply be climbed over.
  The reveal of the hidden valley works if you take the slot; nothing makes you.
- **The cave is a hollow, not a room.** It has no ceiling — the dark is applied by distance
  from the camera to the cave, and the torch is a falloff in the shaders, not a light. It
  reads as enclosed from inside, but seen from directly above it is an open pit.
- **The prose inscriptions are wide.** Fifteen columns of clause-length text take a good
  part of the screen, and on a narrow window they cover a lot of the picture.
- **The poet's eye stands on the ground.** In the cave scene the eye sits at the bottom of a
  pit, so some lines show a wall of hillside rather than a passage; the torch glow and the
  dark carry it.
- **People are built from primitives.** They have a body, arms and hands, but a face is two ink
  dots, and nobody walks: they stand, sit, wash, lean on a staff. Animals are a little
  livelier, but nothing moves across the ground.
- **The film is 960x540 and a fixed set of clips.** Adding a scene to it means recording a
  clip and adding its name to `CLIPS` in `ui/HeroFilm.tsx`. The mp4s are H.264, which every
  current browser plays; the recorder needs a Chromium with WebCodecs.
- **Placed props are session-only.** Nothing persists across a reload.
- **平仄 is hand-encoded per poem**, not looked up. Adding a poem means writing its tones
  out; there is no 平水韵 table in the project.
- **吟诵 is missing.** The ambience is weather and water, not a voice reading the poem.
