import React from 'react';
import { Rocket, FolderOpen } from 'lucide-react';
import type { CompressionConfig } from '../types';
import { MODELS, DATASETS, DEVICES } from '../mockData';

interface ConfigPanelProps {
  config: CompressionConfig;
  onChange: (updater: (prev: CompressionConfig) => CompressionConfig) => void;
  onRun: () => void;
  isCompressing: boolean;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  onChange,
  onRun,
  isCompressing,
}) => {
  const setField = <K extends keyof CompressionConfig>(
    key: K,
    value: CompressionConfig[K]
  ) => {
    onChange((prev) => ({ ...prev, [key]: value }));
  };

  const setSparseField = <K extends keyof CompressionConfig['sparseGpt']>(
    key: K,
    value: CompressionConfig['sparseGpt'][K]
  ) => {
    onChange((prev) => ({
      ...prev,
      sparseGpt: { ...prev.sparseGpt, [key]: value },
    }));
  };

  const setAwqField = <K extends keyof CompressionConfig['awq']>(
    key: K,
    value: CompressionConfig['awq'][K]
  ) => {
    onChange((prev) => ({
      ...prev,
      awq: { ...prev.awq, [key]: value },
    }));
  };

  const setLoraField = <K extends keyof CompressionConfig['lora']>(
    key: K,
    value: CompressionConfig['lora'][K]
  ) => {
    onChange((prev) => ({
      ...prev,
      lora: { ...prev.lora, [key]: value },
    }));
  };

  return (
    <div className="w-full lg:w-[350px] bg-white p-5 border-r border-gray-200 flex flex-col gap-6 select-none shrink-0 overflow-y-auto">
      {/* 1. Model & Data */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">
          1. Model & Data
        </h2>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Model</label>
          <select
            value={config.model}
            onChange={(e) => setField('model', e.target.value)}
            disabled={isCompressing}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Dataset</label>
          <select
            value={config.dataset}
            onChange={(e) => setField('dataset', e.target.value)}
            disabled={isCompressing}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            {DATASETS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Device</label>
          <select
            value={config.device}
            onChange={(e) => setField('device', e.target.value)}
            disabled={isCompressing}
            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          >
            {DEVICES.map((dev) => (
              <option key={dev} value={dev}>
                {dev}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-gray-700">Output Folder</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={config.outputFolder}
              onChange={(e) => setField('outputFolder', e.target.value)}
              disabled={isCompressing}
              className="flex-1 bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono disabled:opacity-50"
            />
            <button
              type="button"
              disabled={isCompressing}
              className="px-3 py-2 bg-gray-100 border border-gray-300 hover:bg-gray-200 text-gray-700 font-medium text-xs rounded-lg flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
              onClick={() => {
                const folder = prompt('Enter output directory:', config.outputFolder);
                if (folder) setField('outputFolder', folder);
              }}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              Browse
            </button>
          </div>
        </div>
      </div>

      <hr className="border-gray-200 p-0" />

      {/* 2. Compression Configuration */}
      <div className="flex flex-col gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 mb-1">
          2. Compression Configuration
        </h2>

        {/* SparseGPT */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-blue-700">
              SparseGPT (Structured Pruning)
            </h3>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="sparsegpt-enable"
                checked={config.sparseGpt.enable}
                onChange={(e) => setSparseField('enable', e.target.checked)}
                disabled={isCompressing}
                className="w-3.5 h-3.5 text-blue-600 rounded bg-white border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="sparsegpt-enable"
                className="text-[11px] font-semibold text-gray-700 cursor-pointer select-none"
              >
                Enable
              </label>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 transition-all ${config.sparseGpt.enable ? 'opacity-100' : 'opacity-35 pointer-events-none'
              }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[11px] font-medium text-gray-700 shrink-0">Sparsity Ratio</span>
              <select
                value={config.sparseGpt.sparsityRatio}
                onChange={(e) => setSparseField('sparsityRatio', e.target.value)}
                disabled={isCompressing || !config.sparseGpt.enable}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
              >
                <option value="30%">30%</option>
                <option value="50%">50%</option>
                <option value="70%">70%</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[11px] font-medium text-gray-700 shrink-0">Pattern</span>
              <select
                value={config.sparseGpt.pattern}
                onChange={(e) => setSparseField('pattern', e.target.value)}
                disabled={isCompressing || !config.sparseGpt.enable}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
              >
                <option value="2:4">2:4</option>
                <option value="4:8">4:8</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 my-1" />

        {/* AWQ Quantization */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-blue-700">
              AWQ (Quantization)
            </h3>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="awq-enable"
                checked={config.awq.enable}
                onChange={(e) => setAwqField('enable', e.target.checked)}
                disabled={isCompressing}
                className="w-3.5 h-3.5 text-blue-600 rounded bg-white border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="awq-enable"
                className="text-[11px] font-semibold text-gray-700 cursor-pointer select-none"
              >
                Enable
              </label>
            </div>
          </div>

          <div
            className={`flex items-center gap-3 transition-all ${config.awq.enable ? 'opacity-100' : 'opacity-35 pointer-events-none'
              }`}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[11px] font-medium text-gray-700 shrink-0">Bit Width</span>
              <select
                value={config.awq.bitWidth}
                onChange={(e) => setAwqField('bitWidth', e.target.value)}
                disabled={isCompressing || !config.awq.enable}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
              >
                <option value="3-bit">3-bit</option>
                <option value="4-bit">4-bit</option>
                <option value="8-bit">8-bit</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-[11px] font-medium text-gray-700 shrink-0">Group Size</span>
              <select
                value={config.awq.groupSize}
                onChange={(e) => setAwqField('groupSize', e.target.value)}
                disabled={isCompressing || !config.awq.enable}
                className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
              >
                <option value="64">64</option>
                <option value="128">128</option>
                <option value="256">256</option>
              </select>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 my-1" />

        {/* LoRA */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-blue-700">
              LoRA (Fine-tuning)
            </h3>
            <div className="flex items-center gap-1.5">
              <input
                type="checkbox"
                id="lora-enable"
                checked={config.lora.enable}
                onChange={(e) => setLoraField('enable', e.target.checked)}
                disabled={isCompressing}
                className="w-3.5 h-3.5 text-blue-600 rounded bg-white border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
              />
              <label
                htmlFor="lora-enable"
                className="text-[11px] font-semibold text-gray-700 cursor-pointer select-none"
              >
                Enable
              </label>
            </div>
          </div>

          <div
            className={`flex flex-col gap-2.5 transition-all ${config.lora.enable ? 'opacity-100' : 'opacity-35 pointer-events-none'
              }`}
          >
            {/* LoRA Row 1 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] font-medium text-gray-700 shrink-0">Rank (r)</span>
                <select
                  value={config.lora.rank}
                  onChange={(e) => setLoraField('rank', Number(e.target.value))}
                  disabled={isCompressing || !config.lora.enable}
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
                >
                  <option value={8}>8</option>
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] font-medium text-gray-700 shrink-0">Alpha (α)</span>
                <select
                  value={config.lora.alpha}
                  onChange={(e) => setLoraField('alpha', Number(e.target.value))}
                  disabled={isCompressing || !config.lora.enable}
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
                >
                  <option value={16}>16</option>
                  <option value={32}>32</option>
                  <option value={64}>64</option>
                </select>
              </div>
            </div>

            {/* LoRA Row 2 */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] font-medium text-gray-700 shrink-0">Dropout</span>
                <select
                  value={config.lora.dropout}
                  onChange={(e) => setLoraField('dropout', Number(e.target.value))}
                  disabled={isCompressing || !config.lora.enable}
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
                >
                  <option value={0.05}>0.05</option>
                  <option value={0.1}>0.1</option>
                  <option value={0.2}>0.2</option>
                </select>
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] font-medium text-gray-700 shrink-0">LR</span>
                <select
                  value={config.lora.lr}
                  onChange={(e) => setLoraField('lr', e.target.value)}
                  disabled={isCompressing || !config.lora.enable}
                  className="flex-1 bg-white text-gray-900 border border-gray-300 rounded px-1.5 py-1 text-xs min-w-0"
                >
                  <option value="1e-4">1e-4</option>
                  <option value="2e-4">2e-4</option>
                  <option value="5e-4">5e-4</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer and Run Button */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onRun}
          disabled={isCompressing}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg border border-blue-500/20 active:scale-98 transition duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 glow-blue text-sm uppercase tracking-wide"
        >
          {isCompressing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Running Optimization...
            </>
          ) : (
            <>
              <Rocket className="w-4 h-4 fill-white/10" />
              Run Compression
            </>
          )}
        </button>
      </div>
    </div>
  );
};
