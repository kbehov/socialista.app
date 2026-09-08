import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { runFfmpeg } from '../../services/video-export/ffmpeg.js'
import { uploadExportedVideo } from '../../services/video-upload.js'

async function downloadToFile(url: string, dest: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to download media (${response.status})`)
  }
  await writeFile(dest, Buffer.from(await response.arrayBuffer()))
}

export async function muxUgcVoiceover(input: {
  videoUrl: string
  audioUrl: string
  workspaceId: string
  projectId: string
  runId: string
  durationSec: number
}): Promise<string> {
  const workDir = await mkdtemp(join(tmpdir(), 'ugc-mux-'))
  try {
    const videoPath = join(workDir, 'video.mp4')
    const audioPath = join(workDir, 'voice.mp3')
    const outputPath = join(workDir, 'muxed.mp4')
    await downloadToFile(input.videoUrl, videoPath)
    await downloadToFile(input.audioUrl, audioPath)
    await runFfmpeg({
      args: [
        '-y',
        '-i',
        videoPath,
        '-i',
        audioPath,
        '-map',
        '0:v:0',
        '-map',
        '1:a:0',
        '-c:v',
        'copy',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-ar',
        '48000',
        '-ac',
        '2',
        '-shortest',
        outputPath,
      ],
      durationSeconds: input.durationSec,
    })
    const bytes = await readFile(outputPath)
    return uploadExportedVideo({
      workspaceId: input.workspaceId,
      videoId: input.projectId,
      runId: `${input.runId}-mux`,
      bytes,
    })
  } finally {
    await rm(workDir, { recursive: true, force: true }).catch(() => undefined)
  }
}
