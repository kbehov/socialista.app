import { hash } from 'bcrypt'
import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type { IUser, UserDocument } from '../types/user.types.js'
import { UserRole, UserStatus } from '../types/user.types.js'
const oauthAccountSchema = new Schema(
  {
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
  },
  { _id: false },
)

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: { type: String, required: true, trim: true },
    avatar: { type: String },
    oauthAccounts: { type: [oauthAccountSchema], default: [] },
    password: { type: String, select: false },
    status: {
      type: String,
      enum: enumValues(UserStatus),
      default: UserStatus.ACTIVE,
    },
    lastLoginAt: { type: Date },
    role: {
      type: String,
      enum: enumValues(UserRole),
      default: UserRole.USER,
    },
  },
  { timestamps: true },
)

userSchema.pre('save', async function (this: UserDocument) {
  if (!this.isModified('password')) return
  this.password = await hash(this.password!, 10)
})

userSchema.index({ status: 1 })

export const UserModel = model<IUser>('User', userSchema)
