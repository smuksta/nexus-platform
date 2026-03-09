exports.handler = async function (event, context) {
  context.callbackWaitsForEmptyEventLoop = false;

  const commonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: commonHeaders,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: commonHeaders,
      body: 'Method Not Allowed',
    };
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({ error: 'FINNHUB_API_KEY not configured' }),
    };
  }

  try {
    const urlSearchParams = new URLSearchParams(event.queryStringParameters || {});
    const symbolsParam = urlSearchParams.get('symbols') || '';
    const symbols = symbolsParam
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    if (!symbols.length) {
      return {
        statusCode: 400,
        headers: commonHeaders,
        body: JSON.stringify({ error: 'No symbols provided' }),
      };
    }

    const results = {};

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const resp = await fetch(
            `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${apiKey}`,
          );
          if (!resp.ok) throw new Error(`Finnhub error for ${symbol}: ${resp.status}`);
          const data = await resp.json();
          // Finnhub quote fields: c=current, d=change, dp=percent, h=high, l=low, o=open, pc=prev close
          results[symbol] = {
            price: data.c ?? null,
            change: data.d ?? null,
            changePct: data.dp ?? null,
            high: data.h ?? null,
            low: data.l ?? null,
            open: data.o ?? null,
            prevClose: data.pc ?? null,
          };
        } catch (err) {
          results[symbol] = { error: err.message };
        }
      }),
    );

    return {
      statusCode: 200,
      headers: {
        ...commonHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbols: results }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: commonHeaders,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

