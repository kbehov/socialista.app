import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import { ProjectStatus, type IProject } from '../types/project.types.js'

const projectSchema = new Schema<IProject>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true },
    icon: { type: String, trim: true },
    timezone: { type: String, required: true, trim: true, default: 'UTC' },
    status: {
      type: String,
      enum: enumValues(ProjectStatus),
      required: true,
      default: ProjectStatus.ACTIVE,
      index: true,
    },
    isDefault: { type: Boolean, required: true, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

projectSchema.index({ workspace: 1, name: 1 })
projectSchema.index({ workspace: 1, updatedAt: -1 })
projectSchema.index({ workspace: 1, isDefault: 1 })

export const ProjectModel = model<IProject>('Project', projectSchema)
