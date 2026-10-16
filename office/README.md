# Extracted office with seated activity

Source: `O2-Axolotl.zip`, its `dashboard/office-scene.js`, `office-clock.js`, and the original day/night panoramas. The prototype retains its Header 3.0 and tools navigation. The main axolotl-2 app is separate.

The room retains the curved windows, lounge, warm lighting and Brumlovka view. Individual cubicle walls are removed. There are four open desks, six floor plants and one small table plant. All O₂ mugs are blue with white marks. Characters and monitors remain seated in their existing positions.

## Artwork

`assets/office-dark.webp` and `office-light.webp` are the complete static scenes, 2172 × 724 pixels, encoded as lossless WebP. The light source was normalized by one pixel in width to match the night composition. No native 4K claim.

`assets/office-clean-dark.webp` and `office-clean-light.webp` are internal animation backing plates. Only small authored arm/mug masks are sampled from them; they are never shown as whole scenes. The main images remain the fallback.

All raster changes used the built-in imagegen tool. Prompt set: preserve the exact room and character geometry, remove approximately 80% of indoor plants while retaining six floor plants plus one table plant, recolor every coffee mug bright cobalt blue with white O₂; relight the resulting composition for daytime. For the animation plates, remove arms and desk mugs while preserving torso, keyboard, desk and surrounding geometry; close the sleeve sockets for clean reconstruction.

## Motion

`office-scene.js` keeps the local WebGL panorama renderer. Typing masks move hands 3–4 source pixels with independent brief rests. Only selected remaining leaves and gill tips flex. Heads, torsos, chairs, monitors and desk edges remain stationary. Old plant masks on the cleared columns have been removed.

`office-activity.js` adds a transparent 2D layer for blinking and two-segment arm gestures. Each axolotl follows its own active-time schedule, alternating typing with sipping, checking a phone and scratching its head. Pick-up, hold, lower and return phases are eased. Coffee mugs retain their source texture and logo; sleeve and hand articulation uses shaded shapes. Phones face their worker when held. This is layered 2.5D animation, not a fully rigged 3D scene. Nobody walks.

Both layers share one capped 30 FPS clock. Pausing, reduced motion, hidden pages, inactive tool routes and offscreen scenes stop that clock. Theme changes preserve time. WebGL failure hides both animated layers and reveals the matching complete static image. If an animation plate fails to load, visible typing and blinking remain available.

Run with `python -m http.server 4186`. Both HTML entry points use the same versioned modules and assets. No runtime dependencies or build step.

Run `node --test office/tests/activity.test.mjs` for schedule coverage and continuous movement back to rest. Browser QA checks day/night, pause, reduced motion, inactive routes, mobile layout and WebGL loss/recovery; inspect gesture poses visually in both themes.
