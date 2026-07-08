import { connectDb } from '@socialista/db'

export async function ensureDb() {
  await connectDb()
}
