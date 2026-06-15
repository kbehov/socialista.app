import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type { IWorkspace } from '../types/workspace.types.js'
import { BillingStatus, Plan, WorkspaceMemberRole, WorkspaceStatus } from '../types/workspace.types.js'

const workspaceMemberSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: {
      type: String,
      enum: enumValues(WorkspaceMemberRole),
      required: true,
    },
  },
  { _id: false },
)

const workspaceSettingsSchema = new Schema(
  {
    timezone: { type: String, required: true },
    language: { type: String },
  },
  { _id: false },
)

const workspaceLimitsSchema = new Schema(
  {
    members: { type: Number, required: true, min: 0, default: 1 },
    storage: { type: Number, required: true, min: 0, default: 1000 },
    accounts: { type: Number, required: true, min: 0, default: 3 },
    posts: { type: Number, required: true, min: 0, default: 30 },
  },
  { _id: false },
)

const workspaceUsageSchema = new Schema(
  {
    storage: { type: Number, required: true, default: 0, min: 0 },
    accounts: { type: Number, required: true, default: 0, min: 0 },
    posts: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false },
)

const workspaceBillingSchema = new Schema(
  {
    plan: {
      type: String,
      enum: enumValues(Plan),
      default: Plan.FREE,
    },
    status: {
      type: String,
      enum: enumValues(BillingStatus),
      default: BillingStatus.ACTIVE,
    },
    stripeCustomerId: { type: String },
    nextBillingDate: { type: Date, required: true },
    nextBillingAmount: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: { type: String, required: true, trim: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    description: { type: String, trim: true },
    settings: { type: workspaceSettingsSchema, required: true },
    avatar: { type: String },
    status: {
      type: String,
      enum: enumValues(WorkspaceStatus),
      default: WorkspaceStatus.ACTIVE,
    },
    members: { type: [workspaceMemberSchema], default: [] },
    limits: { type: workspaceLimitsSchema, required: true },
    usage: { type: workspaceUsageSchema, required: true },
    billing: { type: workspaceBillingSchema, required: true },
  },
  { timestamps: true },
)

workspaceSchema.index({ 'members.userId': 1 })

export const WorkspaceModel = model<IWorkspace>('Workspace', workspaceSchema)
