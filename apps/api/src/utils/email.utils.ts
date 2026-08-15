export async function dispatchEmail(label: string, task: () => Promise<void>) {
  try {
    await task()
  } catch (error) {
    console.warn(`[email] ${label} failed`, error)
  }
}
