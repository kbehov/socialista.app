import { CostUnit, type IModel } from '@socialista/db'
import { videoResolutionCostMultiplier } from '@socialista/types'

export function resolveVideoBilledCost(
  model: IModel,
  resolution: string | undefined,
  durationSec: number,
): number {
  const perSecond = model.resolutions?.find(entry => entry.value === resolution)?.costPerSecond
  if (perSecond != null) return perSecond * durationSec
  return (
    (model.costUnit === CostUnit.PER_SECOND ? model.cost * durationSec : model.cost) *
    videoResolutionCostMultiplier(resolution)
  )
}
