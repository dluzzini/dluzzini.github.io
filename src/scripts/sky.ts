// The dark "sky" behind every page: a faint drifting field that brightens and links up near the cursor,
// sparks that trail the pointer, and, on the home hero only, a swarm that morphs:
// linear supply chain -> circular -> within planetary limits. Respects prefers-reduced-motion.
export function startSky() {
  const cv = document.getElementById('sky') as HTMLCanvasElement | null;
  if (!cv) return;
  const ctx = cv.getContext('2d')!;
  const hero = document.getElementById('hero');
  const phaseEl = document.getElementById('phase');
  const home = !!hero;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  type P = { x: number; y: number; vx: number; vy: number; a: number; s: number; tw: number; tint: string };
  type S = { x: number; y: number; k: number; gx: number; gy: number; transit: boolean; u: number; ra: number; rr: number; da: number; dq: number; sz: number; tint: string; tw: number; lag: number };
  let W = 0, H = 0, field: P[] = [], swarm: S[] = [], lastPhase = -1;
  const sparks: { x: number; y: number; vx: number; vy: number; life: number; s: number; tint: string }[] = [];
  const m = { x: -9999, y: -9999, on: false, lx: 0, ly: 0 };
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;
  const tints = ['255,255,255', '255,160,222', '255,214,170', '175,205,255'];

  function build() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight;
    cv!.width = W * dpr; cv!.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed = 11; field = [];
    const nf = Math.round(W * H / 6500);
    for (let i = 0; i < nf; i++) field.push({ x: rnd() * W, y: rnd() * H, vx: (rnd() - 0.5) * 0.06, vy: (rnd() - 0.5) * 0.06, a: 0.1 + rnd() * 0.22, s: 0.6 + rnd() * 0.9, tw: rnd() * 6.283, tint: tints[(rnd() * tints.length) | 0] });
    const n = W < 700 ? 420 : 760;
    if (home && swarm.length !== n) {
      swarm = [];
      for (let i = 0; i < n; i++) swarm.push({ x: rnd() * W, y: rnd() * H, k: i % 5, gx: gauss(), gy: gauss(), transit: i % 6 === 0, u: rnd(), ra: rnd() * 6.283, rr: 0.78 * (1 + gauss() * 0.035), da: rnd() * 6.283, dq: rnd(), sz: rnd() < 0.08 ? 1.5 + rnd() * 1.5 : 0.6 + rnd() * 0.9, tint: tints[(rnd() * tints.length) | 0], tw: rnd() * 6.283, lag: 0.02 + rnd() * 0.035 });
    }
  }
  addEventListener('pointermove', e => {
    m.x = e.clientX; m.y = e.clientY; m.on = true;
    if (!reduce && Math.hypot(m.x - m.lx, m.y - m.ly) > 14 && sparks.length < 70) {
      m.lx = m.x; m.ly = m.y;
      sparks.push({ x: m.x + (rnd() - 0.5) * 22, y: m.y + (rnd() - 0.5) * 22, vx: (rnd() - 0.5) * 0.35, vy: (rnd() - 0.5) * 0.35 - 0.12, life: 1, s: 0.8 + rnd() * 1.4, tint: tints[(rnd() * tints.length) | 0] });
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { m.on = false; m.x = m.y = -9999; });

  function dot(x: number, y: number, r: number, tint: string, al: number) {
    ctx.fillStyle = `rgba(${tint},${al})`;
    if (r < 1.2) { ctx.fillRect(x - r / 2, y - r / 2, r, r); return; }
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    ctx.fillStyle = `rgba(${tint},${al * 0.12})`; ctx.beginPath(); ctx.arc(x, y, r * 3.2, 0, 6.283); ctx.fill();
  }
  function draw(t: number) {
    ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#070b0a'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';
    const live = m.on && !reduce;
    const near: { x: number; y: number; g: number }[] = [];
    for (const p of field) {
      if (!reduce) { p.x += p.vx; p.y += p.vy; if (p.x < -5) p.x = W + 5; if (p.x > W + 5) p.x = -5; if (p.y < -5) p.y = H + 5; if (p.y > H + 5) p.y = -5; }
      let x = p.x, y = p.y, g = 0;
      if (live) { const d = Math.hypot(x - m.x, y - m.y); if (d < 170) { g = 1 - d / 170; x += (m.x - x) * g * 0.18; y += (m.y - y) * g * 0.18; if (g > 0.2) near.push({ x, y, g }); } }
      dot(x, y, p.s * (1 + g * 1.2), p.tint, Math.min(1, p.a * (0.7 + 0.3 * Math.sin(t * 1.1 + p.tw)) + g * 0.7));
    }
    if (near.length > 1) {
      ctx.lineWidth = 0.8;
      near.forEach((a, i) => {
        let best: typeof a | null = null, bd = 1e9;
        near.forEach((b, j) => { if (i === j) return; const d = (a.x - b.x) ** 2 + (a.y - b.y) ** 2; if (d < bd) { bd = d; best = b; } });
        if (best) { const b = best as typeof a; ctx.strokeStyle = `rgba(255,111,207,${Math.min(a.g, b.g) * 0.4})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      });
    }
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.life -= 0.012;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      dot(s.x, s.y, s.s * (0.6 + s.life * 0.6), s.tint, s.life * 0.85);
    }
    if (home && hero) {
      const r = hero.getBoundingClientRect(), narrow = W < 960;
      if (r.bottom > -200) {
        const cx = narrow ? r.left + r.width / 2 : r.left + r.width * 0.79, cy = narrow ? r.top + 175 : r.top + r.height * 0.5;
        const R = narrow ? Math.min(W * 0.34, 135) : Math.min(r.height * 0.33, r.width * 0.14);
        const span = Math.min(R * 1.6, narrow ? W * 0.42 : r.width * 0.16), lx0 = cx - span, lx1 = cx + span, r0 = R * 0.56;
        const ph = reduce ? 2 : Math.floor(t / 7) % 3;
        if (ph !== lastPhase) { lastPhase = ph; if (phaseEl) phaseEl.textContent = ['Linear supply chain', 'Circular supply chain', 'Within planetary limits'][ph]; }
        if (ph === 2) { ctx.globalCompositeOperation = 'source-over'; ctx.strokeStyle = 'rgba(255,160,222,0.13)'; ctx.lineWidth = 1; [r0, R].forEach(rr => { ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.stroke(); }); ctx.globalCompositeOperation = 'lighter'; }
        const rot = t * 0.05;
        for (const p of swarm) {
          let tx: number, ty: number;
          if (ph === 0) { tx = p.transit ? lx0 + ((p.u + t * 0.03) % 1) * (lx1 - lx0) : lx0 + (lx1 - lx0) * p.k / 4 + p.gx * R * 0.08; ty = cy + p.gy * R * 0.08; }
          else if (ph === 1) { tx = cx + Math.cos(p.ra + rot) * p.rr * R; ty = cy + Math.sin(p.ra + rot) * p.rr * R; }
          else { const dr = Math.sqrt(r0 * r0 + p.dq * (R * R - r0 * r0)); tx = cx + Math.cos(p.da + rot * 0.6) * dr; ty = cy + Math.sin(p.da + rot * 0.6) * dr; }
          if (reduce) { p.x = tx; p.y = ty; } else { p.x += (tx - p.x) * p.lag; p.y += (ty - p.y) * p.lag; }
          let ox = 0, oy = 0, g = 0;
          if (live) { const dx = p.x - m.x, dy = p.y - m.y, d = Math.hypot(dx, dy); if (d < 90) { g = 1 - d / 90; ox = dx / (d || 1) * g * 18; oy = dy / (d || 1) * g * 18; } }
          const al = Math.min(1, 0.35 + 0.5 * (0.55 + 0.45 * Math.sin(t * 1.3 + p.tw)) + g * 0.5);
          dot(p.x + ox, p.y + oy, p.sz * (1 + g * 0.8), p.tint, al);
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }
  const still = () => draw(0);
  build();
  addEventListener('resize', () => { build(); if (reduce) still(); });
  if (reduce) { addEventListener('scroll', still, { passive: true }); still(); }
  else {
    let on = true;
    document.addEventListener('visibilitychange', () => { on = !document.hidden; if (on) requestAnimationFrame(loop); });
    const loop = (ts: number) => { if (!on) return; draw(ts / 1000); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}
