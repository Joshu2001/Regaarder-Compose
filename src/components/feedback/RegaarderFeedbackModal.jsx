import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  X,
  Paperclip,
  Camera,
  Video,
  Check,
  FileText,
  ChevronDown,
  ChevronUp,
  Play,
  Maximize2
} from 'lucide-react';
// html2canvas omitted — native getDisplayMedia frame-grab is used instead (Electron-compatible)
import { FeedbackIcon } from '../RegaarderProductIcons';
import FloatingRecorderBar from './FloatingRecorderBar';
import ScreenSnipperOverlay from './ScreenSnipperOverlay';
import MediaLightboxModal from './MediaLightboxModal';

const FEEDBACK_TYPES = [
  { id: 'bug', label: 'Bug' },
  { id: 'idea', label: 'Feature idea' },
  { id: 'improvement', label: 'Improvement' },
  { id: 'other', label: 'Other' },
];

export default function RegaarderFeedbackModal({
  isOpen,
  onClose,
  activeApp = 'Workspace',
  activeFile = null,
}) {
  const [feedbackType, setFeedbackType] = useState('bug');
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showContextDetails, setShowContextDetails] = useState(false);

  // Snipping Tool State
  const [isSnipperOpen, setIsSnipperOpen] = useState(false);
  const [isModalHidden, setIsModalHidden] = useState(false);
  const [capturedCanvas, setCapturedCanvas] = useState(null);

  // Screen Recorder State
  const [isRecordingScreen, setIsRecordingScreen] = useState(false);
  const [isRecordingPaused, setIsRecordingPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Media Lightbox State
  const [lightboxMedia, setLightboxMedia] = useState(null);

  // Track recent JS console errors
  const [recentErrors, setRecentErrors] = useState([]);

  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordingTimerRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const screenStreamRef = useRef(null);
  const audioStreamRef = useRef(null);

  // Capture unhandled errors for diagnostics
  useEffect(() => {
    const errorHandler = (event) => {
      const errText = event?.message || (typeof event === 'string' ? event : 'Runtime error');
      setRecentErrors((prev) => [
        { message: errText, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 4),
      ]);
    };

    window.addEventListener('error', errorHandler);
    return () => window.removeEventListener('error', errorHandler);
  }, []);

  // Diagnostic context
  const workspaceContext = useMemo(() => {
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    const isMac = /Macintosh|Mac OS X/i.test(userAgent);
    const isWindows = /Windows/i.test(userAgent);
    const os = isMac ? 'macOS' : isWindows ? 'Windows' : 'Linux / Other';

    let browser = 'Browser';
    if (/Edg/i.test(userAgent)) browser = 'Microsoft Edge';
    else if (/Chrome/i.test(userAgent)) browser = 'Google Chrome';
    else if (/Safari/i.test(userAgent)) browser = 'Apple Safari';
    else if (/Firefox/i.test(userAgent)) browser = 'Mozilla Firefox';

    const viewport = typeof window !== 'undefined' ? `${window.innerWidth} × ${window.innerHeight}` : '1920 × 1080';
    const pixelRatio = typeof window !== 'undefined' ? `${window.devicePixelRatio || 1}x` : '1x';

    return {
      app: activeApp,
      activeDocument: activeFile || 'Workspace Dashboard',
      os,
      browser,
      viewport,
      pixelRatio,
      version: 'v2.4.2 (Production)',
      timestamp: new Date().toISOString(),
      recentErrors: recentErrors.length > 0 ? recentErrors : undefined,
    };
  }, [activeApp, activeFile, recentErrors]);

  // Clean up streams on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Attach File Pick
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments = files.map((file) => {
      const isImg = file.type.startsWith('image/');
      const isVid = file.type.startsWith('video/');
      return {
        id: `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: (file.size / 1024).toFixed(0) + ' KB',
        type: isImg ? 'image' : isVid ? 'video' : 'document',
        url: isImg || isVid ? URL.createObjectURL(file) : null,
        file,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (idToRemove) => {
    setAttachments((prev) => {
      const item = prev.find((a) => a.id === idToRemove);
      if (item?.url && item.url.startsWith('blob:')) {
        URL.revokeObjectURL(item.url);
      }
      return prev.filter((a) => a.id !== idToRemove);
    });
  };

  // Launch Interactive Screenshot Snipper via native getDisplayMedia frame grab.
  // html2canvas cannot paint GPU-composited Electron layers, so we use the same
  // OS screen picker the recorder uses — grab exactly one frame, stop the stream,
  // and hand the canvas to ScreenSnipperOverlay for region selection & annotation.
  const handleStartScreenshotSnipper = async () => {
    setIsModalHidden(true);

    try {
      if (!navigator.mediaDevices?.getDisplayMedia) {
        throw new Error('getDisplayMedia not available in this environment.');
      }

      // Give the modal a tick to fully hide before we open the OS picker
      await new Promise((r) => setTimeout(r, 80));

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 1, max: 5 },
        },
        audio: false,
        preferCurrentTab: true,
      });

      const videoTrack = stream.getVideoTracks()[0];

      let bitmap = null;
      if (typeof ImageCapture !== 'undefined') {
        // Preferred path — single high-fidelity frame, no video element needed
        const imageCapture = new ImageCapture(videoTrack);
        bitmap = await imageCapture.grabFrame();
      } else {
        // Fallback: draw via a video element
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        await video.play();
        await new Promise((r) => setTimeout(r, 120));
        const offCanvas = document.createElement('canvas');
        offCanvas.width = video.videoWidth;
        offCanvas.height = video.videoHeight;
        offCanvas.getContext('2d').drawImage(video, 0, 0);
        video.pause();
        video.srcObject = null;
        bitmap = offCanvas;
      }

      // Stop the capture stream immediately — we have what we need
      stream.getTracks().forEach((t) => t.stop());

      // Paint the bitmap onto a persistent canvas
      const captureCanvas = document.createElement('canvas');
      captureCanvas.width = bitmap.width;
      captureCanvas.height = bitmap.height;
      captureCanvas.getContext('2d').drawImage(bitmap, 0, 0);

      if (bitmap.close) bitmap.close(); // release ImageBitmap GPU memory

      setCapturedCanvas(captureCanvas);
      setIsSnipperOpen(true);
    } catch (err) {
      console.warn('[RegaarderFeedbackModal] Screenshot capture error:', err);
      // If the user dismissed the OS picker (NotAllowedError), restore the modal silently
      setIsModalHidden(false);
    }
  };

  const handleConfirmCrop = (dataUrl, width, height) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(':', '');
    const screenshotAttachment = {
      id: `screenshot-${Date.now()}`,
      name: `Screenshot-${timestamp}.png`,
      size: `${Math.round((dataUrl.length * 0.75) / 1024)} KB`,
      dimension: `${width} × ${height} px`,
      type: 'image',
      url: dataUrl,
      isScreenshot: true,
    };

    setAttachments((prev) => [...prev, screenshotAttachment]);
    setIsSnipperOpen(false);
    setCapturedCanvas(null);
    setIsModalHidden(false);
  };

  const handleCancelCrop = () => {
    setIsSnipperOpen(false);
    setCapturedCanvas(null);
    setIsModalHidden(false);
  };

  // Screen Recording Handlers with Floating Bar
  const handleStartScreenRecording = async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert('Screen recording is not supported in this browser environment.');
      return;
    }

    try {
      // 1. Request display media stream
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: 'always' },
        audio: false,
      });

      // 2. Request mic audio if not muted
      let combinedStream = stream;
      if (!isMuted && navigator.mediaDevices.getUserMedia) {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          audioStreamRef.current = micStream;
          const audioTracks = micStream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedStream = new MediaStream([
              ...stream.getVideoTracks(),
              audioTracks[0],
            ]);
          }
        } catch (micErr) {
          console.warn('[RegaarderFeedbackModal] Microphone access declined:', micErr);
        }
      }

      screenStreamRef.current = stream;
      recordedChunksRef.current = [];
      setRecordingSeconds(0);
      setIsRecordingPaused(false);
      setIsRecordingScreen(true);
      setIsModalHidden(true);

      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : 'video/webm';

      const recorder = new MediaRecorder(combinedStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);

        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        const videoSize = (blob.size / (1024 * 1024)).toFixed(1) + ' MB';

        const videoAttachment = {
          id: `recording-${Date.now()}`,
          name: `Screen-Recording-${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).replace(':', '')}.webm`,
          size: videoSize,
          type: 'video',
          url: videoUrl,
        };

        setAttachments((prev) => [...prev, videoAttachment]);
        setIsRecordingScreen(false);
        setIsRecordingPaused(false);
        setRecordingSeconds(0);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach((track) => track.stop());
          audioStreamRef.current = null;
        }
        screenStreamRef.current = null;

        // Restore feedback modal
        setIsModalHidden(false);
      };

      stream.getVideoTracks()[0].onended = () => {
        if (recorder.state !== 'inactive') {
          recorder.stop();
        }
      };

      recorder.start(1000);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            handleStopScreenRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.warn('[RegaarderFeedbackModal] Screen recording canceled or failed:', err);
      setIsRecordingScreen(false);
      setIsModalHidden(false);
    }
  };

  const handleTogglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsRecordingPaused(true);
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    } else if (mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsRecordingPaused(false);
      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            handleStopScreenRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleStopScreenRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleCancelScreenRecording = () => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((track) => track.stop());
      screenStreamRef.current = null;
    }
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach((track) => track.stop());
      audioStreamRef.current = null;
    }
    setIsRecordingScreen(false);
    setIsRecordingPaused(false);
    setRecordingSeconds(0);
    setIsModalHidden(false);
  };

  // Submit Feedback
  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!message.trim() && attachments.length === 0) return;

    setIsSubmitting(true);

    const submissionPayload = {
      id: `fb-${Date.now()}`,
      type: feedbackType,
      message: message.trim(),
      attachmentCount: attachments.length,
      attachments: attachments.map((a) => ({ name: a.name, size: a.size, type: a.type })),
      workspaceContext,
      submittedAt: new Date().toISOString(),
    };

    try {
      const stored = JSON.parse(localStorage.getItem('regaarder_feedback_history') || '[]');
      stored.unshift(submissionPayload);
      localStorage.setItem('regaarder_feedback_history', JSON.stringify(stored.slice(0, 30)));
    } catch (err) {
      // Ignore localStorage access restrictions
    }

    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setMessage('');
        setAttachments([]);
        onClose?.();
      }, 1100);
    }, 400);
  };

  return (
    <>
      {/* 1. Floating Screen Recording Controls */}
      <FloatingRecorderBar
        isRecording={isRecordingScreen}
        isPaused={isRecordingPaused}
        recordingSeconds={recordingSeconds}
        maxDuration={60}
        isMuted={isMuted}
        onTogglePause={handleTogglePause}
        onToggleMute={handleToggleMute}
        onStop={handleStopScreenRecording}
        onCancel={handleCancelScreenRecording}
      />

      {/* 2. Interactive Drag-to-Crop Screen Snipper Overlay */}
      <ScreenSnipperOverlay
        isOpen={isSnipperOpen}
        capturedCanvas={capturedCanvas}
        onConfirmCrop={handleConfirmCrop}
        onCancel={handleCancelCrop}
      />

      {/* 3. Media Full Lightbox Viewer */}
      <MediaLightboxModal
        isOpen={!!lightboxMedia}
        media={lightboxMedia}
        onClose={() => setLightboxMedia(null)}
      />

      {/* 4. Main Feedback Modal */}
      {isOpen && !isModalHidden && (
        <div
          id="regaarder-feedback-modal-container"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-150 transition-opacity font-sans"
          onClick={onClose}
        >
          {/* Frosted backdrop */}
          <div className="absolute inset-0 bg-slate-900/25 dark:bg-black/55 backdrop-blur-[2.5px] transition-opacity" />

          {/* Modal Card */}
          <div
            className="relative w-full max-w-[500px] bg-white dark:bg-[#18181c] border border-slate-200/80 dark:border-white/[0.08] rounded-2xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.22)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col z-10 transition-all animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="pt-5 pb-3.5 px-5 flex items-center justify-between border-b border-slate-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-2xs">
                  <FeedbackIcon size={16} strokeWidth={1.8} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-slate-900 dark:text-zinc-100 tracking-tight leading-none">
                    Feedback & Suggestions
                  </h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Help us refine Regaarder Workspace
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors cursor-pointer border-none bg-transparent outline-none"
                aria-label="Close dialog"
              >
                <X size={15} strokeWidth={2} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              {/* Feedback Type Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {FEEDBACK_TYPES.map((type) => {
                  const isSelected = feedbackType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setFeedbackType(type.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11.5px] font-medium transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-800/60 font-semibold shadow-2xs'
                          : 'bg-transparent text-slate-500 dark:text-zinc-400 border-transparent hover:bg-slate-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Text Area */}
              <div className="relative">
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you think, report an issue, or request a feature..."
                  className="w-full text-[12.5px] leading-relaxed p-3.5 rounded-xl border border-slate-200/90 dark:border-zinc-700/80 bg-slate-50/60 dark:bg-zinc-900/60 text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 transition-all resize-none font-sans"
                  autoFocus
                />
              </div>

              {/* Action Discovery Row */}
              <div className="flex items-center justify-between pt-0.5">
                <div className="flex items-center gap-1">
                  {/* Attach File */}
                  <button
                    type="button"
                    onClick={handleFileClick}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none bg-transparent"
                    title="Attach image, document, PDF or log"
                  >
                    <Paperclip size={13} strokeWidth={1.8} className="text-slate-400" />
                    <span>Attach</span>
                  </button>

                  {/* Drag-to-Snip Screenshot */}
                  <button
                    type="button"
                    onClick={handleStartScreenshotSnipper}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none bg-transparent"
                    title="Drag to select workspace screenshot area"
                  >
                    <Camera size={13} strokeWidth={1.8} className="text-slate-400" />
                    <span>Capture screenshot</span>
                  </button>

                  {/* Screen Recorder with Floating Bar */}
                  <button
                    type="button"
                    onClick={handleStartScreenRecording}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11.5px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer border-none bg-transparent"
                    title="Record short video with floating controls (up to 60s)"
                  >
                    <Video size={13} strokeWidth={1.8} className="text-slate-400" />
                    <span>Record screen</span>
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.pdf,.doc,.docx,.txt,.log,.json"
                  onChange={handleFilesSelected}
                  className="hidden"
                />
              </div>

              {/* Rich Visual Media Gallery (Immediately Visible) */}
              {attachments.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-white/[0.04]">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                    <span>Attached Media ({attachments.length})</span>
                    <span className="text-[10px] text-slate-400">Click preview to inspect</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 max-h-[140px] overflow-y-auto pr-1">
                    {attachments.map((item) => (
                      <div
                        key={item.id}
                        className="group relative flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/80 dark:border-white/10 text-left transition-all hover:border-violet-300 dark:hover:border-violet-700/60"
                      >
                        {/* Media Visual Preview */}
                        {item.type === 'image' && item.url ? (
                          <div
                            onClick={() => setLightboxMedia(item)}
                            className="relative w-12 h-12 rounded-lg bg-slate-200 dark:bg-zinc-800 overflow-hidden shrink-0 cursor-pointer group-hover:opacity-90"
                          >
                            <img
                              src={item.url}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 size={11} />
                            </div>
                          </div>
                        ) : item.type === 'video' && item.url ? (
                          <div
                            onClick={() => setLightboxMedia(item)}
                            className="relative w-12 h-12 rounded-lg bg-violet-950/80 text-violet-400 overflow-hidden shrink-0 cursor-pointer flex items-center justify-center group-hover:opacity-90"
                          >
                            <Play size={16} className="fill-current ml-0.5" />
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8.5px] text-center text-zinc-300 py-0.5">
                              VIDEO
                            </div>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                        )}

                        {/* Details */}
                        <div className="min-w-0 flex-1">
                          <p className="text-[11.5px] font-medium text-slate-800 dark:text-zinc-200 truncate leading-snug">
                            {item.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                            <span>{item.size}</span>
                            {item.dimension && <span>• {item.dimension}</span>}
                          </div>
                        </div>

                        {/* Remove Control */}
                        <button
                          type="button"
                          onClick={() => removeAttachment(item.id)}
                          className="w-5 h-5 rounded-md flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer border-none bg-transparent self-start shrink-0"
                          title="Remove attachment"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Automatically Included Context */}
              <div className="pt-1.5 border-t border-slate-100 dark:border-white/[0.05]">
                <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Check size={12} className="text-emerald-500 shrink-0" strokeWidth={2.4} />
                    <span>
                      Automatically included:{' '}
                      <span className="text-slate-600 dark:text-zinc-400 font-medium">
                        {workspaceContext.app} • {workspaceContext.os} • {workspaceContext.viewport}
                      </span>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowContextDetails((prev) => !prev)}
                    className="hover:text-slate-700 dark:hover:text-zinc-300 transition-colors cursor-pointer border-none bg-transparent p-0 flex items-center gap-0.5 underline"
                  >
                    <span>{showContextDetails ? 'Hide' : 'Details'}</span>
                    {showContextDetails ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                  </button>
                </div>

                {/* Expandable Diagnostic Details */}
                {showContextDetails && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-900/80 border border-slate-200/60 dark:border-white/[0.06] text-[10.5px] text-slate-500 dark:text-zinc-400 font-mono space-y-1 animate-in fade-in">
                    <div>App Mode: {workspaceContext.app}</div>
                    <div>Document: {workspaceContext.activeDocument}</div>
                    <div>OS & Browser: {workspaceContext.os} • {workspaceContext.browser}</div>
                    <div>Resolution: {workspaceContext.viewport} ({workspaceContext.pixelRatio})</div>
                    <div>Build: {workspaceContext.version}</div>
                    {workspaceContext.recentErrors && (
                      <div className="text-red-400 pt-1 border-t border-red-500/20">
                        Recent Errors ({workspaceContext.recentErrors.length}):
                        {workspaceContext.recentErrors.map((err, i) => (
                          <div key={i} className="truncate">• [{err.time}] {err.message}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.05]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-1.5 rounded-xl text-[12px] font-medium text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border-none bg-transparent outline-none"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || (!message.trim() && attachments.length === 0)}
                  className="px-4 py-1.5 rounded-xl text-[12px] font-semibold bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white transition-all cursor-pointer border-none shadow-[0_2px_8px_rgba(124,58,237,0.25)] hover:shadow-[0_4px_12px_rgba(124,58,237,0.35)] disabled:opacity-40 disabled:hover:bg-violet-600 disabled:shadow-none flex items-center gap-1.5 outline-none"
                >
                  {isSubmitting ? (
                    <span>Sending...</span>
                  ) : isSuccess ? (
                    <>
                      <Check size={13} strokeWidth={2.5} />
                      <span>Sent! Thank you</span>
                    </>
                  ) : (
                    <span>Send Feedback</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
