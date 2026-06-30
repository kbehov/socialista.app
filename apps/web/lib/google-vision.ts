import { ImageAnnotatorClient } from '@google-cloud/vision'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { extractSlideshowOverlayText } from '@/lib/tiktok/slide-ocr'

const appRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')

const IMAGE_FETCH_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
  Referer: 'https://www.tiktok.com/',
} as const

export type SlideTextResult = {
  slide: number
  path: string
  text: string
}

let visionClient: ImageAnnotatorClient | null = null

function getVisionClient(): ImageAnnotatorClient {
  if (visionClient) return visionClient

  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  const keyFilename = credentialsPath
    ? path.isAbsolute(credentialsPath)
      ? credentialsPath
      : path.join(appRoot, credentialsPath.replace(/^\.\//, ''))
    : undefined

  visionClient = new ImageAnnotatorClient(keyFilename ? { keyFilename } : undefined)
  return visionClient
}

async function fetchImageContent(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl, {
    headers: IMAGE_FETCH_HEADERS,
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status})`)
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function getImageText(imageUrl: string): Promise<string> {
  const content = await fetchImageContent(imageUrl)
  const [result] = await getVisionClient().textDetection({ image: { content } })
  return extractSlideshowOverlayText(result)
}

export async function extractHookSlideText(imageUrl: string): Promise<SlideTextResult> {
  const content = await fetchImageContent(imageUrl)
  const [result] = await getVisionClient().textDetection({ image: { content } })

  return {
    slide: 1,
    path: imageUrl,
    text: extractSlideshowOverlayText(result),
  }
}

export async function extractAllSlideTexts(imageUrls: string[]): Promise<SlideTextResult[]> {
  return Promise.all(
    imageUrls.map(async (imageUrl, index) => {
      const content = await fetchImageContent(imageUrl)
      const [result] = await getVisionClient().textDetection({ image: { content } })
      return {
        slide: index + 1,
        path: imageUrl,
        text: extractSlideshowOverlayText(result),
      }
    }),
  )
}
