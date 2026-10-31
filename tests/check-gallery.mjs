import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
const gallery=JSON.parse(readFileSync('src/gallery.json','utf8'));
assert(gallery.length>10,'Phone gallery contains the full import, beyond the falling-photo selection');
assert.equal(new Set(gallery.map(p=>p.id)).size,gallery.length,'Unique stable IDs');
assert.equal(new Set(gallery.map(p=>p.source)).size,gallery.length,'Every source appears once');
for(const p of gallery){
  assert(p.source&&!p.source.startsWith('/')&&!p.source.split('/').includes('..'));
  assert(p.alt&&p.width>0&&p.height>0&&Math.max(p.width,p.height)<=1600);
  for(const path of [p.src,p.thumbnail])assert(path.startsWith('assets/gallery/')&&!path.includes('..'));
  const image=readFileSync('public/'+p.src),thumb=readFileSync('public/'+p.thumbnail);
  assert.equal(image.readUInt16BE(0),0xffd8,'Full photo is JPEG');
  assert.equal(thumb.toString('ascii',8,12),'WEBP','Thumbnail is WebP');
  assert(!image.includes(Buffer.from('Exif\0\0')),'Published photo omits EXIF');
  assert(statSync('public/'+p.thumbnail).size<100000,'Thumbnails stay lightweight');
}
assert.equal(readFileSync('public/assets/github-avatar.jpg').readUInt16BE(0),0xffd8);
console.log(`PASS: ${gallery.length} unique gallery images, local full-size/thumbnail pairs, image formats, EXIF removal and thumbnail budget.`);
