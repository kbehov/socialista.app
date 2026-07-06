import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const webRoot = resolve(__dirname, '..')
const publicDir = resolve(webRoot, 'public', 'ffmpeg')

const sources = [
  {
    from: '../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.js',
    to: 'ffmpeg-core.js',
  },
  {
    from: '../node_modules/@ffmpeg/core/dist/esm/ffmpeg-core.wasm',
    to: 'ffmpeg-core.wasm',
  },
  {
    from: '../node_modules/@ffmpeg/ffmpeg/dist/esm/worker.js',
    to: 'worker.js',
  },
  {
    from: '../node_modules/@ffmpeg/ffmpeg/dist/esm/const.js',
    to: 'const.js',
  },
  {
    from: '../node_modules/@ffmpeg/ffmpeg/dist/esm/errors.js',
    to: 'errors.js',
  },
]

if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true })
}

for (const source of sources) {
  const fromPath = resolve(__dirname, source.from)
  const toPath = resolve(publicDir, source.to)
  if (!existsSync(fromPath)) {
    // Optional dependency may not be installed yet; skip silently.
    console.warn(`[copy-ffmpeg-core] skip (not installed): ${source.from}`)
    continue
  }
  copyFileSync(fromPath, toPath)
  console.log(`[copy-ffmpeg-core] copied ${source.to}`)
}
