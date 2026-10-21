/* ──────────────────────────────────────────────────────────────────────────
   Portfolio JS — interactions, animations, and micro-delights.
   ────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ─── Loaded class for entrance animations ─────────────────────────── */
  window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    splitHeadline();
    initHelloRotation();
    initScrollUI();
    initMobileMenu();
    initCardTilt();
    initThemeToggle();
  });

  /* ─── Light / dark theme ───────────────────────────────────────────── */
  function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    const root = document.documentElement;
    const themeColor = document.querySelector('meta[name="theme-color"]');

    const setTheme = (theme, persist) => {
      const nextTheme = theme === 'dark' ? 'dark' : 'light';
      root.dataset.theme = nextTheme;
      toggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
      toggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      if (themeColor) themeColor.setAttribute('content', nextTheme === 'dark' ? '#10151D' : '#FFFFFF');

      if (persist) {
        try {
          localStorage.setItem('portfolio-theme', nextTheme);
        } catch (error) {
          // The selected theme remains active for this visit.
        }
      }
    };

    setTheme(root.dataset.theme || 'light', false);
    toggle.addEventListener('click', () => {
      setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  }

  /* ─── Scroll progress and back-to-top control ─────────────────────── */
  function initScrollUI() {
    const progress = document.querySelector('[data-scroll-progress]');
    const backTop = document.querySelector('[data-back-top]');
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const percent = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progress) progress.style.width = percent + '%';
      if (backTop) backTop.classList.toggle('visible', window.scrollY > 700);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    initActiveSection();
    if (backTop) {
      backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    function initActiveSection() {
      const links = Array.from(document.querySelectorAll('.desktop-nav a, [data-mobile-menu] a'));
      const sections = links
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);
      if (!sections.length) return;

      const setActive = (id) => {
        links.forEach(link => {
          const active = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', active);
          if (active) link.setAttribute('aria-current', 'true');
          else link.removeAttribute('aria-current');
        });
      };
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });
      sections.forEach(section => observer.observe(section));
    }

    const glow = document.querySelector('[data-cursor-glow]');
    const dot = document.querySelector('[data-cursor-dot]');
    const ring = document.querySelector('[data-cursor-ring]');
    const canUseSpotlight = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (glow && canUseSpotlight && !reduceMotion) {
      let pointerFrame = 0;
      let pointerX = 0;
      let pointerY = 0;
      const renderPointer = () => {
        glow.style.setProperty('--cursor-x', pointerX + 'px');
        glow.style.setProperty('--cursor-y', pointerY + 'px');
        if (dot) {
          dot.style.left = pointerX + 'px';
          dot.style.top = pointerY + 'px';
        }
        if (ring) {
          ring.style.left = pointerX + 'px';
          ring.style.top = pointerY + 'px';
        }
        pointerFrame = 0;
      };
      document.addEventListener('pointermove', (event) => {
        pointerX = event.clientX;
        pointerY = event.clientY;
        if (!pointerFrame) pointerFrame = requestAnimationFrame(renderPointer);
        glow.style.opacity = '1';
        if (dot) {
          dot.style.opacity = '1';
        }
        if (ring) {
          ring.style.opacity = '1';
        }
      }, { passive: true });
      document.addEventListener('pointerleave', () => {
        glow.style.opacity = '0';
        if (dot) dot.style.opacity = '0';
        if (ring) ring.style.opacity = '0';
      });
      document.querySelectorAll('a, button, .project-card, .certificate-card').forEach((element) => {
        element.addEventListener('pointerenter', () => document.body.classList.add('cursor-hover'));
        element.addEventListener('pointerleave', () => document.body.classList.remove('cursor-hover'));
      });
    }
  }

  /* ─── Responsive navigation ───────────────────────────────────────── */
  function initMobileMenu() {
    const toggle = document.querySelector('[data-menu-toggle]');
    const menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) return;
    const close = () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open', !open);
    });
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', close));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  /* ─── Gentle pointer tilt for work cards ──────────────────────────── */
  function initCardTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointermove', (event) => {
        if (card.classList.contains('flipped')) return;
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty('--rx', (y * -3.5).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (x * 3.5).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* ─── Split headline into individual chars for stagger animation ──── */
  function splitHeadline() {
    const el = document.querySelector('[data-split]');
    if (!el) return;
    const hl = el.querySelector('.hl');
    if (!hl) return;
    const text = hl.textContent;
    hl.textContent = '';
    text.split('').forEach((ch, i) => {
      const span = document.createElement('span');
      span.className = 'ch';
      span.style.setProperty('--i', i);
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      hl.appendChild(span);
    });
  }

  /* ─── Hello word rotation ──────────────────────────────────────────── */
  function initHelloRotation() {
    const container = document.querySelector('[data-hello]');
    if (!container) return;
    const words = Array.from(container.children);
    if (words.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Measure widths
    const widths = words.map(w => {
      w.style.position = 'static';
      w.style.visibility = 'visible';
      const rect = w.getBoundingClientRect();
      w.style.position = '';
      w.style.visibility = '';
      return rect.width;
    });

    container.style.setProperty('--w', widths[0] + 'px');
    let current = 0;

    setInterval(() => {
      const prev = current;
      current = (current + 1) % words.length;

      words[prev].classList.remove('on');
      words[prev].classList.add('out');

      words[current].classList.remove('out', 'reset');
      words[current].classList.add('on');
      container.style.setProperty('--w', widths[current] + 'px');

      // Reset the old one after transition
      setTimeout(() => {
        words[prev].classList.remove('out');
        words[prev].classList.add('reset');
        requestAnimationFrame(() => {
          words[prev].classList.remove('reset');
        });
      }, 650);
    }, 2400);
  }

  /* ─── Intersection Observer: pop-in reveal ─────────────────────────── */
  const popObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        popObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.pop').forEach(el => popObserver.observe(el));

  /* ─── Chat / Testimonial reveal ────────────────────────────────────── */
  const chatObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        chatObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.chat').forEach(el => chatObserver.observe(el));

  /* ─── Card flip ────────────────────────────────────────────────────── */
  document.querySelectorAll('.card .flip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = btn.closest('.card');
      const flipped = card.classList.toggle('flipped');
      card.querySelectorAll('.flip').forEach(control => control.setAttribute('aria-pressed', String(flipped)));
    });
  });

  // Click anywhere on the card face to flip
  document.querySelectorAll('.card .face-f').forEach(face => {
    face.addEventListener('click', () => {
      const card = face.closest('.card');
      const flipped = card.classList.toggle('flipped');
      card.querySelectorAll('.flip').forEach(control => control.setAttribute('aria-pressed', String(flipped)));
    });
  });
  document.querySelectorAll('.card .face-b').forEach(face => {
    face.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // Don't flip if clicking a link
      const card = face.closest('.card');
      const flipped = card.classList.toggle('flipped');
      card.querySelectorAll('.flip').forEach(control => control.setAttribute('aria-pressed', String(flipped)));
    });
  });

  /* ─── Tabs (Operating manual) ──────────────────────────────────────── */
  const tabList = document.querySelector('[data-tabs]');
  if (tabList) {
    const tabs = tabList.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Deselect all
        tabs.forEach(t => {
          t.setAttribute('aria-selected', 'false');
          t.setAttribute('tabindex', '-1');
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = true;
        });
        // Select clicked
        tab.setAttribute('aria-selected', 'true');
        tab.removeAttribute('tabindex');
        const panel = document.getElementById(tab.getAttribute('aria-controls'));
        if (panel) {
          panel.hidden = false;
          // Re-trigger animation
          panel.style.animation = 'none';
          panel.offsetHeight; // force reflow
          panel.style.animation = '';
        }
      });

      // Arrow key navigation
      tab.addEventListener('keydown', (e) => {
        const idx = Array.from(tabs).indexOf(tab);
        let next;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          next = tabs[(idx + 1) % tabs.length];
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          next = tabs[(idx - 1 + tabs.length) % tabs.length];
        }
        if (next) {
          e.preventDefault();
          next.click();
          next.focus();
        }
      });
    });
  }

  /* ─── Navbar: hide on scroll down, show on scroll up ───────────────── */
  let lastY = 0;
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y > 300 && y > lastY) {
        nav.classList.add('hide');
      } else {
        nav.classList.remove('hide');
      }
      lastY = y;
    }, { passive: true });
  }

  /* ─── Sticker drag ─────────────────────────────────────────────────── */
  document.querySelectorAll('[data-sticker]').forEach(sticker => {
    let startX, startY, origX, origY, dragging = false;

    const onDown = (e) => {
      dragging = true;
      sticker.classList.add('drag');
      const ev = e.touches ? e.touches[0] : e;
      startX = ev.clientX;
      startY = ev.clientY;
      const rect = sticker.getBoundingClientRect();
      origX = rect.left;
      origY = rect.top;
      e.preventDefault();
    };

    const onMove = (e) => {
      if (!dragging) return;
      const ev = e.touches ? e.touches[0] : e;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      sticker.style.position = 'fixed';
      sticker.style.left = (origX + dx) + 'px';
      sticker.style.top = (origY + dy) + 'px';
      sticker.style.zIndex = '100';
    };

    const onUp = () => {
      dragging = false;
      sticker.classList.remove('drag');
    };

    sticker.addEventListener('mousedown', onDown);
    sticker.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
  });

  /* ─── Hide drag hint after first sticker drag ─────────────────────── */
  const dragHint = document.querySelector('.drag-hint');
  if (dragHint) {
    document.querySelectorAll('[data-sticker]').forEach(s => {
      s.addEventListener('mousedown', () => {
        dragHint.style.transition = 'opacity 0.5s';
        dragHint.style.opacity = '0';
        setTimeout(() => dragHint.remove(), 500);
      }, { once: true });
    });
  }

  /* ─── Level map: reveal on scroll ──────────────────────────────────── */
  const levelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reached');
        levelObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  document.querySelectorAll('[data-level]').forEach(el => levelObserver.observe(el));

  /* ─── 60-second TL;DR dialog ───────────────────────────────────────── */
  const dialog = document.getElementById('tldr-dialog');
  if (dialog) {
    document.querySelectorAll('[data-tldr-open]').forEach(btn => {
      btn.addEventListener('click', () => {
        dialog.showModal();
      });
    });

    document.querySelectorAll('[data-tldr-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        dialog.close();
      });
    });

    // Close on backdrop click
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });

    // Close on Escape
    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') dialog.close();
    });
  }

  /* ─── Clock update for Bengaluru time ──────────────────────────────── */
  const clockEl = document.querySelector('[data-clock]');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const time = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      clockEl.textContent = time + ' IST';
    }
    updateClock();
    setInterval(updateClock, 60000);
  }

  /* ─── Smooth scroll for anchor links ───────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ─── Biz icon animation: play when visible ────────────────────────── */
  const bizObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('play');
        bizObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.biz').forEach(el => bizObserver.observe(el));

})();
