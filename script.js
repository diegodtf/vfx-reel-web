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
   REPRODUCTOR EN SITIO
════════════════════════════════════════════════════════════ */
let activeItem = null;

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

function stopPlaying() {
  if (!activeItem) return;
  activeItem.querySelector('.reel-item__thumb iframe, .reel-item__thumb video')?.remove();
  activeItem.querySelector('.reel-item__btn')?.blur();
  activeItem.classList.remove('is-playing');
  activeItem = null;
}

function playInPlace(item) {
  if (activeItem === item) { stopPlaying(); return; }
  stopPlaying();
  item.querySelector('.reel-item__thumb').appendChild(buildMediaEl(item.dataset.type, item.dataset.src));
  item.classList.add('is-playing');
  activeItem = item;
}

document.querySelector('.section--reel')?.addEventListener('click', e => {
  const item = e.target.closest('.reel-item');
  if (item) playInPlace(item);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') stopPlaying();
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
