"""Planches contact 2x3 des captures : python sheets.py dossier_captures"""
import sys, glob
from PIL import Image
fs = sorted(glob.glob(sys.argv[1] + '/s*.png'))
for g in range(0, len(fs), 6):
    sh = Image.new('RGB', (1920, 1620), 'white')
    for i, f in enumerate(fs[g:g + 6]): sh.paste(Image.open(f).resize((960, 540)), ((i % 2) * 960, (i // 2) * 540))
    sh.save(f"{sys.argv[1]}/sheet{g // 6:02d}.png")
print(len(fs), 'captures')
