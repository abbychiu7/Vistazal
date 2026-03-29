/* ═══════════════════════════════════════════════════════════════
   VISTAZAL · script.js
   Loading Screen · Navigation · Intersection Observer
   Wax Seal Modal · Dapitan Builder
   ═══════════════════════════════════════════════════════════════ */

'use strict';

/* ─────────────────────────────────────────────
   1. LOADING SCREEN
   ───────────────────────────────────────────── */
(function initLoader() {
  const loader      = document.getElementById('loader');
  const bar         = document.getElementById('loaderBar');
  const percentEl   = document.getElementById('loaderPercent');

  let progress = 0;
  const TOTAL_DURATION = 2800; // ms
  const INTERVAL       = 30;   // ms
  const INCREMENT      = (100 / (TOTAL_DURATION / INTERVAL));

  document.body.classList.add('loading');

  const tick = setInterval(() => {
    // Simulate natural loading curve (fast start, slow near end)
    const remaining = 100 - progress;
    const step = progress < 70
      ? INCREMENT * 1.4
      : INCREMENT * 0.5;

    progress = Math.min(progress + step, 100);

    bar.style.width        = progress + '%';
    percentEl.textContent  = Math.floor(progress) + '%';

    if (progress >= 100) {
      clearInterval(tick);
      setTimeout(dismissLoader, 500);
    }
  }, INTERVAL);

  function dismissLoader() {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');

    // Trigger hero reveal animations after loader dismisses
    setTimeout(() => {
      document.querySelectorAll('.reveal-up').forEach(el => {
        el.classList.add('visible');
      });
    }, 200);
  }
})();


/* ─────────────────────────────────────────────
   2. NAVIGATION — scroll state & hamburger
   ───────────────────────────────────────────── */
(function initNav() {
  const navbar      = document.getElementById('navbar');
  const hamburger   = document.getElementById('navHamburger');
  const mobileNav   = document.getElementById('mobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  // Scrolled state
  const onScroll = () => {
    if (window.scrollY > 20) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  // Hamburger toggle
  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileNav.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', menuOpen);

    // Animate hamburger spans
    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
      spans[1].style.opacity   = '0';
      spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });

  // Close on link click
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (menuOpen && !navbar.contains(e.target) && !mobileNav.contains(e.target)) {
      menuOpen = false;
      mobileNav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', false);
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity   = '';
      spans[2].style.transform = '';
    }
  });
})();


/* ─────────────────────────────────────────────
   3. INTERSECTION OBSERVER — scroll reveals
   ───────────────────────────────────────────── */
(function initScrollReveal() {
  const THRESHOLD = 0.12;
  const ROOT_MARGIN = '0px 0px -60px 0px';

  // Observer for .observe-fade elements (vistas, section headers, dapitan)
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Small stagger delay per element position
        const delay = entry.target.dataset.stagger
          ? parseFloat(entry.target.dataset.stagger) * 60
          : 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
        fadeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: THRESHOLD,
    rootMargin: ROOT_MARGIN
  });

  document.querySelectorAll('.observe-fade').forEach((el, idx) => {
    el.dataset.stagger = idx;
    fadeObserver.observe(el);
  });

  // Vista-specific stagger: image and content reveal separately
  const vistaObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const vista = entry.target;
        const imgWrap = vista.querySelector('.vista-image-wrap');
        const content = vista.querySelector('.vista-content-col');

        // Stagger image → content by 150ms
        setTimeout(() => imgWrap && imgWrap.classList.add('visible'), 0);
        setTimeout(() => content && content.classList.add('visible'), 150);

        vistaObserver.unobserve(vista);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.vista').forEach(vista => {
    // Apply initial hidden state via JS so CSS still works without JS
    const imgWrap = vista.querySelector('.vista-image-wrap');
    const content = vista.querySelector('.vista-content-col');

    if (imgWrap) {
      imgWrap.style.opacity   = '0';
      imgWrap.style.transform = 'translateY(30px)';
      imgWrap.style.transition = 'opacity 0.8s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94)';
    }

    if (content) {
      content.style.opacity   = '0';
      content.style.transform = 'translateY(30px)';
      content.style.transition = 'opacity 0.8s 0.15s cubic-bezier(0.25,0.46,0.45,0.94), transform 0.8s 0.15s cubic-bezier(0.25,0.46,0.45,0.94)';
    }

    vistaObserver.observe(vista);
  });

  // Helper: when 'visible' class is added via classList.add, set the visible styles
  // We use a MutationObserver to react to class changes
  const styleOnVisible = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (
        mutation.type === 'attributes' &&
        mutation.attributeName === 'class' &&
        mutation.target.classList.contains('visible')
      ) {
        const el = mutation.target;
        el.style.opacity   = '1';
        el.style.transform = 'translateY(0)';
      }
    });
  });

  document.querySelectorAll('.vista-image-wrap, .vista-content-col').forEach(el => {
    styleOnVisible.observe(el, { attributes: true });
  });
})();


/* ─────────────────────────────────────────────
   4. WAX SEAL MODAL
   ───────────────────────────────────────────── */
(function initModal() {
  const overlay      = document.getElementById('modalOverlay');
  const closeBtn     = document.getElementById('modalClose');
  const titleEl      = document.getElementById('modalTitle');
  const descEl       = document.getElementById('modalDesc');
  const linkEl       = document.getElementById('modalLink');
  const videoLinkEl  = document.getElementById('modalVideoLink');
  const videoWrap    = document.getElementById('modalVideoWrap');
  const videoEl      = document.getElementById('modalVideo');
  const videoSrc     = document.getElementById('modalVideoSrc');

  function openModal(title, desc, href, videoPath) {
    titleEl.textContent = title;
    descEl.textContent  = desc;
    linkEl.href         = href;

    // Reset video state
    videoWrap.style.display = 'none';
    videoEl.pause();
    videoSrc.src = '';
    videoEl.load();

    // Show or hide external video link (no AI inline toggle button)
    if (videoPath) {
      videoSrc.src = videoPath;
      videoLinkEl.href = videoPath;
      videoLinkEl.style.display = 'flex';
    } else {
      videoLinkEl.style.display = 'none';
      videoLinkEl.href = '#';
    }

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => closeBtn.focus(), 50);
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    // Stop video playback on close
    videoEl.pause();
    videoWrap.style.display = 'none';
  }

  // Bind all wax seal buttons
  document.querySelectorAll('.wax-seal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title     = btn.dataset.title    || 'Archive';
      const desc      = btn.dataset.desc     || '';
      const href      = btn.dataset.gutenberg || btn.dataset.link || '#';
      const videoPath = btn.dataset.video    || '';
      openModal(title, desc, href, videoPath);
    });
  });

  // Close via button
  closeBtn.addEventListener('click', closeModal);

  // Close via overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close via Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('open')) {
      closeModal();
    }
  });
})();


/* ─────────────────────────────────────────────
   5. DAPITAN BUILDER — interactive grid
   ───────────────────────────────────────────── */
(function initDapitanBuilder() {
  const grid      = document.getElementById('dapitanGrid');
  const panel     = document.getElementById('dapitanPanel');
  const cells     = grid ? grid.querySelectorAll('.d-cell') : [];

  if (!cells.length) return;

  let activeCell = null;

  function showInfo(cell) {
    const name = cell.dataset.name || 'Location';
    const desc = cell.dataset.desc || 'No information available.';

    panel.innerHTML = `
      <div>
        <p class="panel-title">${escapeHtml(name)}</p>
        <p class="panel-desc">${escapeHtml(desc)}</p>
      </div>
    `;

    // Animate panel
    panel.style.borderLeftColor = getCellColor(cell);
  }

  function getCellColor(cell) {
    if (cell.classList.contains('water'))     return '#1a4080';
    if (cell.classList.contains('civic'))     return '#8b3a1a';
    if (cell.classList.contains('structure')) return '#8b6914';
    if (cell.classList.contains('farm'))      return '#306010';
    if (cell.classList.contains('land'))      return '#4a7c40';
    return 'var(--gold)';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  cells.forEach(cell => {
    // Click
    cell.addEventListener('click', () => {
      if (activeCell) activeCell.classList.remove('active');
      cell.classList.add('active');
      activeCell = cell;
      showInfo(cell);
    });

    // Keyboard accessibility
    cell.setAttribute('tabindex', '0');
    cell.setAttribute('role', 'button');
    cell.setAttribute('aria-label', cell.dataset.name || 'Map cell');

    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        cell.click();
      }
    });
  });

  // Auto-activate first civic cell on load with a delay
  setTimeout(() => {
    const firstActive = grid.querySelector('.d-cell.active');
    if (firstActive) {
      showInfo(firstActive);
    }
  }, 400);
})();


/* ─────────────────────────────────────────────
   6. SMOOTH ANCHOR SCROLLING
   ───────────────────────────────────────────── */
(function initSmoothScroll() {
  const NAV_HEIGHT = 72;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - NAV_HEIGHT;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─────────────────────────────────────────────
   7. PARALLAX — subtle hero portrait depth
   ───────────────────────────────────────────── */
(function initParallax() {
  const portrait = document.querySelector('.hero-portrait');
  if (!portrait) return;

  // Only enable on non-touch, larger screens
  if (window.matchMedia('(max-width: 960px)').matches) return;
  if ('ontouchstart' in window) return;

  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const depth = scrollY * 0.08;
        portrait.style.transform = `translateY(${depth}px)`;
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
})();


/* ─────────────────────────────────────────────
   8. VISTA IMAGE — decorative grid lines
      Draws subtle SVG grid pattern inside each
      vista image placeholder to suggest a
      "sketch / blueprint" aesthetic
   ───────────────────────────────────────────── */
(function decorateVistaImages() {
  const images = document.querySelectorAll('.vista-image');

  images.forEach(img => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.12;
    `;

    // Grid lines
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid-' + Math.random().toString(36).slice(2));
    pattern.setAttribute('width', '40');
    pattern.setAttribute('height', '40');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 40 0 L 0 0 0 40');
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(253,252,248,0.8)');
    path.setAttribute('stroke-width', '0.5');

    pattern.appendChild(path);
    defs.appendChild(pattern);

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '100%');
    rect.setAttribute('height', '100%');
    rect.setAttribute('fill', `url(#${pattern.id})`);

    svg.appendChild(defs);
    svg.appendChild(rect);
    img.appendChild(svg);

    // Add a centered roman numeral or vista number overlay
    const vistaEl = img.closest('.vista');
    if (vistaEl) {
      const num = vistaEl.querySelector('.connector-num');
      if (num) {
        const numText = num.textContent.trim();
        const label = document.createElement('div');
        label.style.cssText = `
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        `;
        label.innerHTML = `
          <span style="
            font-family: 'Playfair Display', Georgia, serif;
            font-size: clamp(3rem, 8vw, 6rem);
            font-weight: 900;
            font-style: italic;
            color: rgba(253,252,248,0.06);
            line-height: 1;
            letter-spacing: 0.05em;
            user-select: none;
          ">${numText}</span>
        `;
        img.appendChild(label);
      }
    }
  });
})();


/* ─────────────────────────────────────────────
   9. TIMELINE PROGRESS — gold spine fill
      Fills the spine from top as user scrolls
   ───────────────────────────────────────────── */
(function initSpineProgress() {
  const spine = document.querySelector('.timeline-spine');
  if (!spine) return;

  const timeline = document.getElementById('timeline');
  if (!timeline) return;

  window.addEventListener('scroll', () => {
    const rect     = timeline.getBoundingClientRect();
    const start    = rect.top + window.scrollY + 200;
    const end      = rect.bottom + window.scrollY - 200;
    const scrolled = window.scrollY;

    if (scrolled < start) {
      spine.style.opacity = '0.15';
      return;
    }

    const progress = Math.min((scrolled - start) / (end - start), 1);
    spine.style.opacity = 0.15 + progress * 0.3;
  }, { passive: true });
})();