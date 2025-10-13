// Nav toggle
const navToggle = document.querySelector('.nav__toggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
    navToggle.setAttribute('aria-expanded', String(!expanded));
    navMenu.setAttribute('aria-expanded', String(!expanded));
  });
}

// Theme toggle + persist
const themeBtn = document.getElementById('themeToggle');
const root = document.documentElement;
const storedTheme = localStorage.getItem('theme');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
function setTheme(mode){ root.setAttribute('data-theme', mode); localStorage.setItem('theme', mode); }
setTheme(storedTheme || (systemDark ? 'dark' : 'light'));
if (themeBtn){ themeBtn.addEventListener('click', ()=> setTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark')); }

// Current year - with null check
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

copyProofBtn?.addEventListener('click', async ()=>{
  try { await navigator.clipboard.writeText('Ownership proof: phrase "green-olive-7231", masked serial SN•••7231, hidden mark under seatpost.'); copyProofBtn.textContent = 'Copied ✓'; }
  catch { copyProofBtn.textContent = 'Copy failed'; }
});

// If opened with ?found=1, auto-scroll to found section and gently highlight it
if (new URLSearchParams(window.location.search).get('found') === '1') {
  const found = document.getElementById('found');
  found?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(()=> found?.classList.add('pulse'), 400);
}

// small pulse effect
const style = document.createElement('style');
style.textContent = '.pulse{box-shadow:0 0 0 0 rgba(37,99,235,.7); animation:pulse 1.5s ease 3} @keyframes pulse{0%{box-shadow:0 0 0 0 rgba(37,99,235,.6)}70%{box-shadow:0 0 0 18px rgba(37,99,235,0)}100%{box-shadow:0 0 0 0 rgba(37,99,235,0)}}';
document.head.appendChild(style);
