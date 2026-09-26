/* ============================================================
   Moteur : scène 1920×1080, chapitres, pause, fond étoilé
   ============================================================ */
const W = 1920, H = 1080;
const $ = s => document.querySelector(s);
const stage = $('#stage'), host = $('#scenes');
let SCALE = 1;
const SCENES = [];
function scene(def) { SCENES.push(def); }

/* ---------- mise à l'échelle ---------- */
function fit() {
  SCALE = Math.min(innerWidth / W, innerHeight / H);
  stage.style.transform = `scale(${SCALE})`;
  stage.style.left = (innerWidth - W * SCALE) / 2 + 'px';
  stage.style.top = (innerHeight - H * SCALE) / 2 + 'px';
  Stars.resize();
}

/* ---------- icônes (tracés Lucide, trait 1.75) ---------- */
const ICONS = {
  wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
  map: '<path d="M8 3 4 7l4 4"/><path d="M4 7h16"/><path d="m16 21 4-4-4-4"/><path d="M20 17H4"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  search: '<path d="m8 11 2 2 4-4"/><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  user: '<circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/>',
  bot: '<path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/>',
  term: '<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>',
  db: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  loop: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  cloud: '<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/>',
  key: '<circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/>',
  folder: '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  branch: '<line x1="6" x2="6" y1="3" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>',
  activity: '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  hand: '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
  server: '<rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  list: '<path d="M3 12h.01"/><path d="M3 18h.01"/><path d="M3 6h.01"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M8 6h13"/>',
  sliders: '<line x1="4" x2="4" y1="21" y2="14"/><line x1="4" x2="4" y1="10" y2="3"/><line x1="12" x2="12" y1="21" y2="12"/><line x1="12" x2="12" y1="8" y2="3"/><line x1="20" x2="20" y1="21" y2="16"/><line x1="20" x2="20" y1="12" y2="3"/><line x1="2" x2="6" y1="14" y2="14"/><line x1="10" x2="14" y1="8" y2="8"/><line x1="18" x2="22" y1="16" y2="16"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20"/>',
  wand: '<path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72"/><path d="m14 7 3 3"/>',
  quote: '<path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/><path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z"/>',
  gauge: '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  expand: '<path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/>',
};
const ic = (n, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24">${ICONS[n] || ''}</svg>`;

/* ============================================================
   Fond : constellation d'étoiles (canvas 2D)
   Étoile = carré moins un cercle à chaque coin ; posées bord à bord,
   les vides entre quatre étoiles se lisent comme des cercles.
   ============================================================ */
const Stars = (() => {
  const cv = $('#stars'), ctx = cv.getContext('2d');
  const S = 120, COLS = Math.ceil(W / S), ROWS = Math.ceil(H / S);
  const X0 = W - COLS * S;
  const cells = [];
  const rnd = (i, j, k) => { const v = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    cells.push({ i, j, x: X0 + i * S, y: j * S, a: 0, t: 0, due: 0, next: 0, ph: rnd(i, j, 3) * 6.28, sp: .6 + rnd(i, j, 4) * .9, n: rnd(i, j, 1), hi: false });
  }
  const clamp = v => Math.max(0, Math.min(1, v));
  const q = v => v < .14 ? 0 : Math.round(v * 8) / 8;           // paliers d'intensité
  const FIELDS = {
    none: () => 0,
    cover: c => { const nx = (c.x + S / 2 - 1020) / 900, ny = (c.y + S / 2) / H; return q(clamp(nx * 1.25 - .18 - Math.abs(ny - .5) * .75 + (c.n - .5) * .5)); },
    section: c => { const nx = (c.x + S / 2 - 1180) / 740, ny = (c.y + S / 2) / H; return q(clamp(nx * 1.1 - .12 - Math.abs(ny - .62) * .9 + (c.n - .5) * .55)); },
    content: c => { const nx = (c.x + S / 2 - 1560) / 360, ny = (c.y + S / 2) / 260; return (c.y < 240 && c.x >= 1560) ? q(clamp(nx * .9 - ny * .45 + (c.n - .5) * .45) * .7) : 0; },
    diagram: () => 0,
  };
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const COL = { base: css('--mid-500'), hi: css('--accent2-500') };   // couleurs du décor = palette
  const HI = { cover: [14, 4], section: [15, 5], content: [15, 0] };
  let origin = [0, 0], mode = 'none', dpr = 1, t0 = performance.now(), paused = false;
  function resize() {
    dpr = Math.min(2, Math.max(1, SCALE * (window.devicePixelRatio || 1)));
    cv.width = W * dpr; cv.height = H * dpr;
  }
  function set(m, from) {
    if (m === mode) return;
    mode = m; origin = from || [0, 0];
    const f = FIELDS[m] || FIELDS.none, now = performance.now();
    const mm = HI[m];
    cells.forEach(c => {
      c.next = f(c);
      c.hi = !!(mm && c.i === mm[0] && c.j === mm[1] && c.next > 0);
      const d = Math.hypot(c.x - origin[0], c.y - origin[1]);
      c.due = now + d * .75;                                   // onde de propagation
    });
  }
  function star(x, y, s) {
    const r = s / 2;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arc(x + s, y, r, Math.PI, Math.PI / 2, true);
    ctx.arc(x + s, y + s, r, -Math.PI / 2, -Math.PI, true);
    ctx.arc(x, y + s, r, 0, -Math.PI / 2, true);
    ctx.arc(x, y, r, Math.PI / 2, 0, true);
    ctx.closePath(); ctx.fill();
  }
  function frame(now) {
    const t = (now - t0) / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (const c of cells) {
      if (now >= c.due) c.t = c.next;
      c.a += (c.t - c.a) * .07;
      if (c.a < .004) continue;
      const tw = .8 + .2 * Math.sin(t * c.sp + c.ph);
      ctx.globalAlpha = Math.min(1, c.a * tw * (c.hi ? 1 : .55));
      ctx.fillStyle = c.hi ? COL.hi : COL.base;
      const inset = (1 - Math.min(1, c.a * 1.6)) * 18;
      star(c.x + inset, c.y + inset, S - inset * 2);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  return { resize, set, start: () => requestAnimationFrame(frame) };
})();

/* ---------- disque + logo, par type de mise en page ---------- */
const LAYOUTS = {
  none:    { disc: [150, -300, 10],   logo: [60, -220, 300, 0] },
  cover:   { disc: [150, 90, 300],    logo: [36, 72, 300, 1], stars: [150, 90] },
  section: { disc: [1780, 70, 210],   logo: [1668, 40, 200, 1], stars: [1780, 70] },
  content: { disc: [1880, 1060, 128], logo: [1786, 978, 108, 1], stars: [1880, 1060] },
  diagram: { disc: [1880, 1060, 128], logo: [1786, 978, 108, 1], stars: [1880, 1060] },
};
let layoutNow = null;
function setLayout(name, instant) {
  if (name === layoutNow) return;
  const L = LAYOUTS[name], d = L.disc, g = L.logo;
  const dur = instant ? 0 : 1.3;
  gsap.to('#disc', { left: d[0] - d[2], top: d[1] - d[2], width: d[2] * 2, height: d[2] * 2, duration: dur, ease: 'expo.inOut', overwrite: true });
  gsap.to('#logo', { left: g[0], top: g[1], width: g[2], opacity: g[3], duration: dur, ease: 'expo.inOut', overwrite: true, delay: instant ? 0 : .1 });
  Stars.set(name, L.stars);
  layoutNow = name;
}

/* ============================================================
   Aides d'animation
   ============================================================ */
const EO = 'power3.out', EIO = 'power2.inOut';
const arr = x => !x ? [] : (x.length !== undefined && typeof x !== 'string') ? [...x] : [x];

function splitWords(root) {
  root.querySelectorAll('[data-split]').forEach(el => {
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(tok => {
            if (!tok) return;
            if (/^\s+$/.test(tok)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span'); w.className = 'w';
            const s = document.createElement('span'); s.textContent = tok; w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('w')) walk(n);
      });
    };
    walk(el);
  });
  root.querySelectorAll('[data-type]').forEach(el => { el.dataset.full = el.textContent; el.textContent = ''; });
}

function mk(ctx) {
  const root = ctx.root;
  const Q = s => typeof s === 'string' ? [...root.querySelectorAll(s)] : arr(s);
  const A = {
    Q,
    /* apparition montante */
    rise(tl, s, pos, o = {}) { const e = Q(s); if (!e.length) return tl; return tl.fromTo(e, { autoAlpha: 0, y: o.y ?? 34, x: o.x ?? 0, scale: o.s ?? 1 }, { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: o.d ?? .85, ease: o.ease ?? EO, stagger: o.st ?? .1 }, pos); },
    fade(tl, s, pos, o = {}) { const e = Q(s); if (!e.length) return tl; return tl.fromTo(e, { autoAlpha: 0 }, { autoAlpha: 1, duration: o.d ?? .6, ease: 'none', stagger: o.st ?? .08 }, pos); },
    pop(tl, s, pos, o = {}) { const e = Q(s); if (!e.length) return tl; return tl.fromTo(e, { autoAlpha: 0, scale: o.from ?? .6 }, { autoAlpha: 1, scale: 1, duration: o.d ?? .7, ease: o.ease ?? 'back.out(1.8)', stagger: o.st ?? .08 }, pos); },
    slide(tl, s, pos, o = {}) { return A.rise(tl, s, pos, { y: 0, x: o.x ?? -60, d: o.d, st: o.st, ease: o.ease }); },
    wipe(tl, s, pos, o = {}) { const e = Q(s); if (!e.length) return tl; const from = { l: 'inset(0 100% 0 0 round 18px)', t: 'inset(0 0 100% 0 round 18px)', r: 'inset(0 0 0 100% round 18px)' }[o.dir || 'l']; return tl.fromTo(e, { autoAlpha: 1, clipPath: from }, { clipPath: 'inset(0 0% 0 0% round 18px)', duration: o.d ?? 1.1, ease: o.ease ?? 'expo.inOut', stagger: o.st ?? .1 }, pos); },
    words(tl, s, pos, o = {}) {
      const e = Q(s); if (!e.length) return tl;
      tl.set(e, { autoAlpha: 1 }, pos);
      e.forEach((el, k) => tl.fromTo(el.querySelectorAll('.w>span'), { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: 0, duration: o.d ?? .95, ease: 'expo.out', stagger: o.st ?? .045 }, k ? '<0.1' : (pos === undefined ? '<' : pos)));
      return tl;
    },
    head(tl, pos) {
      const eb = Q('.eyebrow'), ti = Q('.title');
      if (eb.length) tl.fromTo(eb, { autoAlpha: 0, letterSpacing: '.5em', x: -10 }, { autoAlpha: 1, letterSpacing: '.14em', x: 0, duration: 1.1, ease: 'expo.out' }, pos);
      A.words(tl, ti, eb.length ? '<0.1' : pos);
      return tl;
    },
    draw(tl, s, pos, o = {}) {
      const e = Q(s); if (!e.length) return tl;
      e.forEach(p => { const L = p.getTotalLength(); p.style.strokeDasharray = p.dataset.dash || `${L} ${L}`; p.dataset.len = L; });
      tl.set(e, { autoAlpha: 1 }, pos);
      e.forEach((p, k) => {
        const L = +p.dataset.len;
        if (p.dataset.dash) { tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: o.d ?? .7, ease: 'none' }, k ? `<${o.st ?? 0.12}` : '<'); }
        else tl.fromTo(p, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: o.d ?? .7, ease: o.ease ?? 'power2.inOut' }, k ? `<${o.st ?? 0.12}` : '<');
        if (p.dataset.m) tl.set(p, { attr: { 'marker-end': `url(#${p.dataset.m})` } });
      });
      return tl;
    },
    type(tl, s, pos, o = {}) {
      const e = Q(s); if (!e.length) return tl;
      e.forEach((el, k) => {
        const full = el.dataset.full || '', st = { n: 0 };
        tl.set(el, { autoAlpha: 1 }, k ? '>' : pos);
        tl.call(() => el.classList.add('caret'));
        tl.to(st, { n: full.length, duration: Math.max(.3, full.length * (o.cps ?? .035)), ease: 'none', onUpdate: () => { el.textContent = full.slice(0, Math.round(st.n)); } });
        tl.call(() => { if (k < e.length - 1 || !o.keep) el.classList.remove('caret'); el.textContent = full; });
        if (o.gap) tl.to({}, { duration: o.gap });
      });
      return tl;
    },
    count(tl, s, pos, o = {}) {
      Q(s).forEach(el => { const to = +el.dataset.to, st = { v: 0 }; tl.set(el, { autoAlpha: 1 }, pos); tl.to(st, { v: to, duration: o.d ?? 1.2, ease: 'power2.out', onUpdate: () => { el.textContent = String(Math.round(st.v)).padStart(o.pad ?? 1, '0'); } }, '<'); });
      return tl;
    },
    /* particules le long d'un tracé SVG, en boucle (ambiance) */
    flow(pathSel, o = {}) {
      Q(pathSel).forEach((p, pi) => {
        const L = p.getTotalLength(), n = o.n ?? 2;
        for (let k = 0; k < n; k++) {
          const d = document.createElement('div'); d.className = 'dot';
          if (o.color) { d.style.background = o.color; d.style.boxShadow = `0 0 0 6px ${o.glow || 'rgba(var(--accent-rgb),.18)'}`; }
          (o.parent ? root.querySelector(o.parent) : p.closest('.scene')).prepend(d);
          const svg = p.ownerSVGElement, bx = parseFloat(svg.style.left) || 0, by = parseFloat(svg.style.top) || 0;
          const st = { t: 0 };
          gsap.set(d, { autoAlpha: 0 });
          ctx.loop(gsap.to(st, {
            t: 1, duration: o.d ?? 2.2, ease: 'none', repeat: -1, delay: (o.delay ?? 0) + k * (o.d ?? 2.2) / n + pi * .15,
            onUpdate: () => { const pt = p.getPointAtLength(st.t * L); gsap.set(d, { x: pt.x + bx, y: pt.y + by, autoAlpha: st.t < .08 ? st.t / .08 : st.t > .92 ? (1 - st.t) / .08 : 1 }); }
          }));
        }
      });
    },
    /* agrandissement d'une capture en plein écran */
    zoom(tl, shotSel, pos, o = {}) {
      const shot = Q(shotSel)[0]; if (!shot) return tl;
      const img = shot.querySelector('img');
      const r0 = { l: shot.offsetLeft + (shot.offsetParent === root ? 0 : shot.offsetParent.offsetLeft), t: shot.offsetTop + (shot.offsetParent === root ? 0 : shot.offsetParent.offsetTop), w: shot.offsetWidth, h: shot.offsetHeight };
      const ar = o.ar || (img.naturalWidth / img.naturalHeight) || 1.8, maxW = o.maxW ?? 1720, maxH = o.maxH ?? 960;
      let w = maxW, h = w / ar + 40; if (h > maxH) { h = maxH; w = (h - 40) * ar; }
      const veil = document.createElement('div'); veil.className = 'veil'; root.appendChild(veil);
      const z = shot.cloneNode(true); z.classList.add('zoom'); z.classList.remove('h'); root.appendChild(z);
      gsap.set(z, { left: r0.l, top: r0.t, width: r0.w, height: r0.h, autoAlpha: 0, clipPath: 'none' });
      gsap.set(veil, { autoAlpha: 0 });
      tl.to(veil, { autoAlpha: 1, duration: .6, ease: 'none' }, pos)
        .set(z, { autoAlpha: 1 }, '<')
        .to(z, { left: (W - w) / 2, top: (H - h) / 2 + 10, width: w, height: h, duration: 1.2, ease: 'expo.inOut' }, '<');
      ctx.loop(gsap.fromTo(z.querySelector('img'), { scale: 1 }, { scale: 1.035, transformOrigin: '50% 30%', duration: 6, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.6 }));
      return tl;
    },
  };
  return A;
}

/* ============================================================
   Machine à chapitres
   ============================================================ */
const STEPS = [];
let cur = -1, curScene = -1, root = null, tl = null, status = 'idle', loops = [];

function flatten() { SCENES.forEach((s, si) => s.steps.forEach((_, k) => STEPS.push({ si, k }))); }

function buildScene(si) {
  const el = document.createElement('div');
  el.className = 'scene';
  el.innerHTML = SCENES[si].html;
  splitWords(el);
  host.appendChild(el);
  return el;
}
function killLoops() { loops.forEach(t => t.kill()); loops = []; }
function context(el) { const ctx = { root: el, loop: t => (loops.push(t), t) }; ctx.A = mk(ctx); return ctx; }

function play(i) {
  if (i < 0) i = 0;
  if (i >= STEPS.length) return;
  const { si, k } = STEPS[i];
  const prev = cur >= 0 ? STEPS[cur] : null;
  const incremental = prev && si === curScene && k === prev.k + 1 && root;

  if (incremental) {
    if (tl) { tl.progress(1, false); tl.kill(); }
  } else {
    if (tl) tl.kill();
    killLoops();
    const old = root;
    const changing = si !== curScene;
    if (old) {
      if (changing) {
        gsap.to(old, { autoAlpha: 0, y: -24, duration: .5, ease: 'power2.in', onComplete: () => old.remove() });
      } else old.remove();
    }
    root = buildScene(si);
    curScene = si;
    const ctx0 = context(root);
    for (let j = 0; j < k; j++) { const t = gsap.timeline(); SCENES[si].steps[j](t, ctx0.A, ctx0); t.progress(1, false); t.kill(); }
    setLayout(SCENES[si].layout || 'content');
    root._ctx = ctx0;
    root._delay = changing && old ? .45 : (changing ? .2 : 0);
  }
  cur = i;
  const ctx = root._ctx;
  tl = gsap.timeline({ paused: true, onComplete: () => setStatus('done') });
  if (root._delay) { tl.to({}, { duration: root._delay }); root._delay = 0; }
  SCENES[si].steps[k](tl, ctx.A, ctx);
  loops.forEach(t => t.paused() && status === 'paused' && t.resume());
  setStatus('playing');
  tl.play();
  updateInfo();
}
function pause() { if (status !== 'playing') return; tl && tl.pause(); loops.forEach(t => t.pause()); setStatus('paused'); }
function resume() { if (status !== 'paused') return; tl && tl.resume(); loops.forEach(t => t.resume()); setStatus('playing'); }
function next() {
  if (status === 'idle') return start();
  if (cur < STEPS.length - 1) play(cur + 1);
  else if (tl && status !== 'done') { tl.progress(1, false); }
}
function prev() { if (status === 'idle') return; play(cur - 1); }
function home() { if (status === 'idle') return start(); play(0); }
function toggle() {
  if (status === 'idle') start();
  else if (status === 'playing') pause();
  else if (status === 'paused') resume();
  else next();
}
function start() { gsap.to('#hint', { autoAlpha: 0, duration: .4, overwrite: true }); play(0); }

/* ---------- HUD ---------- */
const bPlay = $('#bPlay'), info = $('#info'), prog = $('#prog');
const IC_PLAY = '<svg class="ic" viewBox="0 0 24 24"><polygon points="6 3 20 12 6 21 6 3"/></svg>';
const IC_PAUSE = '<svg class="ic" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
const IC_NEXT = '<svg class="ic" viewBox="0 0 24 24"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>';
function setStatus(s) {
  status = s;
  bPlay.innerHTML = s === 'playing' ? IC_PAUSE : s === 'done' ? IC_NEXT : IC_PLAY;
  bPlay.classList.toggle('ready', s === 'done' && cur < STEPS.length - 1);
  bPlay.title = s === 'playing' ? 'Pause (Espace)' : s === 'paused' ? 'Reprendre (Espace)' : 'Chapitre suivant (Espace)';
}
function updateInfo() {
  const s = SCENES[curScene];
  info.innerHTML = `<b>${String(cur + 1).padStart(2, '0')}</b> / ${STEPS.length} · ${s.name || ''}`;
}
gsap.ticker.add(() => {
  if (cur < 0) { prog.style.width = '0'; return; }
  const p = (cur + (tl ? tl.progress() : 0)) / STEPS.length;
  prog.style.width = (p * 100).toFixed(2) + '%';
});
let idleT;
function wake() {
  $('#hud').classList.remove('hide'); prog.style.opacity = 1; document.body.classList.remove('nocursor');
  clearTimeout(idleT);
  idleT = setTimeout(() => { if (!$('#hud').matches(':hover')) { $('#hud').classList.add('hide'); prog.style.opacity = .5; document.body.classList.add('nocursor'); } }, 2600);
}
function fullscreen() { if (!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }

function boot() {
  flatten();
  fit(); addEventListener('resize', fit);
  Stars.start();
  setLayout('none', true);
  setTimeout(() => Stars.set('cover', [150, 90]), 300);
  gsap.fromTo('#hint', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1, delay: .6 });
  $('#bHome').onclick = () => { home(); $('#bHome').blur(); };
  $('#bPrev').onclick = () => { prev(); $('#bPrev').blur(); };
  $('#bPlay').onclick = () => { toggle(); $('#bPlay').blur(); };
  $('#bNext').onclick = () => { next(); $('#bNext').blur(); };
  $('#bFs').onclick = () => { fullscreen(); $('#bFs').blur(); };
  addEventListener('keydown', e => {
    if (e.repeat && e.key === ' ') return;
    switch (e.key) {
      case 'ArrowRight': case 'PageDown': e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp': e.preventDefault(); prev(); break;
      case ' ': case 'Spacebar': e.preventDefault(); toggle(); break;
      case 'Home': e.preventDefault(); home(); break;
      case 'f': case 'F': fullscreen(); break;
      default: return;
    }
    wake();
  });
  addEventListener('mousemove', wake);
  /* molette : bas = suivant, haut = précédent (anti-rafale pour pavés tactiles et molettes libres) */
  let wheelAcc = 0, wheelLast = 0, wheelLock = 0;
  addEventListener('wheel', e => {
    e.preventDefault();
    const now = performance.now();
    if (now - wheelLast > 250) wheelAcc = 0;
    wheelLast = now;
    if (now < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 40) return;
    if (wheelAcc > 0) next(); else prev();
    wheelAcc = 0; wheelLock = now + 700; wake();
  }, { passive: false });
  /* clic gauche hors barre d'icônes = Espace */
  addEventListener('click', e => { if (e.button !== 0 || e.target.closest('#hud')) return; toggle(); wake(); });
  setStatus('idle'); info.innerHTML = `<b>00</b> / ${STEPS.length} · prêt`;
  wake();
  window.__deck = { play, next, prev, pause, resume, STEPS, SCENES, get status() { return status; }, get cur() { return cur; }, get tl() { return tl; } };
}
