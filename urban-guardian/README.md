# Urban Guardian — News API Setup

## Quick Start (with live news)

### 1. Get a free NewsAPI key
Go to **https://newsapi.org/register** and sign up.  
Free tier: **100 requests/day** — plenty for development.

### 2. Install dependencies
```bash
cd urban-guardian
npm install
```

### 3. Set your API key (choose one method)

**Option A — Environment variable (recommended):**
```bash
export NEWS_API_KEY=your_actual_key_here
node server.js
```

**Option B — Edit server.js directly:**
Open `server.js` and replace `PASTE_YOUR_KEY_HERE` on line ~18:
```js
const NEWS_API_KEY = 'your_actual_key_here';
```
Then run:
```bash
node server.js
```

### 4. Open the app
Visit **http://localhost:3000**

---

## What the news integration does

| Feature | Description |
|---|---|
| **Live ticker** | Fixed bottom bar cycling through latest crime/safety headlines every 5 seconds |
| **News panel** | 8-card grid below the heatmap showing article image, source, time, and district tag |
| **District boost** | Leaflet map markers pulse briefly when their district is mentioned in a headline |
| **Auto-refresh** | News refreshes every 15 minutes (safe within free tier limits) |
| **Fallback mode** | When the server isn't running, curated demo articles are shown instead |

---

## API Endpoints (proxy server)

| Endpoint | Description |
|---|---|
| `GET /api/news?q=crime+india&pageSize=15` | General news proxy |
| `GET /api/news/india-crime` | Pre-configured India crime query |
| `GET /api/news?endpoint=top-headlines&country=in&category=general` | Top headlines |

---

## Without Node.js (static only)

If you just want to run without news:
```bash
python3 -m http.server 8080 --directory urban-guardian
```
The site works fully — news panel shows fallback demo articles, ticker still appears.

---

## Changing the news query

Edit `news.js`, find `NEWS_CONFIG.queries`:
```js
queries: {
  ticker: 'crime women safety India',   // ← ticker headlines
  panel:  'crime assault kidnapping India district',  // ← panel articles
},
```
