/* ==========================================================================
   3D LIVE PORTFOLIO - CORE APPLICATION LOGIC & DYNAMICS (VANILLA JS) - v2
   ========================================================================== */

import ThreeEngine from './three-scene.js';

// Initialize Three.js Engine
document.addEventListener('DOMContentLoaded', () => {
  new ThreeEngine();
  initApplication();
});

function initApplication() {
  // Select Elements
  const header     = document.querySelector('.main-header');
  const sections   = document.querySelectorAll('.section');
  const navLinks   = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu    = document.getElementById('nav-menu');
  const cards      = document.querySelectorAll('[data-tilt]');
  const canvas     = document.getElementById('three-canvas');
  
  // Audio Panel & Synth Setup
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon   = document.getElementById('audio-icon');
  const audioLabel  = document.querySelector('.audio-label');
  let audioEnabled  = false;

  /* ==============================================================
     WEB AUDIO SYNTH ENGINE
     ============================================================== */
  class SynthSFX {
    constructor() { this.ctx = null; }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    }

    playHover() {
      if (!audioEnabled) return;
      this.init();
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }

    playClick() {
      if (!audioEnabled) return;
      this.init();
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, this.ctx.currentTime);
      osc1.frequency.setValueAtTime(1200, this.ctx.currentTime + 0.05);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.15);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);
      osc1.start(); osc2.start();
      osc1.stop(this.ctx.currentTime + 0.15);
      osc2.stop(this.ctx.currentTime + 0.15);
    }

    playCanvasClick() {
      if (!audioEnabled) return;
      this.init();
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    playSuccessSweep() {
      if (!audioEnabled) return;
      this.init();
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const now = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        const osc  = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.06, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    }
  }

  const sfx = new SynthSFX();

  /* ==============================================================
     AUDIO TOGGLE
     ============================================================== */
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      sfx.init();
      audioToggle.classList.add('fx-active');
      audioIcon.className  = 'fa-solid fa-volume-high';
      audioLabel.textContent = 'FX Active';
      sfx.playClick();
    } else {
      audioToggle.classList.remove('fx-active');
      audioIcon.className  = 'fa-solid fa-volume-xmark';
      audioLabel.textContent = 'FX Muted';
    }
  });

  // Attach hover/click sounds
  const soundElements = document.querySelectorAll('.nav-link, .btn, .project-link, #audio-toggle, .glassmorphic-card, .social-icon-btn, .footer-social-link, .scroll-top-btn');
  soundElements.forEach(el => {
    el.addEventListener('mouseenter', () => sfx.playHover());
    el.addEventListener('click',      () => sfx.playClick());
  });

  if (canvas) {
    canvas.addEventListener('click', (e) => {
      if (e.target === canvas) sfx.playCanvasClick();
    });
  }

  /* ==============================================================
     TYPEWRITER EFFECT
     ============================================================== */
  const typewriterEl = document.getElementById('typewriter-text');
  if (typewriterEl) {
    const roles = [
      'Full-Stack Apps',
      'AI/ML Models',
      'REST APIs',
      'MERN Projects',
      'Real-Time Systems',
      'WebGL Experiences',
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typeWriter() {
      const currentRole = roles[roleIndex];
      if (isDeleting) {
        typewriterEl.textContent = currentRole.slice(0, charIndex - 1);
        charIndex--;
      } else {
        typewriterEl.textContent = currentRole.slice(0, charIndex + 1);
        charIndex++;
      }

      let delay = isDeleting ? 55 : 95;

      if (!isDeleting && charIndex === currentRole.length) {
        delay = 1800; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        delay = 350;
      }

      setTimeout(typeWriter, delay);
    }

    setTimeout(typeWriter, 1200); // Initial delay before starting
  }

  /* ==============================================================
     SCROLL-TO-TOP BUTTON
     ============================================================== */
  const scrollTopBtn = document.getElementById('scroll-top-btn');
  if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    });

    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==============================================================
     STICKY NAVIGATION HEADER
     ============================================================== */
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.top     = '10px';
      header.style.padding = '10px 22px';
    } else {
      header.style.top     = '24px';
      header.style.padding = '14px 28px';
    }
  });

  /* ==============================================================
     RESPONSIVE HAMBURGER MENU
     ============================================================== */
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    menuToggle.querySelector('i').className = isOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  /* ==============================================================
     STAT COUNTER ANIMATION
     ============================================================== */
  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1600;
    const start   = performance.now();

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out expo
      const eased = 1 - Math.pow(2, -10 * progress);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target + '+';
    }

    requestAnimationFrame(update);
  }

  const statNumbers = document.querySelectorAll('.stat-number[data-target]');
  let statsAnimated = false;

  /* ==============================================================
     SKILL BAR ANIMATION
     ============================================================== */
  function animateSkillBars(container) {
    container.querySelectorAll('.skill-bar-fill').forEach(bar => {
      const width = bar.getAttribute('data-width');
      bar.style.width = width + '%';
    });
  }

  /* ==============================================================
     INTERSECTION OBSERVER — REVEAL ON SCROLL + STATS + BARS
     ============================================================== */
  // Reveal elements on scroll
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger delay for siblings
        const siblings = entry.target.parentElement
          ? [...entry.target.parentElement.querySelectorAll('.reveal-on-scroll')]
          : [];
        const idx = siblings.indexOf(entry.target);
        entry.target.style.transitionDelay = `${idx * 80}ms`;
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { rootMargin: '-10% 0px -10% 0px', threshold: 0.05 });

  document.querySelectorAll('.reveal-on-scroll').forEach(el => revealObserver.observe(el));

  // Stats counter trigger
  const heroSection = document.getElementById('home');
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        statNumbers.forEach(el => animateCounter(el));
        statsObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  if (heroSection) statsObserver.observe(heroSection);

  // Skill bar trigger
  const aboutSection = document.getElementById('about');
  let barsAnimated = false;
  const barsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !barsAnimated) {
        barsAnimated = true;
        animateSkillBars(entry.target);
        barsObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  if (aboutSection) barsObserver.observe(aboutSection);

  /* ==============================================================
     ACTIVE NAV LINK HIGHLIGHTING (Intersection Observer)
     ============================================================== */
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => link.classList.remove('active'));
        sections.forEach(sec  => sec.classList.remove('active-section'));
        const targetLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (targetLink) targetLink.classList.add('active');
        entry.target.classList.add('active-section');
      }
    });
  }, { root: null, rootMargin: '-30% 0px -40% 0px', threshold: 0 });

  sections.forEach(section => sectionObserver.observe(section));

  /* ==============================================================
     TACTILE 3D CARD TILT EFFECTS
     ============================================================== */
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const x      = e.clientX - rect.left;
      const y      = e.clientY - rect.top;
      const width  = rect.width;
      const height = rect.height;
      const tiltX  = (y / height - 0.5) * 14;
      const tiltY  = (x / width  - 0.5) * -14;
      card.style.setProperty('--mouse-x', `${(x / width)  * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / height) * 100}%`);
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform  = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  /* ==============================================================
     HUD TELEMETRY — Live FPS & Rotating Status
     ============================================================== */
  const hudFps       = document.getElementById('hud-fps');
  const hudTelemetry = document.getElementById('hud-telemetry');

  const telemetryStates = [
    'SECTOR_LOADED',
    'SCAN_COMPLETE',
    'NODE_ACTIVE',
    'DATA_SYNCED',
    'NET_STABLE',
    'UPLINK_OK',
  ];

  let lastTime  = performance.now();
  let frames    = 0;
  let telIdx    = 0;

  function updateHUD(now) {
    frames++;
    const delta = now - lastTime;
    if (delta >= 1000) {
      const fps = (frames / (delta / 1000)).toFixed(1);
      if (hudFps) hudFps.textContent = fps;
      frames   = 0;
      lastTime = now;
    }
    requestAnimationFrame(updateHUD);
  }

  requestAnimationFrame(updateHUD);

  setInterval(() => {
    telIdx = (telIdx + 1) % telemetryStates.length;
    if (hudTelemetry) {
      hudTelemetry.style.opacity = '0';
      setTimeout(() => {
        hudTelemetry.textContent  = telemetryStates[telIdx];
        hudTelemetry.style.opacity = '1';
        hudTelemetry.style.transition = 'opacity 0.4s ease';
      }, 200);
    }
  }, 3000);

  /* ==============================================================
     RESUME BUTTON — Download handler
     ============================================================== */
  const navResume = document.getElementById('nav-resume');
  if (navResume) {
    navResume.addEventListener('click', (e) => {
      e.preventDefault();
      // Show a futuristic toast notification
      showToast('Resume download coming soon! Contact via email for the latest CV.', 'info');
    });
  }

  /* ==============================================================
     TOAST NOTIFICATION SYSTEM
     ============================================================== */
  function showToast(message, type = 'info') {
    const existing = document.getElementById('portfolio-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'portfolio-toast';
    const colors = { info: 'var(--neon-cyan)', success: 'var(--neon-emerald)', error: '#ef4444' };
    toast.style.cssText = `
      position: fixed;
      bottom: 140px;
      right: 24px;
      z-index: 200;
      background: var(--bg-obsidian-glass);
      backdrop-filter: blur(20px);
      border: 1px solid ${colors[type] || colors.info};
      border-radius: 14px;
      padding: 14px 20px;
      font-family: var(--font-header, 'Outfit', sans-serif);
      font-size: 0.88rem;
      font-weight: 500;
      color: var(--text-primary, #fff);
      max-width: 300px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5), 0 0 20px ${colors[type]}33;
      opacity: 0;
      transform: translateX(20px);
      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity   = '1';
      toast.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
      toast.style.opacity   = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  /* ==============================================================
     CONTACT FORM HANDLING
     ============================================================== */
  const contactForm = document.getElementById('contact-form');

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput    = document.getElementById('form-name');
    const emailInput   = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');

    let isValid = true;

    document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));

    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }

    if (!messageInput.value.trim()) {
      messageInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }

    if (isValid) {
      sfx.playSuccessSweep();

      const submitBtn     = contactForm.querySelector('.btn-submit');
      const submitBtnText = submitBtn.querySelector('span');
      const submitBtnIcon = submitBtn.querySelector('i');

      submitBtn.disabled = true;
      submitBtn.style.background = 'linear-gradient(135deg, var(--neon-emerald) 0%, var(--neon-cyan) 100%)';
      submitBtn.style.boxShadow  = '0 0 30px rgba(16, 185, 129, 0.4)';
      submitBtnText.textContent  = 'Transmission Complete';
      submitBtnIcon.className    = 'fa-solid fa-circle-check';

      showToast('Message received! I\'ll get back to you soon.', 'success');

      console.log('--- SIGNAL ACQUIRED ---');
      console.log('Sender:', nameInput.value.trim());
      console.log('Email:',  emailInput.value.trim());
      console.log('Message:', messageInput.value.trim());

      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.boxShadow  = '';
        submitBtnText.textContent  = 'Send Signal';
        submitBtnIcon.className    = 'fa-solid fa-paper-plane';
      }, 5000);
    }
  });
}
