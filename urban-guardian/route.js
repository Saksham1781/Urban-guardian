/* ═══════════════════════════════════════════════════════════════
   URBAN GUARDIAN — route.js
   Safe Route Planner using Google Maps Directions API + Leaflet
   Overlays district crime zones and landmarks on the route
═══════════════════════════════════════════════════════════════ */

// ── Config ────────────────────────────────────────────────────
// Replace with your actual Google Maps API key
const GMAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// ── Landmark database (major Indian city landmarks) ───────────
const LANDMARKS = [
  // Delhi
  { name:'India Gate',          type:'Monument',      lat:28.6129, lng:77.2295, city:'Delhi' },
  { name:'Connaught Place',     type:'Commercial Hub', lat:28.6315, lng:77.2167, city:'Delhi' },
  { name:'Lajpat Nagar Market', type:'Market',         lat:28.5677, lng:77.2433, city:'Delhi' },
  { name:'AIIMS Hospital',      type:'Hospital',       lat:28.5672, lng:77.2100, city:'Delhi' },
  { name:'New Delhi Railway',   type:'Transit Hub',    lat:28.6431, lng:77.2194, city:'Delhi' },
  { name:'Saket Metro',         type:'Metro Station',  lat:28.5244, lng:77.2066, city:'Delhi' },
  { name:'Hauz Khas Village',   type:'Landmark',       lat:28.5494, lng:77.2001, city:'Delhi' },
  { name:'Nehru Place',         type:'Commercial Hub', lat:28.5491, lng:77.2519, city:'Delhi' },
  // Mumbai
  { name:'Gateway of India',    type:'Monument',       lat:18.9220, lng:72.8347, city:'Mumbai' },
  { name:'CST Railway Station', type:'Transit Hub',    lat:18.9398, lng:72.8355, city:'Mumbai' },
  { name:'Bandra Station',      type:'Transit Hub',    lat:19.0543, lng:72.8403, city:'Mumbai' },
  { name:'Dadar Market',        type:'Market',         lat:19.0178, lng:72.8478, city:'Mumbai' },
  { name:'Lilavati Hospital',   type:'Hospital',       lat:19.0543, lng:72.8295, city:'Mumbai' },
  // Bengaluru
  { name:'MG Road',             type:'Commercial Hub', lat:12.9757, lng:77.6011, city:'Bengaluru' },
  { name:'Majestic Bus Stand',  type:'Transit Hub',    lat:12.9775, lng:77.5713, city:'Bengaluru' },
  { name:'Indiranagar',         type:'Landmark',       lat:12.9784, lng:77.6408, city:'Bengaluru' },
  { name:'Manipal Hospital',    type:'Hospital',       lat:12.9592, lng:77.6974, city:'Bengaluru' },
  // Hyderabad
  { name:'Charminar',           type:'Monument',       lat:17.3616, lng:78.4747, city:'Hyderabad' },
  { name:'Hitech City',         type:'Commercial Hub', lat:17.4435, lng:78.3772, city:'Hyderabad' },
  { name:'Secunderabad Station',type:'Transit Hub',    lat:17.4399, lng:78.4983, city:'Hyderabad' },
  // Chennai
  { name:'Marina Beach',        type:'Landmark',       lat:13.0500, lng:80.2824, city:'Chennai' },
  { name:'Central Station',     type:'Transit Hub',    lat:13.0827, lng:80.2707, city:'Chennai' },
  { name:'T Nagar',             type:'Commercial Hub', lat:13.0418, lng:80.2341, city:'Chennai' },
  // Kolkata
  { name:'Victoria Memorial',   type:'Monument',       lat:22.5448, lng:88.3426, city:'Kolkata' },
  { name:'Howrah Station',      type:'Transit Hub',    lat:22.5839, lng:88.3424, city:'Kolkata' },
  { name:'Park Street',         type:'Commercial Hub', lat:22.5514, lng:88.3519, city:'Kolkata' },
  // Pune
  { name:'Shivajinagar',        type:'Commercial Hub', lat:18.5308, lng:73.8475, city:'Pune' },
  { name:'Pune Station',        type:'Transit Hub',    lat:18.5285, lng:73.8742, city:'Pune' },
  { name:'Koregaon Park',       type:'Landmark',       lat:18.5362, lng:73.8938, city:'Pune' },
  // Jaipur
  { name:'Hawa Mahal',          type:'Monument',       lat:26.9239, lng:75.8267, city:'Jaipur' },
  { name:'Jaipur Junction',     type:'Transit Hub',    lat:26.9124, lng:75.7873, city:'Jaipur' },
  { name:'MI Road',             type:'Commercial Hub', lat:26.9124, lng:75.7873, city:'Jaipur' },
];

// ── Route map state ───────────────────────────────────────────
let routeMap = null;
let routeLayerGroup = null;
let zoneLayerGroup  = null;
let landmarkLayerGroup = null;
let currentRoutes = [];

// ── Init route map ────────────────────────────────────────────
function initRouteMap() {
  if (routeMap) return;
  routeMap = L.map('routeMap', { zoomControl: false }).setView([22.5, 82.5], 5);
  L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors', maxZoom: 18
  }).addTo(routeMap);
  L.control.zoom({ position: 'bottomright' }).addTo(routeMap);
  routeLayerGroup   = L.layerGroup().addTo(routeMap);
  zoneLayerGroup    = L.layerGroup().addTo(routeMap);
  landmarkLayerGroup = L.layerGroup().addTo(routeMap);
}

// Init when section scrolls into view
const routeObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      initRouteMap();
      setTimeout(() => { if (routeMap) routeMap.invalidateSize(); }, 100);
      routeObserver.disconnect();
    }
  });
}, { threshold: 0.05 });
const routeSection = document.getElementById('route-planner');
if (routeSection) routeObserver.observe(routeSection);

// ── Geocode using Nominatim (free, no key needed) ─────────────
async function geocode(query) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ', India')}&format=json&limit=1`;
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
  const data = await res.json();
  if (!data.length) throw new Error(`Could not find location: "${query}"`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
}

// ── Get route from OSRM (free routing, no key needed) ─────────
async function getRoute(originLatLng, destLatLng) {
  const url = `https://router.project-osrm.org/route/v1/driving/${originLatLng.lng},${originLatLng.lat};${destLatLng.lng},${destLatLng.lat}?overview=full&geometries=geojson&alternatives=true`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes.length) throw new Error('Could not calculate route');
  return data.routes;
}

// ── Score a route against district crime data ─────────────────
function scoreRoute(routeCoords) {
  let totalRisk = 0;
  let zonesHit = [];
  let newsPenaltyApplied = false;

  // Check each district against route bounding box + proximity
  districts.forEach(d => {
    const level = getLevel(d.total);
    const weight = { critical: 4, high: 2, moderate: 1, low: 0 }[level];
    if (weight === 0) return;

    // Check if any route point is within ~50km of district center
    const nearPoint = routeCoords.some(([lng, lat]) => {
      const dlat = lat - d.lat, dlng = lng - d.lng;
      return Math.sqrt(dlat*dlat + dlng*dlng) < 0.5; // ~55km
    });

    if (nearPoint) {
      totalRisk += weight;
      
      // Check for live news penalty
      let hasNews = false;
      if (window.newsArticles && window.newsArticles.length > 0) {
        const dName = d.name.toLowerCase();
        hasNews = window.newsArticles.some(a => (a.district && a.district.toLowerCase() === dName) || (a.title && a.title.toLowerCase().includes(dName)));
        if (hasNews) {
          totalRisk += 2.5; // Adds ~20 penalty points to score
          newsPenaltyApplied = true;
        }
      }
      
      zonesHit.push({ name: d.name, state: d.state, level, total: d.total, hasNews });
    }
  });

  // Score: 100 = perfectly safe, 0 = extremely dangerous
  const score = Math.max(10, Math.round(100 - (totalRisk * 8)));
  return { score, zonesHit, newsPenaltyApplied };
}

// ── Find landmarks near a route ───────────────────────────────
function findLandmarksNearRoute(routeCoords) {
  const nearby = [];
  LANDMARKS.forEach(lm => {
    const near = routeCoords.some(([lng, lat]) => {
      const dlat = lat - lm.lat, dlng = lng - lm.lng;
      return Math.sqrt(dlat*dlat + dlng*dlng) < 0.3; // ~33km
    });
    if (near) nearby.push(lm);
  });
  return nearby.slice(0, 8); // max 8 landmarks
}

// ── Format duration ───────────────────────────────────────────
function fmtDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

function fmtDistance(meters) {
  if (meters >= 1000) return `${(meters/1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}

// ── Score color ───────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 70) return '#86EFAC';
  if (score >= 45) return '#FCD34D';
  return '#FCA5A5';
}

function scoreLabel(score) {
  if (score >= 70) return 'safe';
  if (score >= 45) return 'moderate';
  return 'high';
}

// ── Main plan route function ──────────────────────────────────
async function planRoute() {
  const originInput = document.getElementById('routeOrigin').value.trim();
  const destInput   = document.getElementById('routeDestination').value.trim();
  const hour        = parseInt(document.getElementById('routeTime').value);

  if (!originInput || !destInput) {
    showRouteError('Please enter both a starting point and destination.');
    return;
  }

  initRouteMap();
  showRouteLoading();

  try {
    // Geocode both locations
    const [origin, dest] = await Promise.all([geocode(originInput), geocode(destInput)]);

    // Get routes from OSRM
    const routes = await getRoute(origin, dest);

    // Clear previous layers
    routeLayerGroup.clearLayers();
    zoneLayerGroup.clearLayers();
    landmarkLayerGroup.clearLayers();
    currentRoutes = [];

    const processedRoutes = routes.slice(0, 3).map((r, i) => {
      const coords = r.geometry.coordinates;
      const { score, zonesHit, newsPenaltyApplied } = scoreRoute(coords);
      const landmarks = findLandmarksNearRoute(coords);
      // Night penalty
      const isNight = hour >= 20 || hour <= 5;
      const finalScore = isNight ? Math.max(10, score - 18) : score;
      return { route: r, coords, score: finalScore, zonesHit, landmarks, index: i, newsPenaltyApplied };
    });

    // Sort by score descending — safest first
    processedRoutes.sort((a, b) => b.score - a.score);
    currentRoutes = processedRoutes;

    // Draw routes on map
    processedRoutes.forEach((pr, i) => {
      const latlngs = pr.coords.map(([lng, lat]) => [lat, lng]);
      const isSafest = i === 0;
      const line = L.polyline(latlngs, {
        color: isSafest ? '#16A34A' : '#4F6EF7',
        weight: isSafest ? 5 : 3,
        opacity: isSafest ? 0.9 : 0.5,
        dashArray: isSafest ? null : '8 6',
      }).addTo(routeLayerGroup);
      line.bindPopup(`<div class="popup-title">${isSafest ? 'Safest Route' : `Alternate ${i}`}</div><div class="popup-stat">Safety Score: <strong style="color:${scoreColor(pr.score)}">${pr.score}/100</strong></div><div class="popup-stat">Distance: <strong>${fmtDistance(pr.route.distance)}</strong> &nbsp; Duration: <strong>${fmtDuration(pr.route.duration)}</strong></div>`);
    });

    // Draw crime zone circles for zones along the safest route
    const safestRoute = processedRoutes[0];
    safestRoute.zonesHit.forEach(z => {
      const d = districts.find(d => d.name === z.name);
      if (!d) return;
      const color = getColor(z.level);
      L.circleMarker([d.lat, d.lng], {
        radius: 18, fillColor: color, color: color,
        weight: 1, fillOpacity: 0.18, opacity: 0.5
      }).addTo(zoneLayerGroup);
      L.circleMarker([d.lat, d.lng], {
        radius: 7, fillColor: color, color: '#fff',
        weight: 1.5, fillOpacity: 0.85
      }).bindPopup(`<div class="popup-title">${d.name}</div><div class="popup-risk" style="color:${color}">${z.level.toUpperCase()} RISK</div><div class="popup-stat">Total crimes: <strong>${d.total.toLocaleString()}</strong></div>`).addTo(zoneLayerGroup);
    });

    // Draw landmark markers
    safestRoute.landmarks.forEach(lm => {
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:#4F6EF7;border:2px solid #fff;border-radius:50%;width:12px;height:12px;box-shadow:0 2px 6px rgba(0,0,0,0.5)"></div>`,
        iconSize: [12, 12], iconAnchor: [6, 6]
      });
      L.marker([lm.lat, lm.lng], { icon })
        .bindPopup(`<div class="popup-title">${lm.name}</div><div class="popup-stat">${lm.type} &nbsp;&middot;&nbsp; ${lm.city}</div>`)
        .addTo(landmarkLayerGroup);
    });

    // Origin & destination markers
    const pinIcon = (color, label) => L.divIcon({
      className: '',
      html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="background:${color};color:#fff;font-size:0.65rem;font-weight:700;padding:3px 8px;border-radius:4px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.4)">${label}</div><div style="width:2px;height:8px;background:${color};margin:0 auto"></div></div>`,
      iconSize: [80, 36], iconAnchor: [40, 36]
    });
    L.marker([origin.lat, origin.lng], { icon: pinIcon('#16A34A', 'Start') }).addTo(routeLayerGroup);
    L.marker([dest.lat, dest.lng],   { icon: pinIcon('#DC2626', 'Destination') }).addTo(routeLayerGroup);

    // Fit map to route
    const allPoints = safestRoute.coords.map(([lng, lat]) => [lat, lng]);
    routeMap.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });

    // Render results panel
    renderRouteResults(processedRoutes, safestRoute.landmarks);

  } catch (err) {
    showRouteError(err.message || 'Something went wrong. Please try again.');
  }
}

// ── Render results panel ──────────────────────────────────────
function renderRouteResults(routes, landmarks) {
  const resultsEl = document.getElementById('routeResults');
  resultsEl.style.display = 'flex';

  // Score
  const best = routes[0];
  const scoreEl = document.getElementById('routeScoreVal');
  scoreEl.textContent = `${best.score}/100`;
  scoreEl.style.color = scoreColor(best.score);

  const optionsEl = document.getElementById('routeOptions');
  optionsEl.innerHTML = routes.map((pr, i) => `
    <div class="route-option ${i === 0 ? 'selected' : ''}" onclick="selectRoute(${i})">
      <div class="ro-left">
        <span class="ro-name" style="display:flex;align-items:center;gap:6px">${i === 0 ? 'Safest Route' : `Alternate Route ${i}`} ${pr.newsPenaltyApplied ? '<span style="font-size:0.6rem;background:rgba(220,38,38,0.2);color:#FCA5A5;padding:2px 6px;border-radius:4px;border:1px solid rgba(220,38,38,0.4)">⚠️ LIVE NEWS PENALTY</span>' : ''}</span>
        <span class="ro-meta">${fmtDistance(pr.route.distance)} &nbsp;&middot;&nbsp; ${fmtDuration(pr.route.duration)}</span>
      </div>
      <span class="ro-badge ${scoreLabel(pr.score)}">${pr.score}/100</span>
    </div>
  `).join('');

  // Zones summary
  const zonesEl = document.getElementById('routeZonesSummary');
  if (best.zonesHit.length) {
    zonesEl.innerHTML = `<div class="rzs-title">Risk Zones Along Route</div>` +
      best.zonesHit.slice(0, 5).map(z => {
        const color = { critical:'#FCA5A5', high:'#FDBA74', moderate:'#FCD34D', low:'#86EFAC' }[z.level];
        const bg    = { critical:'rgba(220,38,38,0.12)', high:'rgba(234,88,12,0.12)', moderate:'rgba(217,119,6,0.12)', low:'rgba(22,163,74,0.12)' }[z.level];
        const border= { critical:'rgba(220,38,38,0.3)', high:'rgba(234,88,12,0.3)', moderate:'rgba(217,119,6,0.3)', low:'rgba(22,163,74,0.3)' }[z.level];
        return `<div class="rzs-item"><span class="rzs-name">${z.name}, ${z.state}</span><span class="rzs-level" style="color:${color};background:${bg};border:1px solid ${border}">${z.level}</span></div>`;
      }).join('');
  } else {
    zonesEl.innerHTML = `<div class="rzs-title">Risk Zones Along Route</div><div style="font-size:0.82rem;color:#86EFAC;padding:8px 0">No high-risk zones detected along this route.</div>`;
  }

  // Landmarks
  const landmarksEl = document.getElementById('routeLandmarks');
  if (landmarks.length) {
    const typeIcon = (type) => {
      const icons = {
        'Monument': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
        'Hospital': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>`,
        'Transit Hub': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
        'Metro Station': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4"/></svg>`,
        'Market': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>`,
        'Commercial Hub': `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
      };
      return icons[type] || icons['Monument'];
    };
    landmarksEl.innerHTML = `<div class="rl-title">Key Landmarks Nearby</div>` +
      landmarks.map(lm => `
        <div class="rl-item">
          <span class="rl-icon">${typeIcon(lm.type)}</span>
          <div>
            <div class="rl-name">${lm.name}</div>
            <div class="rl-type">${lm.type} &middot; ${lm.city}</div>
          </div>
        </div>
      `).join('');
  } else {
    landmarksEl.innerHTML = '';
  }
}

// ── Select alternate route ────────────────────────────────────
function selectRoute(index) {
  if (!currentRoutes[index]) return;
  const pr = currentRoutes[index];

  // Update option highlight
  document.querySelectorAll('.route-option').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });

  // Update score
  const scoreEl = document.getElementById('routeScoreVal');
  scoreEl.textContent = `${pr.score}/100`;
  scoreEl.style.color = scoreColor(pr.score);

  // Fly to route
  const allPoints = pr.coords.map(([lng, lat]) => [lat, lng]);
  routeMap.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
}

// ── UI helpers ────────────────────────────────────────────────
function showRouteLoading() {
  const resultsEl = document.getElementById('routeResults');
  resultsEl.style.display = 'flex';
  resultsEl.innerHTML = `<div class="route-loading"><div class="route-spinner"></div> Calculating safest route...</div>`;
}

function showRouteError(msg) {
  const resultsEl = document.getElementById('routeResults');
  resultsEl.style.display = 'flex';
  resultsEl.innerHTML = `<div class="route-error">${msg}</div>`;
}

// ── Enter key support ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  ['routeOrigin', 'routeDestination'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('keydown', e => { if (e.key === 'Enter') planRoute(); });
  });
});
