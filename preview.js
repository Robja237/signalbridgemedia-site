/* Only curated records select media; query parameters never supply HTML or media URLs. */
'use strict';
(async function () {
  const status = document.getElementById('status');
  const feed = document.getElementById('feed');
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function demoUrl(id) {
    const url = new URL('preview.html', location.href);
    url.searchParams.set('inventory', id);
    return url;
  }
  // Decorative familiar social affordances; no fake interactions or engagement.
  function symbol(path) {
    const span = element('span', null, 'action-symbol');
    span.setAttribute('aria-hidden', 'true');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    const shape = document.createElementNS(svg.namespaceURI, 'path');
    shape.setAttribute('d', path);
    shape.setAttribute('fill', 'none');
    shape.setAttribute('stroke', 'currentColor');
    shape.setAttribute('stroke-width', '1.6');
    svg.append(shape); span.append(svg); return span;
  }
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, { threshold: 0 }) : null;
  function renderPost(record, selected) {
    const post = element('article', null, 'post');
    post.dataset.inventory = record.id;
    const headingId = 'title-' + record.id;
    post.setAttribute('aria-labelledby', headingId);
    if (selected) post.append(element('div', 'Selected inventory demonstration', 'selected-tag'));
    const header = element('div', null, 'post-heading');
    const avatar = element('span', record.dealership.name.split(/\s+/).slice(0, 2).map(word => word[0]).join(''), 'avatar');
    avatar.setAttribute('aria-hidden', 'true');
    const identity = element('div', null, 'post-identity');
    identity.append(element('p', record.dealership.name, 'dealer-name'), element('p', 'Sample post · Simulated preview', 'post-meta'));
    const more = element('span', '•••', 'post-more'); more.setAttribute('aria-hidden', 'true');
    header.append(avatar, identity, more); post.append(header);
    const wrap = element('div', null, 'video-wrap');
    const video = element('video');
    video.controls = true; video.playsInline = true; video.preload = 'none';
    video.poster = record.posterUrl; video.src = record.videoUrl;
    video.setAttribute('aria-label', record.inventory.title + ' demonstration video');
    video.append(element('p', 'Your browser does not support video.'));
    video.addEventListener('play', () => {
      feed.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
    });
    video.addEventListener('error', () => {
      if (!wrap.querySelector('.video-error')) {
        const message = element('p', 'Video unavailable. Please try again later or contact SignalBridge Media.', 'video-error');
        message.setAttribute('role', 'status'); wrap.append(message);
      }
    });
    observer?.observe(video); wrap.append(video); post.append(wrap);
    const body = element('div', null, 'post-body');
    const actions = element('div', null, 'post-actions');
    actions.append(symbol('M12 21 3 12C-3 5 6-2 12 5 18-2 27 5 21 12Z'), symbol('M21 11a9 9 0 0 1-9 9H3l2-4a9 9 0 1 1 16-5Z'), symbol('m2 3 20 8-20 10 4-10-4-8Zm4 8h16'));
    const share = element('button', 'Copy link', 'share-button'); share.type = 'button';
    share.setAttribute('aria-label', 'Copy demonstration link for ' + record.inventory.title);
    share.addEventListener('click', async () => {
      let message = body.querySelector('.share-result');
      if (!message) { message = element('p', null, 'share-result'); message.setAttribute('role', 'status'); body.append(message); }
      try { await navigator.clipboard.writeText(demoUrl(record.id).href); message.textContent = 'Demonstration link copied.'; }
      catch (_) { message.textContent = 'Copy this link: ' + demoUrl(record.id).href; }
    });
    actions.append(share); body.append(actions);
    const title = element('h3', record.inventory.title, 'inventory-title'); title.id = headingId; body.append(title);
    if (record.inventory.reference) body.append(element('p', record.inventory.referenceLabel + ': ' + record.inventory.reference, 'reference'));
    body.append(element('p', record.caption, 'caption'));
    body.append(element('p', record.dealership.verified
      ? 'Personalized demonstration. Not a published post or an endorsement. Social icons are illustrative.'
      : 'Sample dealership context from the existing showcase; association unverified. Not a published post or an endorsement. Social icons are illustrative.', 'post-note'));
    post.append(body); return post;
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) feed.querySelectorAll('video').forEach(video => video.pause());
  });
  try {
    const response = await fetch('demos/inventory.json');
    if (!response.ok) throw new Error('Demonstrations unavailable');
    const records = (await response.json()).demonstrations;
    if (!Array.isArray(records) || !records.length) throw new Error('No demonstrations');
    const id = new URLSearchParams(location.search).get('inventory');
    const selected = records.find(record => record.id === id) || records[0];
    status.textContent = id && !records.some(record => record.id === id)
      ? 'That demonstration was not found. Showing a sample instead.'
      : 'Your selected video is first. Scroll for more sample posts.';
    document.title = selected.inventory.title + ' | SignalBridge Media feed preview';
    [selected, ...records.filter(record => record.id !== selected.id)].forEach((record, index) => feed.append(renderPost(record, index === 0)));
    records.filter(record => record.id !== selected.id).forEach(record => {
      const link = element('a', record.inventory.title); link.href = demoUrl(record.id).href;
      document.getElementById('samples').append(link);
    });
  } catch (_) {
    status.textContent = 'Demonstrations are temporarily unavailable. Please return to the website or contact SignalBridge Media.';
  }
})();
