import {
  CostUnit,
  ModelType,
  deductAiCredits,
  getModelByValue,
  getWorkspaceById,
  incrementModelUsage,
  type IModel,
  type IWorkspace,
} from '@socialista/db'
import { UGC_TALKING_HEAD_MODEL_VALUE, ugcTalkingHeadModel } from '@socialista/types'

export async function loadModel(modelValue: string, notFoundMessage?: string): Promise<IModel> {
  const model = await getModelByValue(modelValue)
  if (!model) {
    throw new Error(notFoundMessage ?? `Model not found: ${modelValue}. Please contact support.`)
  }
  return model
}

export async function loadWorkspace(workspaceId: string): Promise<IWorkspace> {
  const workspace = await getWorkspaceById(workspaceId)
  if (!workspace) {
    throw new Error('Workspace not found. Please contact support.')
  }
  return workspace
}

/** DB model when seeded in the manager; otherwise the shared synthetic descriptor. */
export async function loadTalkingHeadModel(): Promise<IModel> {
  const stored = await getModelByValue(UGC_TALKING_HEAD_MODEL_VALUE)
  if (stored) return stored
  const fallback = ugcTalkingHeadModel()
  return {
    value: fallback.value,
    name: fallback.name,
    cost: fallback.cost,
    costUnit: CostUnit.PER_SECOND,
    modelType: ModelType.VIDEO,
    contextSupports: fallback.contextSupports ?? [],
    allowedInUgc: true,
    usageCount: 0,
    modelProvider: fallback.modelProvider,
    createdAt: fallback.createdAt,
    updatedAt: fallback.updatedAt,
  } as IModel
}

export async function loadModelAndWorkspace(
  modelValue: string,
  workspaceId: string,
  options?: { modelNotFoundMessage?: string },
): Promise<{ model: IModel; workspace: IWorkspace }> {
  const [model, workspace] = await Promise.all([
    loadModel(modelValue, options?.modelNotFoundMessage),
    loadWorkspace(workspaceId),
  ])
  return { model, workspace }
}

export function assertSufficientCredits(workspace: IWorkspace, cost: number) {
  if (workspace.billing.aiCreditsBalance < cost) {
    throw new Error('Insufficient AI credits. Please top up your credits.')
  }
}

export async function finalizeGeneration(workspaceId: string, model: IModel, credits = model.cost) {
  await deductAiCredits(workspaceId, credits)

  if (model._id) {
    void incrementModelUsage(model._id.toString()).catch(() => {
      // usageCount is an analytics counter; a failed increment shouldn't fail a successful generation.
    })
  }
}
