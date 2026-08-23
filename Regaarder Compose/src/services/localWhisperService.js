/**
 * localWhisperService.js
 * Client-side speech recognition and audio sanitization service.
 */

export async function transcribeAudioBlobLocally(blob) {
  return null;
}

export function cleanAndSanitizeTranscription(rawText) {
  if (!rawText || typeof rawText !== "string") return "";
  let cleaned = rawText.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
  cleaned = cleaned.replace(/^\[(?:SILENCE|MUSIC|APPLAUSE|BLANK_AUDIO)\]$/i, "[SILENCE]");
  return cleaned;
}
