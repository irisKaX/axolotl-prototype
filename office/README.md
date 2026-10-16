# Original office, extracted and refined

Source: `O2-Axolotl.zip`, `dashboard/office-scene.js`, `dashboard/office-clock.js`, and the day/night panoramas in `assets/office/panorama/`. The prototype retains its existing header and tools navigation.

The two new panoramas preserve the original room, lounge, lights, plants and Brumlovka view. The tall cubicles and their slogans are removed; four open desks remain in their original arrangement. Axolotls have coherent clothing, hands, seating and monitors facing their workers. The central O₂ mark is retained at a smaller size.

Artwork was edited with the built-in imagegen tool. Both native images are 2172 × 724 pixels and encoded as lossless WebP; no claim of native 4K. Night prompt: preserve the original 3:1 architecture and lounge, remove tall cubicle walls and slogans, refine four seated premium mascots with O₂ hoodies, jeans and sneakers, keep four properly oriented monitors, render crisp evening light. Day prompt: relight the exact resulting composition into natural daytime without moving geometry, characters or props.

`office-scene.js` uses the original local WebGL renderer. Motion masks now cover only fingertips and selected leaves; heads, bodies and furniture remain fixed. Small keyboard taps have independent pauses. Steam and subtle monitor light complete the scene. This is a restrained 2.5D panorama, not a rigged 3D scene; it does not simulate walking or lifting a mug.

The canvas matches screen pixel density up to native image resolution. Animation pauses when the page or scene is hidden, on user pause and with reduced motion enabled. Theme switching preserves active time. PNG/WebP artwork remains visible as a static fallback if WebGL is unavailable or lost. No external image service or runtime dependencies are used.

Run locally with `python -m http.server 4186` and open `/index.html`. The alternate `Axolotl-Header-3-prototyp.html` entry point uses the same office module and artwork.
