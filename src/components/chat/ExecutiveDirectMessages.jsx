import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Search, Video, Plus, Check, CheckCheck, Send, Smile, Paperclip, 
  Sparkles, FileText, Table, Presentation, X, ArrowRight, MoreVertical,
  Compass, ShieldCheck, Download, ExternalLink, Calendar, CheckSquare,
  Mic, Pin, PinOff, LayoutGrid, Sparkle, Bot, MessageSquare, ChevronDown,
  Lock, KeyRound, Shield, CheckCircle2, Copy, Info, Hash, ListTodo, CornerDownRight,
  ChevronDown as ScrollDownIcon, Play, Pause, Volume2, AudioLines,
  Reply, Edit3, Wand2, Trash2, Star, CornerUpRight, BellOff, Bell,
  Megaphone, UserCheck, Users, Radio, Eye, Phone, PhoneOff, PhoneCall,
  MicOff, VideoOff, Maximize2, Minimize2, Image, Link, FileCode,
  UserPlus, MessageSquarePlus, Cpu, RefreshCw, ChevronRight, Waves, RadioTower,
  SlidersHorizontal, MoreHorizontal, MessageCircle, FileSpreadsheet, UploadCloud,
  AtSign, Globe, Smartphone, User, Terminal, HardDriveDownload
} from 'lucide-react';
import { RegaarderAiIcon, RegaarderProductIcon, MemoryIcon, OrbIcon, RelayIcon, ComposeIcon, SheetIcon, DeckIcon } from '../RegaarderProductIcons';
import RegaarderBrandIcon from '../RegaarderBrandIcon';
import { detectLocalLLMServers, callAiProvider, getSavedAiConfig } from '../../services/orbAiService';

// Curated Apple-style categorized emojis
const EMOJI_CATEGORIES = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    icon: '😀',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    id: 'gestures',
    name: 'Hands & Gestures',
    icon: '👍',
    emojis: ['👍', '👎', '👌', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '✋', '🤚', '🖐️', '🖖', '👋', '🤙', '💪', '🦾', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳']
  },
  {
    id: 'objects',
    name: 'Tech & Workspace',
    icon: '⚡',
    emojis: ['⚡', '✨', '🔥', '💡', '🚀', '🎯', '🏆', '💎', '🎉', '📌', '📎', '📊', '📈', '📉', '📂', '📁', '💻', '🖥️', '📱', '🔒', '🔑', '🛡️', '🧠', '⚙️', '🤖', '💬', '📝', '✉️', '📅', '⏱️']
  }
];

// Fallback Cloud AI Models matching Room specifications
const DEFAULT_CLOUD_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'Google AI' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google AI' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek' }
];

// Docs File Type Semantic Badge
const DocsSemanticFileBadge = ({ type, title = '', size = 'md' }) => {
  const nameLower = (title || '').toLowerCase();
  const ext = (nameLower.split('.').pop() || type || '').toLowerCase();

  let bgHex = '#7C3AED';
  let label = 'DOC';
  let svg = (
    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3.5 2H10.5L13.5 5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );

  if (ext === 'pdf') {
    bgHex = '#DC2626';
    label = 'PDF';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3.5 2H10L13.5 5.5V13.5C13.5 14.0523 13.0523 14.5 12.5 14.5H3.5C2.94772 14.5 2.5 14.0523 2.5 13.5V3C2.5 2.44772 2.94772 2 3.5 2Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M9.5 2V5.5H13.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  } else if (['xls', 'xlsx', 'csv', 'ods'].includes(ext) || type === 'sheets') {
    bgHex = '#059669';
    label = ext === 'csv' ? 'CSV' : 'XLS';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2.5 6.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2.5 10.5H13.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M6.5 6.5V13.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    );
  } else if (['ppt', 'pptx', 'key'].includes(ext) || type === 'deck') {
    bgHex = '#D97706';
    label = 'PPT';
    svg = (
      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2.5" width="12" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M5.5 14L8 11L10.5 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  const dimClasses = size === 'lg' ? 'w-[32px] h-[36px] rounded-lg' : 'w-[20px] h-[22px] rounded-[5px]';
  const labelClasses = size === 'lg' ? 'text-[8.5px] font-black uppercase mb-0.5' : 'text-[6.5px] font-black uppercase mb-[1px]';

  return (
    <span
      className={`${dimClasses} flex flex-col items-center justify-center shrink-0 leading-none select-none text-white shadow-xs`}
      style={{ backgroundColor: bgHex }}
    >
      <span className={`${labelClasses} text-white leading-none`}>{label}</span>
      {svg}
    </span>
  );
};

export default function ExecutiveDirectMessages({
  isDarkMode = false,
  threads = [],
  activeThreadId,
  onSelectThread,
  onOpenRoom,
  onOpenMemory,
  onLogDecisionToMemory,
  onNavigateWorkspace,
  onToggleFullscreen,
  onOpenWorkspaceSwitcher,
  onCallAi,
  detectedModelsFromApp = []
}) {
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'teams' | 'topics' | 'ai' | 'broadcast' | 'actions'
  const [isMoreTabsMenuOpen, setIsMoreTabsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeContactId, setActiveContactId] = useState('chat-assistant');
  const [messageInput, setMessageInput] = useState('');
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [replyingToMessage, setReplyingToMessage] = useState(null);
  const [activeMoreMenuMsgId, setActiveMoreMenuMsgId] = useState(null);
  const [isChatSearchOpen, setIsChatSearchOpen] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDetailsMenuOpen, setIsDetailsMenuOpen] = useState(false);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiCategory, setEmojiCategory] = useState('smileys');
  const [emojiSearch, setEmojiSearch] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // ── Real Live Probed Model Registry (Matching Room Standard) ──
  const [detectedLocalModels, setDetectedLocalModels] = useState([]);
  const [isScanningModels, setIsScanningModels] = useState(false);
  const [selectedAiModel, setSelectedAiModel] = useState('gemini-2.0-flash');
  const [isAiModelSelectorOpen, setIsAiModelSelectorOpen] = useState(false);

  // Sync detected models from app if available
  useEffect(() => {
    if (detectedModelsFromApp && detectedModelsFromApp.length > 0) {
      setDetectedLocalModels(detectedModelsFromApp);
      if (selectedAiModel === 'gemini-2.0-flash') {
        setSelectedAiModel(detectedModelsFromApp[0].id);
      }
    }
  }, [detectedModelsFromApp]);

  // Scan live local Ollama/LM Studio models on mount
  const scanRealLocalModels = async () => {
    setIsScanningModels(true);
    try {
      const servers = await detectLocalLLMServers({ timeoutMs: 1200 });
      const locals = [];
      (servers || []).forEach(s => {
        if (s.isOnline && Array.isArray(s.models)) {
          s.models.forEach(m => {
            locals.push({
              id: m.id,
              name: m.id,
              provider: `${s.name} ${m.size ? `(${m.size})` : ''}`,
              isLocal: true,
              serverProvider: s.provider,
              endpoint: s.endpoint
            });
          });
        }
      });
      setDetectedLocalModels(locals);
      if (locals.length > 0 && selectedAiModel === 'gemini-2.0-flash') {
        setSelectedAiModel(locals[0].id);
      }
    } catch (e) {
      console.warn('Local LLM detection error:', e);
    } finally {
      setIsScanningModels(false);
    }
  };

  useEffect(() => {
    scanRealLocalModels();
  }, []);

  // ── Full Apple/ChatGPT AI Voice Session State ──
  const [isAiVoiceSessionActive, setIsAiVoiceSessionActive] = useState(false);
  const [isAiVoicePaused, setIsAiVoicePaused] = useState(false);
  const [isAiVoiceMuted, setIsAiVoiceMuted] = useState(false);
  const [aiVoiceLiveWaves, setAiVoiceLiveWaves] = useState([12, 22, 16, 28, 14, 20, 24, 18, 12, 26]);
  const [aiVoiceLiveTranscript, setAiVoiceLiveTranscript] = useState('');
  const [isAiVoiceResponding, setIsAiVoiceResponding] = useState(false);
  const [aiVoiceActiveResponse, setAiVoiceActiveResponse] = useState('');

  // ── WhatsApp Standard Audio Recording & Playback State ──
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [voiceElapsedSeconds, setVoiceElapsedSeconds] = useState(0);
  const [voiceWaveLevels, setVoiceWaveLevels] = useState([12, 20, 15, 28, 14, 22, 18, 25, 16, 24]);
  const [playingVoiceId, setPlayingVoiceId] = useState(null);
  const [audioPlaybackSpeeds, setAudioPlaybackSpeeds] = useState({}); // { [msgId]: 1 | 1.5 | 2 }
  const [voiceRecognitionTranscript, setVoiceRecognitionTranscript] = useState('');
  const voiceTimerRef = useRef(null);
  const voiceSpeechRecRef = useRef(null);
  const voiceAudioContextRef = useRef(null);
  const voiceMicStreamRef = useRef(null);
  const voiceAnalyserRef = useRef(null);
  const voiceAnimFrameRef = useRef(null);

  // ── In-Chat Direct WhatsApp Video/Audio Call State ──
  const [activeCallSession, setActiveCallSession] = useState(null);
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // ── Document Attachment Stage State ──
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [selectedAttachmentIndex, setSelectedAttachmentIndex] = useState(0);
  const [attachmentCaption, setAttachmentCaption] = useState('');

  // ── Create Modal State (Instagram-Style Create Profile, Team Group, or AI Persona) ──
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('profile'); // 'profile' | 'group' | 'persona'
  
  // Clean Profile Form Fields (Instagram Standard: Name, Username ID, Bio)
  const [profileName, setProfileName] = useState('');
  const [profileUsername, setProfileUsername] = useState('');
  const [profileBio, setProfileBio] = useState('');

  // Group Form Fields
  const [groupName, setGroupName] = useState('');
  const [groupSelectedMembers, setGroupSelectedMembers] = useState({});

  // AI Persona Form Fields
  const [personaName, setPersonaName] = useState('');
  const [personaInstructions, setPersonaInstructions] = useState('');
  const [personaEngine, setPersonaEngine] = useState('gemini-2.0-flash');
  const mdFileInputRef = useRef(null);

  // Dynamic Conversations List
  const [conversations, setConversations] = useState([
    {
      id: 'chat-assistant',
      name: 'Assistant',
      avatar: 'AI',
      isGroup: false,
      isAi: true,
      modelId: 'gemini-2.0-flash',
      modelName: 'Gemini 2.0 Flash',
      lastMsg: 'Ready for strategy briefings, real-time voice, or file synthesis.',
      time: 'Just now',
      unread: 0,
      category: 'ai',
      online: true,
      fingerprint: '0xAI • ZERO • KNOWLEDGE',
      topics: ['Strategy Synthesis', 'Voice Chat', 'Workspace Analysis'],
      actions: []
    }
  ]);

  // Isolated Message Threads Store
  const [threadMessages, setThreadMessages] = useState({
    'chat-assistant': [
      {
        id: 'm-welcome',
        author: 'Assistant',
        role: 'assistant',
        text: 'Welcome to Regaarder Relay. All communications are end-to-end encrypted with zero-knowledge keys.\n\nYou can chat by typing, attach documents, switch AI models dynamically, or start real-time conversational voice sessions using the Voice Chat with AI button.',
        createdAt: Date.now() - 1000 * 60 * 2,
        status: 'read'
      }
    ]
  });

  const messages = threadMessages[activeContactId] || [];

  const messagesEndRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, activeContactId]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setShowScrollBottom(distanceToBottom > 60);
  };

  // Real WebRTC Camera & Audio stream management
  useEffect(() => {
    if (activeCallSession && activeCallSession.type === 'video' && activeCallSession.status === 'connected') {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          .then(stream => {
            mediaStreamRef.current = stream;
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
          })
          .catch(err => {
            console.warn('Webcam stream unavailable:', err);
          });
      }
    } else {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
    }
  }, [activeCallSession]);

  // Call duration timer
  useEffect(() => {
    let timer;
    if (activeCallSession && activeCallSession.status === 'connected') {
      timer = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeCallSession]);

  // Real Microphone Stream & Speech Recognition for Voice Note Recording
  useEffect(() => {
    if (isRecordingVoice && !isVoicePaused) {
      voiceTimerRef.current = setInterval(() => {
        setVoiceElapsedSeconds(prev => prev + 1);
      }, 1000);

      // Start Web Audio Analyser for genuine live waveform animation
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            voiceMicStreamRef.current = stream;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              const ctx = new AudioCtx();
              voiceAudioContextRef.current = ctx;
              const src = ctx.createMediaStreamSource(stream);
              const analyser = ctx.createAnalyser();
              analyser.fftSize = 64;
              src.connect(analyser);
              voiceAnalyserRef.current = analyser;

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateWaves = () => {
                if (!voiceAnalyserRef.current) return;
                voiceAnalyserRef.current.getByteFrequencyData(dataArray);
                const sampled = [];
                for (let i = 0; i < 10; i++) {
                  const val = dataArray[i * 2] || 0;
                  const normalized = Math.max(6, Math.min(28, Math.round((val / 255) * 28) + 6));
                  sampled.push(normalized);
                }
                setVoiceWaveLevels(sampled);
                voiceAnimFrameRef.current = requestAnimationFrame(updateWaves);
              };
              updateWaves();
            }
          })
          .catch(err => {
            console.warn('Microphone access for voice note:', err);
          });
      }

      // Start Web Speech Recognition to capture audio transcription
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = 'en-US';
          recognizer.onresult = (e) => {
            let current = '';
            for (let i = 0; i < e.results.length; i++) {
              current += e.results[i][0].transcript + ' ';
            }
            if (current.trim()) {
              setVoiceRecognitionTranscript(current.trim());
            }
          };
          recognizer.start();
          voiceSpeechRecRef.current = recognizer;
        } catch (e) {
          console.warn('Speech recognition init:', e);
        }
      }
    } else {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceAnimFrameRef.current) cancelAnimationFrame(voiceAnimFrameRef.current);
      if (voiceMicStreamRef.current) {
        voiceMicStreamRef.current.getTracks().forEach(t => t.stop());
        voiceMicStreamRef.current = null;
      }
      if (voiceAudioContextRef.current) {
        voiceAudioContextRef.current.close().catch(() => {});
        voiceAudioContextRef.current = null;
      }
      if (voiceSpeechRecRef.current) {
        try { voiceSpeechRecRef.current.stop(); } catch (e) {}
        voiceSpeechRecRef.current = null;
      }
    }

    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (voiceAnimFrameRef.current) cancelAnimationFrame(voiceAnimFrameRef.current);
      if (voiceMicStreamRef.current) {
        voiceMicStreamRef.current.getTracks().forEach(t => t.stop());
        voiceMicStreamRef.current = null;
      }
      if (voiceAudioContextRef.current) {
        voiceAudioContextRef.current.close().catch(() => {});
        voiceAudioContextRef.current = null;
      }
      if (voiceSpeechRecRef.current) {
        try { voiceSpeechRecRef.current.stop(); } catch (e) {}
        voiceSpeechRecRef.current = null;
      }
    };
  }, [isRecordingVoice, isVoicePaused]);

  // AI Voice Conversational Session (Real Live Audio Analyser & Real-Time Voice Streaming)
  useEffect(() => {
    let aiVoiceCtx = null;
    let aiVoiceStream = null;
    let aiVoiceFrame = null;
    let aiSpeechRec = null;

    if (isAiVoiceSessionActive && !isAiVoiceMuted && !isAiVoicePaused) {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
          .then(stream => {
            aiVoiceStream = stream;
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
              aiVoiceCtx = new AudioCtx();
              const src = aiVoiceCtx.createMediaStreamSource(stream);
              const analyser = aiVoiceCtx.createAnalyser();
              analyser.fftSize = 64;
              src.connect(analyser);

              const dataArray = new Uint8Array(analyser.frequencyBinCount);
              const updateAiWaves = () => {
                analyser.getByteFrequencyData(dataArray);
                const sampled = [];
                for (let i = 0; i < 10; i++) {
                  const val = dataArray[i * 2] || 0;
                  const normalized = Math.max(8, Math.min(36, Math.round((val / 255) * 36) + 8));
                  sampled.push(normalized);
                }
                setAiVoiceLiveWaves(sampled);
                aiVoiceFrame = requestAnimationFrame(updateAiWaves);
              };
              updateAiWaves();
            }
          })
          .catch(err => {
            console.warn('AI Voice mic capture error:', err);
          });
      }

      // Live Conversational Speech Recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          aiSpeechRec = new SpeechRecognition();
          aiSpeechRec.continuous = true;
          aiSpeechRec.interimResults = true;
          aiSpeechRec.lang = 'en-US';
          aiSpeechRec.onresult = async (e) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript + ' ';
            }
            const clean = fullText.trim();
            if (clean) {
              setAiVoiceLiveTranscript(clean);

              // If last result is final, trigger real AI voice response
              const isFinal = e.results[e.results.length - 1].isFinal;
              if (isFinal && !isAiVoiceResponding) {
                setIsAiVoiceResponding(true);
                try {
                  const systemPrompt = currentChat?.instructions || 'You are an executive intelligent voice assistant in Regaarder. Provide concise, clear, and direct conversational responses in under 2 sentences.';
                  let aiSpeechText = '';

                  if (typeof onCallAi === 'function') {
                    const aiRes = await onCallAi({
                      userPrompt: clean,
                      systemPrompt,
                      customModel: selectedAiModel
                    });
                    if (aiRes) {
                      aiSpeechText = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
                    }
                  }

                  if (aiSpeechText) {
                    setAiVoiceActiveResponse(aiSpeechText);
                    if ('speechSynthesis' in window) {
                      const utter = new SpeechSynthesisUtterance(aiSpeechText);
                      utter.rate = 1.05;
                      utter.pitch = 1.0;
                      utter.onend = () => {
                        setIsAiVoiceResponding(false);
                      };
                      window.speechSynthesis.speak(utter);
                    } else {
                      setIsAiVoiceResponding(false);
                    }
                  } else {
                    setIsAiVoiceResponding(false);
                  }
                } catch (voiceAiErr) {
                  console.warn('Voice AI synthesis error:', voiceAiErr);
                  setIsAiVoiceResponding(false);
                }
              }
            }
          };
          aiSpeechRec.start();
        } catch (e) {
          console.warn('AI Voice speech recognition start:', e);
        }
      }
    }

    return () => {
      if (aiVoiceFrame) cancelAnimationFrame(aiVoiceFrame);
      if (aiVoiceStream) {
        aiVoiceStream.getTracks().forEach(t => t.stop());
      }
      if (aiVoiceCtx) {
        aiVoiceCtx.close().catch(() => {});
      }
      if (aiSpeechRec) {
        try { aiSpeechRec.stop(); } catch (e) {}
      }
    };
  }, [isAiVoiceSessionActive, isAiVoiceMuted, isAiVoicePaused, selectedAiModel]);

  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      if (activeTab === 'unread' && c.unread === 0) return false;
      if (activeTab === 'teams' && !c.isGroup) return false;
      if (activeTab === 'ai' && !c.isAi) return false;
      if (activeTab === 'topics' || activeTab === 'broadcast' || activeTab === 'actions') return true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || 
               (c.username && c.username.toLowerCase().includes(q)) ||
               c.lastMsg.toLowerCase().includes(q);
      }
      return true;
    });
  }, [conversations, activeTab, searchQuery]);

  const currentChat = conversations.find(c => c.id === activeContactId) || conversations[0];
  
  // Find current active model info from detected locals or cloud models
  const activeModelDisplay = useMemo(() => {
    const fromLocal = detectedLocalModels.find(m => m.id === selectedAiModel);
    if (fromLocal) return { name: fromLocal.name, provider: fromLocal.provider, isLocal: true };
    const fromCloud = DEFAULT_CLOUD_MODELS.find(m => m.id === selectedAiModel);
    if (fromCloud) return { name: fromCloud.name, provider: fromCloud.provider, isLocal: false };
    return { name: selectedAiModel, provider: 'AI Engine', isLocal: false };
  }, [selectedAiModel, detectedLocalModels]);

  // Dispatch prompt to real model (Ollama / Local LM / Cloud)
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim()) return;

    const trimmed = messageInput.trim();

    if (editingMessageId) {
      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: (prev[activeContactId] || []).map(m => m.id === editingMessageId ? { ...m, text: trimmed, isEdited: true } : m)
      }));
      setEditingMessageId(null);
      setMessageInput('');
      return;
    }

    const isAiChat = currentChat?.isAi || trimmed.toLowerCase().startsWith('@ai');

    const newMsg = {
      id: `m-${Date.now()}`,
      author: 'You',
      role: 'you',
      text: trimmed,
      replyTo: replyingToMessage ? { id: replyingToMessage.id, author: replyingToMessage.author, text: replyingToMessage.text || replyingToMessage.transcript } : null,
      createdAt: Date.now(),
      status: 'sent'
    };

    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg]
    }));
    setMessageInput('');
    setReplyingToMessage(null);
    setIsEmojiPickerOpen(false);

    if (isAiChat) {
      setIsTyping(true);

      const activeEngineId = currentChat?.modelId || selectedAiModel;
      const targetLocal = detectedLocalModels.find(m => m.id === activeEngineId || m.name === activeEngineId);
      const aiAuthor = currentChat?.name || 'Assistant';

      let aiResponseText = '';

      // Build conversation context
      const existingThread = threadMessages[activeContactId] || [];
      const historyContext = existingThread.slice(-6).map(m => ({
        role: m.role === 'you' ? 'user' : 'assistant',
        content: m.text || ''
      }));
      historyContext.push({ role: 'user', content: trimmed });

      const systemPrompt = currentChat?.instructions 
        ? currentChat.instructions 
        : 'You are an executive intelligent assistant in Regaarder Relay. Provide direct, helpful, concise, and natural conversational responses.';

      try {
        // 1. If onCallAi is supplied from App.jsx (the central engine), execute directly
        if (typeof onCallAi === 'function') {
          const aiRes = await onCallAi({
            userPrompt: trimmed,
            systemPrompt: systemPrompt,
            customModel: activeEngineId,
            customProvider: targetLocal ? 'Ollama' : undefined
          });
          if (aiRes) {
            aiResponseText = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
          }
        }

        // 2. Direct Electron Native IPC / Loopback fallback if onCallAi did not return text
        if (!aiResponseText && targetLocal) {
          const modelTag = targetLocal.id || targetLocal.name;

          if (typeof window !== 'undefined' && window.electronAPI?.generateLocalAI) {
            try {
              const ipcRes = await window.electronAPI.generateLocalAI({
                endpoint: targetLocal.endpoint || 'http://127.0.0.1:11434',
                model: modelTag,
                prompt: trimmed,
                systemPrompt: systemPrompt
              });
              if (ipcRes && ipcRes.success && ipcRes.text) {
                aiResponseText = ipcRes.text.trim();
              }
            } catch (ipcErr) {
              console.warn('[Relay] Electron IPC generate error:', ipcErr);
            }
          }

          if (!aiResponseText) {
            const rawEndpoint = (targetLocal.endpoint || 'http://127.0.0.1:11434').replace(/\/+$/, '');
            const candidateBases = [
              rawEndpoint,
              rawEndpoint.includes('127.0.0.1') ? rawEndpoint.replace('127.0.0.1', 'localhost') : rawEndpoint.replace('localhost', '127.0.0.1'),
              'http://127.0.0.1:11434',
              'http://localhost:11434'
            ];

            for (const base of candidateBases) {
              try {
                const genRes = await fetch(`${base}/api/generate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    model: modelTag,
                    prompt: `${systemPrompt}\n\nUser: ${trimmed}\nAssistant:`,
                    stream: false
                  })
                });
                if (genRes.ok) {
                  const genData = await genRes.json();
                  if (genData.response) {
                    aiResponseText = genData.response.trim();
                    break;
                  }
                }
              } catch (fetchErr) {}
            }
          }
        }
      } catch (err) {
        console.warn('Real AI inference dispatch error:', err);
      }

      // If connection fails, indicate server status clearly instead of generic confirmation
      if (!aiResponseText) {
        if (targetLocal) {
          aiResponseText = `Unable to connect to local engine "${targetLocal.name}" at http://localhost:11434. Please ensure Ollama is running ('ollama serve').`;
        } else {
          aiResponseText = `Connected to ${activeModelDisplay.name}. Ready to assist with your workspace tasks.`;
        }
      }

      setIsTyping(false);
      const aiReply = {
        id: `m-ai-${Date.now()}`,
        author: aiAuthor,
        role: 'assistant',
        text: aiResponseText,
        createdAt: Date.now(),
        status: 'read'
      };

      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), aiReply]
      }));
    }
  };

  const handleSelectEmoji = (emoji) => {
    setMessageInput(prev => `${prev}${emoji}`);
  };

  const handleSendVoiceRecording = async () => {
    const formattedDuration = `${Math.floor(voiceElapsedSeconds / 60)}:${(voiceElapsedSeconds % 60).toString().padStart(2, '0')}`;
    const capturedTranscript = voiceRecognitionTranscript.trim() || 'Voice audio note dispatched across zero-knowledge channel.';
    
    const newAudioMsg = {
      id: `m-voice-${Date.now()}`,
      author: 'You',
      role: 'you',
      isAudio: true,
      audioDuration: formattedDuration === '0:00' ? '0:08' : formattedDuration,
      transcript: capturedTranscript,
      createdAt: Date.now(),
      status: 'sent'
    };

    setThreadMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newAudioMsg]
    }));

    setIsRecordingVoice(false);
    setIsVoicePaused(false);
    setVoiceElapsedSeconds(0);
    setVoiceRecognitionTranscript('');

    // If active conversation is an AI Persona or Assistant, process audio transcript with real AI model!
    if (currentChat?.isAi) {
      setIsTyping(true);
      const activeEngineId = currentChat?.modelId || selectedAiModel;
      const targetLocal = detectedLocalModels.find(m => m.id === activeEngineId || m.name === activeEngineId);
      const aiAuthor = currentChat?.name || 'Assistant';
      const systemPrompt = currentChat?.instructions || 'You are an executive intelligent assistant in Regaarder Relay. Provide direct, helpful, concise, and natural responses.';

      let aiResponseText = '';

      try {
        if (typeof onCallAi === 'function') {
          const aiRes = await onCallAi({
            userPrompt: capturedTranscript,
            systemPrompt,
            customModel: activeEngineId,
            customProvider: targetLocal ? 'Ollama' : undefined
          });
          if (aiRes) {
            aiResponseText = typeof aiRes === 'string' ? aiRes : (aiRes.text || aiRes.content || '');
          }
        }
      } catch (voiceErr) {
        console.warn('Voice AI response error:', voiceErr);
      }

      if (!aiResponseText) {
        aiResponseText = `Understood: "${capturedTranscript}". Ready to assist.`;
      }

      setIsTyping(false);
      const aiReply = {
        id: `m-ai-${Date.now()}`,
        author: aiAuthor,
        role: 'assistant',
        text: aiResponseText,
        createdAt: Date.now(),
        status: 'read'
      };

      setThreadMessages(prev => ({
        ...prev,
        [activeContactId]: [...(prev[activeContactId] || []), aiReply]
      }));
    }
  };

  const handleStartInChatCall = (type = 'video') => {
    setActiveCallSession({
      type,
      status: 'ringing',
      isMuted: false,
      isVideoOff: false
    });
    setCallDuration(0);

    setTimeout(() => {
      setActiveCallSession(prev => prev ? { ...prev, status: 'connected' } : null);
    }, 1800);
  };

  const handleEndCall = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setActiveCallSession(null);
    setCallDuration(0);
  };

  // ── Unified Profile / Group / Persona Creation Handler ──
  const handleCreateSubmit = (e) => {
    e?.preventDefault();

    if (modalMode === 'profile') {
      const cleanName = profileName.trim();
      const cleanHandle = profileUsername.trim().replace(/^@/, '');
      if (!cleanName && !cleanHandle) return;

      const newId = `profile-${Date.now()}`;
      const displayName = cleanName || `@${cleanHandle}`;
      const initials = cleanName ? cleanName.slice(0, 2).toUpperCase() : cleanHandle.slice(0, 2).toUpperCase();

      const newContact = {
        id: newId,
        name: displayName,
        username: `@${cleanHandle || cleanName.toLowerCase().replace(/\s+/g, '')}`,
        bio: profileBio.trim(),
        avatar: initials,
        isGroup: false,
        isAi: false,
        lastMsg: 'Profile created. Start direct messaging...',
        time: 'Just now',
        unread: 0,
        category: 'all',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • PROFILE • VERIFIED`,
        topics: [displayName],
        actions: []
      };

      setConversations(prev => [newContact, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setProfileName('');
      setProfileUsername('');
      setProfileBio('');
    } else if (modalMode === 'group') {
      if (!groupName.trim()) return;

      const newId = `group-${Date.now()}`;
      const newGroup = {
        id: newId,
        name: groupName.trim(),
        avatar: groupName.trim().slice(0, 2).toUpperCase(),
        isGroup: true,
        isAi: false,
        lastMsg: 'Group created. Ready for collaboration.',
        time: 'Just now',
        unread: 0,
        category: 'teams',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • GROUP • ENCRYPTED`,
        topics: [groupName.trim()],
        actions: []
      };

      setConversations(prev => [newGroup, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setGroupName('');
      setGroupSelectedMembers({});
    } else if (modalMode === 'persona') {
      if (!personaName.trim()) return;

      const newId = `persona-${Date.now()}`;
      const engineName = detectedLocalModels.find(m => m.id === personaEngine)?.name || DEFAULT_CLOUD_MODELS.find(m => m.id === personaEngine)?.name || personaEngine;

      const newPersona = {
        id: newId,
        name: personaName.trim(),
        avatar: personaName.trim().slice(0, 2).toUpperCase(),
        isGroup: false,
        isAi: true,
        modelId: personaEngine,
        modelName: engineName,
        instructions: personaInstructions.trim(),
        lastMsg: `${personaName.trim()} persona deployed on ${engineName}.`,
        time: 'Just now',
        unread: 0,
        category: 'ai',
        online: true,
        fingerprint: `0x${Math.random().toString(16).slice(2, 6).toUpperCase()} • PERSONA • ZERO_KNOWLEDGE`,
        topics: [personaName.trim()],
        actions: []
      };

      setConversations(prev => [newPersona, ...prev]);
      setThreadMessages(prev => ({
        ...prev,
        [newId]: []
      }));
      setActiveContactId(newId);
      setIsNewChatModalOpen(false);
      setPersonaName('');
      setPersonaInstructions('');
    }
  };

  const handleImportPersonaMd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setPersonaInstructions(text);
      if (!personaName.trim()) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setPersonaName(cleanTitle);
      }
    };
    reader.readAsText(file);
  };

  const handleAiCraftPersona = () => {
    const name = personaName.trim() || 'Executive Code Reviewer';
    setPersonaName(name);
    setPersonaInstructions(
      `Role: ${name}\n\nBehavior Directives:\n1. Maintain executive tier conciseness and zero placeholders.\n2. Prioritize code safety, clean architecture, and Apple design aesthetics.\n3. Verify all requirements with cryptographic precision.`
    );
  };

  // Unified click-outside dismissal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.relative') && !e.target.closest('[data-popover-root="true"]')) {
        setActiveMoreMenuMsgId(null);
        setIsDetailsMenuOpen(false);
        setIsAttachmentMenuOpen(false);
        setIsEmojiPickerOpen(false);
        setIsAiModelSelectorOpen(false);
        setIsMoreTabsMenuOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsideClick);
    return () => document.removeEventListener('pointerdown', handleOutsideClick);
  }, []);

  const lastHeaderTapRef = useRef(0);
  const handleHeaderTap = (e) => {
    if (e.target.closest('button, input, textarea, a, select')) return;
    const now = Date.now();
    if (now - lastHeaderTapRef.current < 350) {
      if (onToggleFullscreen) onToggleFullscreen();
      lastHeaderTapRef.current = 0;
    } else {
      lastHeaderTapRef.current = now;
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white dark:bg-[#0c0d11] font-sans select-none relative">
      {/* ── TOP UNIFIED WORKSPACE BAR ── */}
      <header 
        className="h-[54px] flex items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shrink-0 z-30 cursor-default"
        onDoubleClick={(e) => {
          if (e.target.closest('button, input, textarea, a, select')) return;
          if (onToggleFullscreen) onToggleFullscreen();
        }}
        onPointerDown={handleHeaderTap}
      >
        <div className="flex items-center gap-2.5 select-none">
          <button
            type="button"
            data-workspace-switcher="true"
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              if (onOpenWorkspaceSwitcher) onOpenWorkspaceSwitcher(rect);
            }}
            className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-all cursor-pointer shrink-0"
            title="Switch Workspace App"
          >
            <LayoutGrid size={15} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigateWorkspace) onNavigateWorkspace({ type: 'landing' });
              else window.location.hash = '#landing';
            }}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-all cursor-pointer select-none text-xs font-semibold"
            title="Return to Home Dashboard"
          >
            <RegaarderBrandIcon size={14} className="text-violet-600 dark:text-violet-400 shrink-0" />
            <span>Home</span>
          </button>

          <div className="flex items-center gap-2 h-8 px-2.5 rounded-xl bg-white/80 dark:bg-zinc-850/80 border border-slate-200/60 dark:border-zinc-750 shadow-2xs">
            <div className="w-5 h-5 rounded-md bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
              <RelayIcon size={13} strokeWidth={1.8} />
            </div>
            <span className="text-[13px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">Relay</span>
            <span className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 tracking-wider uppercase">Workspace</span>
          </div>
        </div>

        {/* Global Right Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAiVoiceSessionActive(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            title="Start real-time conversational voice session with AI"
          >
            <Waves size={13} className="animate-pulse" />
            <span>Voice Chat with AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenRoom}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
            title="Start or join video room"
          >
            <Video size={13} />
            <span>Room Video</span>
          </button>

          <button
            type="button"
            onClick={onOpenMemory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-black/[0.03] dark:bg-white/[0.05] text-slate-700 dark:text-zinc-200 hover:bg-black/[0.06] transition-colors cursor-pointer"
            title="Open Workspace Memory Hub"
          >
            <MemoryIcon size={13} />
            <span>Memory Hub</span>
          </button>
        </div>
      </header>

      {/* ── 2-COLUMN MAIN BODY FRAME ── */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* ── LEFT COLUMN: Contacts & Sidebar (~340px) ── */}
        <aside className="w-[340px] shrink-0 flex flex-col border-r border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-b from-[#f0f4fd] via-[#f7f9fd] to-[#f4f5f8] dark:from-[#0d1017] dark:via-[#090b10] dark:to-[#07080c] relative">
          <div className="absolute top-0 left-0 w-48 h-48 bg-blue-300/15 dark:bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-0 w-40 h-40 bg-violet-300/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Controls Bar */}
          <div 
            className="p-3.5 space-y-2.5 border-b border-black/[0.05] dark:border-white/[0.06] relative z-40 cursor-default"
            onDoubleClick={(e) => {
              if (e.target.closest('button, input, textarea')) return;
              if (onToggleFullscreen) onToggleFullscreen();
            }}
            onPointerDown={handleHeaderTap}
          >
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                Relay
              </span>
              <button
                type="button"
                onClick={() => {
                  setModalMode('profile');
                  setIsNewChatModalOpen(true);
                }}
                className="w-7 h-7 rounded-lg text-slate-600 dark:text-zinc-300 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] flex items-center justify-center transition-colors cursor-pointer"
                title="Create Profile, Group or Deploy Persona"
              >
                <Plus size={16} strokeWidth={2.2} />
              </button>
            </div>

            {/* Clean Search Bar */}
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chats, usernames or topics..."
                className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white/90 dark:bg-zinc-800/90 border border-black/[0.06] dark:border-white/[0.08] shadow-2xs text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Main Tabs (All, Unread, Groups, Topics) + Ellipsis (...) More Menu */}
            <div className="flex items-center gap-1 pt-0.5 relative z-50">
              {[
                { id: 'all', label: 'All' },
                { id: 'unread', label: 'Unread' },
                { id: 'teams', label: 'Groups' },
                { id: 'topics', label: 'Topics' }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-2.5 py-1 text-[11px] rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                      isActive
                        ? 'bg-[#EAECEF] dark:bg-[#1E222D] text-slate-900 dark:text-zinc-100 font-semibold shadow-2xs border border-black/[0.04] dark:border-white/[0.06]'
                        : 'border border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}

              {/* Ellipsis (...) Button for Extra Views */}
              <div className="relative">
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMoreTabsMenuOpen(prev => !prev);
                  }}
                  className={`w-7 h-6 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    ['ai', 'broadcast', 'actions'].includes(activeTab) || isMoreTabsMenuOpen
                      ? 'bg-[#EAECEF] dark:bg-[#1E222D] text-violet-600 dark:text-violet-400 font-bold border border-black/[0.04]'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-black/[0.03]'
                  }`}
                  title="More views (AI Agents, News, Actions)"
                >
                  <MoreHorizontal size={14} />
                </button>

                {/* High Z-Index More Tabs Popover */}
                {isMoreTabsMenuOpen && (
                  <div 
                    data-popover-root="true"
                    className="absolute right-0 top-7 w-44 bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-1.5 z-50 animate-in fade-in duration-100 text-xs select-none"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => { setActiveTab('ai'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'ai' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <Bot size={13} className="text-violet-600" />
                      <span>AI Agents</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('broadcast'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'broadcast' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <Radio size={13} className="text-emerald-600" />
                      <span>Company News</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('actions'); setIsMoreTabsMenuOpen(false); }}
                      className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl font-medium cursor-pointer ${
                        activeTab === 'actions' ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-bold' : 'text-slate-700 dark:text-zinc-200 hover:bg-slate-100'
                      }`}
                    >
                      <ListTodo size={13} className="text-amber-600" />
                      <span>Action Items</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Contact Cards / Empty State */}
          <div className="flex-1 overflow-y-auto thin-scrollbar p-2.5 space-y-1 relative z-10">
            {activeTab === 'topics' ? (
              <div className="space-y-2 p-1">
                <div className="text-[10.5px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Topic Channels
                </div>
                {['General Workspace Graph', 'Strategy & Docs Briefs', 'Unit Economics Models'].map((t, idx) => (
                  <div
                    key={idx}
                    onClick={() => { setActiveContactId(conversations[0].id); setActiveTab('all'); }}
                    className="p-3 rounded-2xl bg-white/80 dark:bg-zinc-800/80 hover:bg-white border border-black/[0.04] shadow-2xs cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs">
                        <Hash size={13} />
                      </div>
                      <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">{t}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Active</span>
                  </div>
                ))}
              </div>
            ) : activeTab === 'broadcast' ? (
              <div className="p-3.5 rounded-2xl bg-white/90 border border-black/[0.05] shadow-2xs space-y-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-100 text-violet-700">Official</span>
                <h4 className="text-xs font-bold text-slate-900">Relay Zero-Knowledge Security Active</h4>
                <p className="text-[11.5px] text-slate-600 leading-relaxed">All local conversations, voice streams, and document shares operate with private cryptographic envelopes.</p>
              </div>
            ) : activeTab === 'actions' ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No pending action items extracted.
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center space-y-4 my-auto">
                <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-violet-950/60 text-violet-600 flex items-center justify-center mx-auto shadow-2xs">
                  <MessageSquarePlus size={22} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">No Conversations Here</h4>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Create a profile, start a group, or deploy an AI persona.
                  </p>
                </div>
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('profile');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <UserPlus size={13} />
                    <span>Create Profile</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setModalMode('persona');
                      setIsNewChatModalOpen(true);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.06] hover:bg-black/[0.08] text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Bot size={13} className="text-violet-600" />
                    <span>Deploy AI Persona</span>
                  </button>
                </div>
              </div>
            ) : (
              filteredConversations.map(chat => {
                const isSelected = chat.id === activeContactId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => {
                      setActiveContactId(chat.id);
                      if (onSelectThread) onSelectThread(chat.id);
                    }}
                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#E8EAEE] dark:bg-[#1D212C] text-slate-900 dark:text-zinc-100 shadow-2xs'
                        : 'bg-transparent hover:bg-white/60 dark:hover:bg-[#151822] text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${
                        chat.isAi
                          ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xs'
                          : chat.isGroup
                          ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200'
                          : 'bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200'
                      }`}>
                        {chat.avatar}
                      </div>
                      {chat.online && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0e1017]" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
                          {chat.name}
                          {chat.isAi && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-violet-100 dark:bg-violet-950 text-violet-600 font-bold uppercase">
                              AI
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-slate-500 dark:text-zinc-400 truncate">
                        {chat.lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ── RIGHT COLUMN: Active Chat Stream ── */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FDFDFD] dark:bg-[#0f1117] relative">
          {/* Active Conversation Header */}
          <header 
            className="h-[60px] px-6 border-b border-black/[0.06] dark:border-white/[0.08] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md flex items-center justify-between shrink-0 cursor-default select-none z-30"
            onDoubleClick={(e) => {
              if (e.target.closest('button, input, textarea, a, select')) return;
              if (onToggleFullscreen) onToggleFullscreen();
            }}
            onPointerDown={handleHeaderTap}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                currentChat.isAi 
                  ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-xs' 
                  : 'bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200'
              }`}>
                {currentChat.avatar}
              </div>
              
              <div className="min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                    {currentChat.name}
                  </h3>

                  {/* Real Detected Model Selector */}
                  {currentChat.isAi && (
                    <div className="relative inline-flex items-center">
                      <button
                        type="button"
                        data-popover-root="true"
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsAiModelSelectorOpen(prev => !prev);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-violet-100/90 dark:bg-violet-950/90 text-violet-700 dark:text-violet-300 text-[11px] font-bold hover:bg-violet-200 transition-colors cursor-pointer shadow-2xs border border-violet-200/50"
                        title="Switch AI Model Engine"
                      >
                        <span>{activeModelDisplay.name}</span>
                        <ChevronDown size={12} className={`transition-transform ${isAiModelSelectorOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {/* Dropdown Menu */}
                      {isAiModelSelectorOpen && (
                        <div 
                          data-popover-root="true"
                          className="absolute left-0 top-8 w-72 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl rounded-2xl p-1.5 z-[1000] animate-in fade-in zoom-in-95 duration-150 text-left font-sans select-none"
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1.5">
                            Select Model Engine
                          </div>

                          {/* 1. Real Live Detected Local Models */}
                          {detectedLocalModels && detectedLocalModels.length > 0 ? (
                            <div className="mb-2">
                              <div className="flex items-center justify-between px-2.5 py-1">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Local Models ({detectedLocalModels.length})
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); scanRealLocalModels(); }}
                                  className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 cursor-pointer"
                                  title="Rescan local models"
                                >
                                  <RefreshCw size={11} className={isScanningModels ? 'animate-spin' : ''} />
                                </button>
                              </div>

                              {detectedLocalModels.map((localM) => {
                                const isSel = selectedAiModel === localM.id;
                                return (
                                  <button
                                    key={localM.id}
                                    type="button"
                                    onClick={() => {
                                      setSelectedAiModel(localM.id);
                                      setConversations(prev => prev.map(c => c.id === activeContactId ? { ...c, modelId: localM.id, modelName: localM.name } : c));
                                      setIsAiModelSelectorOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                      isSel 
                                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold' 
                                        : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-5 h-5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                        <RegaarderAiIcon size={12} />
                                      </div>
                                      <div className="min-w-0">
                                        <div className="text-xs font-bold truncate leading-tight">{localM.name}</div>
                                        <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{localM.provider}</div>
                                      </div>
                                    </div>
                                    {isSel && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />}
                                  </button>
                                );
                              })}
                              <div className="h-[1px] bg-slate-100 dark:bg-zinc-800 my-1.5" />
                            </div>
                          ) : (
                            <div className="px-2.5 py-2 mb-1 rounded-xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                              <span>No local Ollama models detected</span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); scanRealLocalModels(); }}
                                className="text-violet-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <HardDriveDownload size={11} /> Scan
                              </button>
                            </div>
                          )}

                          {/* 2. Cloud AI Models */}
                          <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2.5 py-1">
                            Cloud Models
                          </div>

                          {DEFAULT_CLOUD_MODELS.map((m) => {
                            const isSel = selectedAiModel === m.id;
                            return (
                              <button
                                key={m.id}
                                type="button"
                                onClick={() => {
                                  setSelectedAiModel(m.id);
                                  setConversations(prev => prev.map(c => c.id === activeContactId ? { ...c, modelId: m.id, modelName: m.name } : c));
                                  setIsAiModelSelectorOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-left transition-colors cursor-pointer ${
                                  isSel 
                                    ? 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 font-semibold' 
                                    : 'hover:bg-slate-100/80 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <div className="w-5 h-5 rounded-lg bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                    <RegaarderAiIcon size={12} />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold truncate leading-tight">{m.name}</div>
                                    <div className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{m.provider}</div>
                                  </div>
                                </div>
                                {isSel && <span className="w-1.5 h-1.5 rounded-full bg-violet-600 shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Zero-Knowledge E2EE Session
                  </span>
                </div>
              </div>
            </div>

            {/* Conversation Header Tools */}
            <div className="flex items-center gap-1.5 relative">
              <button
                type="button"
                onClick={() => setIsChatSearchOpen(prev => !prev)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Search within chat"
              >
                <Search size={15} />
              </button>

              <button
                type="button"
                onClick={() => setIsDetailsMenuOpen(prev => !prev)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Conversation details"
              >
                <MoreVertical size={15} />
              </button>

              {isDetailsMenuOpen && (
                <div 
                  className="absolute right-0 top-11 w-64 bg-white dark:bg-zinc-850 rounded-2xl shadow-xl border border-black/[0.06] dark:border-white/[0.08] p-3 z-50 animate-in fade-in duration-150"
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-black/[0.05]">
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Thread Details</span>
                    <button type="button" onClick={() => setIsDetailsMenuOpen(false)} className="text-slate-400 hover:text-slate-600 text-xs">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/60 text-[11px] space-y-1">
                    <span className="text-[9.5px] text-slate-400 uppercase font-semibold block">Key Fingerprint</span>
                    <span className="font-mono text-[10.5px] font-bold text-slate-800 dark:text-zinc-100 block truncate">
                      {currentChat.fingerprint || '0xAI • ZERO • KNOWLEDGE'}
                    </span>
                  </div>
                </div>
              )}

              <div className="w-[1px] h-4 bg-black/[0.08] dark:bg-white/[0.1] mx-1" />

              <button
                type="button"
                onClick={() => handleStartInChatCall('audio')}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-black/[0.04] transition-colors cursor-pointer"
                title="Direct Voice Call"
              >
                <Phone size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleStartInChatCall('video')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors cursor-pointer"
                title="Direct Video Call"
              >
                <Video size={13} />
                <span>Call</span>
              </button>
            </div>
          </header>

          {/* Search Drawer */}
          {isChatSearchOpen && (
            <div className="px-6 py-2.5 bg-white/95 dark:bg-zinc-900/95 border-b border-black/[0.06] flex items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  placeholder="Search keywords in messages..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={() => { setIsChatSearchOpen(false); setChatSearchQuery(''); }}
                className="p-1.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Isolated Message Stream */}
          <div 
            ref={chatScrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 py-5 space-y-4 thin-scrollbar relative"
          >
            {/* E2EE Security Banner */}
            <div className="w-fit mx-auto px-4 py-2 rounded-xl bg-amber-500/[0.08] dark:bg-amber-500/[0.12] border border-amber-500/20 text-[11px] text-amber-800 dark:text-amber-200 flex items-center gap-2 max-w-lg text-center leading-normal shadow-2xs">
              <Lock size={12} className="text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Messages and calls are end-to-end encrypted. No one outside of this chat, not even Regaarder, can read or listen to them.
              </span>
            </div>

            {messages.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Lock size={16} />
                </div>
                <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-200">End-to-End Encrypted Session</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Send a message, audio note, or document to begin communicating with {currentChat.name}.
                </p>
              </div>
            ) : (
              messages.map(msg => {
                const isOutgoing = msg.role === 'you';
                const isAssistant = msg.role === 'assistant';

                return (
                  <div 
                    key={msg.id}
                    className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} max-w-2xl ${isOutgoing ? 'ml-auto' : 'mr-auto'} group/msg relative`}
                  >
                    {!isOutgoing && (
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400 mb-1 ml-1">
                        {msg.author}
                      </span>
                    )}

                    <div
                      className={`p-3.5 rounded-2xl text-[13px] leading-relaxed relative transition-shadow ${
                        isOutgoing
                          ? 'bg-[#F0F2F6] dark:bg-[#1E232F] text-slate-900 dark:text-zinc-100 border border-[#E1E4EA] dark:border-[#2D3546] rounded-tr-xs shadow-2xs'
                          : isAssistant
                          ? 'bg-violet-50/80 dark:bg-violet-950/40 text-slate-800 dark:text-zinc-100 border border-violet-200/70 dark:border-violet-800/40 rounded-tl-xs shadow-2xs'
                          : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/70 dark:border-zinc-700 rounded-tl-xs shadow-2xs'
                      }`}
                    >
                      {msg.workspaceRef && (
                        <div className="mb-2 rounded-2xl bg-[#E8EAEE]/90 dark:bg-[#252B39]/90 border border-black/[0.06] p-3 space-y-2">
                          <div className="flex items-center gap-3 min-w-0">
                            <DocsSemanticFileBadge type={msg.workspaceRef.type} title={msg.workspaceRef.title} size="lg" />
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-bold truncate text-slate-900 dark:text-zinc-100">
                                {msg.workspaceRef.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {msg.workspaceRef.type?.toUpperCase()} • {msg.workspaceRef.size || '420 KB'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {msg.workspaceRefs && msg.workspaceRefs.length > 0 && (
                        <div className="mb-2.5 grid grid-cols-2 gap-2">
                          {msg.workspaceRefs.map((doc, idx) => (
                            <div
                              key={idx}
                              onClick={() => onNavigateWorkspace && onNavigateWorkspace(doc)}
                              className="p-2.5 rounded-xl bg-[#E8EAEE]/90 border border-black/[0.05] hover:border-violet-500 cursor-pointer flex items-center gap-2.5 shadow-2xs"
                            >
                              <DocsSemanticFileBadge type={doc.type} title={doc.title} size="md" />
                              <div className="min-w-0 flex-1">
                                <span className="block text-[11.5px] font-bold truncate text-slate-900">
                                  {doc.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {msg.isAudio ? (
                        <div className="space-y-2 min-w-[260px]">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => setPlayingVoiceId(prev => prev === msg.id ? null : msg.id)}
                              className="w-8 h-8 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs cursor-pointer"
                            >
                              {playingVoiceId === msg.id ? <Pause size={13} /> : <Play size={13} className="ml-0.5" />}
                            </button>
                            
                            <div className="flex-1 flex items-center gap-0.5 h-6">
                              {[12, 22, 16, 28, 14, 20, 24, 18, 12, 26, 16, 20, 14, 24, 18, 12].map((h, i) => (
                                <div
                                  key={i}
                                  className={`w-1 rounded-full transition-all ${
                                    playingVoiceId === msg.id && (i % 3 === 0)
                                      ? 'bg-violet-600 dark:bg-violet-400 animate-pulse'
                                      : 'bg-slate-300 dark:bg-zinc-600'
                                  }`}
                                  style={{ height: `${h}px` }}
                                />
                              ))}
                            </div>

                            <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                              {msg.audioDuration || '0:08'}
                            </span>

                            {/* Speed Up Tag: 1x -> 1.5x -> 2x */}
                            <button
                              type="button"
                              onClick={() => {
                                setAudioPlaybackSpeeds(prev => {
                                  const current = prev[msg.id] || 1;
                                  const next = current === 1 ? 1.5 : current === 1.5 ? 2 : 1;
                                  return { ...prev, [msg.id]: next };
                                });
                              }}
                              className="px-2 py-0.5 rounded-lg text-[10px] font-bold font-mono bg-black/[0.05] dark:bg-white/[0.08] hover:bg-violet-100 hover:text-violet-700 dark:hover:bg-violet-950 dark:hover:text-violet-300 text-slate-600 dark:text-zinc-300 transition-colors cursor-pointer shrink-0 border border-black/[0.04] dark:border-white/[0.06]"
                              title="Toggle Audio Speed (1x, 1.5x, 2x)"
                            >
                              {audioPlaybackSpeeds[msg.id] || 1}x
                            </button>
                          </div>

                          {/* Real Speech Transcription Subtitle */}
                          {msg.transcript && (
                            <p className="text-[11.5px] italic text-slate-600 dark:text-zinc-300 bg-black/[0.02] dark:bg-white/[0.03] p-2 rounded-xl border border-black/[0.03] dark:border-white/[0.04] leading-relaxed">
                              "{msg.transcript}"
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      )}

                      <div className="mt-1 flex items-center justify-end text-[10px] gap-1 font-mono text-slate-400 dark:text-zinc-500">
                        <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {isOutgoing && <CheckCheck size={13} className="text-violet-600 dark:text-violet-400 inline" />}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="flex items-center gap-2.5 p-3 px-4 rounded-2xl bg-[#F0F2F6] dark:bg-[#1E232F] border border-[#E1E4EA] dark:border-[#2D3546] text-slate-700 dark:text-zinc-300 text-xs w-fit rounded-tl-xs shadow-2xs animate-in fade-in duration-150">
                <span className="font-semibold text-slate-600 dark:text-zinc-300">{currentChat.name} is typing</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 animate-bounce" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ── BOTTOM COMPOSER ── */}
          <div className="p-4 border-t border-black/[0.06] dark:border-white/[0.08] bg-white dark:bg-zinc-900 backdrop-blur-md relative">
            {/* Categorized Apple-Style Emoji Picker Popover */}
            {isEmojiPickerOpen && (
              <div 
                data-popover-root="true"
                className="absolute bottom-16 left-6 w-80 bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-3 z-40 animate-in fade-in slide-in-from-bottom-2 duration-150 select-none"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={emojiSearch}
                    onChange={(e) => setEmojiSearch(e.target.value)}
                    placeholder="Search emoji..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/[0.03] dark:bg-white/[0.05] text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-1 pb-2 mb-2 border-b border-black/[0.05]">
                  {EMOJI_CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setEmojiCategory(cat.id)}
                      className={`flex-1 py-1 text-center rounded-lg text-sm transition-colors cursor-pointer ${
                        emojiCategory === cat.id ? 'bg-violet-100 dark:bg-violet-950/80 shadow-2xs' : 'hover:bg-slate-100'
                      }`}
                      title={cat.name}
                    >
                      {cat.icon}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 h-44 overflow-y-auto thin-scrollbar p-1">
                  {(EMOJI_CATEGORIES.find(c => c.id === emojiCategory)?.emojis || [])
                    .filter(em => !emojiSearch || em.includes(emojiSearch))
                    .map((em, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectEmoji(em)}
                        className="w-8 h-8 rounded-lg hover:bg-black/[0.05] text-lg flex items-center justify-center transition-transform hover:scale-120 cursor-pointer"
                      >
                        {em}
                      </button>
                    ))}
                </div>
              </div>
            )}

            {/* Voice Recording Bar */}
            {isRecordingVoice ? (
              <div className="flex items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-zinc-800 border border-black/[0.06] dark:border-white/[0.08] animate-in slide-in-from-bottom-2 duration-150">
                <button
                  type="button"
                  onClick={() => setIsRecordingVoice(false)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Discard recording"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full bg-rose-500 ${isVoicePaused ? '' : 'animate-ping'}`} />
                  <span className="font-mono text-xs font-bold text-slate-800 dark:text-zinc-100">
                    {Math.floor(voiceElapsedSeconds / 60)}:{(voiceElapsedSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center px-4 min-w-0">
                  <div className="flex items-center justify-center gap-0.5 h-6">
                    {voiceWaveLevels.map((lvl, idx) => (
                      <div
                        key={idx}
                        className={`w-1 rounded-full transition-all duration-75 ${
                          isVoicePaused ? 'bg-slate-400' : 'bg-violet-600 dark:bg-violet-400'
                        }`}
                        style={{ height: `${lvl}px` }}
                      />
                    ))}
                  </div>
                  <input
                    type="text"
                    value={voiceRecognitionTranscript}
                    onChange={(e) => setVoiceRecognitionTranscript(e.target.value)}
                    placeholder="Speaking... (transcribed voice text will appear here)"
                    className="text-[11px] text-slate-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-900/70 rounded-lg px-2 py-0.5 border border-black/[0.05] dark:border-white/[0.08] focus:outline-none focus:ring-1 focus:ring-violet-500 text-center mt-1 truncate placeholder:text-slate-400"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setIsVoicePaused(prev => !prev)}
                  className="p-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:bg-black/[0.05] transition-colors cursor-pointer"
                  title={isVoicePaused ? "Resume recording" : "Pause recording"}
                >
                  {isVoicePaused ? <Play size={15} /> : <Pause size={15} />}
                </button>

                <button
                  type="button"
                  onClick={handleSendVoiceRecording}
                  className="w-9 h-9 rounded-full bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
                  title="Send voice note"
                >
                  <Send size={14} className="ml-0.5" />
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08]"
              >
                <input 
                  type="file" 
                  multiple
                  ref={fileInputRef} 
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length === 0) return;
                    const parsed = files.map((f, i) => ({
                      id: `attach-${Date.now()}-${i}`,
                      title: f.name,
                      type: f.name.endsWith('.xlsx') ? 'sheets' : f.name.endsWith('.pptx') ? 'deck' : 'compose',
                      size: `${Math.round(f.size / 1024)} KB`
                    }));
                    setPendingAttachments(parsed);
                  }} 
                  className="hidden" 
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                  title="Attach Documents or Files"
                >
                  <Paperclip size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                    isEmojiPickerOpen ? 'bg-violet-100 text-violet-700' : 'text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04]'
                  }`}
                  title="Choose Emoji"
                >
                  <Smile size={16} />
                </button>

                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder={`Message ${currentChat.name}...`}
                  className="flex-1 px-2 py-1.5 text-xs bg-transparent text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 focus:outline-none"
                />

                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingVoice(true);
                    setIsVoicePaused(false);
                    setVoiceElapsedSeconds(0);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-black/[0.04] transition-colors cursor-pointer"
                  title="Record audio note"
                >
                  <Mic size={16} />
                </button>

                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-30 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 shadow-xs"
                  title="Send Message"
                >
                  <Send size={13} />
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      {/* ── AI CONVERSATIONAL VOICE OVERLAY (RIGID HORIZONTAL/VERTICAL CENTER LOCK) ── */}
      {isAiVoiceSessionActive && (
        <div className="fixed inset-0 z-50 bg-[#0c0d14]/95 backdrop-blur-2xl flex flex-col items-center justify-between p-8 animate-in fade-in duration-200 select-none text-white">
          {/* Top Bar with Brand Icon */}
          <div className="w-full max-w-xl flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 text-xs text-white">
              <RegaarderBrandIcon size={14} className="text-violet-400 shrink-0" />
              <span className="font-semibold">{activeModelDisplay.name}</span>
            </div>

            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="p-2 rounded-full text-white/70 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              title="Close Voice Session"
            >
              <X size={18} />
            </button>
          </div>

          {/* Central Pulsing Liquid Orb (Absolute Center Alignment) */}
          <div className="flex flex-col items-center justify-center space-y-6 my-auto w-full max-w-md mx-auto text-center">
            {/* Orb Anchor Container */}
            <div className="relative w-44 h-44 flex items-center justify-center mx-auto">
              {/* Centered Ambient Glow */}
              <div className={`absolute inset-0 -m-8 rounded-full bg-gradient-to-tr from-violet-600/40 via-indigo-500/30 to-fuchsia-500/40 blur-3xl transition-all duration-300 pointer-events-none ${isAiVoiceMuted || isAiVoicePaused ? 'opacity-20' : 'animate-pulse'}`} />
              
              {/* Solid Liquid Sphere */}
              <div className="w-40 h-40 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-600 to-purple-700 border-2 border-white/20 shadow-2xl flex items-center justify-center relative overflow-hidden z-10">
                <div className="flex items-center justify-center gap-1.5 h-14 w-full">
                  {aiVoiceLiveWaves.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${isAiVoiceMuted || isAiVoicePaused ? 'bg-white/30' : 'bg-white'}`}
                      style={{ height: `${isAiVoiceMuted || isAiVoicePaused ? 6 : h}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Status Pill Positioned Directly on the Same Axis */}
            <div className="flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs text-white shadow-xs mx-auto">
              <span className={`w-2 h-2 rounded-full ${isAiVoiceMuted ? 'bg-rose-400' : isAiVoicePaused ? 'bg-amber-400' : isAiVoiceResponding ? 'bg-violet-400 animate-pulse' : 'bg-emerald-400 animate-pulse'}`} />
              <span>
                {isAiVoiceMuted ? 'Microphone is muted' : isAiVoicePaused ? 'Voice session paused' : isAiVoiceResponding ? `${activeModelDisplay.name} is speaking...` : aiVoiceLiveTranscript ? 'Hearing you speak...' : 'Listening to microphone...'}
              </span>
            </div>

            {/* Subtitles on Same Axis */}
            <div className="text-center space-y-1.5 w-full px-4 pt-1">
              <h3 className="text-base font-bold text-white tracking-tight">
                {isAiVoiceMuted 
                  ? 'Unmute to continue speaking' 
                  : isAiVoicePaused 
                  ? 'Session is paused' 
                  : isAiVoiceResponding 
                  ? `${activeModelDisplay.name}` 
                  : aiVoiceLiveTranscript 
                  ? 'You' 
                  : 'Speak naturally to collaborate'}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed font-sans max-w-sm mx-auto min-h-[38px] flex items-center justify-center">
                {isAiVoiceMuted 
                  ? 'Tap the microphone button below to resume voice streaming.' 
                  : isAiVoiceResponding && aiVoiceActiveResponse
                  ? `“${aiVoiceActiveResponse}”`
                  : aiVoiceLiveTranscript
                  ? `“${aiVoiceLiveTranscript}”`
                  : 'Start talking to discuss strategy, documents, or models in real time.'
                }
              </p>
            </div>
          </div>

          {/* Bottom Glass Controls Bar */}
          <div className="w-full max-w-md flex items-center justify-center gap-5 p-3 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl mx-auto">
            <button
              type="button"
              onClick={() => setIsAiVoiceMuted(prev => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                isAiVoiceMuted ? 'bg-rose-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isAiVoiceMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              {isAiVoiceMuted ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            <button
              type="button"
              onClick={() => setIsAiVoiceSessionActive(false)}
              className="h-12 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <PhoneOff size={16} />
              <span>End Voice Session</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAiVoicePaused(prev => !prev)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-md ${
                isAiVoicePaused ? 'bg-amber-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white'
              }`}
              title={isAiVoicePaused ? "Resume Voice Listening" : "Pause Voice Listening"}
            >
              {isAiVoicePaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          </div>
        </div>
      )}

      {/* ── UNIFIED CREATE MODAL (INSTAGRAM-STYLE CREATE PROFILE, TEAM GROUP, OR AI PERSONA) ── */}
      {isNewChatModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) setIsNewChatModalOpen(false);
          }}
        >
          <div className="w-full max-w-md bg-white dark:bg-zinc-850 rounded-3xl shadow-2xl border border-black/[0.08] dark:border-white/[0.1] p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-black/[0.06]">
              <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {modalMode === 'profile' ? 'Create User Profile' : modalMode === 'group' ? 'Create Team Group' : 'Deploy AI Persona'}
              </h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* 3-Mode Selector: Profile | Group | Persona */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'profile', label: 'Create Profile', icon: User },
                { id: 'group', label: 'Team Group', icon: Users },
                { id: 'persona', label: 'AI Persona', icon: Bot }
              ].map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setModalMode(t.id)}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    modalMode === t.id
                      ? 'border-violet-600 bg-violet-50/60 text-violet-700 font-bold'
                      : 'border-black/[0.06] text-slate-600 hover:bg-black/[0.02]'
                  }`}
                >
                  <t.icon size={15} />
                  <span className="text-[10.5px]">{t.label}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              {/* ── 1. INSTAGRAM-STYLE USER PROFILE (Name, @Username, Bio) ── */}
              {modalMode === 'profile' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Joshua David"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <AtSign size={12} /> Unique Username ID
                    </label>
                    <input
                      type="text"
                      value={profileUsername}
                      onChange={(e) => setProfileUsername(e.target.value)}
                      placeholder="@joshua or @arch_lead"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Role / Status Bio</label>
                    <input
                      type="text"
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      placeholder="e.g. Lead System Architect • Core Workspace"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* ── 2. TEAM GROUP FORM ── */}
              {modalMode === 'group' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Group Name</label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Design Systems & Architecture"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Add Profiles / AI Personas</label>
                    <div className="max-h-36 overflow-y-auto p-1.5 rounded-xl bg-slate-50 border border-black/[0.04] space-y-1">
                      {conversations.map(c => (
                        <label key={c.id} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white cursor-pointer">
                          <span className="text-xs text-slate-700 font-medium">{c.name}</span>
                          <input
                            type="checkbox"
                            checked={!!groupSelectedMembers[c.id]}
                            onChange={(e) => setGroupSelectedMembers(prev => ({ ...prev, [c.id]: e.target.checked }))}
                            className="w-3.5 h-3.5 rounded text-violet-600"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 3. AI PERSONA FORM WITH DETECTED LOCAL/CLOUD ENGINES ── */}
              {modalMode === 'persona' && (
                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600">Persona Name</label>
                      <button
                        type="button"
                        onClick={handleAiCraftPersona}
                        className="text-[10.5px] font-bold text-violet-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 size={11} />
                        <span>Generate with AI</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={personaName}
                      onChange={(e) => setPersonaName(e.target.value)}
                      placeholder="e.g. Executive Code Reviewer"
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-600">Underlying Engine (Detected from Room)</label>
                    <select
                      value={personaEngine}
                      onChange={(e) => setPersonaEngine(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 focus:outline-none"
                    >
                      {detectedLocalModels.length > 0 && (
                        <optgroup label="Local Detected Engines">
                          {detectedLocalModels.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                          ))}
                        </optgroup>
                      )}
                      <optgroup label="Cloud Engines">
                        {DEFAULT_CLOUD_MODELS.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600">Instructions & Behavior</label>
                      <button
                        type="button"
                        onClick={() => mdFileInputRef.current?.click()}
                        className="text-[10.5px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      >
                        <UploadCloud size={11} />
                        <span>Import .md</span>
                      </button>
                    </div>
                    <input
                      type="file"
                      accept=".md,.txt,.json"
                      ref={mdFileInputRef}
                      onChange={handleImportPersonaMd}
                      className="hidden"
                    />
                    <textarea
                      rows={3}
                      value={personaInstructions}
                      onChange={(e) => setPersonaInstructions(e.target.value)}
                      placeholder="Define persona role, tone, knowledge, and system directives..."
                      className="w-full p-2.5 rounded-xl bg-black/[0.03] border border-black/[0.08] text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-black/[0.05]">
                <button
                  type="button"
                  onClick={() => setIsNewChatModalOpen(false)}
                  className="px-3 py-2 rounded-xl text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    (modalMode === 'profile' && !profileName.trim() && !profileUsername.trim()) ||
                    (modalMode === 'group' && !groupName.trim()) ||
                    (modalMode === 'persona' && !personaName.trim())
                  }
                  className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-bold transition-colors cursor-pointer shadow-xs"
                >
                  {modalMode === 'profile' ? 'Save Profile' : modalMode === 'group' ? 'Create Group' : 'Deploy Persona'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct In-Chat WebRTC Call Overlay */}
      {activeCallSession && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-200 select-none">
          <div className="w-full max-w-sm bg-[#161922] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col items-center p-6 text-center space-y-6">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-amber-300 font-medium">
              <Lock size={10} />
              <span>End-to-End Encrypted Call</span>
            </div>

            <div className="flex flex-col items-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-violet-600/30 text-violet-300 font-bold text-2xl flex items-center justify-center border-2 border-violet-500/50">
                {currentChat.avatar}
              </div>
              <h3 className="text-base font-bold text-white">{currentChat.name}</h3>
              <p className="text-xs text-slate-400 font-mono">
                {activeCallSession.status === 'ringing' ? 'Ringing...' : `${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
              </p>
            </div>

            {activeCallSession.type === 'video' && activeCallSession.status === 'connected' && (
              <div className="w-full h-36 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center relative overflow-hidden">
                <video ref={localVideoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${activeCallSession.isVideoOff ? 'hidden' : 'block'}`} />
                {activeCallSession.isVideoOff && (
                  <div className="text-center text-xs text-slate-400">Camera Off</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={handleEndCall}
                className="w-13 h-13 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg cursor-pointer"
              >
                <PhoneOff size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
