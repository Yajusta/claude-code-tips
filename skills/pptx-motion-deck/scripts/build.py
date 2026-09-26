"""Assemble la présentation en UN fichier HTML autonome (hors ligne).
Usage : python build.py <src_dir> <sortie.html>
<src_dir>/assets.json :
{ "title": "Titre onglet",
  "gsap": "chemin/gsap.min.js",
  "font_display": "chemin/display.woff2", "font_body": "chemin/body.woff2",
  "logo": "chemin/logo.svg|png",
  "palette": { "accent": "#hex", "accent2": "#hex", "ink": "#hex", "mid": "#hex",
               "paper": "#hex", "warn": "#hex", "danger": "#hex" },   # OBLIGATOIRE : thème PPTX ou couleurs de l'utilisateur
  "images": { "cle": "chemin/image.png", ... } }   # cle -> IMG.cle dans les scènes
Les scènes sont tous les fichiers <src_dir>/scenes*.js, dans l'ordre alphabétique."""
import base64, io, json, sys, pathlib, mimetypes
from PIL import Image
src = pathlib.Path(sys.argv[1]); out = pathlib.Path(sys.argv[2])
cfg = json.load(open(src / 'assets.json', encoding='utf-8'))
def uri(p):
    p = pathlib.Path(p); mime = {'.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff'}.get(p.suffix.lower()) or mimetypes.guess_type(p.name)[0]
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()
def img(p):  # raster -> webp compressé ; svg tel quel
    p = pathlib.Path(p)
    if p.suffix.lower() == '.svg': return uri(p)
    b = io.BytesIO(); Image.open(p).convert('RGB').save(b, 'WEBP', quality=88, method=6)
    return "data:image/webp;base64," + base64.b64encode(b.getvalue()).decode()
def palette(pal):  # 7 couleurs de base -> dégradés de tokens CSS (--accent-600 = couleur de base, etc.)
    need = ['accent', 'accent2', 'ink', 'mid', 'paper', 'warn', 'danger']
    miss = [k for k in need if k not in pal]
    if miss: sys.exit(f"assets.json : palette incomplète, manque {miss} (couleurs du thème PPTX ou de l'utilisateur)")
    rgb = lambda h: [int(h.lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)]
    def mix(h, f):  # f > 0 : vers le blanc, f < 0 : vers le noir
        c = rgb(h); o = 255 if f > 0 else 0
        return '#' + ''.join(f'{round(v + (o - v) * abs(f)):02x}' for v in c)
    ramp = {  # niveau -> facteur de mélange
        'accent': {700: -.2, 600: 0, 500: .2, 400: .38, 200: .66, 100: .83},
        'accent2': {700: -.2, 600: 0, 500: .2, 400: .38, 200: .66, 100: .83},
        'ink': {950: -.3, 900: 0, 800: .06, 700: .1, 600: .16, 500: .25},
        'mid': {700: -.3, 600: -.15, 500: 0, 400: .2, 300: .45, 200: .65},
        'paper': {100: -.06, '050': 0, '025': .5},
        'warn': {600: -.18, 400: 0, 100: .85},
        'danger': {500: 0, 400: .15, 100: .87},
    }
    css = [';'.join(f'--{k}-{lv}:{mix(pal[k], f)}' for lv, f in lvls.items()) + ';' for k, lvls in ramp.items()]
    css.append(''.join(f'--{k}-rgb:{",".join(map(str, rgb(pal[k])))};' for k in ('ink', 'accent', 'paper')))
    return '\n'.join(css)
t = open(src / 'template.html', encoding='utf-8').read()
rep = {
    '%%TITLE%%': cfg.get('title', 'Présentation'),
    '%%PALETTE%%': palette(cfg.get('palette', {})),
    '%%FONT_DISPLAY%%': uri(cfg['font_display']), '%%FONT_BODY%%': uri(cfg['font_body']),
    '%%LOGO%%': img(cfg['logo']) if cfg.get('logo') else '',
    '%%IMAGES%%': json.dumps({k: img(v) for k, v in cfg.get('images', {}).items()}),
    '%%GSAP%%': open(cfg['gsap'], encoding='utf-8').read(),
    '%%ENGINE%%': open(src / 'engine.js', encoding='utf-8').read(),
    '%%SCENES%%': '\n'.join(p.read_text(encoding='utf-8') for p in sorted(src.glob('scenes*.js'))),
}
for k in ['%%TITLE%%', '%%PALETTE%%', '%%FONT_DISPLAY%%', '%%FONT_BODY%%', '%%LOGO%%', '%%IMAGES%%', '%%ENGINE%%', '%%SCENES%%', '%%GSAP%%']:
    t = t.replace(k, rep[k])   # GSAP en dernier : son code ne doit pas être re-scanné
out.write_text(t, encoding='utf-8'); print(out, len(t) // 1024, 'Ko')
