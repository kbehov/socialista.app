export type UgcCreditEstimateInput = {
  sceneCount: number
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
  const stills = Math.max(input.sceneCount, 1) * input.imageCost
  const script = input.includeScript ? input.scriptCost : 0
  const planner = input.plannerCost
  const video = input.videoCost
  return {
    stills,
    script,
    planner,
    video,
    total: stills + script + planner + video,
  }
}
