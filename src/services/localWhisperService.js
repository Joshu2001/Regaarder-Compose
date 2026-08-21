/**
 * In-Browser WebAssembly Whisper Speech-to-Text Transcription Service
 * Uses quantized Xenova/whisper-tiny.en running 100% locally in browser memory.
 */

let transcriberInstance = null;
let isInitializing = false;
let initPromise = null;

const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

/**
 * Strips raw acoustic sound events, hallucinated tokens, and subtitle artifacts
 */
export function cleanAndSanitizeTranscription(rawText) {
  if (!rawText) return '';
  let text = String(rawText).trim();

  // Strip sound descriptors like *door closes*, *chuckles*, [music], (applause), *sighs*, etc.
  text = text.replace(/\*[^*]+\*/g, '');
  text = text.replace(/\[[^\]]+\]/g, '');
  text = text.replace(/\([^)]+\)/g, '');
  
  // Strip repetitive Whisper video subtitle tokens
  text = text.replace(/\b(you|thank you|thanks for watching|subscribe|subtitles by|subtitled by)\b/gi, '');

  // Normalize spacing
  text = text.replace(/\s{2,}/g, ' ').trim();

  // If text is only punctuation, special chars, or empty, discard
  if (!/[a-zA-Z0-9]/.test(text)) {
    return '';
  }

  return text;
}

/**
 * Initializes and caches the local Whisper WebAssembly model pipeline
 */
export async function getLocalWhisperTranscriber(onProgress) {
  if (transcriberInstance) {
    return transcriberInstance;
  }
  if (isInitializing && initPromise) {
    return initPromise;
  }

  isInitializing = true;
  initPromise = (async () => {
    try {
      const { pipeline, env } = await import(/* @vite-ignore */ TRANSFORMERS_CDN);
      env.allowLocalModels = false;
      env.useBrowserCache = true;

      transcriberInstance = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
        quantized: true,
        progress_callback: (progress) => {
          if (typeof onProgress === 'function') {
            onProgress(progress);
          }
        }
      });
      return transcriberInstance;
    } catch (err) {
      console.error('[localWhisperService] Failed to load in-browser Whisper pipeline:', err);
      throw err;
    } finally {
      isInitializing = false;
    }
  })();

  return initPromise;
}

/**
 * Converts any audio Blob (WebM / Ogg / WAV) to Float32Array PCM at 16kHz for Whisper tensor input
 */
async function decodeAudioBlobTo16kHz(audioBlob) {
  const arrayBuffer = await audioBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('AudioContext not supported');
  }
  const audioContext = new AudioCtx({ sampleRate: 16000 });
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // If already 16kHz single channel, return Float32Array directly
    if (audioBuffer.sampleRate === 16000 && audioBuffer.numberOfChannels === 1) {
      return audioBuffer.getChannelData(0);
    }

    // Otherwise resample using OfflineAudioContext to guarantee exact 16kHz mono Float32Array
    const offlineContext = new OfflineAudioContext(1, Math.ceil(audioBuffer.duration * 16000), 16000);
    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    return renderedBuffer.getChannelData(0);
  } finally {
    try {
      await audioContext.close();
    } catch (_e) {}
  }
}

/**
 * Transcribes an audio blob into text locally via WebAssembly Whisper with Intent & Noise Sanitization
 * @param {Blob} audioBlob - Recorded audio chunk or speech sample
 * @param {Function} [onProgress] - Optional model loading progress callback
 * @returns {Promise<string>} Transcribed, sanitized text string
 */
export async function transcribeAudioBlobLocally(audioBlob, onProgress) {
  if (!audioBlob || audioBlob.size < 400) {
    return '';
  }

  try {
    const transcriber = await getLocalWhisperTranscriber(onProgress);
    const float32Pcm = await decodeAudioBlobTo16kHz(audioBlob);

    if (!float32Pcm || float32Pcm.length === 0) {
      return '';
    }

    const output = await transcriber(float32Pcm, {
      chunk_length_s: 30,
      stride_length_s: 5,
      language: 'english',
      task: 'transcribe',
      return_timestamps: false
    });

    const rawText = String(output?.text || '').trim();
    const sanitizedText = cleanAndSanitizeTranscription(rawText);
    return sanitizedText;
  } catch (err) {
    console.warn('[localWhisperService] Error during local transcription:', err);
    return '';
  }
}
