# Archivní designový zdroj Axolotl

Aktivní preview bylo v této pracovní větvi vyřazeno. Jediný katalog: https://iriskax.github.io/axolotl-preview/ds-library-v1-1/#design-system

Vstupní HTML přesměrovává do Library V1.1. Zdroje, historie a podklady zůstávají zachované; nejde o smazání repozitáře. Přesměrování se projeví veřejně až po výslovně schváleném merge a nasazení. Produkční aplikace se nemění.

## Historická dokumentace

# Axolotl prototype

[Open the prototype](https://iriskax.github.io/axolotl-prototype/)

The existing Header 3.0 prototype now includes the office extracted from `O2-Axolotl.zip`: an open room without the tall individual cubicles, refined seated axolotls, matched day/night artwork and visible typing, blinking, small gill movements and independently timed seated coffee, phone and head-scratch actions. Indoor planting is sparse and all O₂ mugs are blue.

The implementation and artwork are isolated in [`office/`](office/README.md). Both HTML entry points use the same module. The main `axolotl-2` application is separate.

Serve this folder over HTTP, for example with `python -m http.server 4186`. No build step or package installation is required.
