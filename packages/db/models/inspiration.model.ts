import { model, Schema } from 'mongoose'
import { enumValues } from '../lib/schema.js'
import type {
  Author,
  IInspirationCategory,
  IInspirationNiche,
  IIspiration,
  Image,
  Stats,
  Video,
} from '../types/inspiration.types.js'
import { InspirationContentType } from '../types/inspiration.types.js'

const imageSchema = new Schema<Image>(
  {
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
)

const authorSchema = new Schema<Author>(
  {
    username: { type: String, required: true },
    nickName: { type: String, required: true },
    avatarUrl: { type: String, required: true },
  },
  { _id: false },
)

const statsSchema = new Schema<Stats>(
  {
    likes: { type: Number, required: true },
    comments: { type: Number, required: true },
    shares: { type: Number, required: true },
    plays: { type: Number, required: true },
  },
  { _id: false },
)

const videoSchema = new Schema<Video>(
  {
    playUrl: { type: String, required: true },
    coverUrl: { type: String, required: true },
    downloadUrl: { type: String, required: true },
    duration: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false },
)

const categorySchema = new Schema<IInspirationCategory>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { timestamps: true },
)

const nicheSchema = new Schema<IInspirationNiche>(
  {
    name: { type: String, required: true },
    icon: { type: String, required: true },
    count: { type: Number, required: true },
  },
  { timestamps: true },
)
const inspirationSchema = new Schema<IIspiration>(
  {
    contentType: { type: String, enum: enumValues(InspirationContentType), required: true },
    images: { type: [imageSchema], required: true },
    author: { type: authorSchema, required: true },
    stats: { type: statsSchema, required: true },
    video: { type: videoSchema, required: true },
    categories: { type: [Schema.Types.ObjectId], ref: 'InspirationCategory', required: true },
    niches: { type: [Schema.Types.ObjectId], ref: 'InspirationNiche', required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const InspirationModel = model<IIspiration>('Inspiration', inspirationSchema)
export const InspirationCategoryModel = model<IInspirationCategory>('InspirationCategory', categorySchema)
export const InspirationNicheModel = model<IInspirationNiche>('InspirationNiche', nicheSchema)
