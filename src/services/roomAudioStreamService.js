/**
 * roomAudioStreamService.js
 * 
 * Phase 5: Live Microphone Audio Stream & Speech-to-Intent Pipeline
 * 
 * Manages physical microphone audio capture, real-time volume/RMS decibel analysis,
 * continuous Web Speech recognition, and automated ingestion into RoomObserverEngine
 * and WorkspaceStateBus.
 */

import { ingestSpeechTurn, HARVESTER_STATUS } from './roomObserverEngine.js';
import { dispatchWorkspaceMutation, WORKSPACE_APP_CHANNELS } from './workspaceStateBus.js';

export const AUDIO_STREAM_STATUS = {
  IDLE: 'idle',
  CONNECTING: 'connecting',
  LISTENING: 'listening',
  MUTED: 'muted',
  ERROR: 'error'
};

let activeStream = null;
let activeAudioContext = null;
let activeAnalyser = null;
let activeRecognition = null;
let levelMeterInterval = null;
let streamStatus = AUDIO_STREAM_STATUS.IDLE;
let isMuted = false;
let currentVolumeLevel = 0.0;
let lastTranscriptText = '';
let currentSpeakerName = 'You (Live Voice)';
let autoIngestIntents = true;

const streamListeners = new Set();

const notifyListeners = () => {
  const state = getAudioStreamState();
  streamListeners.forEach(listener => {
    try {
      listener(state);
    } catch (e) {
      console.error('[RoomAudioStream] Listener error:', e);
    }
  });
};

/**
 * Get snapshot of the current audio stream state.
 */
export function getAudioStreamState() {
  return {
    status: streamStatus,
    isStreaming: streamStatus === AUDIO_STREAM_STATUS.LISTENING || streamStatus === AUDIO_STREAM_STATUS.MUTED,
    isMuted,
    volumeLevel: currentVolumeLevel,
    lastTranscript: lastTranscriptText,
    speaker: currentSpeakerName,
    autoIngest: autoIngestIntents
  };
}

/**
 * Subscribe to audio stream state changes.
 */
export function subscribeToAudioStream(listener) {
  if (typeof listener !== 'function') return () => {};
  streamListeners.add(listener);
  listener(getAudioStreamState());
  return () => streamListeners.delete(listener);
}

/**
 * Start live microphone audio stream and speech-to-intent pipeline.
 */
export async function startLiveAudioStream(options = {}) {
  const {
    speaker = 'You (Live Voice)',
    autoIngest = true,
    onTranscript = null,
    onAudioLevel = null,
    onError = null
  } = options;

  currentSpeakerName = speaker;
  autoIngestIntents = Boolean(autoIngest);

  if (streamStatus === AUDIO_STREAM_STATUS.LISTENING) {
    return getAudioStreamState();
  }

  streamStatus = AUDIO_STREAM_STATUS.CONNECTING;
  notifyListeners();

  const isBrowserWithMedia = typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === 'function';

  if (!isBrowserWithMedia) {
    // Headless / Test / Node environment
    streamStatus = AUDIO_STREAM_STATUS.LISTENING;
    isMuted = false;
    currentVolumeLevel = 0.05;
    notifyListeners();
    return getAudioStreamState();
  }

  try {
    activeStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

    // Setup Web Audio API volume level analyser
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      activeAudioContext = new AudioContextClass();
      const sourceNode = activeAudioContext.createMediaStreamSource(activeStream);
      activeAnalyser = activeAudioContext.createAnalyser();
      activeAnalyser.fftSize = 256;
      sourceNode.connect(activeAnalyser);

      const bufferLength = activeAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      levelMeterInterval = setInterval(() => {
        if (!activeAnalyser || isMuted || streamStatus !== AUDIO_STREAM_STATUS.LISTENING) {
          currentVolumeLevel = 0.0;
        } else {
          activeAnalyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const avg = sum / bufferLength;
          currentVolumeLevel = Math.min(1.0, Math.round((avg / 128) * 100) / 100);
        }
        if (onAudioLevel) onAudioLevel(currentVolumeLevel);
        notifyListeners();
      }, 100);
    }

    // Setup Web Speech API continuous recognition
    const SpeechRecClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecClass) {
      activeRecognition = new SpeechRecClass();
      activeRecognition.continuous = true;
      activeRecognition.interimResults = true;
      activeRecognition.lang = 'en-US';

      activeRecognition.onresult = (evt) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = evt.resultIndex; i < evt.results.length; i++) {
          const transcript = evt.results[i][0]?.transcript || '';
          if (evt.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        const transcriptToProcess = (finalChunk || interimChunk).trim();
        if (transcriptToProcess) {
          lastTranscriptText = transcriptToProcess;
          if (onTranscript) onTranscript({ text: transcriptToProcess, isFinal: Boolean(finalChunk), speaker: currentSpeakerName });

          if (finalChunk && autoIngestIntents) {
            ingestSpeechTurn({
              speaker: currentSpeakerName,
              text: finalChunk.trim(),
              autoMutate: true,
              stage: true
            });
          }
          notifyListeners();
        }
      };

      activeRecognition.onerror = (err) => {
        if (err.error !== 'no-speech') {
          console.warn('[RoomAudioStream] Speech recognition error:', err.error);
          if (onError) onError(err);
        }
      };

      activeRecognition.onend = () => {
        if (streamStatus === AUDIO_STREAM_STATUS.LISTENING && !isMuted) {
          try {
            activeRecognition.start();
          } catch (_) {}
        }
      };

      try {
        activeRecognition.start();
      } catch (recStartErr) {
        console.warn('[RoomAudioStream] Speech recognition start deferred:', recStartErr.message);
      }
    }

    streamStatus = AUDIO_STREAM_STATUS.LISTENING;
    isMuted = false;
    notifyListeners();

    return getAudioStreamState();
  } catch (mediaErr) {
    console.error('[RoomAudioStream] Failed to access microphone:', mediaErr);
    streamStatus = AUDIO_STREAM_STATUS.ERROR;
    notifyListeners();
    if (onError) onError(mediaErr);
    throw mediaErr;
  }
}

/**
 * Stop active live audio stream and release all audio tracks.
 */
export function stopLiveAudioStream() {
  if (levelMeterInterval) {
    clearInterval(levelMeterInterval);
    levelMeterInterval = null;
  }

  if (activeRecognition) {
    activeRecognition.onend = null;
    try { activeRecognition.stop(); } catch (_) {}
    activeRecognition = null;
  }

  if (activeAudioContext) {
    try { activeAudioContext.close(); } catch (_) {}
    activeAudioContext = null;
  }

  if (activeStream) {
    try {
      activeStream.getTracks().forEach(track => track.stop());
    } catch (_) {}
    activeStream = null;
  }

  streamStatus = AUDIO_STREAM_STATUS.IDLE;
  currentVolumeLevel = 0.0;
  isMuted = false;
  notifyListeners();

  return getAudioStreamState();
}

/**
 * Toggle audio mute state.
 */
export function toggleMuteAudioStream() {
  if (streamStatus !== AUDIO_STREAM_STATUS.LISTENING && streamStatus !== AUDIO_STREAM_STATUS.MUTED) {
    return isMuted;
  }

  isMuted = !isMuted;
  if (activeStream) {
    activeStream.getAudioTracks().forEach(track => {
      track.enabled = !isMuted;
    });
  }

  streamStatus = isMuted ? AUDIO_STREAM_STATUS.MUTED : AUDIO_STREAM_STATUS.LISTENING;
  if (isMuted) {
    currentVolumeLevel = 0.0;
  }
  notifyListeners();
  return isMuted;
}

/**
 * Check if audio stream is currently active.
 */
export function isLiveAudioStreaming() {
  return streamStatus === AUDIO_STREAM_STATUS.LISTENING || streamStatus === AUDIO_STREAM_STATUS.MUTED;
}

/**
 * Deterministic turn simulator for testing and headless environments.
 */
export function simulateLiveAudioTurn(text, speaker = currentSpeakerName, volume = 0.72) {
  if (!text) return null;

  lastTranscriptText = text.trim();
  currentVolumeLevel = volume;

  let turnRecord = null;
  if (autoIngestIntents) {
    turnRecord = ingestSpeechTurn({
      speaker,
      text: text.trim(),
      autoMutate: true,
      stage: true
    });
  }

  dispatchWorkspaceMutation({
    appId: WORKSPACE_APP_CHANNELS.ROOM,
    targetApp: WORKSPACE_APP_CHANNELS.ROOM,
    action: 'AUDIO_STREAM_TURN_INGESTED',
    entityId: `audio_evt_${Date.now()}`,
    delta: {
      speaker,
      text: text.trim(),
      volume
    },
    source: 'room_audio_stream_service'
  });

  notifyListeners();
  return { turnRecord, transcript: text, volume };
}

/**
 * Reset audio stream state for unit testing.
 */
export function resetAudioStreamForTesting() {
  stopLiveAudioStream();
  lastTranscriptText = '';
  currentSpeakerName = 'You (Live Voice)';
  autoIngestIntents = true;
  streamListeners.clear();
}
