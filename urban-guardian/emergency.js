/* ═══════════════════════════════════════════════════════════════
   URBAN GUARDIAN — emergency.js
   Emergency contacts manager + SOS alert with live location
═══════════════════════════════════════════════════════════════ */

// ── State ─────────────────────────────────────────────────────
const MAX_CONTACTS = 5;
let contacts = JSON.parse(localStorage.getItem('ug_contacts') || '[]');
let currentLocation = null;
let sosHoldTimer = null;
let sosProgress = 0;
let sosInterval = null;

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderContacts();
  updateCount();

  const msgEl = document.getElementById('ecMessage');
  const charEl = document.getElementById('ecCharCount');
  if (msgEl && charEl) {
    charEl.textContent = `${msgEl.value.length} / 160`;
    msgEl.addEventListener('input', () => {
      charEl.textContent = `${msgEl.value.length} / 160`;
    });
  }

  // Try to get location silently on load
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => setLocation(pos),
      () => {} // silent fail on load
    );
  }
});

// ── Contacts CRUD ─────────────────────────────────────────────
function addContact() {
  const name     = document.getElementById('ecName').value.trim();
  const phone    = document.getElementById('ecPhone').value.trim().replace(/\s/g, '');
  const email    = document.getElementById('ecEmail').value.trim();
  const relation = document.getElementById('ecRelation').value;

  if (!name) { showToast('Please enter a name.', 'error'); return; }
  if (!email && !phone) { showToast('Please enter an email or phone number.', 'error'); return; }
  if (contacts.length >= MAX_CONTACTS) { showToast(`Maximum ${MAX_CONTACTS} contacts allowed.`, 'error'); return; }

  const fullPhone = phone ? '+91' + phone : '';
  if (contacts.some(c => (c.email && c.email === email) || (c.phone && c.phone === fullPhone))) {
    showToast('This contact is already added.', 'error'); return;
  }

  contacts.push({ id: Date.now(), name, phone: fullPhone, email, relation });
  saveContacts();
  renderContacts();
  updateCount();

  // Clear form
  document.getElementById('ecName').value  = '';
  document.getElementById('ecPhone').value = '';
  document.getElementById('ecEmail').value = '';
  showToast(`${name} added as trusted contact.`, 'success');
}

function removeContact(id) {
  contacts = contacts.filter(c => c.id !== id);
  saveContacts();
  renderContacts();
  updateCount();
}

function saveContacts() {
  localStorage.setItem('ug_contacts', JSON.stringify(contacts));
}

function renderContacts() {
  const list  = document.getElementById('ecList');
  const empty = document.getElementById('ecEmpty');
  if (!list) return;

  // Remove existing contact items (keep empty placeholder)
  list.querySelectorAll('.ec-contact-item').forEach(el => el.remove());

  if (!contacts.length) {
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  contacts.forEach(c => {
    const initials = c.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const item = document.createElement('div');
    item.className = 'ec-contact-item';
    item.innerHTML = `
      <div class="ec-contact-avatar">${initials}</div>
      <div class="ec-contact-info">
        <div class="ec-contact-name">${escHtml(c.name)}</div>
        <div class="ec-contact-meta">${escHtml(c.email || c.phone)}</div>
      </div>
      <span class="ec-contact-tag">${escHtml(c.relation)}</span>
      <button class="ec-contact-remove" onclick="removeContact(${c.id})" title="Remove contact">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;
    list.appendChild(item);
  });
}

function updateCount() {
  const el = document.getElementById('ecCount');
  if (el) el.textContent = `${contacts.length} / ${MAX_CONTACTS}`;
}

// ── Location ──────────────────────────────────────────────────
function acquireLocation() {
  const dotEl  = document.getElementById('ecLocDot');
  const textEl = document.getElementById('ecLocText');
  if (dotEl)  { dotEl.className = 'ec-loc-dot'; dotEl.style.background = '#D97706'; }
  if (textEl) textEl.textContent = 'Acquiring location...';

  if (!navigator.geolocation) {
    if (dotEl)  dotEl.className = 'ec-loc-dot error';
    if (textEl) textEl.textContent = 'Geolocation not supported';
    return;
  }

  navigator.geolocation.getCurrentPosition(
    pos => setLocation(pos),
    err => {
      if (dotEl)  dotEl.className = 'ec-loc-dot error';
      if (textEl) textEl.textContent = 'Location access denied';
      showToast('Location access denied. Please allow location in browser settings.', 'error');
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

function setLocation(pos) {
  currentLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude, acc: pos.coords.accuracy };
  const dotEl  = document.getElementById('ecLocDot');
  const textEl = document.getElementById('ecLocText');
  if (dotEl)  dotEl.className = 'ec-loc-dot active';
  if (textEl) textEl.textContent = `Location acquired (±${Math.round(currentLocation.acc)}m)`;
}

function buildLocationUrl(lat, lng) {
  return `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

// ── SOS Hold Logic ────────────────────────────────────────────
function startEcSOS(e) {
  if (e) e.preventDefault();
  if (contacts.length === 0) {
    showToast('Add at least one trusted contact first.', 'error');
    return;
  }

  sosProgress = 0;
  const progressEl = document.getElementById('ecSosProgress');
  const btnEl      = document.getElementById('ecSosBtn');
  if (btnEl) btnEl.style.transform = 'scale(0.95)';

  sosInterval = setInterval(() => {
    sosProgress += 100 / 30; // 3 seconds = 30 ticks at 100ms
    if (progressEl) progressEl.style.width = Math.min(sosProgress, 100) + '%';
    if (sosProgress >= 100) {
      clearInterval(sosInterval);
      triggerEcSOS();
    }
  }, 100);
}

function cancelEcSOS() {
  clearInterval(sosInterval);
  sosProgress = 0;
  const progressEl = document.getElementById('ecSosProgress');
  const btnEl      = document.getElementById('ecSosBtn');
  if (progressEl) progressEl.style.width = '0%';
  if (btnEl) btnEl.style.transform = 'scale(1)';
}

async function triggerEcSOS() {
  const btnEl = document.getElementById('ecSosBtn');
  if (btnEl) btnEl.style.transform = 'scale(1)';

  // Refresh location if possible
  if (navigator.geolocation) {
    try {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          pos => { setLocation(pos); resolve(); },
          () => resolve(),
          { enableHighAccuracy: true, timeout: 4000 }
        );
      });
    } catch (_) {}
  }

  showSendingState();

  const message = document.getElementById('ecMessage')?.value?.trim()
    || 'I need help. This is an emergency. Please contact me immediately.';

  const locationUrl = currentLocation
    ? buildLocationUrl(currentLocation.lat, currentLocation.lng)
    : null;

  const fullMessage = locationUrl
    ? `${message}\n\nMy live location: ${locationUrl}`
    : message;

  // Send to each contact
  const results = [];
  for (const contact of contacts) {
    addLogItem(contact, 'sending');
    try {
      const res = await fetch('/api/emergency/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: contact.email, to: contact.phone, message: fullMessage, name: contact.name })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateLogItem(contact.id, 'success', `Sent to ${contact.name}`);
        results.push({ contact, ok: true });
      } else {
        updateLogItem(contact.id, 'error', data.error || `Failed for ${contact.name}`);
        results.push({ contact, ok: false });
      }
    } catch (err) {
      updateLogItem(contact.id, 'error', `Network error for ${contact.name}`);
      results.push({ contact, ok: false });
    }
    // Small delay between sends
    await new Promise(r => setTimeout(r, 400));
  }

  const sent = results.filter(r => r.ok).length;
  setTimeout(() => showDoneState(sent, results.length), 600);
}

// ── UI State transitions ──────────────────────────────────────
function showSendingState() {
  document.getElementById('ecSosIdle').style.display    = 'none';
  document.getElementById('ecSosSending').style.display = 'block';
  document.getElementById('ecSosDone').style.display    = 'none';
  document.getElementById('ecSendLog').innerHTML = '';
}

function showDoneState(sent, total) {
  document.getElementById('ecSosIdle').style.display    = 'none';
  document.getElementById('ecSosSending').style.display = 'none';
  document.getElementById('ecSosDone').style.display    = 'block';
  const doneText = document.getElementById('ecDoneText');
  if (doneText) {
    doneText.textContent = sent === total
      ? `Alert sent to all ${total} contact${total > 1 ? 's' : ''} successfully.`
      : `Alert sent to ${sent} of ${total} contacts.`;
  }
}

function resetEcSOS() {
  document.getElementById('ecSosIdle').style.display    = 'flex';
  document.getElementById('ecSosSending').style.display = 'none';
  document.getElementById('ecSosDone').style.display    = 'none';
  document.getElementById('ecSosIdle').style.flexDirection = 'column';
  document.getElementById('ecSosIdle').style.alignItems    = 'center';
  const progressEl = document.getElementById('ecSosProgress');
  if (progressEl) progressEl.style.width = '0%';
}

// ── Log items ─────────────────────────────────────────────────
const logItemMap = {};

function addLogItem(contact, state) {
  const log = document.getElementById('ecSendLog');
  if (!log) return;
  const item = document.createElement('div');
  item.className = 'ec-log-item';
  item.id = `ecLog_${contact.id}`;
  item.innerHTML = `
    <div class="ec-log-dot spin" id="ecLogDot_${contact.id}"></div>
    <span>Sending to ${escHtml(contact.name)} (${escHtml(contact.email || contact.phone)})...</span>
  `;
  log.appendChild(item);
  logItemMap[contact.id] = item;
}

function updateLogItem(id, state, text) {
  const item = document.getElementById(`ecLog_${id}`);
  const dot  = document.getElementById(`ecLogDot_${id}`);
  if (!item || !dot) return;
  dot.className = `ec-log-dot ${state === 'success' ? 'ok' : 'err'}`;
  item.className = `ec-log-item ${state}`;
  item.querySelector('span').textContent = text;
}

// ── Toast ─────────────────────────────────────────────────────
let toastTimeout = null;
function showToast(msg, type = '') {
  let toast = document.getElementById('ecToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'ecToast';
    toast.className = 'ec-toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `ec-toast ${type}`;
  clearTimeout(toastTimeout);
  // Force reflow
  void toast.offsetWidth;
  toast.classList.add('show');
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Helpers ───────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
