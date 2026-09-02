import React from 'react';
import { Cpu, Zap, HardDrive, Sliders, AlertTriangle, CheckCircle2, Info, Layers } from 'lucide-react';

export const LocalHardwareOffloadSettings = ({
  localOffloadConfig,
  saveLocalOffloadConfig,
  showToast,
}) => {
  const maxThreads = typeof navigator !== 'undefined' && navigator.hardwareConcurrency 
    ? navigator.hardwareConcurrency 
    : 8;

  const currentMode = localOffloadConfig?.mode || 'auto';
  const gpuLayers = localOffloadConfig?.gpuLayers ?? 33;
  const threads = localOffloadConfig?.threads ?? Math.max(1, maxThreads - 1);
  const contextSize = localOffloadConfig?.contextSize ?? 4096;
  const useMmap = localOffloadConfig?.useMmap ?? true;

  const isHighContext = contextSize >= 16384;
  const isCpuOnly = currentMode === 'cpu_only' || (currentMode === 'custom' && gpuLayers === 0);
  const isFullGpu = currentMode === 'gpu_accelerated' || (currentMode === 'custom' && gpuLayers >= 50);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
            Local Hardware & Model Offloading
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Configure how local neural weights are loaded between GPU VRAM, System RAM, and Storage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={localOffloadConfig?.enabled ?? true}
            onClick={() => {
              const nextState = !(localOffloadConfig?.enabled ?? true);
              saveLocalOffloadConfig({ enabled: nextState });
              if (showToast) showToast(nextState ? 'Custom hardware offload enabled' : 'Custom hardware offload disabled (Ollama default)');
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${
              (localOffloadConfig?.enabled ?? true) ? 'bg-violet-600' : 'bg-slate-300 dark:bg-zinc-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                (localOffloadConfig?.enabled ?? true) ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 select-none">
            {(localOffloadConfig?.enabled ?? true) ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {!(localOffloadConfig?.enabled ?? true) && (
        <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
          <Info size={16} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <div className="leading-relaxed">
            <span className="font-bold">Hardware offloading is currently bypassed.</span> Ollama will automatically manage tensor layers and system memory according to its default engine configuration.
          </div>
        </div>
      )}

      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 block mb-2">
          Offload Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              saveLocalOffloadConfig({
                mode: 'auto',
                gpuLayers: 33,
                useMmap: true,
              });
              if (showToast) showToast('Offload profile set to Balanced Auto');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentMode === 'auto'
                ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 ring-2 ring-violet-500/20'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Zap size={14} className="text-violet-600 dark:text-violet-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">Auto (Recommended)</span>
              </div>
              {currentMode === 'auto' && <CheckCircle2 size={13} className="text-violet-600 dark:text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Dynamically splits model layers between GPU and CPU RAM for optimal balance.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              saveLocalOffloadConfig({
                mode: 'gpu_accelerated',
                gpuLayers: 99,
                useMmap: true,
              });
              if (showToast) showToast('Offload profile set to GPU Acceleration');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentMode === 'gpu_accelerated'
                ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 ring-2 ring-violet-500/20'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Layers size={14} className="text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">GPU Dedicated</span>
              </div>
              {currentMode === 'gpu_accelerated' && <CheckCircle2 size={13} className="text-violet-600 dark:text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Loads all layers into dedicated VRAM for maximum response speed.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              saveLocalOffloadConfig({
                mode: 'cpu_only',
                gpuLayers: 0,
                useMmap: true,
              });
              if (showToast) showToast('Offload profile set to CPU Only');
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              currentMode === 'cpu_only'
                ? 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-300 dark:border-violet-700 ring-2 ring-violet-500/20'
                : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Cpu size={14} className="text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">CPU & RAM Only</span>
              </div>
              {currentMode === 'cpu_only' && <CheckCircle2 size={13} className="text-violet-600 dark:text-violet-400" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
              Streams weights through system RAM and disk cache. Lower graphics load.
            </p>
          </button>
        </div>
      </div>

      {isCpuOnly && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
          <Info size={16} className="shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold">CPU Execution Mode:</span> Inference will run entirely on system RAM and disk paging. Token generation may take longer on larger parameter models.
          </div>
        </div>
      )}

      {isFullGpu && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 text-xs">
          <Zap size={16} className="shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold">Dedicated GPU Acceleration:</span> Fast generation active. Ensure your graphics card has at least 4 GB to 8 GB VRAM to avoid driver fallback.
          </div>
        </div>
      )}

      {isHighContext && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-rose-800 dark:text-rose-300 text-xs">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div className="leading-snug">
            <span className="font-bold">High Memory Allocation Warning:</span> A context size of {contextSize} tokens requires substantial memory for the attention KV cache. Ensure you have 16 GB+ of total RAM.
          </div>
        </div>
      )}

      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-1.5">
          <Sliders size={13} className="text-slate-500" />
          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300">
            Advanced Offloading Parameters
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                GPU Layer Offload
              </label>
              <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
                {gpuLayers === 0 ? '0 (CPU Only)' : gpuLayers >= 99 ? '99 (All Layers)' : `${gpuLayers} layers`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="99"
              step="1"
              value={gpuLayers}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                saveLocalOffloadConfig({
                  gpuLayers: val,
                  mode: val === 0 ? 'cpu_only' : val >= 99 ? 'gpu_accelerated' : 'custom',
                });
              }}
              className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Number of transformer layers placed directly in GPU VRAM.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                CPU Compute Threads
              </label>
              <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
                {threads} / {maxThreads} Cores
              </span>
            </div>
            <input
              type="range"
              min="1"
              max={maxThreads}
              step="1"
              value={threads}
              onChange={(e) => {
                saveLocalOffloadConfig({
                  threads: parseInt(e.target.value, 10),
                });
              }}
              className="w-full accent-violet-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none"
            />
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Logical processing cores assigned to tensor calculations.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                Context Window (Tokens)
              </label>
              <span className="text-[11px] font-mono font-bold text-violet-600 dark:text-violet-400">
                {contextSize >= 1024 ? `${contextSize / 1024}K` : contextSize} tokens
              </span>
            </div>
            <select
              value={contextSize}
              onChange={(e) => {
                saveLocalOffloadConfig({
                  contextSize: parseInt(e.target.value, 10),
                });
              }}
              className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 outline-none focus:border-violet-500"
            >
              <option value="2048">2,048 tokens (Low RAM usage - 2 GB)</option>
              <option value="4096">4,096 tokens (Standard - 4 GB)</option>
              <option value="8192">8,192 tokens (Extended - 6 GB)</option>
              <option value="16384">16,384 tokens (High Capacity - 12 GB)</option>
              <option value="32768">32,768 tokens (Maximum - 24 GB+)</option>
            </select>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400">
              Maximum document and conversational memory retained at once.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <div className="flex items-center gap-1.5">
                <HardDrive size={13} className="text-slate-500" />
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
                  Storage Memory Mapping (mmap)
                </label>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-snug">
                Dynamically pages model weights from disk to prevent out-of-memory errors.
              </p>
            </div>
            <input
              type="checkbox"
              checked={useMmap}
              onChange={(e) => {
                saveLocalOffloadConfig({
                  useMmap: e.target.checked,
                });
                if (showToast) showToast(e.target.checked ? 'Memory mapping enabled' : 'Memory mapping disabled');
              }}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300 dark:border-zinc-700 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalHardwareOffloadSettings;
