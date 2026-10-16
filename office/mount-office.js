import { createOfficeScene } from './office-scene.js?v=seated-2';

const host = document.querySelector('.office-scene');
const home = document.querySelector('#home-view');
const app = document.querySelector('#app');
const motionKey = 'axolotl-prototype-office-paused';
const media = window.matchMedia('(prefers-reduced-motion: reduce)');
let paused = false;
try { paused = localStorage.getItem(motionKey) === 'true'; } catch {}

const canvas = document.createElement('canvas');
canvas.className = 'neutral-hero-image office-scene-canvas';
canvas.width = 2172;
canvas.height = 724;
canvas.setAttribute('aria-hidden', 'true');
const button = document.createElement('button');
button.className = 'office-motion-toggle';
button.type = 'button';
host.append(canvas, button);

const pauseIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M9 5v14M15 5v14"/></svg>';
const playIcon = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="m8 5 11 7-11 7Z"/></svg>';
let status = 'loading';
function updateControl(value = status) {
  status = value;
  host.dataset.motion = media.matches ? 'reduced' : value;
  const still = paused || media.matches;
  const label = value === 'unavailable' ? 'Animace není dostupná; zobrazuje se obrázek'
    : media.matches ? 'Animace je vypnutá podle nastavení systému'
    : value === 'loading' ? 'Načítání kanceláře'
    : still ? 'Spustit animaci kanceláře' : 'Pozastavit animaci kanceláře';
  button.disabled = media.matches || value === 'loading' || value === 'unavailable';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-pressed', String(paused));
  button.title = label;
  button.innerHTML = still || value === 'unavailable' ? playIcon : pauseIcon;
}
const scene = createOfficeScene(canvas, {
  light: host.querySelector('.neutral-hero-light'),
  dark: host.querySelector('.neutral-hero-dark'),
}, updateControl);

let currentTheme;
function sync() {
  const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  if (theme !== currentTheme) { currentTheme = theme; scene.setTheme(theme); }
  scene.setPaused(paused || media.matches);
  scene.setActive(!home.hidden && app.dataset.headerOnly !== 'true');
  updateControl();
}
button.addEventListener('click', () => {
  paused = !paused;
  try { localStorage.setItem(motionKey, String(paused)); } catch {}
  sync();
});
media.addEventListener('change', sync);
const observer = new MutationObserver(sync);
observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
observer.observe(home, { attributes: true, attributeFilter: ['hidden'] });
observer.observe(app, { attributes: true, attributeFilter: ['data-header-only'] });
sync();
window.addEventListener('pagehide', event => {
  if (event.persisted) return;
  observer.disconnect();
  media.removeEventListener('change', sync);
  scene.destroy();
}, { once: false });
