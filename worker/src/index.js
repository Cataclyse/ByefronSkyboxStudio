const ROBLOX_ASSETS_API = 'https://apis.roblox.com';
const ROBLOX_THUMBNAILS_API = 'https://thumbnails.roblox.com';

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'x-api-key, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

async function proxyRequest(request, targetUrl) {
  const origin = request.headers.get('Origin') || '';

  const proxyHeaders = new Headers(request.headers);
  proxyHeaders.delete('Origin');
  proxyHeaders.delete('Host');
  proxyHeaders.delete('Referer');
  proxyHeaders.delete('CF-Connecting-IP');
  proxyHeaders.delete('CF-Ray');
  proxyHeaders.delete('CF-Visitor');
  proxyHeaders.delete('CDN-Loop');
  proxyHeaders.delete('X-Forwarded-For');
  proxyHeaders.delete('X-Real-IP');

  const proxyInit = {
    method: request.method,
    headers: proxyHeaders,
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    proxyInit.body = request.body;
  }

  const response = await fetch(targetUrl, proxyInit);

  const respHeaders = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    respHeaders.set(key, value);
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: respHeaders,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';
    const path = url.pathname;

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    if (path.startsWith('/robloxassets/')) {
      const subpath = path.replace('/robloxassets/', '');
      const targetUrl = `${ROBLOX_ASSETS_API}/${subpath}${url.search}`;
      return proxyRequest(request, targetUrl);
    }

    if (path.startsWith('/thumbnails/')) {
      const subpath = path.replace('/thumbnails/', '');
      const targetUrl = `${ROBLOX_THUMBNAILS_API}/${subpath}${url.search}`;
      return proxyRequest(request, targetUrl);
    }

    return env.ASSETS.fetch(request);
  },
};
