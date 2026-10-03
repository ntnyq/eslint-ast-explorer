import { createReadStream, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../.output/public/', import.meta.url))
const config = JSON.parse(
  readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'),
)
const headers = Object.fromEntries(
  config.headers[0].headers.map(({ key, value }) => [key, value]),
)
const types = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.ttf': 'font/ttf',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://127.0.0.1')
  let path = resolve(root, `.${decodeURIComponent(url.pathname)}`)
  if (
    !path.startsWith(root.replace(/\/$/, '') + sep) &&
    path !== root.replace(/\/$/, '')
  ) {
    res.writeHead(403).end()
    return
  }
  try {
    if (statSync(path).isDirectory()) {
      path = resolve(path, 'index.html')
    }
    const file = statSync(path)
    res.writeHead(200, {
      ...headers,
      'Content-Type': types[extname(path)] || 'application/octet-stream',
      'Content-Length': file.size,
    })
    createReadStream(path).pipe(res)
  } catch {
    res.writeHead(404, headers).end('Not found')
  }
}).listen(4173, '127.0.0.1')
