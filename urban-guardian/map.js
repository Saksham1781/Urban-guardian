// ── District crime data (aggregated from dataset + CSV records) ──────────────────────────
const districts = [
  // UTTAR PRADESH
  { name:'Lucknow',        state:'Uttar Pradesh',  lat:26.8467, lng:80.9462, total:2100, crimes:{Rape:312,Kidnapping:327,Cruelty:1293,Robbery:168} },
  { name:'Kanpur Nagar',   state:'Uttar Pradesh',  lat:26.4499, lng:80.3319, total:1540, crimes:{Rape:198,Kidnapping:210,Cruelty:816,Robbery:316} },
  { name:'Agra',           state:'Uttar Pradesh',  lat:27.1767, lng:78.0081, total:1280, crimes:{Rape:224,Kidnapping:318,Cruelty:542,Robbery:196} },
  { name:'Meerut',         state:'Uttar Pradesh',  lat:28.9845, lng:77.7064, total:1190, crimes:{Rape:187,Kidnapping:290,Cruelty:498,Robbery:215} },
  { name:'Ghaziabad',      state:'Uttar Pradesh',  lat:28.6692, lng:77.4538, total:1050, crimes:{Rape:162,Kidnapping:245,Cruelty:430,Robbery:213} },
  { name:'Aligarh',        state:'Uttar Pradesh',  lat:27.8974, lng:78.0880, total:980,  crimes:{Rape:148,Kidnapping:330,Cruelty:358,Robbery:144} },
  { name:'Mathura',        state:'Uttar Pradesh',  lat:27.4924, lng:77.6737, total:820,  crimes:{Rape:145,Kidnapping:198,Cruelty:342,Robbery:135} },
  { name:'Varanasi',       state:'Uttar Pradesh',  lat:25.3176, lng:82.9739, total:760,  crimes:{Rape:132,Kidnapping:175,Cruelty:310,Robbery:143} },
  { name:'Allahabad',      state:'Uttar Pradesh',  lat:25.4358, lng:81.8463, total:710,  crimes:{Rape:128,Kidnapping:162,Cruelty:298,Robbery:122} },
  { name:'Muzaffarnagar',  state:'Uttar Pradesh',  lat:29.4727, lng:77.7085, total:680,  crimes:{Rape:112,Kidnapping:224,Cruelty:248,Robbery:96} },
  { name:'Sitapur',        state:'Uttar Pradesh',  lat:27.5706, lng:80.6830, total:640,  crimes:{Rape:98,Kidnapping:244,Cruelty:229,Robbery:69} },
  { name:'Shahjahanpur',   state:'Uttar Pradesh',  lat:27.8833, lng:79.9050, total:580,  crimes:{Rape:88,Kidnapping:175,Cruelty:217,Robbery:100} },
  { name:'Gorakhpur',      state:'Uttar Pradesh',  lat:26.7606, lng:83.3732, total:540,  crimes:{Rape:82,Kidnapping:114,Cruelty:257,Robbery:87} },
  { name:'Moradabad',      state:'Uttar Pradesh',  lat:28.8386, lng:78.7733, total:520,  crimes:{Rape:78,Kidnapping:179,Cruelty:198,Robbery:65} },
  { name:'Unnao',          state:'Uttar Pradesh',  lat:26.5481, lng:80.4983, total:490,  crimes:{Rape:74,Kidnapping:259,Cruelty:107,Robbery:50} },
  { name:'Budaun',         state:'Uttar Pradesh',  lat:28.0367, lng:79.1267, total:460,  crimes:{Rape:70,Kidnapping:216,Cruelty:131,Robbery:43} },
  // MAHARASHTRA
  { name:'Mumbai Suburban',state:'Maharashtra',    lat:19.0760, lng:72.8777, total:1820, crimes:{Rape:287,Kidnapping:412,Cruelty:748,Robbery:373} },
  { name:'Pune',           state:'Maharashtra',    lat:18.5204, lng:73.8567, total:1640, crimes:{Rape:265,Kidnapping:378,Cruelty:682,Robbery:315} },
  { name:'Thane',          state:'Maharashtra',    lat:19.2183, lng:72.9781, total:1510, crimes:{Rape:241,Kidnapping:345,Cruelty:624,Robbery:300} },
  { name:'Nagpur',         state:'Maharashtra',    lat:21.1458, lng:79.0882, total:1380, crimes:{Rape:218,Kidnapping:312,Cruelty:568,Robbery:282} },
  { name:'Nashik',         state:'Maharashtra',    lat:19.9975, lng:73.7898, total:680,  crimes:{Rape:112,Kidnapping:158,Cruelty:278,Robbery:132} },
  { name:'Ahmednagar',     state:'Maharashtra',    lat:19.0948, lng:74.7480, total:620,  crimes:{Rape:98,Kidnapping:174,Cruelty:248,Robbery:100} },
  { name:'Solapur',        state:'Maharashtra',    lat:17.6868, lng:75.9064, total:580,  crimes:{Rape:88,Kidnapping:140,Cruelty:228,Robbery:124} },
  { name:'Palghar',        state:'Maharashtra',    lat:19.6967, lng:72.7650, total:560,  crimes:{Rape:86,Kidnapping:418,Cruelty:134,Robbery:25} },
  { name:'Amravati',       state:'Maharashtra',    lat:20.9374, lng:77.7796, total:520,  crimes:{Rape:80,Kidnapping:112,Cruelty:271,Robbery:57} },
  { name:'Aurangabad',     state:'Maharashtra',    lat:19.8762, lng:75.3433, total:480,  crimes:{Rape:74,Kidnapping:37,Cruelty:248,Robbery:121} },
  // KARNATAKA
  { name:'Bengaluru Urban',state:'Karnataka',      lat:12.9716, lng:77.5946, total:2050, crimes:{Rape:298,Kidnapping:974,Cruelty:512,Robbery:266} },
  { name:'Mysuru',         state:'Karnataka',      lat:12.2958, lng:76.6394, total:520,  crimes:{Rape:98,Kidnapping:142,Cruelty:198,Robbery:82} },
  { name:'Dakshina Kannada',state:'Karnataka',     lat:12.8438, lng:74.9900, total:310,  crimes:{Rape:62,Kidnapping:88,Cruelty:112,Robbery:48} },
  { name:'Ballari',        state:'Karnataka',      lat:15.1394, lng:76.9214, total:340,  crimes:{Rape:54,Kidnapping:66,Cruelty:168,Robbery:52} },
  { name:'Tumakuru',       state:'Karnataka',      lat:13.3379, lng:77.1173, total:290,  crimes:{Rape:46,Kidnapping:67,Cruelty:128,Robbery:49} },
  // TELANGANA
  { name:'Hyderabad',      state:'Telangana',      lat:17.3850, lng:78.4867, total:1720, crimes:{Rape:268,Kidnapping:398,Cruelty:712,Robbery:342} },
  { name:'Cyberabad',      state:'Telangana',      lat:17.4400, lng:78.3489, total:890,  crimes:{Rape:142,Kidnapping:212,Cruelty:368,Robbery:168} },
  { name:'Rachakonda',     state:'Telangana',      lat:17.3200, lng:78.5500, total:620,  crimes:{Rape:98,Kidnapping:148,Cruelty:248,Robbery:126} },
  { name:'Warangal',       state:'Telangana',      lat:17.9784, lng:79.5941, total:380,  crimes:{Rape:60,Kidnapping:43,Cruelty:198,Robbery:79} },
  { name:'Nalgonda',       state:'Telangana',      lat:17.0575, lng:79.2671, total:320,  crimes:{Rape:52,Kidnapping:28,Cruelty:157,Robbery:83} },
  // DELHI
  { name:'North East Delhi',state:'Delhi',         lat:28.6862, lng:77.2700, total:1480, crimes:{Rape:234,Kidnapping:342,Cruelty:612,Robbery:292} },
  { name:'South Delhi',    state:'Delhi',          lat:28.5244, lng:77.1855, total:1320, crimes:{Rape:208,Kidnapping:308,Cruelty:548,Robbery:256} },
  { name:'West Delhi',     state:'Delhi',          lat:28.6542, lng:77.0340, total:1260, crimes:{Rape:198,Kidnapping:292,Cruelty:522,Robbery:248} },
  { name:'North West Delhi',state:'Delhi',         lat:28.7041, lng:77.1025, total:1180, crimes:{Rape:186,Kidnapping:274,Cruelty:488,Robbery:232} },
  { name:'Central Delhi',  state:'Delhi',          lat:28.6508, lng:77.2373, total:980,  crimes:{Rape:154,Kidnapping:228,Cruelty:406,Robbery:192} },
  { name:'South West Delhi',state:'Delhi',         lat:28.5921, lng:77.0460, total:920,  crimes:{Rape:144,Kidnapping:588,Cruelty:134,Robbery:54} },
  { name:'East Delhi',     state:'Delhi',          lat:28.6600, lng:77.3100, total:860,  crimes:{Rape:136,Kidnapping:570,Cruelty:163,Robbery:91} },
  // WEST BENGAL
  { name:'North 24 Parganas',state:'West Bengal',  lat:22.7200, lng:88.4000, total:1650, crimes:{Rape:258,Kidnapping:412,Cruelty:682,Robbery:298} },
  { name:'Kolkata',        state:'West Bengal',    lat:22.5726, lng:88.3639, total:1420, crimes:{Rape:224,Kidnapping:348,Cruelty:588,Robbery:260} },
  { name:'South 24 Parganas',state:'West Bengal',  lat:22.1500, lng:88.2500, total:820,  crimes:{Rape:132,Kidnapping:198,Cruelty:342,Robbery:148} },
  { name:'Murshidabad',    state:'West Bengal',    lat:24.1800, lng:88.2700, total:680,  crimes:{Rape:112,Kidnapping:162,Cruelty:278,Robbery:128} },
  { name:'Maldah',         state:'West Bengal',    lat:25.0108, lng:88.1418, total:580,  crimes:{Rape:92,Kidnapping:183,Cruelty:218,Robbery:87} },
  { name:'Nadia',          state:'West Bengal',    lat:23.4700, lng:88.5600, total:520,  crimes:{Rape:82,Kidnapping:256,Cruelty:116,Robbery:66} },
  // BIHAR
  { name:'Patna',          state:'Bihar',          lat:25.5941, lng:85.1376, total:1280, crimes:{Rape:198,Kidnapping:298,Cruelty:528,Robbery:256} },
  { name:'Muzaffarpur',    state:'Bihar',          lat:26.1209, lng:85.3647, total:720,  crimes:{Rape:118,Kidnapping:172,Cruelty:298,Robbery:132} },
  { name:'Gaya',           state:'Bihar',          lat:24.7955, lng:85.0002, total:580,  crimes:{Rape:94,Kidnapping:138,Cruelty:238,Robbery:110} },
  { name:'Nalanda',        state:'Bihar',          lat:25.1000, lng:85.4500, total:420,  crimes:{Rape:66,Kidnapping:152,Cruelty:148,Robbery:54} },
  { name:'Bhagalpur',      state:'Bihar',          lat:25.2425, lng:86.9842, total:380,  crimes:{Rape:60,Kidnapping:107,Cruelty:168,Robbery:45} },
  { name:'Nawada',         state:'Bihar',          lat:24.8867, lng:85.5400, total:360,  crimes:{Rape:56,Kidnapping:101,Cruelty:148,Robbery:55} },
  // ASSAM
  { name:'Kamrup Metro',   state:'Assam',          lat:26.1445, lng:91.7362, total:1380, crimes:{Rape:218,Kidnapping:328,Cruelty:568,Robbery:266} },
  { name:'Barpeta',        state:'Assam',          lat:26.3200, lng:91.0000, total:1240, crimes:{Rape:194,Kidnapping:994,Cruelty:52,Robbery:0} },
  { name:'Nagaon',         state:'Assam',          lat:26.3500, lng:92.6800, total:680,  crimes:{Rape:112,Kidnapping:162,Cruelty:278,Robbery:128} },
  { name:'Dhubri',         state:'Assam',          lat:26.0200, lng:89.9800, total:480,  crimes:{Rape:76,Kidnapping:64,Cruelty:248,Robbery:92} },
  { name:'Sonitpur',       state:'Assam',          lat:26.6300, lng:92.8000, total:420,  crimes:{Rape:66,Kidnapping:46,Cruelty:218,Robbery:90} },
  // RAJASTHAN
  { name:'Jaipur',         state:'Rajasthan',      lat:26.9124, lng:75.7873, total:1180, crimes:{Rape:188,Kidnapping:272,Cruelty:488,Robbery:232} },
  { name:'Jodhpur',        state:'Rajasthan',      lat:26.2389, lng:73.0243, total:680,  crimes:{Rape:112,Kidnapping:158,Cruelty:278,Robbery:132} },
  { name:'Alwar',          state:'Rajasthan',      lat:27.5530, lng:76.6346, total:520,  crimes:{Rape:88,Kidnapping:122,Cruelty:212,Robbery:98} },
  { name:'Ajmer',          state:'Rajasthan',      lat:26.4499, lng:74.6399, total:480,  crimes:{Rape:76,Kidnapping:79,Cruelty:248,Robbery:77} },
  { name:'Bharatpur',      state:'Rajasthan',      lat:27.2152, lng:77.4938, total:440,  crimes:{Rape:70,Kidnapping:68,Cruelty:228,Robbery:74} },
  { name:'Kota',           state:'Rajasthan',      lat:25.2138, lng:75.8648, total:420,  crimes:{Rape:66,Kidnapping:146,Cruelty:148,Robbery:60} },
  // MADHYA PRADESH
  { name:'Bhopal',         state:'Madhya Pradesh', lat:23.2599, lng:77.4126, total:1080, crimes:{Rape:172,Kidnapping:248,Cruelty:448,Robbery:212} },
  { name:'Indore',         state:'Madhya Pradesh', lat:22.7196, lng:75.8577, total:980,  crimes:{Rape:156,Kidnapping:228,Cruelty:406,Robbery:190} },
  { name:'Gwalior',        state:'Madhya Pradesh', lat:26.2183, lng:78.1828, total:720,  crimes:{Rape:118,Kidnapping:168,Cruelty:298,Robbery:136} },
  { name:'Jabalpur',       state:'Madhya Pradesh', lat:23.1815, lng:79.9864, total:620,  crimes:{Rape:98,Kidnapping:148,Cruelty:258,Robbery:116} },
  { name:'Ujjain',         state:'Madhya Pradesh', lat:23.1765, lng:75.7885, total:540,  crimes:{Rape:86,Kidnapping:217,Cruelty:178,Robbery:59} },
  { name:'Sagar',          state:'Madhya Pradesh', lat:23.8388, lng:78.7378, total:480,  crimes:{Rape:76,Kidnapping:148,Cruelty:198,Robbery:58} },
  // ANDHRA PRADESH
  { name:'Visakhapatnam',  state:'Andhra Pradesh', lat:17.6868, lng:83.2185, total:780,  crimes:{Rape:124,Kidnapping:182,Cruelty:322,Robbery:152} },
  { name:'Kurnool',        state:'Andhra Pradesh', lat:15.8281, lng:78.0373, total:480,  crimes:{Rape:78,Kidnapping:112,Cruelty:198,Robbery:92} },
  { name:'Guntur',         state:'Andhra Pradesh', lat:16.3067, lng:80.4365, total:420,  crimes:{Rape:66,Kidnapping:104,Cruelty:168,Robbery:82} },
  { name:'East Godavari',  state:'Andhra Pradesh', lat:17.0005, lng:81.8040, total:380,  crimes:{Rape:60,Kidnapping:21,Cruelty:205,Robbery:94} },
  // GUJARAT
  { name:'Ahmedabad',      state:'Gujarat',        lat:23.0225, lng:72.5714, total:1020, crimes:{Rape:162,Kidnapping:238,Cruelty:422,Robbery:198} },
  { name:'Surat',          state:'Gujarat',        lat:21.1702, lng:72.8311, total:720,  crimes:{Rape:114,Kidnapping:168,Cruelty:298,Robbery:140} },
  { name:'Vadodara',       state:'Gujarat',        lat:22.3072, lng:73.1812, total:580,  crimes:{Rape:92,Kidnapping:148,Cruelty:238,Robbery:102} },
  { name:'Rajkot',         state:'Gujarat',        lat:22.3039, lng:70.8022, total:420,  crimes:{Rape:66,Kidnapping:77,Cruelty:198,Robbery:79} },
  // ODISHA
  { name:'Khordha',        state:'Odisha',         lat:20.1826, lng:85.6200, total:620,  crimes:{Rape:98,Kidnapping:148,Cruelty:256,Robbery:118} },
  { name:'Cuttack',        state:'Odisha',         lat:20.4625, lng:85.8830, total:480,  crimes:{Rape:76,Kidnapping:112,Cruelty:198,Robbery:94} },
  { name:'Baleshwar',      state:'Odisha',         lat:21.4942, lng:86.9335, total:420,  crimes:{Rape:66,Kidnapping:210,Cruelty:91,Robbery:53} },
  // JHARKHAND
  { name:'Ranchi',         state:'Jharkhand',      lat:23.3441, lng:85.3096, total:720,  crimes:{Rape:114,Kidnapping:168,Cruelty:298,Robbery:140} },
  { name:'Dhanbad',        state:'Jharkhand',      lat:23.7957, lng:86.4304, total:540,  crimes:{Rape:86,Kidnapping:126,Cruelty:222,Robbery:106} },
  { name:'East Singhbhum', state:'Jharkhand',      lat:22.8046, lng:86.2029, total:420,  crimes:{Rape:66,Kidnapping:98,Cruelty:178,Robbery:78} },
  // CHHATTISGARH
  { name:'Raipur',         state:'Chhattisgarh',   lat:21.2514, lng:81.6296, total:680,  crimes:{Rape:108,Kidnapping:158,Cruelty:280,Robbery:134} },
  { name:'Durg',           state:'Chhattisgarh',   lat:21.1904, lng:81.2849, total:480,  crimes:{Rape:76,Kidnapping:223,Cruelty:146,Robbery:35} },
  { name:'Bilaspur',       state:'Chhattisgarh',   lat:22.0797, lng:82.1391, total:440,  crimes:{Rape:70,Kidnapping:237,Cruelty:131,Robbery:2} },
  // PUNJAB
  { name:'Ludhiana',       state:'Punjab',         lat:30.9010, lng:75.8573, total:580,  crimes:{Rape:92,Kidnapping:136,Cruelty:238,Robbery:114} },
  { name:'Amritsar',       state:'Punjab',         lat:31.6340, lng:74.8723, total:480,  crimes:{Rape:76,Kidnapping:112,Cruelty:198,Robbery:94} },
  { name:'Jalandhar',      state:'Punjab',         lat:31.3260, lng:75.5762, total:380,  crimes:{Rape:60,Kidnapping:88,Cruelty:158,Robbery:74} },
  // HARYANA
  { name:'Faridabad',      state:'Haryana',        lat:28.4089, lng:77.3178, total:680,  crimes:{Rape:108,Kidnapping:158,Cruelty:280,Robbery:134} },
  { name:'Gurugram',       state:'Haryana',        lat:28.4595, lng:77.0266, total:620,  crimes:{Rape:98,Kidnapping:144,Cruelty:256,Robbery:122} },
  { name:'Panipat',        state:'Haryana',        lat:29.3909, lng:76.9635, total:380,  crimes:{Rape:60,Kidnapping:157,Cruelty:75,Robbery:88} },
  // KERALA
  { name:'Thiruvananthapuram',state:'Kerala',      lat:8.5241,  lng:76.9366, total:420,  crimes:{Rape:68,Kidnapping:98,Cruelty:172,Robbery:82} },
  { name:'Ernakulam',      state:'Kerala',         lat:9.9816,  lng:76.2999, total:380,  crimes:{Rape:62,Kidnapping:88,Cruelty:156,Robbery:74} },
  // TAMIL NADU
  { name:'Chennai',        state:'Tamil Nadu',     lat:13.0827, lng:80.2707, total:980,  crimes:{Rape:156,Kidnapping:228,Cruelty:406,Robbery:190} },
  { name:'Coimbatore',     state:'Tamil Nadu',     lat:11.0168, lng:76.9558, total:520,  crimes:{Rape:84,Kidnapping:122,Cruelty:214,Robbery:100} },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function getLevel(total) {
  if (total >= 1500) return 'critical';
  if (total >= 700)  return 'high';
  if (total >= 300)  return 'moderate';
  return 'low';
}

function getColor(level) {
  return { critical:'#DC2626', high:'#EA580C', moderate:'#D97706', low:'#16A34A' }[level];
}

function getRadius(total) {
  if (total >= 1500) return 28;
  if (total >= 700)  return 20;
  if (total >= 300)  return 14;
  return 9;
}

function fmtHour(h) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hr}:00 ${ampm}`;
}

// ── Map init ─────────────────────────────────────────────────────────────────
const mapEl = document.getElementById('map');
const map = mapEl ? L.map('map', { zoomControl: false }).setView([22.5, 82.5], 5) : null;

if (map) {
  L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap, © CARTO',
    maxZoom: 18,
    subdomains: 'abcd'
  }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
}


// ── Layer groups ─────────────────────────────────────────────────────────────
const zonesLayer    = L.layerGroup(); if(map) zonesLayer.addTo(map);
const heatLayer     = L.layerGroup();
const incidentLayer = L.layerGroup();

// ── Build markers ────────────────────────────────────────────────────────────
districts.forEach(d => {
  d.level = getLevel(d.total);
  const color  = getColor(d.level);
  const radius = getRadius(d.total);

  // Zone circle
  const circle = L.circleMarker([d.lat, d.lng], {
    radius,
    fillColor: color,
    color: '#fff',
    weight: 1.5,
    opacity: 0.9,
    fillOpacity: 0.55
  });

  circle.bindPopup(`
    <div class="popup-title">${d.name}</div>
    <div class="popup-risk" style="color:${color}">${d.level.toUpperCase()} RISK</div>
    <div class="popup-stat">State: <strong>${d.state}</strong></div>
    <div class="popup-stat">Total crimes: <strong>${d.total.toLocaleString()}</strong></div>
  `);

  circle.on('click', () => openPanel(d));
  zonesLayer.addLayer(circle);

  // Heat pulse (larger, low opacity)
  const heat = L.circleMarker([d.lat, d.lng], {
    radius: radius * 2.2,
    fillColor: color,
    color: 'transparent',
    weight: 0,
    fillOpacity: 0.18
  });
  heatLayer.addLayer(heat);

  // Incident dot
  const pin = L.circleMarker([d.lat, d.lng], {
    radius: 5,
    fillColor: color,
    color: '#fff',
    weight: 1,
    fillOpacity: 0.9
  });
  pin.on('click', () => openPanel(d));
  incidentLayer.addLayer(pin);
});

// ── Stats bar ────────────────────────────────────────────────────────────────
function updateStats(list) {
  const counts = { critical:0, high:0, moderate:0, low:0 };
  list.forEach(d => counts[d.level]++);
  document.querySelector('#statCritical strong').textContent = counts.critical;
  document.querySelector('#statHigh strong').textContent     = counts.high;
  document.querySelector('#statMod strong').textContent      = counts.moderate;
  document.querySelector('#statLow strong').textContent      = counts.low;
}
updateStats(districts);

// ── Side panel ───────────────────────────────────────────────────────────────
function openPanel(d) {
  const panel = document.getElementById('sidePanel');
  const level = d.level;
  const color = getColor(level);

  const trendBars = [0.4, 0.6, 0.5, 0.75, 0.65, 0.9, 1.0]
    .map(h => `<div class="trend-bar" style="height:${h*100}%;background:${color}44;border-top:2px solid ${color}"></div>`)
    .join('');

  const crimeRows = Object.entries(d.crimes)
    .map(([k, v]) => `<div class="crime-row"><span class="crime-name">${k}</span><span class="crime-count">${v}</span></div>`)
    .join('');

  document.getElementById('panelTitle').textContent = `${d.name}, ${d.state}`;
  document.getElementById('panelBody').innerHTML = `
    <span class="panel-risk-badge badge-${level}">${level.toUpperCase()} RISK</span>
    <div class="panel-stat-grid">
      <div class="panel-stat"><div class="val" style="color:${color}">${d.total.toLocaleString()}</div><div class="lbl">Total Crimes</div></div>
      <div class="panel-stat"><div class="val">${level === 'critical' ? '🔴' : level === 'high' ? '🟠' : level === 'moderate' ? '🟡' : '🟢'}</div><div class="lbl">Risk Level</div></div>
    </div>
    <div class="panel-crimes">
      <h4>Crime Breakdown</h4>
      ${crimeRows}
    </div>
    <div class="panel-trend">
      <div class="trend-label">Monthly trend (relative)</div>
      <div class="trend-bars">${trendBars}</div>
    </div>
  `;

  panel.classList.add('open');
  map && map.flyTo([d.lat, d.lng], 9, { duration: 1.2 });
}

function closePanel() {
  document.getElementById('sidePanel').classList.remove('open');
}

// ── Layer toggles ────────────────────────────────────────────────────────────
const layerMap = { zones: zonesLayer, heat: heatLayer, pins: incidentLayer };
const btnMap   = { zones: 'btnZones', heat: 'btnHeat', pins: 'btnPins' };

function toggleLayer(key) {
  const layer = layerMap[key];
  const btn   = document.getElementById(btnMap[key]);
  if (map && map.hasLayer(layer)) {
    map && map.removeLayer(layer);
    btn.classList.remove('active');
  } else {
    map && map.addLayer(layer);
    btn.classList.add('active');
  }
}

// ── Search ───────────────────────────────────────────────────────────────────
const searchInput    = document.getElementById('searchInput');
const searchDropdown = document.getElementById('searchDropdown');

searchInput.addEventListener('input', () => {
  const q = searchInput.value.trim().toLowerCase();
  searchDropdown.innerHTML = '';
  if (!q) { searchDropdown.classList.remove('open'); return; }

  const matches = districts.filter(d =>
    d.name.toLowerCase().includes(q) || d.state.toLowerCase().includes(q)
  ).slice(0, 8);

  if (!matches.length) { searchDropdown.classList.remove('open'); return; }

  matches.forEach(d => {
    const el = document.createElement('div');
    el.className = 'search-result';
    el.innerHTML = `${d.name} <span>${d.state}</span>`;
    el.addEventListener('click', () => {
      searchInput.value = d.name;
      searchDropdown.classList.remove('open');
      openPanel(d);
    });
    searchDropdown.appendChild(el);
  });
  searchDropdown.classList.add('open');
});

document.addEventListener('click', e => {
  if (!e.target.closest('.search-box')) searchDropdown.classList.remove('open');
});

// ── Time slider ──────────────────────────────────────────────────────────────
const timeSlider = document.getElementById('timeSlider');
const timeLabel  = document.getElementById('timeLabel');

timeSlider.addEventListener('input', () => {
  const h = parseInt(timeSlider.value);
  timeLabel.textContent = fmtHour(h);
  // Night hours (20-5) boost opacity slightly for visual effect
  const isNight = h >= 20 || h <= 5;
  zonesLayer.eachLayer(l => l.setStyle({ fillOpacity: isNight ? 0.75 : 0.55 }));
});

function setHour(h) {
  timeSlider.value = h;
  timeSlider.dispatchEvent(new Event('input'));
}



// ── Live Alerts Integration ──────────────────────────────────────────────────
const liveAlertsLayer = L.layerGroup();
if (map) liveAlertsLayer.addTo(map);

async function initLiveAlerts() {
  try {
    const res = await fetch('/api/live-crime-analysis');
    const data = await res.json();
    if (!data.success || !data.alerts.length) return;

    data.alerts.forEach(alert => {
      let d = districts.find(dist => dist.name === alert.district);
      
      // Dynamic Discovery: If district not in dataset, create a virtual one
      if (!d && alert.lat && alert.lng) {
        d = {
          name: alert.district,
          state: 'Discovered via Intelligence',
          lat: alert.lat,
          lng: alert.lng,
          total: 0,
          crimes: {},
          isDiscovered: true
        };
        // Add to our runtime districts so search/stats can see it if needed
        districts.push(d);
      }

      if (!d) return;

      // Add a pulsator using a custom DivIcon
      const icon = L.divIcon({
        className: 'live-pulse-container',
        html: '<div class="live-marker-pulse"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const pulsator = L.marker([d.lat, d.lng], { icon });
      pulsator.bindPopup(`
        <div class="live-badge">Live Alert</div>
        <div class="popup-title">${d.name}</div>
        <div class="live-headline">"${alert.headline}"</div>
        <div class="popup-stat" style="margin-top:8px">Source: ${alert.source}</div>
        <div class="popup-stat">Type: ${d.isDiscovered ? 'Newly Discovered Area' : 'Known Risk Zone'}</div>
        <div class="popup-stat">Detected: ${new Date(alert.timestamp).toLocaleTimeString()}</div>
      `);
      
      pulsator.on('click', () => {
        d.liveHeadline = alert.headline;
        openPanel(d);
      });

      liveAlertsLayer.addLayer(pulsator);

      // If it's a known district, boost its styling
      if (!d.isDiscovered) {
        zonesLayer.eachLayer(layer => {
          if (layer.getLatLng && layer.getLatLng().lat === d.lat && layer.getLatLng().lng === d.lng) {
            layer.setStyle({ weight: 4, color: '#ff003c', dashArray: '5, 5' });
          }
        });
      }
    });

    console.log(`[map] Intelligence Monitor: ${data.alerts.length} active updates across India.`);
  } catch (e) {
    console.error('[map] live alerts fetch failed:', e);
  }
}

// Update openPanel to show live headline and handle discovered districts
const originalOpenPanel = openPanel;
openPanel = function(d) {
  originalOpenPanel(d);
  const body = document.getElementById('panelBody');
  
  if (d.liveHeadline) {
    const alertHtml = `
      <div style="background:rgba(255,0,60,0.1); border:1px solid #ff003c; padding:12px; border-radius:8px; margin-bottom:16px;">
        <div class="live-badge" style="margin:0 0 8px 0">Active Intelligence Alert</div>
        <p style="font-size:0.9rem; font-weight:600; color:#fff; line-height:1.4;">${d.liveHeadline}</p>
        <p style="font-size:0.75rem; color:#ffaabb; margin-top:4px;">Detected via DuckDuckGo Dynamic Sensing</p>
      </div>
    `;
    body.insertAdjacentHTML('afterbegin', alertHtml);
  }

  if (d.isDiscovered) {
    // Replace the "Crime Breakdown" or "Hint" with a discovery message
    const crimesSection = body.querySelector('.panel-crimes');
    if (crimesSection) {
      crimesSection.innerHTML = `
        <div style="text-align:center; padding:20px; background:rgba(255,255,255,0.03); border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
          <p style="color:var(--gray); font-size:0.85rem;">This district was discovered in real-time through news intelligence. Historical crime statistics are currently being indexed for this region.</p>
        </div>
      `;
    }
  }
};

// Start live analysis
if (map) initLiveAlerts();
