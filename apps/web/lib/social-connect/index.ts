export type { ConnectProvider, MetaCandidate, ConnectAccountResultItem } from './types'
export { accountIdentityKey, parseMetaCandidateId } from './types'
export { assertProviderConfigured, getCallbackUrl } from './config'
export {
  beginOAuthState,
  consumeOAuthState,
  setMetaHandoff,
  readMetaHandoff,
  clearMetaHandoff,
} from './session'
export { requireConnectSession, assertWorkspaceMatches } from './workspace'
export {
  loadWorkspaceAccounts,
  buildConnectedIdentitySet,
  isAlreadyConnected,
} from './accounts'
export { accountsRedirect, jsonError, toOAuthErrorCode, SocialConnectError } from './errors'
export { persistNewAccounts, summarizeConnectResults } from './persist'
export {
  buildFacebookAuthorizeUrl,
  exchangeFacebookCode,
  discoverMetaAssets,
} from './meta'
export { buildTikTokAuthorizeUrl, exchangeTikTokCode } from './tiktok'
export { buildThreadsAuthorizeUrl, exchangeThreadsCode } from './threads'
