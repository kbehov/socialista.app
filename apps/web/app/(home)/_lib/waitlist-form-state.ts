export type JoinWaitlistFormState = {
  status: 'idle' | 'success' | 'duplicate' | 'error'
  message: string
  email?: string
  fieldErrors?: {
    email?: string
  }
}

export const IDLE_WAITLIST_STATE: JoinWaitlistFormState = {
  status: 'idle',
  message: '',
}
