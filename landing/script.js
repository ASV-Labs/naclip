(() => {
  'use strict';
  document.body.classList.add('interactive');
  const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
  const motionOff = new URLSearchParams(location.search).get('motion') === 'off';
  const videos = [...document.querySelectorAll('video')];
  const panels = [
    ['hero1-content', 'hero1-card'].map(id => document.getElementById(id)),
    ['hero2-content', 'hero2-stats'].map(id => document.getElementById(id))
  ];
  const sceneButtons = [...document.querySelectorAll('[data-scene]')];
  const motionButton = document.querySelector('#motion-toggle');
  const menuButton = document.querySelector('#mobile-menu-btn');
  const menu = document.querySelector('#mobile-overlay');
  let scene = 0;
  let paused = motionQuery.matches || motionOff;
  let complete = false;
  let blocked = false;
  let ready = paused;
  let menuOpen = false;
  let lastWheel = 0;
  let playbackRevision = 0;

  if (paused) document.body.classList.add('motion-reduced');
  panels.flat().forEach(panel => {
    panel.classList.add('scene-panel');
    panel.hidden = false;
  });
  videos.forEach(video => { video.loop = false; video.muted = true; });

  function updateControl() {
    const label = complete ? 'Replay animation' : (paused || blocked ? 'Play animation' : 'Pause animation');
    motionButton.setAttribute('aria-label', label);
    motionButton.title = label;
    motionButton.innerHTML = complete
      ? '<span aria-hidden="true">↻</span><span>Replay animation</span>'
      : `<span aria-hidden="true">${paused || blocked ? '▷' : 'Ⅱ'}</span>`;
    motionButton.classList.toggle('replay', complete);
    document.body.dataset.motionState = complete ? 'complete' : paused ? 'paused' : blocked ? 'blocked' : ready ? 'playing' : 'intro';
  }

  function advance() {
    if (scene === 0) selectScene(1);
    else {
      complete = true;
      syncMotion(); // Hold the final frame and leave setup copy in place.
    }
  }

  function syncMotion() {
    const revision = ++playbackRevision;
    const running = ready && !paused && !complete && !menuOpen && !document.hidden;
    videos.forEach((video, index) => {
      if (index !== scene || !running) video.pause();
    });
    if (running) {
      const video = videos[scene];
      if (video.ended) { advance(); return; }
      video.play().then(() => {
        if (revision !== playbackRevision) return;
        blocked = false;
        updateControl();
      }).catch(() => {
        if (revision !== playbackRevision) return;
        blocked = true;
        updateControl(); // A browser autoplay restriction gets a real, explicit recovery action.
      });
    }
    updateControl();
  }

  function selectScene(next) {
    scene = next;
    complete = false;
    blocked = false;
    videos[scene].currentTime = 0;
    panels.forEach((group, index) => group.forEach(panel => {
      panel.inert = index !== scene;
      panel.classList.toggle('is-active', index === scene);
    }));
    videos.forEach((video, index) => { video.style.opacity = index === scene ? '1' : '0'; });
    sceneButtons.forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.scene) === scene)));
    document.body.dataset.scene = String(scene);
    syncMotion();
  }

  function toggleMenu(open) {
    menuOpen = open;
    menu.hidden = !open;
    menu.inert = !open;
    document.querySelector('main').inert = open;
    motionButton.inert = open;
    menu.classList.toggle('opacity-0', !open);
    menu.classList.toggle('pointer-events-none', !open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.querySelector('#menu-icon').classList.toggle('hidden', open);
    document.querySelector('#close-icon').classList.toggle('hidden', !open);
    syncMotion();
    if (open) menu.querySelector('a').focus();
    else menuButton.focus();
  }

  videos.forEach((video, index) => video.addEventListener('ended', () => {
    if (index === scene && ready && !paused && !menuOpen && !document.hidden && !complete) advance();
  }));
  sceneButtons.forEach(button => button.addEventListener('click', () => selectScene(Number(button.dataset.scene))));
  motionButton.addEventListener('click', () => {
    if (complete) {
      paused = false;
      selectScene(0);
    } else {
      paused = blocked ? false : !paused;
      blocked = false;
      syncMotion();
    }
  });
  menuButton.addEventListener('click', () => toggleMenu(!menuOpen));
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => toggleMenu(false)));
  document.querySelector('main').addEventListener('focusin', event => {
    if (event.target.closest('.scene-panel') && !complete) {
      paused = true; // Keep a focused install/documentation link visible for keyboard users.
      syncMotion();
    }
  });
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
  motionQuery.addEventListener('change', event => {
    document.body.classList.toggle('motion-reduced', event.matches || motionOff);
    if (event.matches) paused = true;
    syncMotion();
  });
  matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches && menuOpen) toggleMenu(false); });

  selectScene(0);
  if (!paused) {
    document.body.classList.add('intro');
    setTimeout(() => {
      document.querySelector('#curtain-left').style.transform = 'translateX(-100%)';
      document.querySelector('#curtain-right').style.transform = 'translateX(100%)';
      document.querySelector('#loader-content').style.opacity = '0';
      setTimeout(() => {
        document.body.classList.remove('intro');
        ready = true;
        syncMotion();
      }, 1200);
    }, 250);
  }
})();
