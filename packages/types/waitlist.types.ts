export type WaitlistAcquisition = {
  source?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  referrer?: string
}

export type JoinWaitlistPayload = {
  email: string
  website?: string
} & WaitlistAcquisition

export type JoinWaitlistResult = {
  email: string
  alreadyJoined: boolean
}
