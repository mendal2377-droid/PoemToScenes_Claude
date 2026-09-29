# 卧游 · Wandering in the Landscape

A walkable Chinese landscape painting. Pick a classical poem, step into the world it
describes, and collect it one line at a time by walking to the place each line is about.

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

**Three modes.**

- **自由观看** — orbit the valley the way you would walk around a hanging scroll.
- **漫游** — WASD to walk, Shift to run, drag to look. A figure in a straw hat and rain
  cape follows the ochre trail. Reach a landmark and its line of the poem unrolls in
  calligraphy where you're standing.
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

- **Roaming needs a keyboard.** On touch, free view and composition work, but there is no
  on-screen joystick yet, so 漫游 is desktop-only.
- **Building a world costs ~0.6–0.7 s** of main-thread time. The loading card is painted
  first and covers it, but it is a blocking build, not a worker.
- **Placed props are session-only.** Nothing persists across a reload.
- The five greyed poems on the shelf are titles and palettes, not worlds.
