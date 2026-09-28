import { lookup } from 'node:dns/promises'
import { BlockList, isIP } from 'node:net'
import { BROWSER_USER_AGENT } from '@/utils/http-client.js'
import { fetch, type Response } from 'undici'

const FETCH_TIMEOUT_MS = 8_000
const MAX_REDIRECTS = 4
const MAX_HTML_BYTES = 1_500_000
const BLOCKED_HOSTS = new Set([
  'localhost',
  '0.0.0.0',
  '::1',
  'metadata.google.internal',
  'metadata.internal',
  'kubernetes',
  'kubernetes.default',
  'kubernetes.default.svc',
])
const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal', '.lan', '.home', '.corp']

const privateNetworks = new BlockList()
privateNetworks.addSubnet('0.0.0.0', 8, 'ipv4')
privateNetworks.addSubnet('10.0.0.0', 8, 'ipv4')
privateNetworks.addSubnet('100.64.0.0', 10, 'ipv4')
privateNetworks.addSubnet('127.0.0.0', 8, 'ipv4')
privateNetworks.addSubnet('169.254.0.0', 16, 'ipv4')
privateNetworks.addSubnet('172.16.0.0', 12, 'ipv4')
privateNetworks.addSubnet('192.0.0.0', 24, 'ipv4')
privateNetworks.addSubnet('192.0.2.0', 24, 'ipv4')
privateNetworks.addSubnet('192.168.0.0', 16, 'ipv4')
privateNetworks.addSubnet('198.18.0.0', 15, 'ipv4')
privateNetworks.addSubnet('198.51.100.0', 24, 'ipv4')
privateNetworks.addSubnet('203.0.113.0', 24, 'ipv4')
privateNetworks.addSubnet('224.0.0.0', 4, 'ipv4')
privateNetworks.addSubnet('240.0.0.0', 4, 'ipv4')
privateNetworks.addAddress('::', 'ipv6')
privateNetworks.addAddress('::1', 'ipv6')
privateNetworks.addSubnet('fc00::', 7, 'ipv6')
privateNetworks.addSubnet('fe80::', 10, 'ipv6')
privateNetworks.addSubnet('ff00::', 8, 'ipv6')

export class SiteScrapeError extends Error {
  constructor(
    message: string,
    public status: 400 | 422 | 502 = 502,
  ) {
    super(message)
    this.name = 'SiteScrapeError'
  }
}

export function normalizeHttpUrl(value: string): URL {
  const trimmed = value.trim()
  if (!trimmed) {
    throw new SiteScrapeError('Website URL is required', 400)
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let parsed: URL
  try {
    parsed = new URL(withProtocol)
  } catch {
    throw new SiteScrapeError('Enter a valid website URL', 400)
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new SiteScrapeError('Website must be an http or https URL', 400)
  }

  if (parsed.username || parsed.password) {
    throw new SiteScrapeError('Website URL must not include credentials', 400)
  }

  return parsed
}

function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, '')
  if (!host) return true
  if (BLOCKED_HOSTS.has(host)) return true
  return BLOCKED_HOST_SUFFIXES.some(suffix => host.endsWith(suffix))
}

function isPrivateIp(address: string): boolean {
  const ip = address.trim().toLowerCase()
  if (!ip) return true

  if (ip.startsWith('::ffff:')) {
    const mapped = ip.slice('::ffff:'.length)
    if (isIP(mapped) === 4) return isPrivateIp(mapped)
  }

  const version = isIP(ip)
  if (version === 4) return privateNetworks.check(ip, 'ipv4')
  if (version === 6) return privateNetworks.check(ip, 'ipv6')
  return true
}

async function assertPublicHttpUrl(value: string | URL): Promise<URL> {
  const url = value instanceof URL ? value : normalizeHttpUrl(value)
  const hostname = url.hostname

  if (isBlockedHostname(hostname)) {
    throw new SiteScrapeError('That website cannot be used', 400)
  }

  const ipVersion = isIP(hostname)
  if (ipVersion === 4 || ipVersion === 6) {
    if (isPrivateIp(hostname)) {
      throw new SiteScrapeError('That website cannot be used', 400)
    }
    return url
  }

  let addresses: Array<{ address: string }>
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true })
  } catch {
    throw new SiteScrapeError('Could not resolve that website', 422)
  }

  if (addresses.length === 0 || addresses.some(entry => isPrivateIp(entry.address))) {
    throw new SiteScrapeError('That website cannot be used', 400)
  }

  return url
}

function isHtmlContentType(value: string | null): boolean {
  if (!value) return true
  const type = value.split(';')[0]?.trim().toLowerCase() ?? ''
  return (
    type === 'text/html' ||
    type === 'application/xhtml+xml' ||
    type === 'text/plain' ||
    type === 'application/xml' ||
    type === 'text/xml'
  )
}

async function readLimitedText(response: Response, maxBytes: number): Promise<string> {
  const declared = Number(response.headers.get('content-length'))
  if (Number.isFinite(declared) && declared > maxBytes) {
    throw new SiteScrapeError('That page is too large to import', 422)
  }

  const body = response.body
  if (!body) return ''

  const reader = body.getReader()
  const chunks: Uint8Array[] = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    received += value.byteLength
    if (received > maxBytes) {
      await reader.cancel().catch(() => undefined)
      throw new SiteScrapeError('That page is too large to import', 422)
    }
    chunks.push(value)
  }

  const bytes = new Uint8Array(received)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }

  const charset = /charset=([^;]+)/i.exec(response.headers.get('content-type') ?? '')?.[1]?.trim()
  try {
    return new TextDecoder(charset || 'utf-8').decode(bytes)
  } catch {
    return new TextDecoder('utf-8').decode(bytes)
  }
}

async function fetchOnce(url: URL, signal: AbortSignal): Promise<Response> {
  return fetch(url, {
    method: 'GET',
    redirect: 'manual',
    signal,
    headers: {
      'User-Agent': BROWSER_USER_AGENT,
      Accept: 'text/html,application/xhtml+xml;q=0.9,text/plain;q=0.8,*/*;q=0.1',
      'Accept-Language': 'en-US,en;q=0.8',
      'Cache-Control': 'no-cache',
    },
  })
}

export async function fetchPublicHtml(url: string): Promise<{ url: string; html: string }> {
  let current = await assertPublicHttpUrl(url)

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    let response: Response
    try {
      response = await fetchOnce(current, controller.signal)
    } catch {
      if (controller.signal.aborted) {
        throw new SiteScrapeError('That website took too long to respond', 502)
      }
      throw new SiteScrapeError('Could not reach that website', 502)
    } finally {
      clearTimeout(timer)
    }

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      await response.body?.cancel().catch(() => undefined)
      if (!location) {
        throw new SiteScrapeError('That website sent an invalid redirect', 502)
      }
      current = await assertPublicHttpUrl(new URL(location, current))
      continue
    }

    if (response.status === 401 || response.status === 403) {
      throw new SiteScrapeError('That website blocked the request. Try another page or enter details manually.', 422)
    }

    if (response.status === 404) {
      throw new SiteScrapeError('That page could not be found', 422)
    }

    if (!response.ok) {
      throw new SiteScrapeError(`Could not load that website (${response.status})`, 502)
    }

    if (!isHtmlContentType(response.headers.get('content-type'))) {
      throw new SiteScrapeError('That URL is not a web page', 422)
    }

    const html = await readLimitedText(response, MAX_HTML_BYTES)
    if (!html.trim()) {
      throw new SiteScrapeError('That page did not contain enough content to build a brand', 422)
    }

    return { url: current.toString(), html }
  }

  throw new SiteScrapeError('That website redirected too many times', 502)
}
