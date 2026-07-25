import { ProductModel } from '../models/product.model.js'
import type { Iproduct, ProductDocument } from '../types/product.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export const createProduct = async (product: Partial<Iproduct>): Promise<ProductDocument> => {
  const newProduct = await ProductModel.create(product)
  return newProduct
}

export const getProductById = async (id: string): Promise<Iproduct | null> => {
  const product = await ProductModel.findById(id).lean()
  return product
}

export const getProducts = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [products, total] = await Promise.all([
    ProductModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    ProductModel.countDocuments(match),
  ])
  return {
    products,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateProduct = async (id: string, product: Partial<Iproduct>): Promise<ProductDocument | null> => {
  const updatedProduct = await ProductModel.findByIdAndUpdate(id, { $set: product }, { new: true })
  return updatedProduct
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  const deletedProduct = await ProductModel.findByIdAndDelete(id)
  return deletedProduct ? true : false
}
