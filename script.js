/* ==========================================================================
   AURELIA — Interactions
   Organized into small, single-purpose modules initialized on DOMContentLoaded.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initScrollProgress();
  initNavbar();
  initMobileMenu();
  initCursorGlow();
  initRevealAnimations();
  initHeroWordStagger();
  initParallax();
  initButtonRipple();
  initTestimonialSlider();
  initReserveForm();
  initNewsletterForm();
  initMinDateOnReservation();
});

/* --------------------------------------------------------------------------
   Preloader — hides once page + fonts are ready, with a minimum show time
   so the draw-in animation is never cut short.
   -------------------------------------------------------------------------- */
function initPreloader() {
  const preloader = document.getElementById('preloader');
  if (!preloader) return;

  const minDisplay = 1200;
  const start = Date.now();

  const hide = () => {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minDisplay - elapsed);
    setTimeout(() => {
      preloader.classList.add('is-hidden');
      document.body.style.overflow = '';
    }, wait);
  };

  document.body.style.overflow = 'hidden';

  if (document.readyState === 'complete') {
    hide();
  } else {
    window.addEventListener('load', hide);
    // Safety fallback in case load event is delayed by slow assets
    setTimeout(hide, 3500);
  }
}

/* --------------------------------------------------------------------------
   Scroll progress bar
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scrollProgressBar');
  if (!bar) return;

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Navbar — solid background after scrolling past the hero
   -------------------------------------------------------------------------- */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const update = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('is-scrolled');
    } else {
      navbar.classList.remove('is-scrolled');
    }
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* --------------------------------------------------------------------------
   Mobile menu toggle
   -------------------------------------------------------------------------- */
function initMobileMenu() {
  const toggle = document.getElementById('navToggle');
  const panel = document.getElementById('mobilePanel');
  if (!toggle || !panel) return;

  const close = () => {
    toggle.classList.remove('is-open');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('is-open');
    toggle.classList.toggle('is-open', isOpen);
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  panel.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', close);
  });
}

/* --------------------------------------------------------------------------
   Cursor glow — follows the pointer on devices that support hover
   -------------------------------------------------------------------------- */
function initCursorGlow() {
  const glow = document.getElementById('cursorGlow');
  if (!glow) return;
  if (window.matchMedia('(hover: none)').matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let raf = null;

  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    glow.classList.add('is-active');
    if (!raf) raf = requestAnimationFrame(animate);
  });

  document.addEventListener('mouseleave', () => glow.classList.remove('is-active'));

  function animate() {
    // Gentle easing toward the pointer for a soft, trailing feel
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    glow.style.transform = `translate(${currentX}px, ${currentY}px)`;

    if (Math.abs(targetX - currentX) > 0.5 || Math.abs(targetY - currentY) > 0.5) {
      raf = requestAnimationFrame(animate);
    } else {
      raf = null;
    }
  }
}

/* --------------------------------------------------------------------------
   Scroll reveal — IntersectionObserver adds .is-visible with a light stagger
   for elements that share the same parent section.
   -------------------------------------------------------------------------- */
function initRevealAnimations() {
  const revealEls = document.querySelectorAll('[data-reveal]');
  const ornaments = document.querySelectorAll('[data-reveal-ornament]');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // Stagger cards within the same grid using their DOM index
          const staggerParent = el.closest('.dish-grid, .experience-grid, .masonry, .story-facts, .chef-awards');
          if (staggerParent) {
            const siblings = Array.from(staggerParent.children);
            const index = siblings.indexOf(el);
            el.style.transitionDelay = Math.min(index * 90, 450) + 'ms';
          }
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el) => observer.observe(el));

    const ornamentObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          ornamentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    ornaments.forEach((el) => ornamentObserver.observe(el));
  } else {
    // Fallback: reveal everything immediately if IO is unsupported
    revealEls.forEach((el) => el.classList.add('is-visible'));
    ornaments.forEach((el) => el.classList.add('is-visible'));
  }
}

/* --------------------------------------------------------------------------
   Hero headline — staggered word-by-word reveal on load
   -------------------------------------------------------------------------- */
function initHeroWordStagger() {
  const words = document.querySelectorAll('.hero-title .reveal-word');
  words.forEach((word, i) => {
    word.style.transitionDelay = (0.15 + i * 0.12) + 's';
  });

  // Trigger shortly after preloader begins hiding so it feels intentional
  setTimeout(() => {
    document.querySelectorAll('.hero [data-reveal]').forEach((el, i) => {
      el.style.transitionDelay = el.style.transitionDelay || (0.4 + i * 0.1) + 's';
      el.classList.add('is-visible');
    });
  }, 500);
}

/* --------------------------------------------------------------------------
   Parallax — subtle vertical drift on the hero image as the user scrolls
   -------------------------------------------------------------------------- */
function initParallax() {
  const heroMedia = document.querySelector('.hero-media img');
  if (!heroMedia) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;
    const offset = Math.min(scrollY * 0.35, 160);
    heroMedia.style.transform = `translateY(${offset}px) scale(1.02)`;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
}

/* --------------------------------------------------------------------------
   Button ripple — small material-style click feedback on gold buttons
   -------------------------------------------------------------------------- */
function initButtonRipple() {
  const buttons = document.querySelectorAll('.btn-ripple');

  buttons.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);

      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';

      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}

/* --------------------------------------------------------------------------
   Testimonial slider — simple auto-rotating carousel with manual dots
   -------------------------------------------------------------------------- */
function initTestimonialSlider() {
  const track = document.getElementById('testimonialTrack');
  const dotsContainer = document.getElementById('testimonialDots');
  if (!track || !dotsContainer) return;

  const slides = Array.from(track.children);
  let current = 0;
  let autoTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i, true));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.children);

  function goTo(index, isManual) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    if (isManual) restartAutoplay();
  }

  function next() { goTo(current + 1); }

  function restartAutoplay() {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(next, 6000);
  }

  restartAutoplay();

  // Pause on hover for readability
  const slider = document.getElementById('testimonialSlider');
  slider.addEventListener('mouseenter', () => autoTimer && clearInterval(autoTimer));
  slider.addEventListener('mouseleave', restartAutoplay);
}

/* --------------------------------------------------------------------------
   Reservation form — lightweight client-side validation + confirmation
   (no backend; this is a front-end deliverable)
   -------------------------------------------------------------------------- */
function initReserveForm() {
  const form = document.getElementById('reserveForm');
  const confirmation = document.getElementById('reserveConfirmation');
  if (!form || !confirmation) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = form.querySelector('#resName').value.trim();
    const date = form.querySelector('#resDate').value;
    const time = form.querySelector('#resTime').value;

    const formattedDate = date
      ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
      : '';

    confirmation.textContent = `Thank you, ${name}. Your table is requested for ${formattedDate} at ${time} — we'll confirm by email shortly.`;
    confirmation.classList.add('is-visible');
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   Newsletter form — inline success message, no backend
   -------------------------------------------------------------------------- */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  const note = document.getElementById('newsletterNote');
  if (!form || !note) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input[type="email"]');
    if (!input.checkValidity()) {
      input.reportValidity();
      return;
    }
    note.textContent = 'You\u2019re on the list. Welcome to Aurelia.';
    form.reset();
  });
}

/* --------------------------------------------------------------------------
   Reservation date field — prevent selecting dates in the past
   -------------------------------------------------------------------------- */
function initMinDateOnReservation() {
  const dateInput = document.getElementById('resDate');
  if (!dateInput) return;
  const today = new Date().toISOString().split('T')[0];
  dateInput.setAttribute('min', today);
}
