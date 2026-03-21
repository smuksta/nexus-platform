## NEXUS — Intelligence Platform

NEXUS is a single‑page intelligence dashboard for an Australian investor/subcontractor in Melbourne.  
It combines a **geopolitical/financial map**, **deep‑dive intel view**, and a **signals** view powered by an Anthropic model and live market prices.

### Current surface (v1 focus)

- **MAP**
  - Canvas graph of key nodes: Hormuz, gold, oil, USD, RBA, CBDC, etc.
  - Clicking a node opens a **slide panel** with:
    - `why` — what it is and why it matters now
    - `shadow` — deeper pattern / less‑discussed dynamics
    - `money` — Australian investor impact
    - `act` — immediate / short‑term / long‑term actions
  - Panel content is generated via the Cloudflare worker proxying Anthropic.
- **Header stats**
  - Live `GOLD XAU/USD`, `CRUDE OIL`, `AUD/USD` driven by Finnhub via the worker `/prices` endpoint.

### Backend (Cloudflare Worker)

- **Endpoint `/`**
  - Proxies `POST` requests to `https://api.anthropic.com/v1/messages`.
  - Forces `claude-haiku-4-5-20251001` with a safe `max_tokens`.
  - Uses:
    - `env.ANTHROPIC_API_KEY`
- **Endpoint `/prices`**
  - `GET /prices?symbols=XAUUSD,CL,AUDUSD`
  - Calls Finnhub `quote` for each symbol and returns:
    - `{ symbols: { TICKER: { price, change, changePct, high, low, open, prevClose } } }`
  - Uses:
    - `env.FINNHUB_API_KEY`

### Frontend dev notes

- Entry file: `index.html`
- Important globals:
  - `NEXUS_WORKER_URL` — Cloudflare worker base URL
  - `PRICE_API_URL` — worker `/prices` URL
  - `nodes` — map node definitions
  - `parseModelJsonOrThrow(text)` — shared helper to safely parse model JSON (used by MAP panel, INTEL, and SIGNALS)
- Views:
  - `setMode('map' | 'intel' | 'signals')` toggles between MAP, INTEL, and SIGNALS.

### Mobile (iPhone)

There is **one responsive** `index.html` — no separate native app or second HTML file. Safari uses `viewport-fit=cover`, safe-area insets (notch / home indicator), and `layoutChrome()` measures the real header + alert bar height so the map and slide panel sit below them. Intel inputs use **16px** font on small screens to reduce iOS zoom-on-focus. Add to Home Screen works via `apple-mobile-web-app-capable`.

### Session log / ideas

Use this section to jot quick notes after each build session so future work is easy to resume.

- **2026‑03‑09**
  - Tightened MAP layout (bubbles closer, label fonts larger).
  - Added robust JSON parsing for all model responses.
  - Wired live prices for GOLD / OIL / AUD via Finnhub and worker `/prices`.
  - Added SIGNALS view enhancements (auto “SCAN MARKET” and best‑now/core/debasement buckets) — currently experimental and can be iterated later.

