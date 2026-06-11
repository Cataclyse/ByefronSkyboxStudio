# Architecture

## Stack
- Frontend: vanilla HTML/CSS/JS, no framework
- 3D preview: WebGL2 (GLSL ES 3.00)
- Image processing: Canvas API
- Proxy: Cloudflare Worker
- Storage: localStorage (history, config)

## Worker design
- Routes `/robloxassets/assets/v1/*` → `https://apis.roblox.com/assets/v1/*`
- Routes `/thumbnails/v1/*` → `https://thumbnails.roblox.com/v1/*`
- Passes `x-api-key`, body (multipart), query params through
- CORS headers for browser access

## Pattern decisions
- Worker is simple reverse proxy, no auth logic
- API key sent from frontend directly (stateless worker)
- Local dev: `?worker=http://localhost:8787/robloxassets` URL param
