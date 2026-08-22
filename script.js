'use strict';

/**
 * Enquiry form submission endpoint.
 *
 * Swap this for a real endpoint when ready to go live, e.g.:
 *   Formspree:  const FORM_ENDPOINT = 'https://formspree.io/f/your-form-id';
 *   Getform:    const FORM_ENDPOINT = 'https://getform.io/f/your-form-id';
 *   Custom API: const FORM_ENDPOINT = 'https://api.yourdomain.com/enquiries';
 * No other code needs to change — the payload is already sent as JSON via fetch().
 */
const FORM_ENDPOINT = 'https://formspree.io/f/xkjwepry';

document.addEventListener('DOMContentLoaded', () => {
  setCurrentYear();
  initNav();
  initSmoothScroll();
  initFadeInObserver();
  initTestimonialCarousel();
  initFormValidation();
});

/** Returns true when the visitor has requested reduced motion. */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Writes the current year into the footer copyright line. */
function setCurrentYear() {
  const yearEl = document.getElementById('current-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

/** Wires up the hamburger toggle and closes the mobile menu on link tap / Escape. */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!toggle || !menu) return;

  // Below 768px the closed menu is only visually clipped (max-height:0), so without
  // this its links would still be reachable by keyboard Tab while invisible.
  const mobileQuery = window.matchMedia('(max-width: 767.98px)');
  const syncInert = () => {
    const isOpen = menu.classList.contains('is-open');
    menu.toggleAttribute('inert', mobileQuery.matches && !isOpen);
  };

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    menu.classList.remove('is-open');
    syncInert();
  };

  toggle.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    syncInert();
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  mobileQuery.addEventListener('change', syncInert);
  syncInert();
}

/** Intercepts same-page anchor clicks for a smooth, focus-managed scroll. */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });

      // Move focus to the target so keyboard/screen-reader users land where they scrolled to.
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });
}

/** Fades in each major section as it enters the viewport; skipped entirely under reduced motion. */
function initFadeInObserver() {
  const targets = document.querySelectorAll('[data-animate]');
  if (!targets.length) return;

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/** Builds dot indicators and wires prev/next buttons for the mobile testimonial carousel. */
function initTestimonialCarousel() {
  const viewport = document.querySelector('.testimonial-viewport');
  const track = document.getElementById('testimonial-track');
  const dotsContainer = document.getElementById('testimonial-dots');
  const prevBtn = document.getElementById('testimonial-prev');
  const nextBtn = document.getElementById('testimonial-next');
  if (!viewport || !track || !dotsContainer) return;

  const cards = Array.from(track.children);

  const cardOffset = (card) =>
    card.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;

  const currentIndex = () => {
    const pos = viewport.scrollLeft;
    let closest = 0;
    let closestDist = Infinity;
    cards.forEach((card, i) => {
      const dist = Math.abs(cardOffset(card) - pos);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    return closest;
  };

  const dots = cards.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'testimonial-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dot.addEventListener('click', () => scrollToIndex(i));
    dotsContainer.appendChild(dot);
    return dot;
  });

  function scrollToIndex(i) {
    const clamped = Math.max(0, Math.min(cards.length - 1, i));
    viewport.scrollTo({
      left: cardOffset(cards[clamped]),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  }

  function updateActiveState() {
    const idx = currentIndex();
    dots.forEach((dot, i) => dot.setAttribute('aria-selected', i === idx ? 'true' : 'false'));
    if (prevBtn) prevBtn.disabled = idx === 0;
    if (nextBtn) nextBtn.disabled = idx === cards.length - 1;
  }

  if (prevBtn) prevBtn.addEventListener('click', () => scrollToIndex(currentIndex() - 1));
  if (nextBtn) nextBtn.addEventListener('click', () => scrollToIndex(currentIndex() + 1));

  let scrollTimeout;
  viewport.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(updateActiveState, 100);
  });

  window.addEventListener('resize', updateActiveState);
  updateActiveState();
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[\d\s()-]{7,20}$/;

const FIELD_VALIDATORS = {
  name: (value) => (value.trim() ? '' : 'Please enter your full name.'),
  email: (value) => {
    if (!value.trim()) return 'Please enter your email address.';
    return EMAIL_REGEX.test(value.trim()) ? '' : 'Please enter a valid email address.';
  },
  phone: (value) => {
    if (!value.trim()) return 'Please enter your phone number.';
    return PHONE_REGEX.test(value.trim()) ? '' : 'Please enter a valid phone number, e.g. +65 3123 4567.';
  },
  company: () => '',
  service: (value) => (value ? '' : 'Please choose an option.'),
  message: (value) => (value.trim() ? '' : 'Please enter a short message.'),
};

/** Validates a single form field, updating its error text and aria-invalid state. */
function validateField(input) {
  const validator = FIELD_VALIDATORS[input.name];
  if (!validator) return true;

  const errorEl = document.getElementById(`error-${input.name}`);
  const message = validator(input.value);

  if (message) {
    input.setAttribute('aria-invalid', 'true');
    if (errorEl) errorEl.textContent = message;
  } else {
    input.removeAttribute('aria-invalid');
    if (errorEl) errorEl.textContent = '';
  }
  return !message;
}

/** Sets up blur/submit validation, honeypot spam capture, and the fetch-based submit flow. */
function initFormValidation() {
  const form = document.getElementById('enquiry-form');
  if (!form) return;

  const statusEl = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  const confirmationPanel = document.getElementById('confirmation-panel');
  const sendAnotherBtn = document.getElementById('send-another-btn');
  const honeypot = document.getElementById('hp-website');

  const fields = Array.from(form.elements).filter((el) => FIELD_VALIDATORS[el.name]);

  fields.forEach((field) => {
    field.addEventListener('blur', () => validateField(field));
  });

  const setStatus = (state, message) => {
    statusEl.textContent = message;
    if (state) statusEl.setAttribute('data-state', state);
    else statusEl.removeAttribute('data-state');
  };

  const setLoading = (isLoading) => {
    submitBtn.disabled = isLoading;
    submitBtn.classList.toggle('is-loading', isLoading);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setStatus('', '');

    // Honeypot filled in => likely a bot. Pretend success without sending anything.
    if (honeypot && honeypot.value) {
      showSuccessPanel(form, confirmationPanel);
      return;
    }

    const isValid = fields.reduce((allValid, field) => validateField(field) && allValid, true);
    if (!isValid) {
      setStatus('error', 'Please fix the errors above and try again.');
      return;
    }

    const payload = Object.fromEntries(fields.map((field) => [field.name, field.value.trim()]));

    setLoading(true);
    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (!response.ok) {
          const httpError = new Error(`Request failed with status ${response.status}`);
          httpError.isHttpError = true;
          throw httpError;
        }
        showSuccessPanel(form, confirmationPanel);
      })
      .catch((error) => {
        if (error.isHttpError) {
          setStatus('error', 'Something went wrong on our end. Please try again shortly.');
        } else {
          setStatus('error', 'Network error — please check your connection and try again.');
        }
      })
      .finally(() => setLoading(false));
  });

  if (sendAnotherBtn) {
    sendAnotherBtn.addEventListener('click', () => resetForm(form, confirmationPanel, statusEl));
  }
}

/** Hides the enquiry form and reveals the confirmation panel with its download CTA. */
function showSuccessPanel(form, confirmationPanel) {
  form.hidden = true;
  confirmationPanel.hidden = false;
  const heading = confirmationPanel.querySelector('h3');
  if (heading) {
    heading.setAttribute('tabindex', '-1');
    heading.focus();
  }
}

/** Restores the empty form after "Send another enquiry" is clicked. */
function resetForm(form, confirmationPanel, statusEl) {
  form.reset();
  form.querySelectorAll('[aria-invalid]').forEach((el) => el.removeAttribute('aria-invalid'));
  form.querySelectorAll('.field-error').forEach((el) => (el.textContent = ''));
  statusEl.textContent = '';
  statusEl.removeAttribute('data-state');

  confirmationPanel.hidden = true;
  form.hidden = false;
  form.querySelector('input, select, textarea').focus();
}
