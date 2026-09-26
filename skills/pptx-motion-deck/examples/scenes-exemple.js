const hd = (eb, title) => `<div class="eyebrow h">${eb}</div><div class="title h" data-split>${title}</div>`;
const shotHTML = (cls, img, label, style) => `<div class="shot h ${cls}" style="${style}"><div class="bar"><i></i><i></i><i></i><span>${label}</span></div><div class="vp"><img src="${img}" alt=""></div></div>`;
const marchDash = (ctx, sel, speed = 1) => ctx.A.Q(sel).forEach(p => ctx.loop(gsap.fromTo(p, { strokeDashoffset: 0 }, { strokeDashoffset: -24, duration: .8 / speed, ease: 'none', repeat: -1 })));

/* ---------- 00 · Couverture ---------- */
scene({
  name: 'Couverture', layout: 'cover',
  html: `
  <div class="abs h cv-t d" data-split style="left:132px;top:520px;width:1180px;font-size:100px;line-height:1.04;letter-spacing:-.025em;color:var(--ink-900)">Boomi : utilisation de l’IA dans la plateforme</div>
  <div class="abs h cv-r" style="left:132px;top:768px;width:620px;height:2px;background:rgba(var(--ink-rgb),.18);transform-origin:0 50%"></div>
  <div class="abs h cv-s" style="left:132px;top:796px;font:400 32px/1.3 var(--fb);color:var(--mid-500)">Ce que Boomi propose <span style="color:var(--accent-600)">/</span> ce que nous avons construit</div>
  <div class="abs h cv-d lbl" style="left:132px;top:870px;font-size:20px">Septembre 2026</div>
  <div class="abs h cv-c" style="left:132px;top:1012px;font:400 17px/1 var(--fb);color:var(--mid-400)">© 2026</div>`,
  steps: [
    (tl, A) => {
      tl.to({}, { duration: .5 });
      A.words(tl, '.cv-t', '>', { st: .06, d: 1.1 });
      tl.fromTo(A.Q('.cv-r'), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 1.1, ease: 'expo.inOut' }, '-=0.6');
      A.rise(tl, '.cv-s', '-=0.7', { y: 20 });
      A.rise(tl, '.cv-d, .cv-c', '-=0.5', { y: 12, st: .15 });
    },
  ],
});

/* ---------- Sections ---------- */
function sectionScene(n, eb, title, sub) {
  scene({
    name: `${n} · ${title}`, layout: 'section',
    html: `
    <div class="abs h sx-n d" style="left:70px;top:-20px;font-size:520px;line-height:1;letter-spacing:-.06em;color:var(--mid-500);opacity:.12">${n}</div>
    <div class="abs h sx-e lbl" style="left:132px;top:500px;font-size:26px">${eb}</div>
    <div class="abs h sx-t d" data-split style="left:132px;top:548px;font-size:124px;line-height:1.02;letter-spacing:-.03em;color:var(--ink-900);white-space:nowrap">${title}</div>
    <div class="abs h sx-r" style="left:132px;top:720px;width:520px;height:2px;background:rgba(var(--ink-rgb),.18);transform-origin:0 50%"></div>
    <div class="abs h sx-s" style="left:132px;top:752px;font:400 34px/1.35 var(--fb);color:var(--mid-500)">${sub}</div>`,
    steps: [(tl, A) => {
      tl.fromTo(A.Q('.sx-n'), { autoAlpha: 0, x: -140 }, { autoAlpha: .12, x: 0, duration: 1.6, ease: 'expo.out' });
      tl.fromTo(A.Q('.sx-e'), { autoAlpha: 0, letterSpacing: '.6em' }, { autoAlpha: 1, letterSpacing: '.14em', duration: 1.2, ease: 'expo.out' }, '-=1.2');
      A.words(tl, '.sx-t', '-=1', { st: .07, d: 1.1 });
      tl.fromTo(A.Q('.sx-r'), { autoAlpha: 1, scaleX: 0 }, { scaleX: 1, duration: 1, ease: 'expo.inOut' }, '-=0.7');
      A.rise(tl, '.sx-s', '-=0.6', { y: 18 });
    }],
  });
}
sectionScene('01', '01 · Partie', 'Titre de la partie', 'Sous-titre de la partie');

/* ---------- Boomi GPT ---------- */
const CAPS = [['wrench', 'Construire', 'Générer un process depuis une description'], ['map', 'Mapper', 'Suggérer les mappings entre deux profils'], ['file', 'Documenter', 'Décrire un process, existant ou nouveau'], ['search', 'Diagnostiquer', 'Analyser une erreur, vérifier un process']];
scene({
  name: "L'assistant IA de Boomi", layout: 'content',
  html: hd('Boomi GPT', "L'assistant IA de Boomi") + `<div class="c">
    <div class="abs h g-in" style="left:0;top:0;width:720px;font:400 27px/1.5 var(--fb);color:var(--ink-800)">Un assistant conversationnel intégré à la plateforme. On lui décrit un besoin, il fait appel aux <b style="font-weight:600;color:var(--accent-700)">agents spécialisés</b> pour y répondre.</div>
    ${CAPS.map((c, i) => `<div class="card h g-cap" style="left:0;top:${176 + i * 112}px;width:720px;height:96px;display:flex;align-items:center;gap:22px;padding:0 26px">
      <div class="idisc">${ic(c[0])}</div><div><div class="d" style="font-size:28px">${c[1]}</div><div class="p s" style="margin-top:2px">${c[2]}</div></div></div>`).join('')}
    <div class="abs h g-note" style="left:0;top:640px;display:flex;align-items:center;gap:12px"><span class="tag accent2">${ic('check')} Inclus</span><span class="p" style="font-size:20px">Dans la licence Boomi, sans projet ni surcoût.</span></div>
    ${shotHTML('g-shot', IMG.gpt, 'Boomi GPT', 'left:800px;top:40px;width:856px')}
  </div>`,
  steps: [
    (tl, A) => { A.head(tl); A.rise(tl, '.g-in', '-=0.6'); A.wipe(tl, '.g-shot', '-=0.7', { dir: 'l', d: 1.3 }); tl.fromTo(A.Q('.g-shot img'), { scale: 1.12 }, { scale: 1, duration: 1.8, ease: 'expo.out' }, '<'); },
    (tl, A) => { A.rise(tl, '.g-cap', undefined, { x: -40, y: 0, st: .14 }); A.pop(tl, '.g-cap .idisc', '<0.15', { st: .14 }); A.rise(tl, '.g-note', '-=0.3', { y: 14 }); },
    (tl, A) => { A.zoom(tl, '.g-shot', undefined, { ar: 1177 / 647 }); },
  ],
});

/* ---------- Le principe ---------- */
const colCard = (cls, x, w, lab, title, items, dark, mono) => `<div class="card ${dark ? 'dark' : ''} pad h ${cls}" style="left:${x}px;top:0;width:${w}px;height:320px">
  <div class="lbl ${dark ? 'on-dark' : ''}">${lab}</div>
  <div class="${mono ? 'mono' : 'd'}" style="font-size:${mono ? 26 : 34}px;${mono ? 'font-weight:600;color:var(--accent-400);' : ''}margin-top:10px;line-height:1.15">${title}</div>
  <div style="margin-top:22px">${items.map(t => `<div class="li ${cls}-i" style="margin-top:12px;${dark ? 'color:var(--paper-100)' : ''}">${ic(dark ? 'check' : 'arrow').replace('class="ic ', `style="color:${dark ? 'var(--accent2-400)' : 'var(--accent-600)'}" class="ic `)}<span>${t}</span></div>`).join('')}</div></div>`;
scene({
  name: 'Le principe', layout: 'content',
  html: hd('Le principe', 'Du job Talend au plan de construction') + `<div class="c">
    <svg class="wire" width="1656" height="700" style="left:0;top:0">
      <path class="h pp-a1" data-m="ahP" d="M470 160 L538 160" style="stroke-width:3"/><path class="h pp-a2" data-m="ahP" d="M1118 160 L1186 160" style="stroke-width:3"/>
      <path class="pp-f1" d="M470 160 L548 160" style="stroke:none"/><path class="pp-f2" d="M1118 160 L1196 160" style="stroke:none"/>
      <defs><marker id="ahP" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto"><path d="M0 0L10 5L0 10z" style="fill:var(--mid-400)"/></marker></defs>
    </svg>
    ${colCard('pp1', 0, 460, 'Entrée', 'Le projet Talend', ['Jobs (.item)', 'Contextes par environnement', 'Joblets, routines'])}
    ${colCard('pp2', 548, 560, 'Booster IA', 'talend-boomi-conception', ['Analyse le job', 'Applique les patterns Vicat', 'Fait relire sa copie'], 1, 1)}
    ${colCard('pp3', 1196, 460, 'Sortie', 'Le document de conception', ['Un schéma par process', 'Chaque shape et ses paramètres', 'La traçabilité Talend → Boomi'])}
    ${[['Jamais du 1 pour 1', 'Ce que Talend fait en une étape peut en demander trois dans Boomi, et inversement.'], ['Les standards du client', 'Architecture main / sub, frameworks [FWK] réutilisés, jamais redessinés.'], ["Rien d'implicite", 'Tout écart fonctionnel avec le job Talend est signalé et justifié.']].map((p, i) => `
    <div class="card soft h pp4" style="left:${i * 560}px;top:356px;width:536px;height:200px;padding:28px 30px">
      <div class="d" style="font-size:30px">${p[0]}</div><div class="p" style="font-size:20px;margin-top:12px">${p[1]}</div></div>`).join('')}
  </div>`,
  steps: [
    (tl, A) => { A.head(tl); A.rise(tl, '.pp1', '-=0.5', { x: -40, y: 0 }); A.rise(tl, '.pp1-i', '-=0.4', { x: -14, y: 0, st: .1, d: .5 }); },
    (tl, A) => { A.draw(tl, '.pp-a1', undefined, { d: .4 }); A.flow('.pp-f1', { n: 2, d: 1.4, parent: '.c', delay: .4 }); A.pop(tl, '.pp2', '-=0.1', { from: .92, ease: 'expo.out', d: .9 }); A.Q('.pp2-i').forEach(el => A.rise(tl, el, '>-0.1', { x: -14, y: 0, d: .5 })); },
    (tl, A) => { A.draw(tl, '.pp-a2', undefined, { d: .4 }); A.flow('.pp-f2', { n: 2, d: 1.4, parent: '.c', delay: .4 }); A.rise(tl, '.pp3', '-=0.1', { x: -40, y: 0 }); A.rise(tl, '.pp3-i', '-=0.4', { x: -14, y: 0, st: .1, d: .5 }); },
    (tl, A) => { A.rise(tl, '.pp4', undefined, { y: 40, st: .14 }); },
  ],
});

/* Clôture : sectionScene-like avec layout 'cover' — voir la couverture. */
