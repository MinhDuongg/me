# Minh Orbit

An interactive personal website built around five rotating 3D head styles: Original, Low poly, Blocks, Cubist and Pop Art. Scroll continuously through diagonal worlds, drag and throw the floating objects, and explore a physical photo pile.

## Run locally

Requires Node.js 22.12 or newer and npm.

```sh
git clone git@github.com:MinhDuongg/me.git
cd me
npm ci
npm run dev
```

Open the local address printed by Vite, normally `http://127.0.0.1:5173`.

## Build and check

```sh
npm test
npm run preview
```

`npm test` builds the production website and runs the regression suite. The production output is `dist/`; `npm run preview` serves that output locally. The GitHub workflow performs a clean install, runs the same checks and saves `dist/` as a build artifact.

The build uses relative paths, so `dist/` can be served from a root domain or a subdirectory by any static host. This repository does not depend on the temporary Cloudflare tunnel.

## GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the publishing source. GitHub Free requires a public repository for Pages; a private source repository requires a supported paid plan.

The workflow builds and tests every push and pull request, then publishes successful builds from `main`. It can also be started from **Actions → Build, test and deploy → Run workflow**. The project address after deployment is `https://minhduongg.github.io/me/`.

## Interactions

- **Loading:** full-screen playable Pong; **Click to spin** appears when all models and shaders are ready. Clicking unlocks audio and starts the roulette behind Pong. The main scene is revealed roughly a quarter-second later, already spinning; it slows to a random theme over 3.8 seconds. Enter or Space also starts it. Rolling noise, theme ticks and a landing cue follow the spin. Scroll, click or press a key to interrupt; reduced motion skips straight to a random theme.
- **Worlds:** wheel/touch scroll follows a continuous diagonal orbit; Page Up/Down changes worlds. The pause button stops the scene motion.
- **Cat:** click for a meow and its own text bubble.
- **Camera:** the head says “Check this out!” and ten photographs fall from above, collide and settle at the bottom.
- **Photos:** tap to enlarge, tap outside or Escape to shrink and resume gravity. Drag to move or throw off-screen. Focus a print and press Delete to dismiss it, or arrows to throw it. Click the camera again to reset the ten-print pile.
- **CRT computer:** the head introduces the GitHub link to [MinhDuongg](https://github.com/MinhDuongg).
- **Job application:** click for the application-form jump scare. Tap anywhere or Escape to dismiss.
- **Phone:** opens an interactive iPhone panel on the right (centered on mobile). Photos browses all 39 exported Lightroom images; GitHub opens the profile/repository; Notes saves locally; Worlds switches the live scene; Calculator supports keyboard input; Pong is playable with pointer, arrow keys or buttons; Camera releases the photo pile; Settings controls motion and wallpaper. Use the home indicator, Back, Escape, Close or tap outside to navigate/dismiss.
- **Text input:** Enter or the arrow plays beep-and-bop speech with synchronized mouth animation and a theme-matched, head-attached dialogue panel.

## Source map

| Path | Purpose |
| --- | --- |
| `src/app.js` | Scene scrolling, accessible controls and object actions |
| `src/head.js` | Three.js renderer, models, hair, lighting and scene placement |
| `src/scene-props.js` | The five authored 3D props |
| `src/phone.js`, `src/phone.css`, `src/phone-tools.js` | Interactive iPhone, eight apps, local notes, calculator and Pong |
| `src/talking-rig.js`, `src/speech.js` | Mouth deformation and beep timing |
| `src/photo-pile.js`, `src/photo-physics.js` | Gallery preview, drag/throw handling and Matter.js rigid bodies |
| `src/pong-loader.js` | Loader/game, inlined by the Vite plugin for immediate startup |
| `src/intro-spin.js`, `src/roll-sound.js` | Finite random-theme roulette and locally synthesized rolling sound |
| `src/job-scare.js` | Application-form overlay and procedural impact sound |
| `src/style.css`, `src/scenes.js` | Layout, themes and background artwork |
| `src/photos.json` | The ten falling photos and their descriptions |
| `src/gallery.json`, `public/assets/gallery/` | Complete phone gallery, full images and lightweight thumbnails |
| `public/assets/` | Head geometry, textures, web-sized photos, fonts and reference image |
| `tests/` | Physics, timing, projection, interaction and build checks |

All application assets are local. Audio is synthesized in the browser after interaction; no voice or external audio service is used. Reduced-motion settings skip unnecessary motion. The website needs a modern browser with WebGL2 and streaming decompression support.

Third-party notices are in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The personal head likeness and photographs are project content, not a general-purpose stock asset pack.

## Refresh the phone gallery

The phone gallery contains a web export of the selected local folder. To include new photos later, install Pillow and run `python3 scripts/import-photos.py /path/to/photos`, then commit and push the generated assets and manifest. The importer reads supported images recursively, creates thumbnails and 1600px images without EXIF metadata, and leaves originals unchanged. No local folder path is published. The falling photo pile uses its own ten-image selection.

## Realistic model revision (1 November 2026)

`public/assets/head-realistic.glb` is the updated authored head, corrected facial proportions, rigid photographic eyes, refined fringe, and whole-head 4K maps. Its mesh and UV layout are loaded together, replacing the earlier procedural realistic presentation. It preserves all 72,843 exported hair fibers and the source triangle count. WebP textures are lossless; Meshopt uses 16-bit positions/UVs and 12-bit normals. Source Blender and raw exchange files remain in the local `outputs/head_models/01_realistic/` collection; the 141 MB raw GLB is above GitHub’s file limit. Export provenance is in `public/assets/realistic-model.json`. The other four styles retain their own existing assets and UVs.
