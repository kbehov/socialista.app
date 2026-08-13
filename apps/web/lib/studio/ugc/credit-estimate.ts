export type UgcCreditEstimateInput = {
  sceneCount: number
  variantCount: number
  imageCost: number
  videoCost: number
  plannerCost: number
  scriptCost: number
  includeScript?: boolean
}

export type UgcCreditEstimate = {
  stills: number
  script: number
  planner: number
  video: number
  total: number
}

export function estimateUgcCredits(input: UgcCreditEstimateInput): UgcCreditEstimate {
  const variants = Math.max(input.variantCount, 1)
  const stills = input.sceneCount * variants * input.imageCost
  const script = input.includeScript ? input.scriptCost : 0
  const planner = variants * input.plannerCost
  const video = variants * input.videoCost
  return {
    stills,
    script,
    planner,
    video,
    total: stills + script + planner + video,
  }
}
