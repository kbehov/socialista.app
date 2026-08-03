import { auth } from '@trigger.dev/sdk/v3'
// Create a public access token for a run
export const createPublicAccessToken = async (runId: string) => {
  return await auth.createPublicToken({
    scopes: {
      read: {
        runs: runId,
      },
    },
    expirationTime: '1h',
  })
}
