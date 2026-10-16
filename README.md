# Axolotl prototype

[Open the prototype](https://iriskax.github.io/axolotl-prototype/)

The existing Header 3.0 prototype now includes the office extracted from `O2-Axolotl.zip`: an open room without the tall individual cubicles, refined seated axolotls, matched day/night artwork and visible typing, blinking, small gill movements and independently timed seated coffee, phone and head-scratch actions. Indoor planting is sparse and all O₂ mugs are blue.

The implementation and artwork are isolated in [`office/`](office/README.md). Both HTML entry points use the same module. The main `axolotl-2` application is separate.

Serve this folder over HTTP, for example with `python -m http.server 4186`. No build step or package installation is required.
