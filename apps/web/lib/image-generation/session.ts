const ACCESS_TOKEN_STORAGE_PREFIX = 'image-generation-token:'

export function storeGenerationAccessToken(runId: string, token: string) {
  sessionStorage.setItem(`${ACCESS_TOKEN_STORAGE_PREFIX}${runId}`, token)
}

export function readGenerationAccessToken(runId: string) {
  return sessionStorage.getItem(`${ACCESS_TOKEN_STORAGE_PREFIX}${runId}`)
}
