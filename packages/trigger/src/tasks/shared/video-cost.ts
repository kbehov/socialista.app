import { CostUnit, type IModel } from '@socialista/db'
import { videoResolutionCostMultiplier } from '@socialista/types'

/** Stored per-second rate, or the model's per-second cost. Null when billing is a flat generation fee. */
export function resolveVideoCostPerSecond(model: IModel, resolution: string | undefined): number | null {
  const listed = model.resolutions?.find(entry => entry.value === resolution)?.costPerSecond
  if (listed != null) return listed
  if (model.costUnit === CostUnit.PER_SECOND) {
    return model.cost * videoResolutionCostMultiplier(resolution)
  }
  return null
}

/** Rate used when length is unknown until the clip exists, including flat-priced models. */
export function resolveVideoSecondRate(model: IModel, resolution: string | undefined): number {
  return resolveVideoCostPerSecond(model, resolution) ?? model.cost * videoResolutionCostMultiplier(resolution)
}

export function resolveVideoBilledCost(
  model: IModel,
  resolution: string | undefined,
  durationSec: number,
): number {
  const perSecond = resolveVideoCostPerSecond(model, resolution)
  if (perSecond != null) return perSecond * durationSec
  return model.cost * videoResolutionCostMultiplier(resolution)
}
