export const COMPLETED_STATUSES = new Set(['COMPLETED'])
export const FAILED_STATUSES = new Set([
  'FAILED',
  'CRASHED',
  'SYSTEM_FAILURE',
  'CANCELED',
  'CANCELLED',
  'TIMED_OUT',
  'EXPIRED',
  'INTERRUPTED',
])

export const PIPELINE_STEPS = [
  { id: 'prepare', label: 'Reviewing your brief', threshold: 0 },
  { id: 'enhance', label: 'Sharpening the creative direction', threshold: 10 },
  { id: 'generate', label: 'Producing your visual', threshold: 40 },
  { id: 'queue', label: 'Queued for creation', threshold: 50 },
  { id: 'render', label: 'Rendering your asset', threshold: 65 },
  { id: 'finalize', label: 'Final polish', threshold: 90 },
] as const
export const ASPECT_RATIO_LABELS: Record<string, string> = {
  '1:1': 'Square',
  '16:9': 'Landscape',
  '9:16': 'Portrait',
  '4:3': 'Classic',
}
