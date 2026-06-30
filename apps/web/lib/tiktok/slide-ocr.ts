import type { protos } from '@google-cloud/vision'

type AnnotateImageResponse = protos.google.cloud.vision.v1.IAnnotateImageResponse
type Block = protos.google.cloud.vision.v1.IBlock

type BoundingBox = {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
  centerX: number
  centerY: number
}

type ScoredBlock = {
  text: string
  score: number
  box: BoundingBox
  heightRatio: number
}

const MIN_HEIGHT_RATIO = 0.028
const MIN_AREA_RATIO = 0.006

function getBoundingBox(vertices: protos.google.cloud.vision.v1.IVertex[] | null | undefined): BoundingBox | null {
  if (!vertices?.length) return null

  const xs = vertices.map(vertex => vertex.x ?? 0)
  const ys = vertices.map(vertex => vertex.y ?? 0)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const width = maxX - minX
  const height = maxY - minY

  if (width <= 0 || height <= 0) return null

  return {
    minX,
    maxX,
    minY,
    maxY,
    width,
    height,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  }
}

function getBlockText(block: Block): string {
  return (block.paragraphs ?? [])
    .map(paragraph =>
      (paragraph.words ?? [])
        .map(word => (word.symbols ?? []).map(symbol => symbol.text ?? '').join(''))
        .join(' '),
    )
    .join('\n')
    .trim()
}

function scoreOverlayBlock(box: BoundingBox, imageWidth: number, imageHeight: number): number {
  const imageArea = imageWidth * imageHeight
  const heightRatio = box.height / imageHeight
  const areaRatio = (box.width * box.height) / imageArea
  const verticalCenterDist = Math.abs(box.centerY / imageHeight - 0.5)
  const horizontalCenterDist = Math.abs(box.centerX / imageWidth - 0.5)
  const topRatio = box.minY / imageHeight
  const bottomRatio = box.maxY / imageHeight

  const sizeScore = Math.min(heightRatio * 12, 4) + Math.min(areaRatio * 60, 3)
  const centerScore = (1 - verticalCenterDist * 1.8) * 2.5 + (1 - horizontalCenterDist * 1.5) * 1.5
  const edgePenalty =
    (topRatio < 0.04 ? 2 : 0) +
    (bottomRatio > 0.96 ? 2 : 0) +
    (box.minX / imageWidth < 0.02 ? 1 : 0) +
    (box.maxX / imageWidth > 0.98 ? 1 : 0)

  return sizeScore + centerScore - edgePenalty
}

function selectCaptionBlocks(blocks: ScoredBlock[], imageWidth: number): ScoredBlock[] {
  if (blocks.length === 0) return []

  const best = blocks.reduce((current, candidate) => (candidate.score > current.score ? candidate : current))
  const alignTolerance = imageWidth * 0.18
  const scoreThreshold = best.score * 0.55

  return blocks
    .filter(
      block =>
        block.score >= scoreThreshold &&
        Math.abs(block.box.centerX - best.box.centerX) <= alignTolerance &&
        block.heightRatio >= MIN_HEIGHT_RATIO * 0.85,
    )
    .sort((a, b) => a.box.minY - b.box.minY)
}

export function extractSlideshowOverlayText(response: AnnotateImageResponse | null | undefined): string {
  const page = response?.fullTextAnnotation?.pages?.[0]
  if (!page?.blocks?.length) return ''

  const imageWidth = page.width ?? 1
  const imageHeight = page.height ?? 1
  const imageArea = imageWidth * imageHeight

  const scoredBlocks: ScoredBlock[] = []

  for (const block of page.blocks) {
    const text = getBlockText(block)
    if (!text) continue

    const box = getBoundingBox(block.boundingBox?.vertices)
    if (!box) continue

    const heightRatio = box.height / imageHeight
    const areaRatio = (box.width * box.height) / imageArea

    if (heightRatio < MIN_HEIGHT_RATIO || areaRatio < MIN_AREA_RATIO) continue

    scoredBlocks.push({
      text,
      score: scoreOverlayBlock(box, imageWidth, imageHeight),
      box,
      heightRatio,
    })
  }

  const captionBlocks = selectCaptionBlocks(scoredBlocks, imageWidth)
  if (captionBlocks.length > 0) {
    return captionBlocks.map(block => block.text).join('\n').trim()
  }

  if (scoredBlocks.length === 0) return ''

  return scoredBlocks
    .sort((a, b) => b.score - a.score)
    .slice(0, 1)
    .map(block => block.text)
    .join('\n')
    .trim()
}
