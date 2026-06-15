import mongoose from 'mongoose'

/**
 * Resolves the Mongo connection string from the environment.
 * Declared in root `turbo.json` under `globalEnv` for cache correctness.
 */
export function getMongoUri(): string {
  const uri = process.env.MONGODB_URI ?? process.env.DATABASE_URL
  if (!uri) {
    throw new Error('Missing MONGODB_URI or DATABASE_URL environment variable')
  }
  return uri
}

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var __socialistaMongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.__socialistaMongooseCache ?? {
  conn: null,
  promise: null,
}

if (!global.__socialistaMongooseCache) {
  global.__socialistaMongooseCache = cache
}

/**
 * Connects to MongoDB with a module-level cache so serverless
 * runtimes reuse a single connection across invocations.
 */
export async function connectDb(uri?: string): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri ?? getMongoUri())
  }

  cache.conn = await cache.promise
  console.log('Connected to MongoDB:', cache.conn.connection.host)
  return cache.conn
}

/** Closes the connection and clears the module cache (useful in tests). */
export async function disconnectDb(): Promise<void> {
  cache.conn = null
  cache.promise = null
  await mongoose.disconnect()
}

export { mongoose }
