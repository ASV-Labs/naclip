(() => {
  'use strict';
  document.body.classList.add('interactive');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video')];
  const sceneButtons = [...document.querySelectorAll('[data-scene]')];
  const motionButton = document.querySelector('#motion-toggle');
  const menuButton = document.querySelector('#mobile-menu-btn');
  const menu = document.querySelector('#mobile-overlay');
  let scene = 0;
  const motionOff = new URLSearchParams(location.search).get('motion') === 'off';
  if (motionOff) document.body.classList.add('motion-reduced');
  let paused = motionQuery.matches || motionOff;
  let menuOpen = false;
  let lastWheel = 0;
  function syncMotion() {
    videos.forEach((video, index) => {
      if (index !== scene || paused || document.hidden) video.pause();
      else video.play().catch(() => {}); // Text and navigation never depend on media playback.
    });
    motionButton.setAttribute('aria-pressed', String(paused));
    motionButton.setAttribute('aria-label', paused ? 'Play background motion' : 'Pause background motion');
    motionButton.innerHTML = paused ? '▷ <span>Play</span>' : 'Ⅱ <span>Pause</span>';
  }
  function selectScene(next) {
    scene = next;
    ['hero1-content', 'hero1-card'].forEach(id => {
      const node = document.getElementById(id);
      node.hidden = scene !== 0;
      node.inert = scene !== 0;
    });
    ['hero2-content', 'hero2-stats'].forEach(id => {
      const node = document.getElementById(id);
      node.hidden = scene !== 1;
      node.inert = scene !== 1;
    });
    videos.forEach((video, index) => { video.style.opacity = index === scene ? '1' : '0'; });
    sceneButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.scene) === scene)));
    syncMotion();
  }
  function toggleMenu(open) {
    menuOpen = open;
    menu.hidden = !open;
    menu.inert = !open;
    document.querySelector('main').inert = open;
    menu.classList.toggle('opacity-0', !open);
    menu.classList.toggle('pointer-events-none', !open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.querySelector('#menu-icon').classList.toggle('hidden', open);
    document.querySelector('#close-icon').classList.toggle('hidden', !open);
    if (open) menu.querySelector('a').focus();
    else menuButton.focus();
  }
  sceneButtons.forEach(button => button.addEventListener('click', () => selectScene(Number(button.dataset.scene))));
  motionButton.addEventListener('click', () => { paused = !paused; syncMotion(); });
  menuButton.addEventListener('click', () => toggleMenu(!menuOpen));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuOpen) { toggleMenu(false); return; }
    if (menuOpen && event.key === 'Tab') {
      const links = [...menu.querySelectorAll('a')];
      const first = links[0], last = links.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); menuButton.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); menuButton.focus(); }
      else if (document.activeElement === menuButton) { event.preventDefault(); (event.shiftKey ? last : first).focus(); }
      return;
    }
    if (menuOpen || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.ctrlKey || event.metaKey || event.altKey) return;
    if (['ArrowDown', 'PageDown', 'ArrowRight'].includes(event.key)) { event.preventDefault(); selectScene(1); }
    if (['ArrowUp', 'PageUp', 'ArrowLeft'].includes(event.key)) { event.preventDefault(); selectScene(0); }
  });
  addEventListener('wheel', event => {
    if (menuOpen || event.ctrlKey || Math.abs(event.deltaY) < 15 || Date.now() - lastWheel < 800) return;
    lastWheel = Date.now();
    selectScene(event.deltaY > 0 ? 1 : 0);
  }, { passive: true });
  document.addEventListener('visibilitychange', syncMotion);
  motionQuery.addEventListener('change', event => { paused = event.matches; syncMotion(); });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches && menuOpen) toggleMenu(false); });
  if (!motionQuery.matches && !motionOff) {
    document.body.classList.add('intro');
    setTimeout(() => {
      document.querySelector('#curtain-left').style.transform = 'translateX(-100%)';
      document.querySelector('#curtain-right').style.transform = 'translateX(100%)';
      document.querySelector('#loader-content').style.opacity = '0';
      setTimeout(() => document.body.classList.remove('intro'), 1200);
    }, 250);
  }
  selectScene(0);
})();
