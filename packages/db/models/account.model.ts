import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type { IAccount } from '../types/account.types.js'
import { ConnectionStatus, SocialProvider } from '../types/account.types.js'

const accountSchema = new Schema<IAccount>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: enumValues(SocialProvider),
      required: true,
    },
    providerAccountId: { type: String, required: true },
    accountName: { type: String, required: true, trim: true },
    username: { type: String, trim: true },
    accountAvatar: { type: String },
    timezone: { type: String, required: true },
    connectionStatus: {
      type: String,
      enum: enumValues(ConnectionStatus),
      default: ConnectionStatus.PENDING,
      index: true,
    },
    scopes: { type: [String], default: [] },
    metadata: { type: Schema.Types.Mixed, default: {} },
    refreshToken: { type: String, select: false },
    accessToken: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date },
    accessTokenExpiresAt: { type: Date },
    lastError: { type: String },
    lastSyncedAt: { type: Date },
  },
  { timestamps: true },
)

accountSchema.index({ workspace: 1, provider: 1, providerAccountId: 1 }, { unique: true })
accountSchema.index({ workspace: 1, connectionStatus: 1 })
accountSchema.index({ workspace: 1, provider: 1 })

export const AccountModel = model<IAccount>('Account', accountSchema)
