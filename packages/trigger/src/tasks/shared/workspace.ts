import {
  ModelType,
  deductAiCredits,
  getModelByValue,
  getModels,
  getWorkspaceById,
  incrementModelUsage,
  type IModel,
  type IWorkspace,
} from '@socialista/db'

const UGC_LIP_SYNC_DEFAULT_QUERY =
  'limit=1&modelType=lip-sync&allowedInUgc=true&sort=-usageCount'

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

function isUgcLipSyncModel(model: IModel): boolean {
  return model.modelType === ModelType.LIP_SYNC && model.allowedInUgc
}

export async function loadUgcLipSyncModel(modelValue?: string): Promise<IModel> {
  if (modelValue) {
    const stored = await getModelByValue(modelValue)
    if (stored && isUgcLipSyncModel(stored)) return stored
  }

  const { models } = await getModels(UGC_LIP_SYNC_DEFAULT_QUERY)
  const fallback = models[0]
  if (!fallback) {
    throw new Error('No lip-sync model available. Add a lip-sync model allowed in UGC.')
  }
  return fallback
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
