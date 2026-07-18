export async function imgToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return Buffer.from(buffer)
}

export async function imgToUint8Array(url: string): Promise<Uint8Array> {
  const buffer = await imgToBuffer(url)
  return new Uint8Array(buffer)
}

export async function imgToBase64(url: string): Promise<string> {
  const buffer = await imgToBuffer(url)
  return `data:image/jpeg;base64,${buffer.toString('base64')}`
}

export async function imgToArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  return buffer
}
