/**
 * Urban Guardian — news.js
 * Fetches live crime news from Aaj Tak (/api/aajtak-crime)
 * and renders 6-8 cards. Clicking a card opens a modal with
 * the full article content (scraped server-side, no redirect).
 */

/* ── Fetch articles from proxy ───────────────────────────────── */
async function fetchAajtakNews() {
  try {
    const res  = await fetch('/api/aajtak-crime', { signal: AbortSignal.timeout(10000) });
    const data = await res.json();
    if (data.success && data.articles.length) return data.articles;
  } catch (e) {
    console.warn('[news] fetch failed:', e.message);
  }
  return null;
}

/* ── Fetch full article content ──────────────────────────────── */
async function fetchArticle(url) {
  const res  = await fetch(`/api/aajtak-article?url=${encodeURIComponent(url)}`);
  const data = await res.json();
  return data.success ? data.article : null;
}

/* ── Time ago helper ─────────────────────────────────────────── */
function timeAgo(dateStr) {
  if (!dateStr) return 'आज';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  const diff = Date.now() - d.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'अभी';
  if (m < 60) return `${m}m पहले`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h पहले`;
  return `${Math.floor(h / 24)}d पहले`;
}

/* ── Build news panel ────────────────────────────────────────── */
function buildNewsPanel(articles) {
  const mapWrap = document.querySelector('.inline-map-wrap');
  if (!mapWrap) return;

  let panel = document.getElementById('newsPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'newsPanel';
    mapWrap.parentNode.insertBefore(panel, mapWrap.nextSibling);
  }

  const cards = articles.slice(0, 8).map((a, i) => `
    <div class="news-card" onclick="openNewsModal(${i})" style="cursor:pointer">
      ${a.img
        ? `<div class="nc-img" style="background-image:url('${a.img}')"></div>`
        : `<div class="nc-img nc-img-placeholder">📰</div>`}
      <div class="nc-body">
        <div class="nc-meta">
          <span class="nc-source">Aaj Tak</span>
          <span class="nc-time">${timeAgo(a.date)}</span>
        </div>
        <p class="nc-title">${a.title}</p>
        ${a.desc ? `<p class="nc-desc">${a.desc.slice(0, 100)}...</p>` : ''}
      </div>
    </div>
  `).join('');

  panel.innerHTML = `
    <div class="news-panel-header">
      <div class="np-title">
        <span class="np-dot"></span>
        लाइव क्राइम न्यूज़ — Aaj Tak
      </div>
      <span class="np-count">${articles.length} खबरें</span>
      <button class="np-refresh" onclick="refreshNews()" title="Refresh">↻</button>
    </div>
    <div class="news-grid" id="newsGrid">${cards}</div>
    <p class="np-credit">Source: <a href="https://www.aajtak.in/crime/news" target="_blank" rel="noopener">aajtak.in/crime</a></p>
  `;

  // Store articles globally for modal access
  window._aajtakArticles = articles;
}

/* ── News Modal ──────────────────────────────────────────────── */
function buildModal() {
  if (document.getElementById('newsModal')) return;
  const modal = document.createElement('div');
  modal.id = 'newsModal';
  modal.innerHTML = `
    <div class="nm-backdrop" onclick="closeNewsModal()"></div>
    <div class="nm-box">
      <div class="nm-header">
        <span class="nm-source">Aaj Tak — क्राइम</span>
        <button class="nm-close" onclick="closeNewsModal()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="nm-body" id="nmBody">
        <div class="nm-loading">
          <div class="nm-spinner"></div>
          <span>खबर लोड हो रही है...</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

async function openNewsModal(index) {
  buildModal();
  const modal = document.getElementById('newsModal');
  const body  = document.getElementById('nmBody');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  body.innerHTML = `<div class="nm-loading"><div class="nm-spinner"></div><span>खबर लोड हो रही है...</span></div>`;

  const articleMeta = window._aajtakArticles?.[index];
  if (!articleMeta) { body.innerHTML = '<p style="color:#F87171;padding:20px">खबर नहीं मिली।</p>'; return; }

  try {
    const article = await fetchArticle(articleMeta.url);
    if (!article || !article.content.length) {
      // Fallback: show what we have from the listing
      body.innerHTML = `
        ${articleMeta.img ? `<img src="${articleMeta.img}" class="nm-img" alt="">` : ''}
        <h2 class="nm-title">${articleMeta.title}</h2>
        <p class="nm-date">${articleMeta.date}</p>
        <div class="nm-content"><p>${articleMeta.desc || 'पूरी खबर के लिए Aaj Tak पर जाएं।'}</p></div>
        <a href="${articleMeta.url}" target="_blank" rel="noopener" class="nm-read-more">Aaj Tak पर पढ़ें →</a>
      `;
      return;
    }

    body.innerHTML = `
      ${article.img ? `<img src="${article.img}" class="nm-img" alt="">` : ''}
      <h2 class="nm-title">${article.title}</h2>
      <p class="nm-date">${article.date ? new Date(article.date).toLocaleDateString('hi-IN', {day:'numeric',month:'long',year:'numeric'}) : articleMeta.date}</p>
      <div class="nm-content">
        ${article.content.map(p => `<p>${p}</p>`).join('')}
      </div>
      <a href="${articleMeta.url}" target="_blank" rel="noopener" class="nm-read-more">Aaj Tak पर पढ़ें →</a>
    `;
  } catch (e) {
    body.innerHTML = `<p style="color:#F87171;padding:20px">खबर लोड नहीं हो सकी: ${e.message}</p>`;
  }
}

function closeNewsModal() {
  const modal = document.getElementById('newsModal');
  if (modal) modal.classList.remove('open');
  document.body.style.overflow = '';
}

// Close on Escape key
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNewsModal(); });

/* ── Build ticker ────────────────────────────────────────────── */
let tickerInterval = null;
let tickerIndex    = 0;

function buildTicker(articles) {
  const old = document.getElementById('newsTicker');
  if (old) old.remove();
  if (!articles.length) return;

  const ticker = document.createElement('div');
  ticker.id = 'newsTicker';
  ticker.innerHTML = `
    <div class="ticker-label">📰 LIVE NEWS</div>
    <div class="ticker-track">
      <div class="ticker-text" id="tickerText"></div>
    </div>
    <button class="ticker-close" onclick="document.getElementById('newsTicker').remove()" aria-label="Close">✕</button>
  `;
  document.body.appendChild(ticker);

  function showNext() {
    const el = document.getElementById('tickerText');
    if (!el) return;
    const a = articles[tickerIndex % articles.length];
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = `Aaj Tak: ${a.title}`;
      el.style.opacity = '1';
      tickerIndex++;
    }, 300);
  }
  showNext();
  if (tickerInterval) clearInterval(tickerInterval);
  tickerInterval = setInterval(showNext, 5000);
}

/* ── Main refresh ────────────────────────────────────────────── */
async function refreshNews() {
  const btn = document.querySelector('.np-refresh');
  if (btn) { btn.textContent = '⟳'; btn.style.animation = 'spin 1s linear infinite'; }

  const articles = await fetchAajtakNews();

  if (btn) { btn.textContent = '↻'; btn.style.animation = ''; }

  if (articles) {
    buildTicker(articles);
    buildNewsPanel(articles);
  }
}

/* ── Auto-init ───────────────────────────────────────────────── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => setTimeout(refreshNews, 800));
} else {
  setTimeout(refreshNews, 800);
}
