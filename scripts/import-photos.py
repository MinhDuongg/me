"""Export a local photo folder for the static phone gallery; originals are read-only.
Usage: python3 scripts/import-photos.py /path/to/photos
Requires Pillow (python3 -m pip install Pillow).
"""
import hashlib
import io
import json
import sys
from pathlib import Path
from PIL import Image, ImageCms, ImageOps

root = Path(__file__).resolve().parents[1]
source = Path(sys.argv[1]).expanduser().resolve()
if not source.is_dir():
    raise SystemExit('Provide a photo directory.')
files = sorted((p for p in source.rglob('*') if p.is_file()
                and not any(part.startswith('.') for part in p.relative_to(source).parts)
                and p.suffix.lower() in {'.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff'}),
               key=lambda p: p.relative_to(source).as_posix().casefold())
if not files:
    raise SystemExit('No supported images found; gallery left unchanged.')
output = root / 'public/assets/gallery'
output.mkdir(parents=True, exist_ok=True)
known = {p['source']: p['alt'] for p in json.loads((root / 'src/photos.json').read_text())}
gallery = []
for path in files:
    relative = path.relative_to(source).as_posix()
    identifier = hashlib.sha256(relative.encode()).hexdigest()[:16]
    with Image.open(path) as original:
        image = ImageOps.exif_transpose(original).convert('RGB')
        if original.info.get('icc_profile'):
            try:
                image = ImageCms.profileToProfile(image,
                    ImageCms.ImageCmsProfile(io.BytesIO(original.info['icc_profile'])),
                    ImageCms.createProfile('sRGB'), outputMode='RGB')
            except (ImageCms.PyCMSError, OSError, ValueError):
                pass
        image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        full = output / f'{identifier}.jpg'
        image.save(full, 'JPEG', quality=85, optimize=True, progressive=True)
        thumb = image.copy()
        thumb.thumbnail((360, 360), Image.Resampling.LANCZOS)
        thumb.save(output / f'{identifier}-thumb.webp', 'WEBP', quality=80, method=6)
        gallery.append({'id': identifier, 'source': relative,
                        'src': f'assets/gallery/{identifier}.jpg',
                        'thumbnail': f'assets/gallery/{identifier}-thumb.webp',
                        'alt': known.get(path.name, path.stem.replace('_', ' ')),
                        'width': image.width, 'height': image.height})
(root / 'src/gallery.json').write_text(json.dumps(gallery, ensure_ascii=False, indent=2) + '\n')
print(f'Exported {len(gallery)} photos with thumbnails; EXIF metadata omitted. Originals unchanged.')
