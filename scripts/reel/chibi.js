/**
 * 赤壁赋 — Su Shi, the autumn of 1082, in exile at Huangzhou. All of it.
 *
 * One night on the river in one take: the boat drifting east under the red
 * cliffs, the moon coming up over 东山 and climbing, and at the end the night
 * going by in a few breaths while they sleep, and the east grown light.
 *
 * The text is prose, so it is written as it is read — clause by clause, a column
 * each, in passages of two to four — and each passage, read, dissolves the way
 * ink does in water before the next is written. Every one of its 537 characters
 * is brushed stroke by stroke. At the end the whole of it unrolls as a page over
 * the river at dawn, and the seal.
 *
 * The camera is five movements, one for each part of the piece, and each goes
 * one way without stopping — so the take travels rather than parking at a view
 * for every passage and setting off again:
 *   I    the voyage   清风徐来 … 羽化而登仙   one long rise: low on the water from upstream, past
 *                                           the boat and over it, the moon coming up, on into the air
 *   II   song, flute  桂棹兮兰桨 … 何为其然也 one descending circle round the boat: past the piper
 *                                           face on, ending level with Su, the moon over his shoulder
 *   III  the guest    月明星稀 … 托遗响于悲风  away upstream and up, backwards at first; the fleet
 *                                           comes down the river under us; the boat a grain of millet
 *   IV   Su's answer  逝者如斯 … 共适          one long glide down over the open water and in to the boat
 *   V    dawn         洗盏更酌 … 既白          up and back behind them, towards the east
 * Near the boat it looks down or along the river, never across at the wall
 * from close to, and the moon is a subject three times, from three places.
 */
window.__screenplays = window.__screenplays || {};

(() => {
  // [clauses, English] — the whole text, in the passages it is written in.
  const P = [
    [['壬戌之秋', '七月既望', '苏子与客泛舟游于赤壁之下'], 'In the autumn of the renxu year, the night after the full moon of the seventh month, my friends and I took a boat out below the Red Cliffs.'],
    [['清风徐来', '水波不兴'], 'A clear wind came slowly; the water did not stir.'],
    [['举酒属客', '诵明月之诗', '歌窈窕之章'], 'I raised my wine to my guests, recited the poem of the bright moon, and sang the song of the graceful lady.'],
    [['少焉', '月出于东山之上', '徘徊于斗牛之间'], 'Before long the moon came up over the eastern hills and lingered among the stars of the Dipper and the Ox.'],
    [['白露横江', '水光接天'], 'White mist lay across the river; the light on the water ran on into the sky.'],
    [['纵一苇之所如', '凌万顷之茫然'], 'We let our reed of a boat go where it would, over ten thousand acres of shining blankness —'],
    [['浩浩乎如冯虚御风', '而不知其所止'], 'vast, as if riding the wind through empty air, with no idea where we would stop;'],
    [['飘飘乎如遗世独立', '羽化而登仙'], 'light, as if we had left the world and stood alone, grown wings, and risen among the immortals.'],
    [['于是饮酒乐甚', '扣舷而歌之'], 'So we drank, very happy, and beat time on the side of the boat, and sang:'],
    [['歌曰', '桂棹兮兰桨', '击空明兮溯流光'], '“Oars of cassia, oars of orchid, striking the moon in the clear water, rowing up the stream of light —'],
    [['渺渺兮予怀', '望美人兮天一方'], 'far, far goes my heart, to the one I long for, at the other edge of the sky.”'],
    [['客有吹洞箫者', '倚歌而和之'], 'One of my guests played the dongxiao, following the song.'],
    [['其声呜呜然', '如怨如慕', '如泣如诉'], 'Its sound was a low moaning, as if resentful, as if yearning, as if weeping, as if pleading;'],
    [['余音袅袅', '不绝如缕'], 'the last notes trailed away, thin as a thread that will not break.'],
    [['舞幽壑之潜蛟', '泣孤舟之嫠妇'], 'It would make the dragon hidden in a dark gorge dance, and a widow alone in her boat weep.'],
    [['苏子愀然', '正襟危坐而问客曰', '何为其然也'], 'Saddened, I straightened my robe, sat up, and asked him: “Why does it sound like that?”'],
    [['客曰', '月明星稀', '乌鹊南飞', '此非曹孟德之诗乎'], 'He said: “‘The moon is bright, the stars are few, the magpies fly south’ — is that not Cao Cao’s poem?'],
    [['西望夏口', '东望武昌', '山川相缪', '郁乎苍苍'], 'West towards Xiakou, east towards Wuchang, the hills and rivers twined together, dark and deep —'],
    [['此非孟德之困于周郎者乎'], 'is this not where Cao Cao was trapped by young Zhou Yu?'],
    [['方其破荆州', '下江陵', '顺流而东也'], 'When he had broken Jingzhou and taken Jiangling, and came east on the current,'],
    [['舳舻千里', '旌旗蔽空'], 'his warships ran stern to bow for a thousand li, his banners hid the sky.'],
    [['酾酒临江', '横槊赋诗'], 'He poured wine over the river and made poems with his spear across his knees.'],
    [['固一世之雄也', '而今安在哉'], 'He was the hero of his age. And where is he now?'],
    [['况吾与子渔樵于江渚之上', '侣鱼虾而友麋鹿'], 'And you and I fish and gather wood on the river’s islets, keeping company with fish and shrimp, friends of the deer,'],
    [['驾一叶之扁舟', '举匏樽以相属'], 'sailing a leaf of a boat, raising gourd cups to each other —'],
    [['寄蜉蝣于天地', '渺沧海之一粟'], 'mayflies lodged between heaven and earth, a single grain of millet on the wide sea.'],
    [['哀吾生之须臾', '羡长江之无穷'], 'I grieve that our life is a moment, and envy the Long River that never ends.'],
    [['挟飞仙以遨游', '抱明月而长终'], 'I would roam with the flying immortals, and hold the bright moon for ever —'],
    [['知不可乎骤得', '托遗响于悲风'], 'knowing that cannot be had, I gave the last notes to the sad wind.”'],
    [['苏子曰', '客亦知夫水与月乎'], 'I said: “And do you know the water and the moon?'],
    [['逝者如斯', '而未尝往也'], 'The water goes by like this, and yet it is never gone;'],
    [['盈虚者如彼', '而卒莫消长也'], 'the moon fills and empties like that, and in the end is neither more nor less.'],
    [['盖将自其变者而观之', '则天地曾不能以一瞬'], 'Look at it as what changes, and heaven and earth do not last the blink of an eye;'],
    [['自其不变者而观之', '则物与我皆无尽也', '而又何羡乎'], 'look at it as what does not, and things and we are both without end. So what is there to envy?'],
    [['且夫天地之间', '物各有主'], 'Besides, between heaven and earth everything has its owner,'],
    [['苟非吾之所有', '虽一毫而莫取'], 'and what is not mine I would not take a hair of.'],
    [['惟江上之清风', '与山间之明月'], 'Only the clear wind on the river and the bright moon among the hills:'],
    [['耳得之而为声', '目遇之而成色'], 'the ear takes one and it is sound, the eye meets the other and it is colour;'],
    [['取之无禁', '用之不竭'], 'no one forbids the taking, and they are never used up.'],
    [['是造物者之无尽藏也', '而吾与子之所共适'], 'This is the Maker’s endless treasury, and it is yours and mine to share.”'],
    [['客喜而笑', '洗盏更酌'], 'My guest was glad and laughed. We rinsed the cups and poured again.'],
    [['肴核既尽', '杯盘狼藉'], 'The food was gone; cups and dishes lay everywhere.'],
    [['相与枕藉乎舟中', '不知东方之既白'], 'We fell asleep against one another in the boat, and never knew the east had grown light.'],
  ];

  // When each passage is written, held and let go. A clause takes about a
  // quarter of a second a character; a passage stays up until its English
  // can be read as well.
  const START = 8.6;
  const lines = [];
  const T = [], E = [];
  let t = START;
  P.forEach(([cols, en], p) => {
    let w = t;
    cols.forEach((zh) => {
      const dur = 0.27 * [...zh].length + 0.35;
      lines.push({ zh, en, p, w: [w, dur], show: [t, 0] });
      w += dur + 0.2;
    });
    const write = w - 0.2 - t;
    const L = Math.max(write + 1.9, en.length * 0.052 + 1.6);
    T.push(t);
    E.push(t + L);
    lines.filter((l) => l.p === p).forEach((l) => (l.show[1] = t + L));
    t += L + 0.5;
  });
  const FIN_AT = t + 0.3;
  const TOTAL = Math.round((FIN_AT + 16) * 10) / 10;

  // The boat drifts east under the cliffs all night, turning a little.
  const WATER = -1.6;
  const boatAt = (s) => ({ x: -44 + 64 * (s / TOTAL), z: -30 + 3 * Math.sin(s * 0.02), rot: Math.PI / 2 + 0.08 * Math.sin(s * 0.031) });

  // The clock: dusk with the moon still behind 东山; it rises at 少焉; it climbs
  // slowly through the night; and while they sleep the night goes by.
  const clock = (s) => {
    const k = (a, b) => Math.max(0, Math.min(1, (s - a) / (b - a)));
    const sm = (x) => x * x * (3 - 2 * x);
    let h = 18.85;
    h += 0.85 * sm(k(T[3], T[3] + 6.5));
    h += 0.9 * k(T[3] + 6.5, T[29]);
    h += 0.6 * k(T[29], E[39]);
    // 不知东方之既白 — the rest of the night, in six seconds.
    h += (29.95 - 21.2) * sm(k(T[42] + 0.8, T[42] + 7.2));
    return h % 24;
  };

  window.__screenplays.chibi = {
    name: 'reel-chibi',
    scene: 'chibi',
    total: TOTAL,
    seed: 1082,
    aim: 60,
    bitrate: 9000000,
    paper: '#e8dfcb',
    cover: T[3] + 6.5,
    author: '苏轼',
    title: { text: '赤壁赋', at: 1.2, dur: 1.8, out: 8.2, x: 846, y: 250, size: 108 },
    column: { x: 118, y: 300, size: 84 },
    lines,
    final: {
      at: FIN_AT, sealAt: FIN_AT + 6.4, out: FIN_AT + 12.6, x0: 952, dx: 52, y: 170, size: 44,
      sealX: 952 - 17 * 52 + 2, sealY: 170 + 10 * 44 * 1.08 + 34, sealSize: 72,
      credit: 'The Red Cliffs  ·  Su Shi, 1037–1101', creditY: 1820,
    },
    end: { paper: FIN_AT + 12.2, card: FIN_AT + 13.0 },

    setup(F) {
      F.air({ wind: 0.2, mist: 0.45, snow: 0.06 });
    },

    world(F, s) {
      F.clock(clock(s));
      F.boat(0, boatAt(s));
      // 白露横江 — the mist comes up across the river, and lies there a while.
      const k = (a, b) => Math.max(0, Math.min(1, (s - a) / (b - a)));
      const mist = 0.45 + 0.4 * k(T[4] - 1, T[4] + 3) - 0.3 * k(T[8], T[9]) + 0.15 * k(T[42], E[42]);
      // 托遗响于悲风 — the wind gets up, and drops again for Su's answer.
      const wind = 0.2 + 0.9 * k(T[28] - 1, T[28] + 2) * (1 - k(T[29], T[30])) + 0.25 * k(T[36], T[36] + 2) * (1 - k(T[39], E[39]));
      F.air({ mist, wind });
    },

    grade: (s) => {
      // Night needs lifting to read on a phone; dawn less so.
      const d = Math.max(0, Math.min(1, (s - T[42] - 2) / 6));
      return `brightness(${(1.3 - 0.12 * d).toFixed(3)}) contrast(1.16) saturate(${(1.25 - 0.1 * d).toFixed(3)})`;
    },

    camera: ({ G }) => {
      const W = WATER;
      const B = (s) => boatAt(s);
      // A point on the boat, in its own frame (x across, z along to the bow).
      const on = (s, x, y, z) => { const b = B(s); const c = Math.cos(b.rot), n = Math.sin(b.rot); return [b.x + x * c + z * n, W + y, b.z - x * n + z * c]; };
      const near = (s, dx, y, dz) => { const b = B(s); return [b.x + dx, W + y, b.z + dz]; };
      // Where the moon is at an hour, roughly (from the scene's sky).
      const moonDir = (h) => {
        const tab = { 18.9: [0.9, 0.1, -0.42], 19.5: [0.87, 0.25, -0.43], 20: [0.83, 0.36, -0.43], 20.5: [0.77, 0.47, -0.44], 21: [0.69, 0.57, -0.44] };
        const ks = Object.keys(tab).map(Number).sort((a, b) => a - b);
        let i = 0; while (i < ks.length - 2 && h > ks[i + 1]) i++;
        const u = Math.max(0, Math.min(1, (h - ks[i]) / (ks[i + 1] - ks[i])));
        return tab[ks[i]].map((v, j) => v + (tab[ks[i + 1]][j] - v) * u);
      };
      const moon = (s, from) => { const d = moonDir(clock(s)); return from.map((v, j) => v + d[j] * 200); };
      const sit = { su: (s) => on(s, 0, 1.15, 1.85), piper: (s) => on(s, -0.15, 1.1, -1.55), deck: (s) => on(s, 0, 0.5, 0) };
      const K = [];
      const key = (s, pos, look, fov, roll) => K.push([s, pos, look, fov, roll ?? 0]);
      const down = (s) => sit.deck(s);
      // Around the boat: an angle (0 east, π/2 south, π west, 3π/2 north), a
      // distance and a height — for the one slow circle of the second movement.
      const orbit = (s, a, r, h) => near(s, Math.cos(a) * r, h, Math.sin(a) * r);

      // The take is five movements, one for each part of the piece. Each goes one
      // way — up, round, out, down, up — and never stops; nothing is looked at
      // across the river at the wall from close to, and the moon is seen three
      // times, from three different places.

      // I. 泛舟 — the voyage (0 – 1:06). One long rise: in low on the water
      // from upstream, the cliffs a wall running away on the left; past the boat
      // and over it; out over the open water as the moon comes up; and on up into
      // the air for 羽化而登仙.
      key(0, near(0, -50, 1.3, 6), [B(0).x + 220, 3, -14], 54);
      key(T[0], near(T[0], -34, 1.5, 7), [B(T[0]).x + 160, 1, -22], 52);
      key(T[1], near(T[1], -16, 2.2, 8), down(T[1]), 48);
      key(T[2] + 1, near(T[2] + 1, -2, 6.5, 8), down(T[2] + 1), 46);
      key(T[3] + 1.5, near(T[3] + 1.5, 10, 8.5, 9), moon(T[3] + 1.5, near(T[3] + 1.5, 10, 8.5, 9)), 44);
      key(T[4] + 1, near(T[4] + 1, 22, 12, 12), moon(T[4] + 1, near(T[4] + 1, 22, 12, 12)), 50);
      key(T[5] + 1, near(T[5] + 1, 32, 18, 16), [B(T[5]).x + 170, -2, 26], 54);
      key(T[6] + 1, near(T[6] + 1, 42, 28, 18), [B(T[6]).x + 260, 10, 60], 56, -0.05);
      key(T[7] + 1, near(T[7] + 1, 50, 40, 14), [B(T[7]).x + 20, -2, 100], 56, -0.03);
      key(E[7], near(E[7], 52, 50, 16), [B(E[7]).x - 10, -2, 34], 54);

      // II. 歌 · 箫 — the song and the flute (1:06 – 2:00). One slow descending
      // circle round the boat, from high in the south-east, round by the east
      // and the north — close past the piper, face on to him as he plays — and
      // to the west, where it comes level with Su and looks him in the face as
      // he sits up; the moon is over his shoulder, which is where we go next.
      key(T[8] + 3.5, orbit(T[8] + 3.5, 0.55, 46, 36), down(T[8] + 3.5), 52);
      key(T[9] + 2.5, orbit(T[9] + 2.5, 0.0, 30, 20), down(T[9] + 2.5), 46);
      key(T[10] + 2.5, orbit(T[10] + 2.5, -0.8, 18, 9), down(T[10] + 2.5), 42);
      key(T[11] + 3, orbit(T[11] + 3, -1.3, 12, 4.6), sit.piper(T[11] + 3), 34);
      key(T[12] + 3.5, orbit(T[12] + 3.5, -1.75, 9.5, 3.2), sit.piper(T[12] + 3.5), 30);
      key(T[13] + 2.5, orbit(T[13] + 2.5, -2.3, 10, 3), down(T[13] + 2.5), 34);
      key(T[14] + 3, orbit(T[14] + 3, -2.75, 13, 4), [34, -0.6, 14], 40);
      key(T[15] + 4, orbit(T[15] + 4, -3.15, 9, 3.6), sit.su(T[15] + 4), 34);

      // III. 客曰 — the guest (2:00 – 3:30). Away from the boat, upstream and up:
      // backwards at first, the moon over the boat and the magpies across it;
      // round through the south to face up the river; the fleet comes down it
      // and passes under; and on up until the boat is a grain on the water.
      key(T[16] + 1.5, near(T[16] + 1.5, -4, 8.5, 4), moon(T[16] + 1.5, near(T[16] + 1.5, -4, 8.5, 4)), 42);
      key(T[16] + 6.5, near(T[16] + 6.5, -14, 11, 6), moon(T[16] + 6.5, near(T[16] + 6.5, -14, 11, 6)), 42);
      key(T[17] + 1.7, near(T[17] + 1.7, -24, 15, 10), [B(T[17]).x + 120, 0, 110], 54);
      key(T[17] + 5.5, near(T[17] + 5.5, -32, 18, 12), [B(T[17]).x - 20, -2, 150], 56);
      key(T[18] + 3, near(T[18] + 3, -41, 21.5, 8), [B(T[18]).x - 220, -2, 10], 54);
      key(T[19] + 2.5, near(T[19] + 2.5, -48, 24, 3), [B(T[19]).x - 190, -6, 2], 56);
      key(T[20] + 3, near(T[20] + 3, -55, 28, -1), [B(T[20]).x - 130, -8, 6], 58);
      key(T[21] + 3, near(T[21] + 3, -61, 34, 0), [B(T[21]).x - 100, -8, 4], 58);
      key(T[22] + 3.5, near(T[22] + 3.5, -66, 43, 3), [B(T[22]).x - 110, -6, 8], 56);
      key(T[23] + 3.5, near(T[23] + 3.5, -70, 54, 9), [B(T[23]).x - 60, -2, 90], 54);
      key(T[24] + 3, near(T[24] + 3, -64, 66, 13), down(T[24] + 3), 46);
      key(E[25], near(E[25], -50, 86, 10), down(E[25]), 44);
      key(E[26], near(E[26], -40, 82, 8), [B(E[26]).x + 320, 0, 2], 50);
      key(E[27], near(E[27], -32, 76, 8), moon(E[27], near(E[27], -32, 76, 8)), 50);

      // IV. 苏子曰 — Su's answer (3:30 – 4:46). One long glide down: out over the
      // river to the south in the wind, round over the open water with the
      // cliffs and the moon across it, and in low from the south-west to the
      // boat at the water's level.
      key(E[28], near(E[28], -34, 64, 18), [B(E[28]).x + 140, -2, 30], 54);
      key(E[29] + 0.5, near(E[29] + 0.5, -34, 52, 32), [B(E[29]).x + 70, -2, 24], 52);
      key(E[30] + 0.5, near(E[30] + 0.5, -31, 43, 43), [B(E[30]).x + 70, -1.6, 0], 50);
      key(E[31], near(E[31], -27, 35, 51), [B(E[31]).x + 60, -1.6, -6], 50);
      key(E[32], near(E[32], -22, 28, 56), [B(E[32]).x + 230, 6, 24], 54);
      key(E[33], near(E[33], -17, 22, 56), [B(E[33]).x + 220, 6, 10], 54);
      key(E[34], near(E[34], -14, 17, 52), [B(E[34]).x + 230, 4, -12], 54);
      key(E[35], near(E[35], -14, 13, 44), [B(E[35]).x + 200, 8, -40], 54);
      key(E[36], near(E[36], -16, 12, 35), [B(E[36]).x + 150, 46, -90], 58);
      key(E[37], near(E[37], -18, 8, 26), down(E[37]), 48);
      key(E[38], near(E[38], -18, 4.4, 17), down(E[38]), 44);
      key(E[39], near(E[39], -16, 3.2, 10), down(E[39]), 42);
      key(E[40], near(E[40], -11, 2.6, 5.5), down(E[40]), 40);

      // V. 既白 — dawn (4:46 –). Up and back behind them, towards the east,
      // while the night goes over.
      key(E[41], near(E[41], -9.5, 3.6, 2.5), down(E[41]), 42);
      key(E[42], near(E[42], -13, 7, -1), [B(E[42]).x + 240, 16, -36], 48);
      key(TOTAL, near(TOTAL, -24, 14, -3), [B(TOTAL).x + 260, 14, -40], 50);
      K.sort((a, b) => a[0] - b[0]);
      return K;
    },

    // Over the picture: the magpies across the moon, and Cao Cao's fleet.
    drawWorld(A, s, pose) {
      const { ctx, H, project, skyPoint, rng, ease, span, F } = A;
      // 乌鹊南飞 — seven birds across the moon, going south.
      if (s > T[16] + 2 && s < E[16] + 1) {
        const m = skyPoint(F.sky().moon, pose);
        if (!this._mag) { const r = rng(77); this._mag = Array.from({ length: 7 }, () => ({ dx: r() * 260, dy: (r() - 0.5) * 220, sz: 18 + r() * 14, ph: r() * 6.28, v: 120 + r() * 50 })); }
        ctx.save(); ctx.fillStyle = '#121216'; ctx.strokeStyle = '#121216'; ctx.lineCap = 'round';
        for (const b of this._mag) {
          const q = s - (T[16] + 2);
          const x = m.x - 620 + b.dx + q * b.v, y = m.y + b.dy + Math.sin(q * 1.3 + b.ph) * 10;
          const f = Math.sin(q * 9 + b.ph), w = b.sz;
          ctx.globalAlpha = ease(span(s, T[16] + 2, T[16] + 3)) * (1 - ease(span(s, E[16], E[16] + 1)));
          ctx.lineWidth = Math.max(2, w * 0.13);
          ctx.beginPath();
          ctx.moveTo(x - w, y - w * 0.4 * f);
          ctx.quadraticCurveTo(x - w * 0.4, y - w * (0.5 + 0.3 * f), x, y);
          ctx.quadraticCurveTo(x + w * 0.4, y - w * (0.5 + 0.3 * f), x + w, y - w * 0.4 * f);
          ctx.stroke();
          ctx.beginPath(); ctx.ellipse(x + w * 0.1, y + w * 0.04, w * 0.22, w * 0.09, 0, 0, 6.28); ctx.fill();
          ctx.beginPath(); ctx.moveTo(x - w * 0.1, y); ctx.lineTo(x - w * 0.75, y + w * 0.12); ctx.stroke();
        }
        ctx.restore();
      }
      // 舳舻千里，旌旗蔽空 — the fleet, in ghost-light on the water: rank on rank
      // of warships coming down out of the west on the current, sails and
      // banners; at 而今安在哉 they go back into the mist, the farthest first.
      const f0 = T[19] - 0.5, f1 = E[22] + 1.5;
      if (s > f0 && s < f1) {
        if (!this._fleet) {
          const r = rng(208);
          this._fleet = Array.from({ length: 46 }, (_, i) => ({ x: -250 + r() * 250, z: -26 + r() * 52, len: 12 + r() * 8, mast: 11 + r() * 6, ph: r() * 6.28, gone: r(), flag: r() < 0.7 }));
        }
        const come = ease(span(s, f0, T[20] + 1.5));
        const ships = this._fleet.map((sh) => {
          const x = sh.x + (s - f0) * 2.6;
          return { sh, x, d: Math.hypot(x - pose.pos[0], sh.z - pose.pos[2]) };
        }).sort((a, b) => b.d - a.d);
        ctx.save();
        ctx.filter = 'blur(0.8px)';
        ctx.lineCap = 'round';
        for (const { sh, x, d } of ships) {
          // nearest first in, farthest first out
          const inA = ease(span(come, Math.min(0.9, d / 260), Math.min(1, d / 260 + 0.25)));
          const outA = 1 - ease(span(s, T[22] + 1 + sh.gone * 3 + (1 - Math.min(1, d / 200)) * 1.5, T[22] + 3 + sh.gone * 3 + (1 - Math.min(1, d / 200)) * 1.5));
          // a ship right under the lens would fill it: the near ones stay in the mist
          const a = inA * outA * Math.max(0.2, 1 - d / 300) * ease(span(Math.hypot(d, pose.pos[1] - WATER), 34, 52));
          if (a <= 0.01) continue;
          // Each ship is drawn as a painter would: a hull along the line its keel
          // makes on the screen, a mast, a battened junk sail and a banner.
          const z = sh.z, y = WATER;
          const st = project([x - sh.len / 2, y, z], pose), bw = project([x + sh.len / 2, y, z], pose), c = project([x, y, z], pose);
          if (st.z < 15 || bw.z < 15 || c.z < 15) continue;
          const k = H / 2 / Math.tan((pose.fov * Math.PI) / 360) / c.z; // pixels per metre there
          let ux = bw.x - st.x, uy = bw.y - st.y;
          const ul = Math.hypot(ux, uy);
          // seen end-on a hull is still a few metres wide
          // and seen any way it is never longer than it is
          const minL = 5 * k, maxL = sh.len * k * 1.1;
          if (ul < minL) { const f = ul > 0.1 ? minL / ul : 0; ux = ul > 0.1 ? ux * f : minL; uy = ul > 0.1 ? uy * f : 0; }
          else if (ul > maxL) { ux *= maxL / ul; uy *= maxL / ul; }
          const sx = c.x - ux / 2, sy = c.y - uy / 2, ex = c.x + ux / 2, ey = c.y + uy / 2;
          const hh = 1.7 * k;
          ctx.globalAlpha = a * 0.55;
          ctx.fillStyle = '#e9e6da';
          ctx.beginPath();
          ctx.moveTo(sx, sy - hh * 1.25);
          ctx.quadraticCurveTo(c.x, c.y - hh * 0.6, ex, ey - hh * 1.05);
          ctx.quadraticCurveTo(c.x + ux * 0.3, c.y + hh * 0.35, c.x, c.y + hh * 0.3);
          ctx.quadraticCurveTo(c.x - ux * 0.3, c.y + hh * 0.35, sx, sy - hh * 1.25);
          ctx.fill();
          // mast
          const top = c.y - sh.mast * k;
          ctx.globalAlpha = a * 0.7;
          ctx.strokeStyle = '#efece0'; ctx.lineWidth = Math.max(1, 0.22 * k);
          ctx.beginPath(); ctx.moveTo(c.x, c.y - hh * 0.6); ctx.lineTo(c.x, top); ctx.stroke();
          // the sail, face on, with its battens
          const sw = 2.6 * k, s0 = c.y - sh.mast * 0.3 * k, s1 = c.y - sh.mast * 0.92 * k;
          ctx.globalAlpha = a * 0.34;
          ctx.fillStyle = '#f2efe3';
          ctx.beginPath(); ctx.moveTo(c.x - sw, s0); ctx.lineTo(c.x + sw * 1.1, s0); ctx.lineTo(c.x + sw * 0.8, s1); ctx.lineTo(c.x - sw * 0.7, s1); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = a * 0.5; ctx.lineWidth = Math.max(0.8, 0.12 * k);
          for (let i = 1; i < 5; i++) { const yy = s0 + (s1 - s0) * (i / 5); const w0 = sw * (1 - 0.3 * i / 5); ctx.beginPath(); ctx.moveTo(c.x - w0, yy); ctx.lineTo(c.x + w0 * 1.1, yy); ctx.stroke(); }
          if (sh.flag) {
            // 旌旗 — streaming downwind, with the current
            const wv = Math.sin(s * 5 + sh.ph) * 0.3 * k;
            ctx.globalAlpha = a * 0.75; ctx.fillStyle = '#dcb4a0';
            ctx.beginPath(); ctx.moveTo(c.x, top); ctx.lineTo(c.x + Math.sign(ux || 1) * 3 * k, top + 0.5 * k + wv); ctx.lineTo(c.x, top + 1.4 * k); ctx.closePath(); ctx.fill();
          }
        }
        ctx.restore();
      }
    },

    // A passage is written clause by clause, right to left, held while it is
    // read, and then the ink lets go into the water: it blurs, lifts and is gone.
    drawLines(A, s, LINES) {
      const { ctx, W, H, layers, strokesInto, english, ease, span, lum, INK, SILVER, LATIN } = A;
      const size = 84, y = 214, gap = 104, x0 = 902;
      const la = layers[0], lx = la.getContext('2d');
      this._ink = this._ink || {};
      for (let p = 0; p < P.length; p++) {
        if (s < T[p] - 0.35 || s > E[p] + 1.0) continue;
        const cols = LINES.filter((l) => l.p === p);
        const left = x0 - (cols.length - 1) * gap;
        if (!this._ink[p]) this._ink[p] = lum(left, y, gap * cols.length, 900) < 122 ? SILVER : INK;
        const color = this._ink[p];
        const a = ease(span(s, T[p] - 0.3, T[p] + 0.2));
        const k = ease(span(s, E[p] - 0.3, E[p] + 0.9));
        lx.clearRect(0, 0, W, H);
        cols.forEach((l, j) => strokesInto(lx, l.plan, x0 - j * gap, y, size, s, color));
        ctx.save();
        ctx.globalAlpha = a * (1 - k) * 0.94;
        ctx.filter = `blur(${(0.5 + k * 9).toFixed(2)}px)`;
        ctx.shadowColor = color === INK ? 'rgba(238,236,228,0.95)' : 'rgba(6,8,14,0.85)';
        ctx.shadowBlur = 14;
        ctx.drawImage(la, 0, -k * 40);
        ctx.shadowBlur = 0;
        ctx.drawImage(la, 0, -k * 40);
        ctx.restore();
        // the English, wrapped
        const ea = ease(span(s, T[p] + 1.0, T[p] + 2.0)) * (1 - ease(span(s, E[p] - 0.6, E[p] + 0.2)));
        if (ea > 0) {
          ctx.save(); ctx.font = `italic 40px ${LATIN}`;
          const words = P[p][1].split(' '), rows = [];
          let row = '';
          for (const w of words) { const tr = row ? row + ' ' + w : w; if (ctx.measureText(tr).width > 900 && row) { rows.push(row); row = w; } else row = tr; }
          rows.push(row);
          ctx.restore();
          rows.forEach((r, i) => english(r, ea, 1452 + (i - (rows.length - 1) / 2) * 54));
        }
      }
    },

    // The whole of it, unrolled over the river at dawn as one page: thirty-one
    // characters a column, right to left, on a wash of paper.
    drawFinal(A, s, fA) {
      const { ctx, W, H, layers, strokesInto, planColumn, ease, span, INK } = A;
      const size = 44, per = 31, x0 = 952, dx = 52, y = 170;
      if (!this._page) {
        const text = P.map(([c]) => c.join('')).join('');
        const page = document.createElement('canvas'); page.width = W; page.height = H;
        const px = page.getContext('2d');
        for (let c = 0; c * per < text.length; c++) strokesInto(px, planColumn(text.slice(c * per, c * per + per), 0, 0.01), x0 - c * dx, y, size, 1e6, INK);
        this._page = page;
      }
      const un = ease(span(s, this.final.at, this.final.at + 5.2));
      const edge = W + 80 - (W + 160) * un;
      // the wash it is written on
      ctx.save();
      ctx.globalAlpha = fA * 0.62;
      const g = ctx.createLinearGradient(edge - 120, 0, edge + 40, 0);
      g.addColorStop(0, 'rgba(236,230,214,0)'); g.addColorStop(1, 'rgba(236,230,214,1)');
      ctx.fillStyle = g;
      ctx.fillRect(Math.max(0, edge - 120), 120, W, 1600);
      ctx.restore();
      const lb = layers[1], bx = lb.getContext('2d');
      bx.clearRect(0, 0, W, H);
      bx.drawImage(this._page, 0, 0);
      bx.globalCompositeOperation = 'destination-in';
      const m = bx.createLinearGradient(edge - 60, 0, edge + 20, 0);
      m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(1, 'rgba(0,0,0,1)');
      bx.fillStyle = m; bx.fillRect(0, 0, W, H);
      bx.globalCompositeOperation = 'source-over';
      ctx.save(); ctx.globalAlpha = fA * 0.95; ctx.filter = 'blur(0.4px)'; ctx.drawImage(lb, 0, 0); ctx.restore();
    },

    // ---------------------------------------------------------------- score
    // Water under everything. A qin in 宫 on G for the voyage and for Su; the
    // 洞箫 in 羽 on E for the guest; war drums for the fleet, cut off at 安在哉;
    // the wind at 悲风; and at dawn, the first birds.
    score(A) {
      const { oc, noise, qin, fan, xiao, pad, drone, ping, rnd, master, conv } = A;
      const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
      const G2 = 43, D3 = 50, E3 = 52, G3 = 55, A3 = 57, B3 = 59, D4 = 62, E4 = 64, G4 = 67, A4 = 69, B4 = 71, D5 = 74, E5 = 76, G5 = 79;
      const walk = (t0, notes) => notes.forEach(([dt, m, v = 0.5, sl = 0]) => qin(t0 + dt, hz(m), v, 4.6, sl));

      // The river: a low wash and the lap of water on the hull, all night.
      const river = noise(0.3, TOTAL, 'lowpass', 380, 0.5, 0.08, 3, 3);
      for (let s = 1; s < TOTAL - 3; s += 0.5) river.g.gain.setValueAtTime(0.06 + 0.03 * Math.sin(s * 0.4) * Math.sin(s * 0.13), s);
      const lap = noise(2, TOTAL, 'bandpass', 620, 2, 0.0001, 0.5, 2, master, -0.2);
      for (let s = 2.5; s < TOTAL - 3; s += 1.7 + rnd() * 1.6) { lap.g.gain.setValueAtTime(0.0001, s); lap.g.gain.linearRampToValueAtTime(0.03, s + 0.05); lap.g.gain.linearRampToValueAtTime(0.0001, s + 0.45); }
      // 悲风 — the wind rising for the guest's last words, and the gentle wind of 清风.
      const wind = noise(1, TOTAL, 'bandpass', 600, 0.6, 0.0001, 1, 3);
      const wv = (s) => 0.018 + 0.08 * Math.max(0, Math.min(1, (s - T[28] + 1) / 3)) * (1 - Math.max(0, Math.min(1, (s - T[29]) / 2.5))) + 0.03 * Math.max(0, Math.min(1, (s - T[36]) / 2)) * (1 - Math.max(0, Math.min(1, (s - E[39]) / 2)));
      for (let s = 1.5; s < TOTAL - 3; s += 0.25) { wind.g.gain.setValueAtTime(wv(s), s); wind.fl.frequency.setValueAtTime(500 + 300 * Math.sin(s * 0.5), s); }

      // The ground: G, and later E for the guest, back to G for the answer.
      drone(0.4, T[11] + 1, hz(G2), 0.022);
      drone(T[11] - 1, T[29] + 2, hz(E3 - 12), 0.022);
      drone(T[29], TOTAL, hz(G2), 0.022);
      pad(1, T[3], [hz(G3), hz(D4), hz(B4)], 0.03);
      pad(T[3] - 1, T[8], [hz(G3), hz(D4), hz(E4), hz(A4)], 0.032);
      pad(T[11] - 1, T[16], [hz(E3), hz(B3), hz(G4)], 0.03);
      pad(T[23], T[29] + 1, [hz(E3), hz(B3), hz(D4)], 0.03);
      pad(T[29], T[40], [hz(G3), hz(D4), hz(B4)], 0.03);
      pad(T[42] - 1, TOTAL, [hz(G3), hz(D4), hz(A4), hz(D5)], 0.036);

      // The voyage: the qin, unhurried.
      walk(1.0, [[0, D4, 0.55], [2.0, G4], [3.4, A4], [5.0, B4, 0.5], [6.4, A4], [7.6, G4, 0.55]]);
      walk(T[0], [[0.2, G3, 0.55], [1.6, D4], [3.0, E4], [4.6, G4], [6.2, E4], [7.6, D4]]);
      walk(T[1], [[0.3, B4, 0.45], [1.8, A4], [3.3, G4, 0.5]]);
      walk(T[2], [[0.2, D4], [1.4, E4], [2.6, G4], [3.8, A4], [5.2, G4, 0.5, 0.94]]);
      // 月出于东山之上 — harmonics, climbing with it.
      [0, 1.4, 2.8, 4.4].forEach((d, i) => fan(T[3] + 0.6 + d, hz([G4, B4, D5, G5][i]), 0.45, 6));
      // 白露横江，水光接天 — wide and still.
      fan(T[4] + 0.5, hz(D5), 0.4, 7);
      walk(T[4] + 1.5, [[0, G3, 0.45], [2.2, D4, 0.4]]);
      // 纵一苇 … 羽化而登仙 — lifting off: rising runs, and harmonics high up.
      walk(T[5], [[0.2, G3], [0.9, A3], [1.6, B3], [2.3, D4], [3.0, E4], [3.7, G4, 0.5]]);
      walk(T[6], [[0.2, D4], [0.9, E4], [1.6, G4], [2.3, A4], [3.0, B4], [3.7, D5, 0.5]]);
      [0.4, 1.6, 2.8, 4.0].forEach((d, i) => fan(T[7] + d, hz([G5, D5, E5, G5][i]), 0.35, 7));
      // 扣舷而歌之 — beating time on the gunwale, and the song.
      const knock = (s, v = 0.22) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(320, s); o.frequency.exponentialRampToValueAtTime(190, s + 0.06);
        const g = oc.createGain(); g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(v, s + 0.003); g.gain.exponentialRampToValueAtTime(0.0003, s + 0.18);
        o.connect(g); g.connect(master); g.connect(conv); o.start(s); o.stop(s + 0.2);
      };
      for (let s = T[8] + 2.2; s < E[10]; s += 0.75) knock(s, ((s - T[8]) / 0.75) % 4 < 1 ? 0.26 : 0.16);
      walk(T[9], [[0.2, G4, 0.55], [0.95, A4], [1.7, B4], [2.45, A4], [3.2, G4], [3.95, E4], [4.7, D4], [5.45, E4], [6.2, G4, 0.55]]);
      walk(T[10], [[0.2, B4, 0.5], [0.95, A4], [1.7, G4], [2.45, E4], [3.2, D4, 0.5, 0.94], [4.7, G3, 0.55]]);
      // 客有吹洞箫者 — the xiao comes in under the song, then has the night to itself.
      xiao(T[11] + 0.6, hz(B4), 1.6, 0.45, 1);
      xiao(T[11] + 2.3, hz(A4), 1.0, 0.4);
      xiao(T[11] + 3.4, hz(G4), 2.2, 0.48, 1);
      // 其声呜呜然，如怨如慕，如泣如诉 — 羽: falling, bending, catching.
      [[0.3, E5, 1.6, 1], [2.0, D5, 0.9], [3.0, B4, 1.8, 1], [4.9, A4, 0.8], [5.8, G4, 1.2, 1]].forEach(([d, m, du, b]) => xiao(T[12] + d, hz(m), du, 0.5, b));
      // 余音袅袅，不绝如缕 — one note, held and held, going thin.
      xiao(T[13] + 0.3, hz(E4), 5.6, 0.42, 1);
      fan(T[13] + 2.4, hz(E5), 0.25, 6);
      // 舞幽壑之潜蛟，泣孤舟之嫠妇 — low and deep, then a sob.
      xiao(T[14] + 0.3, hz(B3), 2.4, 0.5, 1);
      noise(T[14] + 0.5, T[14] + 3.2, 'lowpass', 120, 0.7, 0.05, 1, 1.4);
      xiao(T[14] + 3.2, hz(G4), 0.7, 0.4, 1); xiao(T[14] + 3.9, hz(E4), 2.2, 0.45, 1);
      // 苏子愀然 — nothing, but one string.
      qin(T[15] + 0.4, hz(E3), 0.5, 6);
      // 月明星稀，乌鹊南飞 — the qin quoting, and small wings.
      walk(T[16] + 1, [[0, E4, 0.5], [1.4, G4], [2.8, A4], [4.4, B4, 0.45], [5.8, A4, 0.45]]);
      for (let i = 0; i < 6; i++) noise(T[16] + 2.4 + i * 0.5, T[16] + 2.7 + i * 0.5, 'bandpass', 1600, 3, 0.012, 0.02, 0.25, master, 0.3);
      // 西望夏口 … 郁乎苍苍
      walk(T[17] + 0.5, [[0, E3, 0.55], [1.6, B3], [3.2, D4], [4.8, E4], [6.4, B3, 0.5, 0.94]]);
      qin(T[18] + 0.4, hz(E3), 0.55, 6);
      // The fleet: war drums, coming on.
      const drum = (s, v) => {
        const o = oc.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(92, s); o.frequency.exponentialRampToValueAtTime(48, s + 0.5);
        const g = oc.createGain(); g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(v, s + 0.01); g.gain.exponentialRampToValueAtTime(0.0004, s + 1.1);
        o.connect(g); g.connect(master); g.connect(conv); o.start(s); o.stop(s + 1.2);
        noise(s, s + 0.15, 'lowpass', 600, 0.7, v * 0.4, 0.004, 0.12);
      };
      for (let s = T[19] + 0.5, i = 0; s < T[22] + 1.6; s += 0.6, i++) {
        const v = 0.08 + 0.2 * Math.min(1, (s - T[19]) / (T[20] + 2 - T[19]));
        drum(s, i % 4 === 0 ? v * 1.3 : i % 2 ? v * 0.6 : v);
      }
      noise(T[20], T[22] + 1.6, 'bandpass', 900, 0.5, 0.03, 2, 0.3);
      walk(T[21], [[0.2, E4, 0.55], [1.0, G4], [1.8, A4], [2.6, B4, 0.55]]);
      // 而今安在哉 — and gone. One harmonic, into the reverb.
      fan(T[22] + 2.2, hz(B4), 0.5, 7);
      // 况吾与子 … 渺沧海之一粟 — small things: a few qin notes, far apart.
      walk(T[23] + 0.5, [[0, B3, 0.4], [2.2, D4, 0.4], [4.4, E4, 0.4]]);
      walk(T[24] + 0.5, [[0, G4, 0.4], [2.0, E4, 0.4]]);
      ping(T[25] + 2.6, hz(E5 + 12), 0.04); fan(T[25] + 3.0, hz(E5), 0.3, 6);
      // 哀吾生之须臾，羡长江之无穷
      xiao(T[26] + 0.4, hz(D5), 2.2, 0.4, 1); xiao(T[26] + 2.8, hz(B4), 2.8, 0.42, 1);
      // 挟飞仙以遨游，抱明月而长终
      fan(T[27] + 0.5, hz(E5), 0.35, 6); fan(T[27] + 2.0, hz(B4), 0.35, 6);
      // 托遗响于悲风 — the last of the flute, given to the wind.
      xiao(T[28] + 0.6, hz(E4), 4.2, 0.4, 1);
      // 苏子曰 — the qin again, in G, and steady.
      walk(T[29] + 0.2, [[0, G3, 0.6], [1.4, D4, 0.5], [2.8, G4, 0.55]]);
      walk(T[30], [[0.3, B4], [1.3, A4], [2.3, G4], [3.3, E4], [4.3, D4, 0.5]]);
      walk(T[31], [[0.3, D4], [1.3, E4], [2.3, G4], [3.3, A4], [4.3, G4, 0.5, 0.94]]);
      walk(T[32], [[0.3, G3, 0.55], [1.8, B3], [3.3, D4], [4.8, G4], [6.3, D4]]);
      walk(T[33], [[0.3, A4], [1.6, B4], [2.9, D5, 0.5], [4.4, B4], [5.9, A4], [7.4, G4, 0.55]]);
      walk(T[34], [[0.3, D4, 0.45], [1.8, E4, 0.45], [3.3, D4, 0.45]]);
      walk(T[35], [[0.3, G4, 0.45], [1.8, E4, 0.45], [3.3, D4, 0.45]]);
      // 惟江上之清风，与山间之明月 — harmonics, bright and open.
      [0.4, 1.6, 2.8].forEach((d, i) => fan(T[36] + d, hz([G4, D5, G5][i]), 0.4, 7));
      walk(T[37], [[0.3, B4, 0.45], [1.5, D5, 0.45], [2.7, E5, 0.45], [4.0, D5, 0.45]]);
      walk(T[38], [[0.3, G4, 0.45], [1.5, A4, 0.45], [2.7, B4, 0.45]]);
      walk(T[39], [[0.3, D4, 0.5], [1.6, G4, 0.5], [2.9, B4, 0.5], [4.2, D5, 0.5], [5.8, G4, 0.55]]);
      // 客喜而笑，洗盏更酌 — quick and glad; a cup set down.
      walk(T[40], [[0.2, G4, 0.5], [0.5, A4, 0.4], [0.8, B4, 0.45], [1.4, D5, 0.45], [2.2, B4, 0.4], [2.6, G4, 0.45]]);
      knock(T[40] + 3.3, 0.18); knock(T[41] + 1.0, 0.12); knock(T[41] + 1.4, 0.1);
      // 相与枕藉乎舟中 — the night going over: a long swell, and the first birds of the morning.
      noise(T[42] + 0.8, T[42] + 7.2, 'bandpass', 300, 0.5, 0.05, 3, 3);
      fan(T[42] + 4.6, hz(D5), 0.4, 8); fan(T[42] + 5.4, hz(G5), 0.35, 8);
      for (let i = 0; i < 10; i++) { const s = T[42] + 6 + i * 0.7 + rnd() * 0.4; ping(s, hz(G5 + [0, 2, 4, 7, 9][i % 5] + 12), 0.03, (rnd() - 0.5) * 0.8); }
      // The whole of it: the qin plays the opening again; the seal.
      walk(FIN_AT + 0.4, [[0, D4, 0.55], [1.6, G4], [3.0, A4], [4.6, B4, 0.5], [6.2, A4], [7.6, G4, 0.6]]);
      qin(FIN_AT + 9.4, hz(G3), 0.6, 6);
      fan(FIN_AT + 9.6, hz(G4), 0.4, 6);
    },
  };
  window.__screenplays.chibi._T = T;
  window.__screenplays.chibi._E = E;
})();
