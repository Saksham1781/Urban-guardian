/* ═══════════════════════════════════════════════════════════════
   URBAN GUARDIAN — app.js  (redesigned)
═══════════════════════════════════════════════════════════════ */

// ── Clock ──────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2,'0');
  const m = String(now.getMinutes()).padStart(2,'0');
  const el = document.getElementById('phoneTime');
  if (el) el.textContent = `${h}:${m}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── Scroll helper ──────────────────────────────────────────────
function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior:'smooth' });
}

// ── Mobile menu ────────────────────────────────────────────────
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
hamburger?.addEventListener('click', () => mobileMenu.classList.toggle('open'));
function closeMobileMenu() { mobileMenu?.classList.remove('open'); }

// ── Navbar scroll ──────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('navbar');
  if (nav) nav.style.background = window.scrollY > 40
    ? 'rgba(10,15,44,0.98)' : 'rgba(10,15,44,0.82)';
});

// ── Hero Canvas Heatmap Animation ──────────────────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const blobs = [
    { x:0.15, y:0.35, r:0.22, color:'rgba(220,38,38,',   speed:0.0008, phase:0 },
    { x:0.72, y:0.25, r:0.18, color:'rgba(220,38,38,',   speed:0.0006, phase:1.2 },
    { x:0.55, y:0.65, r:0.20, color:'rgba(220,38,38,',   speed:0.0007, phase:2.4 },
    { x:0.25, y:0.70, r:0.16, color:'rgba(79,110,247,',  speed:0.0009, phase:0.8 },
    { x:0.80, y:0.60, r:0.19, color:'rgba(79,110,247,',  speed:0.0005, phase:1.8 },
    { x:0.45, y:0.20, r:0.14, color:'rgba(79,110,247,',  speed:0.0010, phase:3.0 },
    { x:0.60, y:0.45, r:0.12, color:'rgba(124,58,237,',  speed:0.0007, phase:0.5 },
    { x:0.30, y:0.50, r:0.10, color:'rgba(124,58,237,',  speed:0.0008, phase:2.0 },
  ];

  // City grid lines
  function drawGrid(t) {
    ctx.strokeStyle = 'rgba(79,110,247,0.05)';
    ctx.lineWidth = 1;
    const cols = 14, rows = 10;
    const cw = canvas.width / cols, ch = canvas.height / rows;
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cw, 0);
      ctx.lineTo(i * cw, canvas.height);
      ctx.stroke();
    }
    for (let j = 0; j <= rows; j++) {
      ctx.beginPath();
      ctx.moveTo(0, j * ch);
      ctx.lineTo(canvas.width, j * ch);
      ctx.stroke();
    }
  }

  let t = 0;
  function draw() {
    t++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark base
    ctx.fillStyle = '#060B18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid(t);

    // Animated blobs
    blobs.forEach(b => {
      const pulse = Math.sin(t * b.speed * 1000 + b.phase) * 0.04;
      const r = (b.r + pulse) * Math.min(canvas.width, canvas.height);
      const cx = b.x * canvas.width  + Math.sin(t * b.speed * 800 + b.phase) * 30;
      const cy = b.y * canvas.height + Math.cos(t * b.speed * 600 + b.phase) * 20;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      grad.addColorStop(0,   b.color + '0.18)');
      grad.addColorStop(0.5, b.color + '0.08)');
      grad.addColorStop(1,   b.color + '0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Heat Map Data ──────────────────────────────────────────────
const hourData = {
  0:  { safe:20, caution:35, risk:45, title:'Late Night — High Risk',        desc:'Minimal foot traffic, poor lighting. Most areas shift to caution or high risk.',
        cells:['r','r','y','r','r','y','r','r','y','r','r','r','r','y','r','r'] },
  1:  { safe:15, caution:30, risk:55, title:'1 AM — Danger Peak',            desc:'Lowest safety window. Avoid non-essential travel.',
        cells:['r','r','r','r','r','y','r','r','r','r','r','y','r','r','r','r'] },
  2:  { safe:15, caution:30, risk:55, title:'2 AM — Danger Peak',            desc:'Lowest safety window. Avoid non-essential travel.',
        cells:['r','r','r','r','r','y','r','r','r','r','r','y','r','r','r','r'] },
  3:  { safe:20, caution:35, risk:45, title:'3 AM — Still High Risk',        desc:'Very few people out. Risk remains elevated.',
        cells:['r','r','y','r','r','y','r','r','y','r','r','r','r','y','r','r'] },
  4:  { safe:30, caution:40, risk:30, title:'4 AM — Slight Improvement',     desc:'Early morning activity begins in some areas.',
        cells:['r','y','y','r','y','y','r','r','y','g','r','r','y','y','r','r'] },
  5:  { safe:45, caution:35, risk:20, title:'5 AM — Early Morning',          desc:'Commuters start appearing. Risk drops in main corridors.',
        cells:['y','g','g','y','y','g','y','r','g','g','y','r','y','g','y','y'] },
  6:  { safe:60, caution:28, risk:12, title:'6 AM — Morning Commute Begins', desc:'Increased activity. Most main roads become safe.',
        cells:['g','g','g','y','g','g','y','y','g','g','g','y','y','g','g','y'] },
  7:  { safe:70, caution:22, risk:8,  title:'7 AM — Morning Rush',           desc:'High foot traffic keeps most areas safe.',
        cells:['g','g','g','g','g','g','y','g','g','g','g','y','g','g','g','g'] },
  8:  { safe:75, caution:18, risk:7,  title:'8 AM — Business Hours Start',   desc:'City is active. Most zones are green.',
        cells:['g','g','g','g','g','g','g','y','g','g','g','g','g','g','y','g'] },
  9:  { safe:78, caution:16, risk:6,  title:'9 AM — Peak Safety',            desc:'Busy streets, open businesses — optimal safety conditions.',
        cells:['g','g','g','g','g','g','g','g','g','g','g','y','g','g','g','g'] },
  10: { safe:80, caution:14, risk:6,  title:'10 AM — Peak Safety',           desc:'Busy streets, open businesses — optimal safety conditions.',
        cells:['g','g','g','g','g','g','g','g','g','g','g','y','g','g','g','g'] },
  11: { safe:80, caution:14, risk:6,  title:'11 AM — Peak Safety',           desc:'Busy streets, open businesses — optimal safety conditions.',
        cells:['g','g','g','g','g','g','g','g','g','g','g','y','g','g','g','g'] },
  12: { safe:78, caution:16, risk:6,  title:'Midday — City is Mostly Safe',  desc:'Most areas are green during business hours.',
        cells:['g','g','g','g','g','g','g','y','g','g','g','g','g','g','y','g'] },
  13: { safe:78, caution:16, risk:6,  title:'1 PM — Afternoon Activity',     desc:'Lunch crowds keep streets active and safe.',
        cells:['g','g','g','g','g','g','g','y','g','g','g','g','g','g','y','g'] },
  14: { safe:76, caution:18, risk:6,  title:'2 PM — Afternoon',              desc:'Steady activity. Minor caution zones near transit hubs.',
        cells:['g','g','g','g','g','g','y','g','g','g','g','y','g','g','g','g'] },
  15: { safe:74, caution:20, risk:6,  title:'3 PM — School Hours End',       desc:'Increased pedestrian activity near schools and parks.',
        cells:['g','g','g','y','g','g','y','g','g','g','g','g','y','g','g','g'] },
  16: { safe:72, caution:20, risk:8,  title:'4 PM — Evening Commute',        desc:'Rush hour begins. Some areas see increased incidents.',
        cells:['g','g','y','g','g','g','y','g','y','g','g','g','g','y','g','g'] },
  17: { safe:68, caution:22, risk:10, title:'5 PM — Peak Commute',           desc:'Busy but manageable. Stay on main routes.',
        cells:['g','g','y','g','g','y','y','g','y','g','g','y','g','y','g','g'] },
  18: { safe:62, caution:26, risk:12, title:'6 PM — Evening Begins',         desc:'Daylight fading. Some zones shifting to caution.',
        cells:['g','y','y','g','g','y','y','r','y','g','g','y','g','y','y','g'] },
  19: { safe:55, caution:28, risk:17, title:'7 PM — Dusk',                   desc:'Lighting becomes a factor. Stick to well-lit routes.',
        cells:['g','y','y','r','g','y','r','r','y','g','y','y','g','y','y','r'] },
  20: { safe:48, caution:30, risk:22, title:'8 PM — Night Activity',         desc:'Entertainment districts active but risk rising in quieter areas.',
        cells:['y','y','r','r','g','y','r','r','y','y','y','r','g','y','y','r'] },
  21: { safe:40, caution:32, risk:28, title:'9 PM — Night Risk Rising',      desc:'Avoid isolated areas. Stay in groups where possible.',
        cells:['y','r','r','r','g','y','r','r','y','y','r','r','y','y','r','r'] },
  22: { safe:32, caution:33, risk:35, title:'10 PM — High Caution',          desc:'Significant risk increase. Plan your route carefully.',
        cells:['r','r','r','r','y','r','r','r','y','r','r','r','y','y','r','r'] },
  23: { safe:25, caution:33, risk:42, title:'11 PM — Late Night Danger',     desc:'Most areas shift to high risk. Limit travel if possible.',
        cells:['r','r','r','r','r','r','r','r','r','r','r','r','r','y','r','r'] },
};

const cellColors = {
  g: 'rgba(0,229,160,0.28)',
  y: 'rgba(255,214,10,0.28)',
  r: 'rgba(255,78,106,0.28)'
};
const cellBorders = {
  g: 'rgba(0,229,160,0.45)',
  y: 'rgba(255,214,10,0.45)',
  r: 'rgba(255,78,106,0.45)'
};

// ── Heat Map Rendering ─────────────────────────────────────────
function buildMapGrid(containerId) {
  const grid = document.querySelector(`#${containerId} .map-grid`);
  if (!grid) return;
  grid.innerHTML = '';
  for (let i = 0; i < 16; i++) {
    const cell = document.createElement('div');
    cell.className = 'map-cell';
    grid.appendChild(cell);
  }
}

function applyHourToMap(hour, gridSelector) {
  const data  = hourData[parseInt(hour)] || hourData[12];
  const cells = document.querySelectorAll(`${gridSelector} .map-cell`);
  cells.forEach((cell, i) => {
    const key = (data.cells && data.cells[i % data.cells.length]) || 'g';
    cell.style.background  = cellColors[key];
    cell.style.borderLeft  = `3px solid ${cellBorders[key]}`;
    cell.style.borderRadius = '6px';
  });
}

function updateZoneInfo(hour) {
  const data = hourData[hour] || hourData[12];
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  const setW = (id, val) => { const el = document.getElementById(id); if (el) el.style.width = val + '%'; };
  set('zoneTitle', data.title);
  set('zoneDesc',  data.desc);
  setW('safeBar',    data.safe);
  setW('cautionBar', data.caution);
  setW('riskBar',    data.risk);
  set('safePct',    data.safe    + '%');
  set('cautionPct', data.caution + '%');
  set('riskPct',    data.risk    + '%');
}

function formatHour(h) {
  if (h === 0)  return '12:00 AM';
  if (h === 12) return '12:00 PM';
  return h < 12 ? `${h}:00 AM` : `${h-12}:00 PM`;
}

function setTime(h) {
  const slider = document.getElementById('timeSlider');
  if (slider) { slider.value = h; slider.dispatchEvent(new Event('input')); }
}

buildMapGrid('mapContainer');

const timeSlider  = document.getElementById('timeSlider');
const timeDisplay = document.getElementById('timeDisplay');

function onTimeChange(h) {
  h = parseInt(h);
  if (timeDisplay) timeDisplay.textContent = formatHour(h);
  applyHourToMap(h, '#mapContainer');
  updateZoneInfo(h);
  updateMiniScore(h);
}

timeSlider?.addEventListener('input', e => onTimeChange(e.target.value));
onTimeChange(12);

// ── Mini Score ─────────────────────────────────────────────────
function updateMiniScore(hour) {
  const data  = hourData[hour] || hourData[12];
  const score = Math.round(data.safe * 0.9 + data.caution * 0.3);
  const el    = document.getElementById('miniScore');
  if (el) {
    el.textContent = score;
    el.style.color = score >= 65 ? 'var(--mint)' : score >= 40 ? 'var(--yellow)' : 'var(--coral)';
  }
}

// ── SOS Demo ───────────────────────────────────────────────────
let sosTimer = null;

function startSOS() {
  const btn = document.getElementById('sosBtn');
  if (btn) btn.style.transform = 'scale(0.92)';
  let progress = 0;
  sosTimer = setInterval(() => {
    progress += 100;
    if (progress >= 3000) { clearInterval(sosTimer); activateSOS(); }
  }, 100);
}

function cancelSOS() {
  clearInterval(sosTimer);
  const btn = document.getElementById('sosBtn');
  if (btn) btn.style.transform = 'scale(1)';
}

function activateSOS() {
  const idle   = document.getElementById('sosIdle');
  const active = document.getElementById('sosActive');
  if (idle)   idle.style.display   = 'none';
  if (active) { active.style.display = 'flex'; active.style.flexDirection = 'column'; active.style.alignItems = 'center'; }
  ['s1','s2','s3','s4'].forEach((id, i) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.style.opacity = '1';
    }, i * 900);
  });
}

function resetSOS() {
  const idle   = document.getElementById('sosIdle');
  const active = document.getElementById('sosActive');
  if (idle)   { idle.style.display = 'flex'; idle.style.flexDirection = 'column'; idle.style.alignItems = 'center'; }
  if (active) active.style.display = 'none';
  ['s2','s3','s4'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.opacity = '0.3';
  });
}

function triggerSOSDemo() {
  scrollTo('sos');
  setTimeout(activateSOS, 400);
}

// ── Safety Score Demo (Day/Night toggle) ───────────────────────
const demoModes = {
  day: {
    score: 87, label: 'Safe', color: '#22C55E',
    time: '2:30 PM — Daytime',
    route: 'Main Street via Park Ave',
    risk: 'Low foot traffic near Station Rd',
    verdict: 'Route is safe. Proceed normally.',
    routeColor: 'linear-gradient(90deg, #16A34A, #4F6EF7)',
    zones: [
      { cls:'safe',   s:'top:5%;left:5%;width:40%;height:35%' },
      { cls:'safe',   s:'top:5%;left:52%;width:40%;height:25%' },
      { cls:'caution',s:'top:45%;left:5%;width:35%;height:30%' },
      { cls:'safe',   s:'top:45%;left:48%;width:45%;height:40%' },
    ],
    fastRisk: 'Moderate Risk',
    fastCls: 'ro fast-ro',
    balancedCls: 'ro balanced-ro active-ro',
  },
  night: {
    score: 34, label: 'Danger', color: '#F87171',
    time: '11:30 PM — Night',
    route: 'Rerouted via Lit Corridor B',
    risk: 'Dark alley on Station Rd, isolated park',
    verdict: 'High risk detected. Rerouting to safer path.',
    routeColor: 'linear-gradient(90deg, #DC2626, #EA580C)',
    zones: [
      { cls:'danger', s:'top:5%;left:5%;width:40%;height:35%' },
      { cls:'caution',s:'top:5%;left:52%;width:40%;height:25%' },
      { cls:'danger', s:'top:45%;left:5%;width:35%;height:30%' },
      { cls:'caution',s:'top:45%;left:48%;width:45%;height:40%' },
    ],
    fastRisk: 'HIGH RISK — Avoid',
    fastCls: 'ro fast-ro active-ro',
    balancedCls: 'ro balanced-ro',
  }
};

function setDemoMode(mode) {
  const d = demoModes[mode];
  if (!d) return;

  // Toggle buttons
  document.getElementById('dayBtn')?.classList.toggle('active', mode === 'day');
  document.getElementById('nightBtn')?.classList.toggle('active', mode === 'night');

  // Score ring
  const circumference = 2 * Math.PI * 50; // r=50
  const offset = circumference - (d.score / 100) * circumference;
  const fill = document.getElementById('srFill');
  if (fill) { fill.style.stroke = d.color; fill.style.strokeDashoffset = offset; }
  const srNum = document.getElementById('srNum');
  if (srNum) { srNum.textContent = d.score; srNum.style.color = d.color; }
  const srLabel = document.getElementById('srLabel');
  if (srLabel) { srLabel.textContent = d.label; }

  // Phone score
  const dpScore = document.getElementById('dpScoreVal');
  if (dpScore) { dpScore.textContent = d.score; dpScore.style.color = d.color; }
  // Time display
  const dpTime = document.getElementById('dpTime');
  if (dpTime) dpTime.textContent = mode === 'day' ? '2:30 PM' : '11:30 PM';

  // Details
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('ddTimeVal', d.time);
  set('ddRoute',   d.route);
  set('ddRisk',    d.risk);
  set('ddVerdict', d.verdict);

  // Route line color
  const route = document.getElementById('demoRoute');
  if (route) route.style.background = d.routeColor;

  // Map zones
  const demoMap = document.getElementById('demoMap');
  if (demoMap) {
    demoMap.querySelectorAll('.dm-zone').forEach((z, i) => {
      if (d.zones[i]) {
        z.className = `dm-zone ${d.zones[i].cls}`;
        z.style.cssText = d.zones[i].s;
      }
    });
  }

  // Route options
  const roFast     = document.getElementById('roFast');
  const roBalanced = document.getElementById('roBalanced');
  if (roFast)     { roFast.className = d.fastCls; roFast.textContent = `🔴 Fastest — ${d.fastRisk}`; }
  if (roBalanced) roBalanced.className = d.balancedCls;
}

// Init demo
setDemoMode('day');

// ── Waitlist Form ──────────────────────────────────────────────
function joinWaitlist(e) {
  e.preventDefault();
  const email   = document.getElementById('waitlistEmail')?.value;
  const confirm = document.getElementById('ctaConfirm');
  if (confirm && email) {
    confirm.style.display = 'block';
    document.getElementById('waitlistEmail').value = '';
  }
}

// ── Scroll-triggered fade-in ───────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  '.problem-card, .feat-card, .persona-card, .dd-item, .sos-feature, .hero-content, .hero-phone-wrap, .sbar-item'
).forEach(el => {
  el.classList.add('fade-in');
  observer.observe(el);
});

// ── Score ring animation on scroll ────────────────────────────
const demoObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setDemoMode('day'); // re-trigger animation
      demoObserver.disconnect();
    }
  });
}, { threshold: 0.2 });
const demoSection = document.getElementById('demo');
if (demoSection) demoObserver.observe(demoSection);
