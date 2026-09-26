// Vérification : capture chaque chapitre en fin d'animation + test de navigation.
// Usage : NODE_PATH=$(npm root -g) node shoot.js fichier.html dossier_captures
const { chromium } = require('playwright');
const [,, file, dir] = process.argv;
(async () => {
  const fs = require('fs'); fs.mkdirSync(dir, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + require('path').resolve(file)); await p.waitForTimeout(1500);
  await p.keyboard.press('Space');
  const N = await p.evaluate(() => __deck.STEPS.length);
  for (let i = 0; i < N; i++) {
    await p.waitForTimeout(600); await p.evaluate(() => __deck.tl && __deck.tl.progress(1)); await p.waitForTimeout(1500);
    await p.screenshot({ path: `${dir}/s${String(i).padStart(2, '0')}.png` }); await p.keyboard.press('ArrowRight');
  }
  // navigation : pause / reprise / précédent / début
  const st = () => p.evaluate(() => [__deck.cur, __deck.status]);
  await p.evaluate(() => __deck.play(0)); await p.waitForTimeout(500);
  await p.keyboard.press('Space'); console.log('pause ->', await st());
  await p.keyboard.press('Space'); console.log('reprise ->', await st());
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowLeft'); console.log('→ → ← ->', await st());
  await p.keyboard.press('Home'); console.log('Début ->', await st());
  console.log('chapitres', N, 'erreurs', errs);
  await b.close();
})();
