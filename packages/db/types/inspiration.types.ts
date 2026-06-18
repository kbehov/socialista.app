import { HydratedDocument, Types } from 'mongoose'
export type Author = {
  username?: string
  nickName?: string
  avatarUrl?: string
}
export type Video = {
  playUrl?: string
  coverUrl?: string
  downloadUrl?: string
  duration?: number
  width?: number
  height?: number
}
export type Stats = {
  likes: number
  comments: number
  shares: number
  plays: number
}
export type Image = {
  url: string
  width: number
  height: number
}
export enum InspirationContentType {
  SLIDESHOW = 'slideshow',
  VIDEO = 'video',
}
export interface IIspiration {
  _id: Types.ObjectId
  images: Image[]
  author: Author
  contentType?: InspirationContentType
  stats: Stats
  video: Video
  categories: Types.ObjectId[]
  niches: Types.ObjectId[]
  views: number
  createdAt: Date
  updatedAt: Date
}
export interface IInspirationCategory {
  _id: Types.ObjectId
  name: string
  icon?: string
  count?: number
  createdAt: Date
  updatedAt: Date
}
export interface IInspirationNiche {
  _id: Types.ObjectId
  name: string
  icon?: string
  count?: number
  createdAt: Date
  updatedAt: Date
}
export type InspirationDocument = HydratedDocument<IIspiration>
export type InspirationCategoryDocument = HydratedDocument<IInspirationCategory>
export type InspirationNicheDocument = HydratedDocument<IInspirationNiche>
