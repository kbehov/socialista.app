import { BrandModel } from '../models/brand.model.js'
import type { BrandDocument, IBrand } from '../types/brand.types.js'
import { buildFilters, buildPaginationMeta } from '../utils/build-filters.js'

export const createBrand = async (brand: Partial<IBrand>): Promise<BrandDocument> => {
  const created = await BrandModel.create(brand)
  return created
}

export const getBrandById = async (id: string): Promise<IBrand | null> => {
  const brand = await BrandModel.findById(id).lean()
  return brand
}

export const getBrands = async (query: string) => {
  const { match, pagination, sort } = buildFilters(query)
  const [brands, total] = await Promise.all([
    BrandModel.find(match).sort(sort).skip(pagination.skip).limit(pagination.limit).lean(),
    BrandModel.countDocuments(match),
  ])
  return {
    brands,
    meta: buildPaginationMeta(total, pagination, sort),
  }
}

export const updateBrand = async (id: string, brand: Partial<IBrand>): Promise<BrandDocument | null> => {
  const updated = await BrandModel.findByIdAndUpdate(id, { $set: brand }, { new: true })
  return updated
}

export const deleteBrand = async (id: string): Promise<boolean> => {
  const deleted = await BrandModel.findByIdAndDelete(id)
  return deleted ? true : false
}
