import type { HydratedDocument, Types } from 'mongoose'

export enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  PENDING = 'pending',
  ERROR = 'error',
}

/** A social platform account connected to a workspace for publishing. */
export interface IAccount {
  _id: string
  workspace: Types.ObjectId
  createdBy: Types.ObjectId
  timezone: string
  connectionStatus: ConnectionStatus
  provider: string
  providerAccountId: string
  refreshToken?: string
  accessToken?: string
  refreshTokenExpiresAt?: Date
  accessTokenExpiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export type AccountDocument = HydratedDocument<IAccount>
