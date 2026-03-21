/**
 * Cloudflare Worker — merge into your existing NEXUS worker `fetch` handler.
 * Stores TWELVEDATA_API_KEY in env (Workers secret / wrangler secret), never in the browser.
 *
 * In your main handler:
 *   if (url.pathname === '/twelve-quote') return handleTwelveQuote(request, env);
 *
 * Route: GET /twelve-quote?symbol=XAU/USD,CL1,AUD/USD
 * Proxies to: https://api.twelvedata.com/quote?symbol=...&apikey=...
 * Returns: Twelve Data JSON (batch object keyed by symbol, or single quote).
 */
export async function handleTwelveQuote(request, env) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get('symbol');
  if (!symbol) {
    return new Response(JSON.stringify({ error: 'missing symbol' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const key = env.TWELVEDATA_API_KEY;
  if (!key) {
    return new Response(JSON.stringify({ error: 'TWELVEDATA_API_KEY not configured' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const tdUrl = `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(symbol)}&apikey=${encodeURIComponent(key)}`;
  const tdRes = await fetch(tdUrl);
  const body = await tdRes.text();
  return new Response(body, {
    status: tdRes.status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60',
    },
  });
}
