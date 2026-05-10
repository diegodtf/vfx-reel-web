'use strict';

/* ════════════════════════════════════════════════════════════
   VFX REEL — script.js
════════════════════════════════════════════════════════════ */

/* ── Año del copyright ───────────────────────────────────── */
const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ════════════════════════════════════════════════════════════
   NAVEGACIÓN MÓVIL
════════════════════════════════════════════════════════════ */
const navToggle = document.querySelector('.nav__toggle');
const navMenu   = document.getElementById('nav-links');

if (navToggle && navMenu) {
  const openMenu = () => {
    navToggle.setAttribute('aria-expanded', 'true');
    navMenu.classList.add('is-open');
  };
  const closeMenu = () => {
    navToggle.setAttribute('aria-expanded', 'false');
    navMenu.classList.remove('is-open');
  };

  navToggle.addEventListener('click', () => {
    navToggle.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  navMenu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', e => {
    if (navMenu.classList.contains('is-open') &&
        !navMenu.contains(e.target) &&
        e.target !== navToggle) {
      closeMenu();
    }
  });
}

/* ════════════════════════════════════════════════════════════
   ENLACE ACTIVO AL HACER SCROLL
════════════════════════════════════════════════════════════ */
const navLinks = document.querySelectorAll('.nav__link');
const sections = document.querySelectorAll('main section[id]');

const updateActiveLink = () => {
  const threshold = window.scrollY + window.innerHeight / 3;
  let current = '';

  sections.forEach(sec => {
    if (sec.offsetTop <= threshold) current = sec.id;
  });

  navLinks.forEach(link => {
    link.setAttribute(
      'aria-current',
      link.getAttribute('href') === `#${current}` ? 'true' : 'false'
    );
  });
};

window.addEventListener('scroll', updateActiveLink, { passive: true });
updateActiveLink();

/* ════════════════════════════════════════════════════════════
   PIP PLAYER — se ancla al thumbnail, flota al hacer scroll
════════════════════════════════════════════════════════════ */
const pipPlayer = document.getElementById('pipPlayer');
const pipMedia  = document.getElementById('pipMedia');
const pipClose  = document.getElementById('pipClose');
let   activeItem = null;
let   isFloating = false;

function buildMediaEl(type, src) {
  if (type === 'youtube') {
    const iframe = document.createElement('iframe');
    iframe.src             = `https://www.youtube-nocookie.com/embed/${src}?autoplay=1&rel=0&modestbranding=1`;
    iframe.allow           = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy  = 'strict-origin-when-cross-origin';
    iframe.title           = 'Reproductor YouTube';
    return iframe;
  }
  if (type === 'vimeo') {
    const iframe = document.createElement('iframe');
    iframe.src             = `https://player.vimeo.com/video/${src}?autoplay=1&color=F0B922&title=0&byline=0`;
    iframe.allow           = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title           = 'Reproductor Vimeo';
    return iframe;
  }
  const video       = document.createElement('video');
  video.src         = src;
  video.controls    = true;
  video.autoplay    = true;
  video.playsInline = true;
  video.preload     = 'metadata';
  return video;
}

function snapToCard() {
  const rect = activeItem.querySelector('.reel-item__thumb').getBoundingClientRect();
  pipPlayer.style.transition = 'none';
  pipPlayer.style.left   = rect.left + 'px';
  pipPlayer.style.top    = rect.top + 'px';
  pipPlayer.style.width  = rect.width + 'px';
  pipPlayer.style.height = rect.height + 'px';
  pipPlayer.classList.remove('pip-player--floating');
  isFloating = false;
}

function floatToCorner() {
  const w = Math.min(340, window.innerWidth - 32);
  const h = Math.round(w * 9 / 16);
  pipPlayer.style.transition = 'left 0.35s ease, top 0.35s ease, width 0.35s ease, height 0.35s ease';
  pipPlayer.style.left   = (window.innerWidth - w - 16) + 'px';
  pipPlayer.style.top    = '80px';
  pipPlayer.style.width  = w + 'px';
  pipPlayer.style.height = h + 'px';
  pipPlayer.classList.add('pip-player--floating');
  isFloating = true;
}

function updatePip() {
  if (!activeItem) return;
  const rect = activeItem.querySelector('.reel-item__thumb').getBoundingClientRect();
  const inView = rect.top < window.innerHeight - 40 && rect.bottom > 40;
  if (inView) {
    snapToCard();
  } else if (!isFloating) {
    floatToCorner();
  }
}

function openPip(item) {
  activeItem = item;
  isFloating = false;
  pipMedia.innerHTML = '';
  pipMedia.appendChild(buildMediaEl(item.dataset.type, item.dataset.src));
  pipPlayer.classList.add('is-active');
  snapToCard();
}

function closePip() {
  pipPlayer.classList.remove('is-active', 'pip-player--floating');
  pipMedia.innerHTML = '';
  activeItem = null;
  isFloating = false;
}

window.addEventListener('scroll', updatePip, { passive: true });
window.addEventListener('resize', updatePip, { passive: true });

document.querySelector('.section--reel')?.addEventListener('click', e => {
  const item = e.target.closest('.reel-item');
  if (!item) return;
  if (activeItem) closePip();
  openPip(item);
});

pipClose.addEventListener('click', closePip);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && activeItem) closePip();
});

/* ════════════════════════════════════════════════════════════
   FORMULARIO DE CONTACTO
════════════════════════════════════════════════════════════ */
const form       = document.getElementById('contactForm');
const emailInput = document.getElementById('sender-email');
const msgInput   = document.getElementById('sender-message');
const formStatus = document.getElementById('formStatus');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setFieldError(input, errorId, msg) {
  input.classList.add('is-error');
  document.getElementById(errorId).textContent = msg;
}

function clearFieldError(input, errorId) {
  input.classList.remove('is-error');
  document.getElementById(errorId).textContent = '';
}

if (form && emailInput && msgInput) {
  // Limpiar errores mientras el usuario escribe
  emailInput.addEventListener('input', () => clearFieldError(emailInput, 'email-error'));
  msgInput.addEventListener('input',   () => clearFieldError(msgInput,   'message-error'));

  form.addEventListener('submit', e => {
    e.preventDefault();

    let valid = true;
    const emailVal = emailInput.value.trim();
    const msgVal   = msgInput.value.trim();

    if (!emailVal) {
      setFieldError(emailInput, 'email-error', 'Por favor introduce tu email.');
      valid = false;
    } else if (!EMAIL_RE.test(emailVal)) {
      setFieldError(emailInput, 'email-error', 'El formato del email no es válido.');
      valid = false;
    } else {
      clearFieldError(emailInput, 'email-error');
    }

    if (!msgVal) {
      setFieldError(msgInput, 'message-error', 'El mensaje no puede estar vacío.');
      valid = false;
    } else {
      clearFieldError(msgInput, 'message-error');
    }

    if (!valid) return;

    /* ── OPCIÓN A: mailto: ─────────────────────────────────────
       Lee el email del atributo data-email del <form>.
       Sustituye "tucorreo@ejemplo.com" en el HTML por tu email.
       ─────────────────────────────────────────────────────────── */
    const recipient = form.dataset.email;
    if (recipient) {
      const subject = encodeURIComponent(`Contacto desde portfolio — ${emailVal}`);
      const body    = encodeURIComponent(`De: ${emailVal}\n\n${msgVal}`);
      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      formStatus.textContent = 'Abriendo tu cliente de correo…';
      setTimeout(() => { formStatus.textContent = ''; }, 5000);
      return;
    }

    /* ── OPCIÓN B: Formspree ────────────────────────────────────
       Si añadiste method="POST" y action="https://formspree.io/f/XXXX"
       al <form> y eliminaste data-email, descomenta este bloque:

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    })
      .then(res => {
        if (res.ok) {
          formStatus.textContent = '¡Mensaje enviado! Te responderé pronto.';
          form.reset();
        } else {
          formStatus.textContent = 'Algo salió mal. Inténtalo de nuevo.';
        }
      })
      .catch(() => {
        formStatus.textContent = 'Error de red. Inténtalo de nuevo.';
      });

    ─────────────────────────────────────────────────────────── */
  });
}
