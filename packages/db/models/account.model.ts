import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type { IAccount } from '../types/account.types.js'
import { ConnectionStatus } from '../types/account.types.js'

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
    timezone: { type: String, required: true },
    connectionStatus: {
      type: String,
      enum: enumValues(ConnectionStatus),
      default: ConnectionStatus.PENDING,
    },
    accountName: { type: String, required: true },
    accountAvatar: { type: String },
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    refreshToken: { type: String, select: false },
    accessToken: { type: String, select: false },
    refreshTokenExpiresAt: { type: Date },
    accessTokenExpiresAt: { type: Date },
  },
  { timestamps: true },
)

accountSchema.index({ workspace: 1, provider: 1, providerAccountId: 1 }, { unique: true })

export const AccountModel = model<IAccount>('Account', accountSchema)
