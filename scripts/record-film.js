/**
 * How the clips in public/film/ were made.
 *
 * Paste this into the browser console on `/scene/<id>?film` (a production build
 * is best), after loading mp4-muxer — `npm i --no-save mp4-muxer` and serve
 * build/mp4-muxer.js, or load it from any CDN as a classic script so that
 * `Mp4Muxer` is a global. Then, for example:
 *
 *   __startEnc('shanju', [['kongshan', 3.2], ['zhuxuan', 3.6], ['liandong', 3.6]]);
 *   // ...poll window.__job until it says done; `window.__lastBlob` is the mp4.
 *
 * Film mode (src/three/Film.tsx) renders on request instead of on animation
 * frames, so a recording does not depend on the window being on screen and comes
 * out at exactly 30 fps however long each frame takes. Each shot is a landmark
 * id; the eye cuts to it, walks on at a stroller's pace, and every shot is faded
 * in and out of paper inside the canvas. Frames are downscaled to 960x540 and
 * encoded with WebCodecs (H.264), then muxed into an mp4.
 */
window.__startEnc = async (name, shots, walk = 0.5, upload = null) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const job = (window.__job = { done: false, err: null, frames: 0, total: 0, msg: '', encErr: null });
  try {
    const F = window.__film;
    const canvas = document.querySelector('canvas');
    const W = 960;
    const H = 540;
    const fps = 30;
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const ctx = off.getContext('2d');
    const muxer = new Mp4Muxer.Muxer({
      target: new Mp4Muxer.ArrayBufferTarget(),
      video: { codec: 'avc', width: W, height: H },
      fastStart: 'in-memory',
    });
    const enc = new VideoEncoder({
      output: (c, m) => muxer.addVideoChunk(c, m),
      error: (e) => {
        job.encErr = String(e);
      },
    });
    enc.configure({ codec: 'avc1.4d001f', width: W, height: H, bitrate: 1100000, framerate: fps });

    // The timeline, in frames: cut to a shot and fade up; at its end fade out and hold.
    const ev = [];
    let f = 0;
    F.walk = walk;
    shots.forEach(([id, secs], i) => {
      ev.push([f, 'focus', id], [f, 'fade', 0, 0.9]);
      f += Math.round(secs * fps);
      if (i < shots.length - 1) {
        ev.push([f, 'fade', 1, 0.7]);
        f += Math.round(0.85 * fps);
      }
    });
    ev.push([f, 'fade', 1, 1.0]);
    f += Math.round(1.1 * fps);
    job.total = f;

    // Warm up on paper: compile the shaders, settle the sky.
    F.fadeTo(1, 0.05);
    F.focus(shots[0][0], true);
    for (let i = 0; i < 12; i++) {
      F.step();
      await sleep(0);
    }

    let k = 0;
    for (let i = 0; i < f; i++) {
      while (k < ev.length && ev[k][0] <= i) {
        const e = ev[k++];
        if (e[1] === 'focus') F.focus(e[2], true);
        else F.fadeTo(e[2], e[3]);
      }
      F.step();
      ctx.drawImage(canvas, 0, 0, W, H);
      const vf = new VideoFrame(off, { timestamp: Math.round((i * 1e6) / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: i % 60 === 0 });
      vf.close();
      job.frames = i + 1;
      if (enc.encodeQueueSize > 6) await sleep(4);
      else if (i % 4 === 0) await sleep(0);
      if (job.encErr) throw new Error(job.encErr);
    }
    await enc.flush();
    muxer.finalize();
    const blob = new Blob([muxer.target.buffer], { type: 'video/mp4' });
    window.__lastBlob = blob;
    if (upload) job.msg = await (await fetch(upload + name + '.mp4', { method: 'POST', body: blob })).text();
  } catch (e) {
    job.err = String((e && e.stack) || e);
  }
  job.done = true;
};
