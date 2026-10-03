import { VIDEO_DURATION_MAX } from '@socialista/types'

import { probeMediaDurationSec } from '../../services/video-export/ffmpeg.js'

/** Seconds to bill after the model chooses the length. Falls back to the 15s maximum if probing fails. */
export async function probeBilledDurationSec(mediaUrl: string): Promise<number> {
  const probed = await probeMediaDurationSec(mediaUrl)
  if (probed == null || !Number.isFinite(probed) || probed <= 0) return VIDEO_DURATION_MAX
  return Math.max(1, Math.ceil(probed))
}
