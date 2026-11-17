'use strict';
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('primary-navigation');
function closeMenu() { toggle.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); }
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open)); nav.classList.toggle('is-open', open);
});
nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { closeMenu(); toggle.focus(); } });
const videos = [...document.querySelectorAll('.home-preview-video')];
const motion = document.getElementById('preview-motion');
let playing = false;
function syncPreviews() {
  videos.forEach(video => {
    const rect = video.getBoundingClientRect();
    const visible = rect.bottom > 0 && rect.top < innerHeight;
    if (playing && visible && !document.hidden && document.getElementById('view-home').classList.contains('active')) video.play().catch(() => {});
    else video.pause();
  });
}
motion.addEventListener('click', () => {
  playing = !playing; motion.setAttribute('aria-pressed', String(playing)); motion.textContent = playing ? 'Pause video previews' : 'Play video previews'; syncPreviews();
});
if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(syncPreviews); videos.forEach(video => observer.observe(video)); }
document.addEventListener('visibilitychange', syncPreviews);
new MutationObserver(syncPreviews).observe(document.getElementById('view-home'), { attributes: true, attributeFilter: ['class'] });
// Media remains linked to its demonstration even when a preview cannot load.
videos.forEach(video => video.addEventListener('error', () => { video.poster && video.setAttribute('title', 'Open the social feed to view this demonstration.'); }));
