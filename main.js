// Cursor bubble
const bubble = document.createElement('div');
bubble.className = 'cursor-bubble is-hidden';
document.body.appendChild(bubble);

let mouseX = 0, mouseY = 0;
let bubbleX = 0, bubbleY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  bubble.classList.remove('is-hidden');
});

document.addEventListener('mouseleave', () => bubble.classList.add('is-hidden'));

(function animateBubble() {
  bubbleX += (mouseX - bubbleX) * 0.08;
  bubbleY += (mouseY - bubbleY) * 0.08;
  bubble.style.left = bubbleX + 'px';
  bubble.style.top = bubbleY + 'px';
  requestAnimationFrame(animateBubble);
})();

// Auto-update age
const birthDate = new Date('2005-01-30');
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
if (today < new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())) age--;
document.getElementById('age').textContent = age;

// Initialize Lucide icons
lucide.createIcons();

// Photocard click-to-highlight
document.querySelectorAll('.ktm-photocard').forEach((card) => {
  card.addEventListener('click', () => {
    const isAlreadyActive = card.classList.contains('is-active');
    document.querySelectorAll('.ktm-photocard').forEach((c) => c.classList.remove('is-active'));
    if (!isAlreadyActive) card.classList.add('is-active');
  });
});


// Navbar toggle
const nav = document.getElementById('site-nav');
const navOverlay = document.getElementById('nav-overlay');
const toggle = document.getElementById('nav-toggle');
const navLinks = document.querySelectorAll('.nav-link');

function closeNav() {
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
}

toggle.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    closeNav();
    suppressFlash = true;
    setTimeout(() => { suppressFlash = false; }, 1200);
  });
});

// Section tracking
let activeSection = null;
let hasScrolled = false;
let flashTimer = null;
let suppressFlash = false;
let scrollDir = 'down';
let prevScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  scrollDir = window.scrollY >= prevScrollY ? 'down' : 'up';
  prevScrollY = window.scrollY;
  hasScrolled = true;
}, { passive: true });


function setActiveSection(id) {
  if (id === activeSection) return;
  activeSection = id;

  navLinks.forEach((link) => {
    link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
  });

  if (hasScrolled && scrollDir === 'down' && !nav.classList.contains('is-open') && !suppressFlash) {
    flashOverlay();
  }
}

function flashOverlay() {
  clearTimeout(flashTimer);

  navOverlay.style.transition = 'opacity 0.35s ease';
  navOverlay.style.opacity = '1';
  navOverlay.style.pointerEvents = 'none';

  flashTimer = setTimeout(() => {
    navOverlay.style.transition = 'opacity 0.6s ease';
    navOverlay.style.opacity = '0';
  }, 1000);
}

// Restore overlay for manual open/close
toggle.addEventListener('click', () => {
  navOverlay.style.transition = '';
  navOverlay.style.opacity = '';
  navOverlay.style.pointerEvents = '';
  clearTimeout(flashTimer);
}, { capture: true });

const sections = document.querySelectorAll('section[id]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) setActiveSection(entry.target.id);
  });
}, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

sections.forEach((s) => observer.observe(s));
