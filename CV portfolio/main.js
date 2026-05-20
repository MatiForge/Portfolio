/* ── CURSOR ── */
const cur  = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
let mx=window.innerWidth/2, my=window.innerHeight/2;
let rx=mx, ry=my, cx=mx, cy=my;

document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });

(function loop() {
  cx += (mx-cx)*0.22; cy += (my-cy)*0.22;
  rx += (mx-rx)*0.10; ry += (my-ry)*0.10;
  cur.style.left  = cx+'px'; cur.style.top  = cy+'px';
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(loop);
})();

/* ── HEADER SCROLL ── */
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── SCROLL REVEAL ── */
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

/* ── GITHUB REPOS ── */
const LANG_COLORS = {
  JavaScript:'#f0db4f', TypeScript:'#3178c6', Python:'#3572a5',
  HTML:'#e34c26', CSS:'#7B5EA7', 'C#':'#178600', C:'#555',
  Java:'#b07219', Rust:'#dea584', Go:'#00add8', PHP:'#4f5d95',
  Shell:'#89e051', Lua:'#000088', Kotlin:'#A97BFF',
};

async function loadRepos() {
  const grid = document.getElementById('repos-grid');
  try {
    const r = await fetch('https://api.github.com/users/MatiForge/repos?sort=updated&per_page=30&type=public');
    if (!r.ok) throw new Error(r.status);
    const repos = await r.json();

    const list = repos
      .filter(r => !r.fork)
      .sort((a,b) => (b.stargazers_count - a.stargazers_count) || (new Date(b.updated_at)-new Date(a.updated_at)));

    if (!list.length) {
      grid.innerHTML = '<div class="repos-error">// no public repositories</div>';
      return;
    }

    grid.innerHTML = list.map((repo, i) => {
      const lang  = repo.language;
      const color = lang ? (LANG_COLORS[lang] || '#666') : null;
      const desc  = repo.description || '';
      const date  = new Date(repo.updated_at).toLocaleDateString('en-US', {month:'short', year:'numeric'});
      const delay = (i * 0.045).toFixed(2);
      return `
        <a class="repo-card reveal" style="--d:${delay}s"
           href="${repo.html_url}" target="_blank" rel="noopener">
          <div class="repo-name">
            ${repo.name}
            <span class="repo-arrow">↗</span>
          </div>
          <p class="repo-desc">${desc || '<span style="opacity:.3;font-style:italic">no description</span>'}</p>
          <div class="repo-meta">
            ${lang ? `<span class="repo-lang"><span class="lang-dot" style="background:${color}"></span>${lang}</span>` : ''}
            <span class="repo-stars">
              <svg width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              ${repo.stargazers_count}
            </span>
            <span class="repo-date">${date}</span>
          </div>
        </a>`;
    }).join('');

    grid.querySelectorAll('.reveal').forEach(el => observer.observe(el));
  } catch(err) {
    grid.innerHTML = `<div class="repos-error">// failed to fetch repositories (${err.message})</div>`;
  }
}

loadRepos();