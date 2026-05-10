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
   LIGHTBOX — ventana flotante arrastrable
════════════════════════════════════════════════════════════ */
const lightbox        = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightboxContent');
const lightboxMedia   = document.getElementById('lightboxMedia');
const lightboxClose   = document.getElementById('lightboxClose');
const lightboxHandle  = document.getElementById('lightboxHandle');
let   lastFocused     = null;

/* ── Arrastre ─────────────────────────────────────────────── */
let isDragging = false, dragStartX, dragStartY, initialLeft, initialTop;

lightboxHandle.addEventListener('mousedown', e => {
  if (e.button !== 0) return;
  isDragging = true;
  const rect = lightboxContent.getBoundingClientRect();
  dragStartX  = e.clientX;
  dragStartY  = e.clientY;
  initialLeft = rect.left;
  initialTop  = rect.top;
  lightboxContent.style.transition = 'none';
  e.preventDefault();
});

document.addEventListener('mousemove', e => {
  if (!isDragging) return;
  lightboxContent.style.left      = `${initialLeft + e.clientX - dragStartX}px`;
  lightboxContent.style.top       = `${initialTop  + e.clientY - dragStartY}px`;
  lightboxContent.style.transform = 'none';
});

document.addEventListener('mouseup', () => { isDragging = false; });

/**
 * Construye el elemento de media según el tipo.
 * @param {'youtube'|'vimeo'|'local'} type
 * @param {string} src  ID de YouTube/Vimeo o ruta del archivo .mp4
 * @returns {HTMLElement}
 */
function buildMediaEl(type, src) {
  if (type === 'youtube') {
    const iframe = document.createElement('iframe');
    // autoplay=1: reproduce al abrir · rel=0: sin vídeos relacionados
    iframe.src             = `https://www.youtube-nocookie.com/embed/${src}?autoplay=1&rel=0&modestbranding=1`;
    iframe.allow           = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy  = 'strict-origin-when-cross-origin';
    iframe.title           = 'Reproductor YouTube';
    return iframe;
  }

  if (type === 'vimeo') {
    const iframe = document.createElement('iframe');
    // color=c49a6c: tint de los controles al color acento del sitio
    iframe.src             = `https://player.vimeo.com/video/${src}?autoplay=1&color=F0B922&title=0&byline=0`;
    iframe.allow           = 'autoplay; fullscreen; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.title           = 'Reproductor Vimeo';
    return iframe;
  }

  // Vídeo local .mp4
  const video        = document.createElement('video');
  video.src          = src;
  video.controls     = true;
  video.autoplay     = true;
  video.playsInline  = true;
  video.preload      = 'metadata';
  return video;
}

function openLightbox(type, src) {
  lastFocused = document.activeElement;
  lightboxMedia.innerHTML = '';
  lightboxMedia.appendChild(buildMediaEl(type, src));
  // Centrar al abrir (resetear si se había arrastrado antes)
  lightboxContent.style.left      = '50%';
  lightboxContent.style.top       = '50%';
  lightboxContent.style.transform = 'translate(-50%, -50%)';
  lightboxContent.style.transition = '';
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  lightboxClose.focus();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  setTimeout(() => { lightboxMedia.innerHTML = ''; }, 260);
  if (lastFocused) lastFocused.focus();
}

// Delegación: clic en cualquier .reel-item (featured o grid) abre el lightbox
document.querySelector('.section--reel')?.addEventListener('click', e => {
  const item = e.target.closest('.reel-item');
  if (!item) return;
  openLightbox(item.dataset.type, item.dataset.src);
});

lightboxClose.addEventListener('click', closeLightbox);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
    closeLightbox();
  }
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
