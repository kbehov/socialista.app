import {
  deductAiCredits,
  getModelByValue,
  getWorkspaceById,
  ModelModel,
  type IModel,
  type IWorkspace,
} from '@socialista/db'

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

export async function finalizeGeneration(workspaceId: string, model: IModel) {
  await deductAiCredits(workspaceId, model.cost)

  void ModelModel.updateOne({ _id: model._id.toString() }, { $inc: { usageCount: 1 } }).catch(() => {
    // usageCount is an analytics counter; a failed increment shouldn't fail a successful generation.
  })
}
