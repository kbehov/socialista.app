import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { GenerateTextToSpeechInput } from '@socialista/types'
// elevanlabs client
export const elevenlabs = new ElevenLabsClient()
// default model fallback
const DEFAULT_MODEL = 'eleven_multilingual_v2'
//generate text to speech
export const generateTextToSpeech = async (input: GenerateTextToSpeechInput) => {
  const { text, voice, model } = input
  const audio = await elevenlabs.textToSpeech.convert(voice, {
    text,
    modelId: model || DEFAULT_MODEL,
    outputFormat: 'mp3_44100_128',
  })
  return audio
}

export const getVoices = async () => {
  const voices = await elevenlabs.voices.search()
  return voices
}
  