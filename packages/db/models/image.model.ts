import { model, Schema } from 'mongoose'
import { IImage, IImageCollection } from '../types/image.types.js'

const imageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    key: { type: String, required: true },
    size: { type: Number, default: 0, min: 0 },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    collectionId: { type: Schema.Types.ObjectId, ref: 'ImageCollection' },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
)

export const ImageModel = model<IImage>('Image', imageSchema)

const imageCollectionSchema = new Schema<IImageCollection>(
  {
    name: { type: String, required: true },
    workspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
    isPublic: { type: Boolean, default: false },
    description: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    imagesCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const ImageCollectionModel = model<IImageCollection>('ImageCollection', imageCollectionSchema)
