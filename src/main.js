/* ==========================================================================
   3D LIVE PORTFOLIO - CORE APPLICATION LOGIC & DYNAMICS (VANILLA JS)
   ========================================================================== */

import ThreeEngine from './three-scene.js';

// Initialize Three.js Engine
document.addEventListener('DOMContentLoaded', () => {
  new ThreeEngine();
  initApplication();
});

function initApplication() {
  // Select Elements
  const header = document.querySelector('.main-header');
  const sections = document.querySelectorAll('.section');
  const navLinks = document.querySelectorAll('.nav-link');
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const cards = document.querySelectorAll('[data-tilt]');
  const canvas = document.getElementById('three-canvas');
  
  // Audio Panel & Synth Setup
  const audioToggle = document.getElementById('audio-toggle');
  const audioIcon = document.getElementById('audio-icon');
  const audioLabel = document.querySelector('.audio-label');
  let audioEnabled = false;

  // Web Audio Synth Engine
  class SynthSFX {
    constructor() {
      this.ctx = null;
    }

    init() {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    // Gentle short hover synth pulse
    playHover() {
      if (!audioEnabled) return;
      this.init();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, this.ctx.currentTime); // Low-frequency tick
      
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.1);
    }

    // High-tech click beep
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
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 0.15);
      osc2.stop(this.ctx.currentTime + 0.15);
    }

    // Special sound for spawning interactive canvas particles on click
    playCanvasClick() {
      if (!audioEnabled) return;
      this.init();
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      // Beautiful slide from 600Hz to 150Hz representing a packet landing!
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    // Beautiful glowing success chime arpeggio (C major pentatonic)
    playSuccessSweep() {
      if (!audioEnabled) return;
      this.init();
      
      const notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // C4, D4, E4, G4, A4, C5
      const now = this.ctx.currentTime;
      
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
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

  // Handle Audio Toggle Button clicks
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    if (audioEnabled) {
      sfx.init();
      audioToggle.classList.add('fx-active');
      audioIcon.className = "fa-solid fa-volume-high";
      audioLabel.textContent = "FX Active";
      sfx.playClick();
    } else {
      audioToggle.classList.remove('fx-active');
      audioIcon.className = "fa-solid fa-volume-xmark";
      audioLabel.textContent = "FX Muted";
    }
  });

  // Attach hover sounds to navigation links and buttons
  const soundElements = document.querySelectorAll('.nav-link, .btn, .project-link, #audio-toggle, .glassmorphic-card');
  soundElements.forEach(el => {
    el.addEventListener('mouseenter', () => sfx.playHover());
    el.addEventListener('click', () => sfx.playClick());
  });

  // Interactive 3D Canvas clicks audio feedback
  if (canvas) {
    canvas.addEventListener('click', (e) => {
      // Only play if clicked directly on background canvas and not on interactive overlay panels
      if (e.target === canvas) {
        sfx.playCanvasClick();
      }
    });
  }

  // --- Sticky Navigation header ---
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.top = '12px';
      header.style.padding = '12px 24px';
    } else {
      header.style.top = '24px';
      header.style.padding = '16px 32px';
    }
  });

  // --- Responsive Hamburger Menu ---
  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const isOpen = navMenu.classList.contains('open');
    menuToggle.querySelector('i').className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
  });

  // Close mobile menu on clicking any link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      menuToggle.querySelector('i').className = "fa-solid fa-bars";
    });
  });

  // --- Intersection Observer for Active Link Highlighting ---
  const observerOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px',
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Remove active class from all links and sections
        navLinks.forEach(link => link.classList.remove('active'));
        sections.forEach(sec => sec.classList.remove('active-section'));

        // Add active state to corresponding section and nav link
        const targetLink = document.querySelector(`.nav-link[data-section="${id}"]`);
        if (targetLink) targetLink.classList.add('active');
        entry.target.classList.add('active-section');
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  // --- Tactile 3D Mouse Card Tilt Effects ---
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x coordinate inside element
      const y = e.clientY - rect.top;  // y coordinate inside element
      
      const width = rect.width;
      const height = rect.height;

      // Calculate tilt percentages (-1 to 1)
      const tiltX = (y / height - 0.5) * 16; // Up to 16 degrees tilt
      const tiltY = (x / width - 0.5) * -16; // Up to 16 degrees tilt

      // Set mouse custom properties for radial gradient shine effect
      card.style.setProperty('--mouse-x', `${(x / width) * 100}%`);
      card.style.setProperty('--mouse-y', `${(y / height) * 100}%`);

      // Apply 3D perspective rotation
      card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-5px)`;
    });

    // Smooth reset on mouse leave
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.5s ease';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none'; // Disable transition during active tilt tracking
    });
  });

  // --- Contact Form handling & Animation ---
  const contactForm = document.getElementById('contact-form');
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const nameInput = document.getElementById('form-name');
    const emailInput = document.getElementById('form-email');
    const messageInput = document.getElementById('form-message');
    
    let isValid = true;
    
    // Reset validations
    document.querySelectorAll('.form-group').forEach(grp => grp.classList.remove('invalid'));

    // Validate Name
    if (!nameInput.value.trim()) {
      nameInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }
    
    // Validate Email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(emailInput.value.trim())) {
      emailInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }
    
    // Validate Message
    if (!messageInput.value.trim()) {
      messageInput.closest('.form-group').classList.add('invalid');
      isValid = false;
    }

    if (isValid) {
      // Trigger gorgeous warm arpeggio swoop!
      sfx.playSuccessSweep();
      
      const submitBtn = contactForm.querySelector('.btn-submit');
      const submitBtnText = submitBtn.querySelector('span');
      const submitBtnIcon = submitBtn.querySelector('i');
      
      // Animate submission state
      submitBtn.disabled = true;
      submitBtn.style.background = 'linear-gradient(135deg, var(--neon-emerald) 0%, var(--neon-cyan) 100%)';
      submitBtn.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.4)';
      submitBtnText.textContent = 'Transmission Complete';
      submitBtnIcon.className = 'fa-solid fa-circle-check';
      
      // Console logging the success for simulation
      console.log('--- SIGNAL ACQUIRED ---');
      console.log('Sender:', nameInput.value.trim());
      console.log('Email:', emailInput.value.trim());
      console.log('Message:', messageInput.value.trim());

      // Reset form after delay
      setTimeout(() => {
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.style.background = '';
        submitBtn.style.boxShadow = '';
        submitBtnText.textContent = 'Send Signal';
        submitBtnIcon.className = 'fa-solid fa-paper-plane';
      }, 5000);
    }
  });
}
