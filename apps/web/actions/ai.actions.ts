import { STATIC_AD_MODEL, type AspectRatio } from '@socialista/types'
import { buildStaticAdFinalPrompt } from '@socialista/trigger'
import { generateImage } from 'ai'

export async function generateStaticAd(
  prompt: string,
  images: string[],
  aspectRatio: AspectRatio = '1:1',
): Promise<string> {
  const size =
    aspectRatio === '9:16'
      ? '1024x1536'
      : aspectRatio === '16:9' || aspectRatio === '4:3'
        ? '1536x1024'
        : '1024x1024'

  const { image } = await generateImage({
    model: STATIC_AD_MODEL,
    prompt: {
      text: buildStaticAdFinalPrompt({
        prompt,
        aspectRatio,
      }),
      images,
    },
    size,
  })

  return `data:${image.mediaType};base64,${image.base64}`
}
