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

// One media element is the sole owner of homepage playback and network loading.
(async function setupSocialShowcase() {
  const feed = document.querySelector('.social-showcase');
  const video = document.getElementById('showcase-video');
  const togglePlayback = document.getElementById('showcase-toggle');
  const previous = document.getElementById('showcase-previous');
  const next = document.getElementById('showcase-next');
  const status = document.getElementById('showcase-status');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let wantsPlayback = !reducedMotion.matches;
  let visible = false;
  let blocked = false;
  let generation = 0;
  let watchdog;
  let records = [];
  let index = 0;
  const captions = {
    'robalo-r270': 'Less lot. More open water. Meet the Robalo R270—made for a different kind of scroll.',
    'canam-maverick': 'Trade the ordinary scroll for the scenic route. The Maverick X3 brings a little trail energy to your feed.',
    'sportsman-247': 'Your next daydream has a hull. Take a closer look at the Sportsman 247.'
  };
  function eligible() {
    return records.length > 0 && wantsPlayback && visible && !document.hidden && !blocked && document.getElementById('view-home').classList.contains('active');
  }
  function updateButton() {
    togglePlayback.textContent = blocked ? 'Play' : wantsPlayback ? 'Pause' : 'Resume';
    togglePlayback.setAttribute('aria-label', blocked ? 'Try playing this inventory video' : wantsPlayback ? 'Pause sequential video playback' : 'Resume sequential video playback');
  }
  function stopWaiting() { clearTimeout(watchdog); }
  function fail(message) {
    blocked = true;
    generation += 1;
    stopWaiting();
    video.pause();
    status.textContent = message;
    updateButton();
  }
  function waitForPlayback() {
    stopWaiting();
    watchdog = setTimeout(() => {
      if (eligible()) fail('Video is taking longer to load. Press Play to retry, or try the next sample.');
    }, 15000);
  }
  function sync() {
    updateButton();
    if (!eligible()) {
      generation += 1;
      stopWaiting();
      video.pause();
      return;
    }
    if (!video.paused) return;
    const attempt = ++generation;
    waitForPlayback();
    video.play().catch(error => {
      // A source change or visibility pause can cancel an earlier play request.
      if (attempt !== generation || !eligible()) return;
      if (error.name === 'NotAllowedError') fail('Autoplay is paused by your browser. Press Play to start the muted preview.');
      else fail('This video could not play. Press Play to retry, or try the next sample.');
    });
  }
  function select(position, manual = false) {
    generation += 1;
    stopWaiting();
    video.pause();
    index = (position + records.length) % records.length;
    const record = records[index];
    blocked = false;
    video.poster = record.posterUrl;
    video.muted = true;
    video.src = record.videoUrl;
    video.setAttribute('aria-label', record.inventory.title + ' sample social video');
    document.getElementById('showcase-title').textContent = record.inventory.title;
    document.getElementById('showcase-reference').textContent = record.inventory.reference
      ? record.inventory.referenceLabel + ': ' + record.inventory.reference : '';
    document.getElementById('showcase-caption').textContent = captions[record.id] || record.caption;
    document.getElementById('showcase-demo-link').href = 'preview.html?inventory=' + encodeURIComponent(record.id);
    document.getElementById('showcase-position').textContent = (index + 1) + ' / ' + records.length;
    feed.dataset.inventory = record.id;
    status.textContent = manual ? record.inventory.title + ' selected.' : '';
    sync();
  }
  previous.addEventListener('click', () => select(index - 1, true));
  next.addEventListener('click', () => select(index + 1, true));
  togglePlayback.addEventListener('click', () => {
    if (blocked) {
      blocked = false;
      wantsPlayback = true;
      if (video.error) video.load();
    } else wantsPlayback = !wantsPlayback;
    status.textContent = wantsPlayback ? '' : 'Video sequence paused.';
    sync();
  });
  video.addEventListener('ended', () => { if (eligible()) select(index + 1); });
  video.addEventListener('playing', () => {
    stopWaiting();
    if (!eligible()) video.pause();
    else status.textContent = '';
  });
  video.addEventListener('waiting', () => { if (eligible()) waitForPlayback(); });
  video.addEventListener('stalled', () => { if (eligible()) waitForPlayback(); });
  video.addEventListener('error', () => {
    if (video.error) fail('Video unavailable. Try the next sample or open the full feed preview.');
  });
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', () => { generation += 1; stopWaiting(); video.pause(); });
  window.addEventListener('pageshow', sync);
  new MutationObserver(sync).observe(document.getElementById('view-home'), { attributes: true, attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) { wantsPlayback = false; status.textContent = 'Reduced motion enabled. Press Resume to play.'; sync(); }
  });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
      sync();
    }, { threshold: [0, 0.2] }).observe(video);
  } else {
    const check = () => { const box = video.getBoundingClientRect(); visible = box.bottom > 0 && box.top < innerHeight; sync(); };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
  }
  try {
    const response = await fetch('demos/inventory.json');
    if (!response.ok) throw new Error('Inventory unavailable');
    records = (await response.json()).demonstrations;
    if (!Array.isArray(records) || !records.length) throw new Error('No inventory');
    const selected = records.findIndex(record => record.id === new URLSearchParams(location.search).get('inventory'));
    select(selected < 0 ? 0 : selected);
    [previous, next, togglePlayback].forEach(button => { button.disabled = false; });
    if (reducedMotion.matches) status.textContent = 'Reduced motion enabled. Press Resume to play.';
  } catch (_) {
    status.textContent = 'Sample sequence unavailable. Open the full feed preview to explore the inventory.';
  }
})();
