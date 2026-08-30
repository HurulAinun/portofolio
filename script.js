/* ============================================================
   Hurul Ainun Thakhirah Wildani — Portfolio
   Vanilla JS: nav, scroll reveal, project filter, lightbox
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {

    /* -------------------- FOOTER YEAR -------------------- */
    var yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    /* -------------------- MOBILE NAV -------------------- */
    var toggle = document.getElementById('nav-toggle');
    var menu = document.getElementById('nav-menu');
    var navWrap = document.querySelector('.nav-wrap');

    function closeMenu() {
      if (!menu || !toggle) return;
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Buka menu');
    }

    if (toggle && menu) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.setAttribute('aria-label', open ? 'Tutup menu' : 'Buka menu');
      });

      menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) closeMenu();
      });

      document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav')) closeMenu();
      });

      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeMenu();
      });

      // Reset the drawer if the viewport grows past the mobile breakpoint
      window.addEventListener('resize', function () {
        if (window.innerWidth > 860) closeMenu();
      });
    }

    /* -------------------- STICKY NAV SHADOW -------------------- */
    var toTop = document.getElementById('to-top');

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      if (navWrap) navWrap.classList.toggle('is-stuck', y > 8);
      if (toTop) toTop.classList.toggle('is-visible', y > 500);
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    }

    /* -------------------- SCROLL REVEAL -------------------- */
    var revealItems = document.querySelectorAll('.reveal');

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });

      revealItems.forEach(function (el, i) {
        // Small stagger so cards in the same row don't all pop at once
        el.style.transitionDelay = (i % 3) * 70 + 'ms';
        observer.observe(el);
      });
    }

    /* -------------------- ACTIVE NAV LINK -------------------- */
    var sections = Array.prototype.slice.call(
      document.querySelectorAll('main section[id]')
    );
    var navLinks = Array.prototype.slice.call(
      document.querySelectorAll('.nav-menu a[href^="#"]')
    );

    if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              'is-active',
              link.getAttribute('href') === '#' + id
            );
          });
        });
      }, { rootMargin: '-45% 0px -50% 0px' });

      sections.forEach(function (s) { spy.observe(s); });
    }

    /* -------------------- PROJECT FILTER -------------------- */
    var filters = Array.prototype.slice.call(document.querySelectorAll('.filter'));
    var projects = Array.prototype.slice.call(document.querySelectorAll('.project'));

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.dataset.filter;

        filters.forEach(function (b) {
          var active = b === btn;
          b.classList.toggle('is-active', active);
          b.setAttribute('aria-pressed', active ? 'true' : 'false');
        });

        projects.forEach(function (card) {
          var cats = (card.dataset.cat || '').split(/\s+/);
          var show = value === 'all' || cats.indexOf(value) !== -1;
          card.classList.toggle('is-hidden', !show);

          // Re-run the reveal animation for cards coming back into view
          if (show && !reduceMotion) {
            card.classList.remove('is-visible');
            /* force reflow so the transition restarts */
            void card.offsetWidth;
            card.classList.add('is-visible');
          }
        });
      });
    });

    /* -------------------- LIGHTBOX (sertifikat + galeri desain) -------------------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxTitle = document.getElementById('lightbox-title');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxCount = document.getElementById('lightbox-count');
    var btnPrev = document.getElementById('lightbox-prev');
    var btnNext = document.getElementById('lightbox-next');

    var lastFocused = null;
    var group = [];   // item-item pada galeri yang sedang dibuka
    var index = 0;

    function render() {
      var item = group[index];
      if (!item) return;
      lightboxImg.src = item.src;
      lightboxImg.alt = item.title || 'Gambar';
      if (lightboxTitle) lightboxTitle.textContent = item.title || '';

      var many = group.length > 1;
      if (lightboxCount) {
        lightboxCount.hidden = !many;
        lightboxCount.textContent = (index + 1) + ' / ' + group.length;
      }
      if (btnPrev) btnPrev.hidden = !many;
      if (btnNext) btnNext.hidden = !many;
    }

    function step(delta) {
      if (group.length < 2) return;
      // berputar, supaya dari gambar terakhir kembali ke yang pertama
      index = (index + delta + group.length) % group.length;
      render();
    }

    function openLightbox(items, startAt) {
      if (!lightbox || !lightboxImg || !items.length) return;
      lastFocused = document.activeElement;
      group = items;
      index = startAt || 0;
      render();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
      if (!lightbox) return;
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      // lepas src setelah animasi keluar supaya gambar besar tidak menetap di memori
      window.setTimeout(function () {
        if (!lightbox.classList.contains('is-open') && lightboxImg) {
          lightboxImg.removeAttribute('src');
        }
      }, 300);
      group = [];
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    // Sertifikat: satu gambar, tanpa navigasi
    document.querySelectorAll('.cert-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        openLightbox([{ src: btn.dataset.cert, title: btn.dataset.title }], 0);
      });
    });

    // Galeri desain: seluruh anggota data-gallery yang sama bisa dijelajahi
    document.querySelectorAll('.shot[data-gallery]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var name = btn.dataset.gallery;
        var peers = Array.prototype.slice.call(
          document.querySelectorAll('.shot[data-gallery="' + name + '"]')
        );
        var items = peers.map(function (el) {
          return { src: el.dataset.src, title: el.dataset.title };
        });
        openLightbox(items, peers.indexOf(btn));
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (btnPrev) btnPrev.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    if (btnNext) btnNext.addEventListener('click', function (e) { e.stopPropagation(); step(1); });

    if (lightbox) {
      lightbox.addEventListener('click', function (e) {
        if (!e.target.closest('.lightbox-inner')) closeLightbox();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (!lightbox || !lightbox.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLightbox();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });

  });
})();
