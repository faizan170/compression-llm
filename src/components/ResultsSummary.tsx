import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { Metrics } from '../types';

interface ResultsSummaryProps {
  baseline: Metrics;
  proposed: Metrics;
  isCompleted: boolean;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  baseline,
  proposed,
  isCompleted,
}) => {
  // Calculations
  const sizeReduced = Math.max(0, baseline.modelSize - proposed.modelSize);
  const sizeReductionPercent = baseline.modelSize > 0
    ? ((sizeReduced / baseline.modelSize) * 100)
    : 0;

  const speedupFactor = proposed.latency > 0
    ? (baseline.latency / proposed.latency)
    : 1;

  // Let's compute progress bar widths (capped at 100)
  const ratioProgressWidth = Math.min(100, sizeReductionPercent);
  const speedupPercent = Math.min(100, Math.max(0, ((speedupFactor - 1) / 2) * 100));
  const memorySavedPercent = baseline.modelSize > 0
    ? ((sizeReduced / baseline.modelSize) * 100)
    : 0;

  return (
    <div className="bg-white px-5 pt-2 rounded-xl border border-gray-200 flex flex-col gap-4 shadow-sm">
      <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">
        4. Results Summary
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* Left Side: Before vs After Cards */}
        <div className="xl:col-span-8 flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-gray-200">

          {/* Baseline Card */}
          <div className="flex-1 w-full bg-white p-4 rounded-lg border border-blue-200 hover:border-blue-400 transition duration-300 shadow-sm">
            <h3 className="text-xs font-bold text-blue-700 mb-4 tracking-wide uppercase">
              Before Compression (Baseline)
            </h3>
            <div className="flex flex-col gap-2.5 font-mono text-sm text-gray-900">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Model Size</span>
                <span className="text-gray-900 font-bold">{baseline.modelSize.toFixed(2)} GB</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Perplexity (PPL)</span>
                <span className="text-gray-900 font-bold">{baseline.perplexity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Latency (Avg)</span>
                <span className="text-gray-900 font-bold">{baseline.latency.toFixed(3)} s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-sans text-xs">Throughput</span>
                <span className="text-gray-900 font-bold">{baseline.throughput} tokens/s</span>
              </div>
            </div>
          </div>

          {/* Connection Arrow */}
          <div className="flex items-center justify-center p-2 text-gray-400">
            <ArrowRight className="w-6 h-6 rotate-90 sm:rotate-0 text-gray-500 animate-slide-arrow" />
          </div>

          {/* Proposed Card */}
          <div className={`flex-1 w-full bg-white p-4 rounded-lg border transition-all duration-500 shadow-sm ${isCompleted
              ? 'border-emerald-200 hover:border-emerald-400'
              : 'border-gray-200 opacity-60'
            }`}>
            <h3 className={`text-xs font-bold mb-4 tracking-wide uppercase ${isCompleted ? 'text-emerald-700' : 'text-gray-500'
              }`}>
              After Compression (Proposed)
            </h3>
            <div className="flex flex-col gap-2.5 font-mono text-sm text-gray-900">
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Model Size</span>
                <span className={`font-bold transition duration-300 ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {proposed.modelSize.toFixed(2)} GB
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Perplexity (PPL)</span>
                <span className="text-gray-900 font-bold">{proposed.perplexity.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-100 pb-1.5">
                <span className="text-gray-500 font-sans text-xs">Latency (Avg)</span>
                <span className={`font-bold transition duration-300 ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {proposed.latency.toFixed(3)} s
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-sans text-xs">Throughput</span>
                <span className={`font-bold transition duration-300 ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
                  {proposed.throughput} tokens/s
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: Key Metrics Stack */}
        <div className="xl:col-span-4 flex flex-col gap-3.5 justify-center">

          {/* Compression Ratio */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200 flex flex-col gap-1.5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Compression Ratio</span>
              <span className="text-sm font-bold text-emerald-600 font-mono">
                {isCompleted ? `${sizeReductionPercent.toFixed(1)} %` : '-- %'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${isCompleted ? ratioProgressWidth : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              {isCompleted ? `(${sizeReduced.toFixed(2)} GB Reduced)` : '(Awaiting optimization)'}
            </span>
          </div>

          {/* Speedup Ratio */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200 flex flex-col gap-1.5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Speedup (Latency)</span>
              <span className="text-sm font-bold text-orange-600 font-mono">
                {isCompleted ? `${speedupFactor.toFixed(2)} x` : '-- x'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-orange-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${isCompleted ? speedupPercent : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              {isCompleted
                ? `(${baseline.latency.toFixed(3)} s → ${proposed.latency.toFixed(3)} s)`
                : '(Awaiting optimization)'}
            </span>
          </div>

          {/* Memory Saved */}
          <div className="bg-slate-50 p-3.5 rounded-lg border border-gray-200 flex flex-col gap-1.5 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-gray-600">Memory Saved</span>
              <span className="text-sm font-bold text-purple-600 font-mono">
                {isCompleted ? `${sizeReduced.toFixed(2)} GB` : '-- GB'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-500 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${isCompleted ? memorySavedPercent : 0}%` }}
              />
            </div>
            <span className="text-[10px] text-gray-500 font-mono">
              {isCompleted
                ? `(From ${baseline.modelSize.toFixed(2)} GB to ${proposed.modelSize.toFixed(2)} GB)`
                : '(Awaiting optimization)'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};
