import { TASK_IDS } from '@socialista/types'
import { tasks } from '@trigger.dev/sdk/v3'

export async function enqueueStaticAdTemplateAnalysis(templateId: string): Promise<void> {
  await tasks.trigger(TASK_IDS.staticAdTemplateAnalysis, { templateId })
}
