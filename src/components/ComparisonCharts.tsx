import React, { useState } from 'react';
import type { Metrics } from '../types';

interface ComparisonChartsProps {
  baseline: Metrics;
  awqOnly: Metrics;
  proposed: Metrics;
  isCompleted: boolean;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  label: string;
  value: string;
  color: string;
}

export const ComparisonCharts: React.FC<ComparisonChartsProps> = ({
  baseline,
  awqOnly,
  proposed,
  isCompleted,
}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: '',
    color: '',
  });

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    label: string,
    value: string,
    color: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const container = e.currentTarget.closest('.charts-container')?.getBoundingClientRect();
    
    if (container) {
      setTooltip({
        visible: true,
        x: rect.left - container.left + rect.width / 2,
        y: rect.top - container.top - 40,
        label,
        value,
        color,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  // Helper to render a group of 3 bars
  const renderBarGroup = (
    title: string,
    vals: { baseline: number; awq: number; proposed: number },
    formatFn: (v: number) => string,
    unit: string
  ) => {
    const activeVals = {
      baseline: vals.baseline,
      awq: isCompleted ? vals.awq : vals.baseline * 0.7, // fallback layout before compress
      proposed: isCompleted ? vals.proposed : vals.baseline,
    };

    const maxVal = Math.max(activeVals.baseline, activeVals.awq, activeVals.proposed, 1) * 1.15;
    
    const hBaseline = (activeVals.baseline / maxVal) * 100;
    const hAwq = (activeVals.awq / maxVal) * 100;
    const hProposed = (activeVals.proposed / maxVal) * 100;

    return (
      <div className="flex-1 min-w-[200px] bg-slate-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between h-[250px] relative group/chart shadow-sm">
        {/* Y Axis Gridlines (Visual only) */}
        <div className="absolute inset-x-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none px-4">
          <div className="border-t border-gray-200/70 w-full" />
          <div className="border-t border-gray-200/70 w-full" />
          <div className="border-t border-gray-200/70 w-full" />
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-around gap-2 px-2 relative z-10 h-full mt-4">
          {/* Baseline Bar */}
          <div className="flex flex-col items-center flex-1 h-full justify-end">
            <span className="text-[10px] text-gray-500 font-mono mb-1 select-none">
              {formatFn(activeVals.baseline)}
            </span>
            <div
              onMouseEnter={(e) =>
                handleMouseEnter(e, 'Baseline (FP16)', `${formatFn(activeVals.baseline)} ${unit}`, 'bg-blue-500')
              }
              onMouseLeave={handleMouseLeave}
              className="w-full bg-blue-500 rounded-t hover:bg-blue-400 hover:scale-105 transition-all duration-500 cursor-pointer glow-blue"
              style={{ height: `${hBaseline}%` }}
            />
          </div>

          {/* AWQ Bar */}
          <div className="flex flex-col items-center flex-1 h-full justify-end">
            <span className="text-[10px] text-gray-500 font-mono mb-1 select-none">
              {isCompleted ? formatFn(activeVals.awq) : '--'}
            </span>
            <div
              onMouseEnter={(e) =>
                handleMouseEnter(e, 'AWQ (INT4)', `${formatFn(activeVals.awq)} ${unit}`, 'bg-emerald-500')
              }
              onMouseLeave={handleMouseLeave}
              className={`w-full rounded-t hover:scale-105 transition-all duration-500 cursor-pointer ${
                isCompleted 
                  ? 'bg-emerald-500 hover:bg-emerald-400 glow-green' 
                  : 'bg-emerald-100/30 border border-dashed border-emerald-300'
              }`}
              style={{ height: `${hAwq}%` }}
            />
          </div>

          {/* Proposed Bar */}
          <div className="flex flex-col items-center flex-1 h-full justify-end">
            <span className="text-[10px] text-gray-500 font-mono mb-1 select-none">
              {isCompleted ? formatFn(activeVals.proposed) : '--'}
            </span>
            <div
              onMouseEnter={(e) =>
                handleMouseEnter(
                  e,
                  'Proposed (Ours)',
                  `${formatFn(activeVals.proposed)} ${unit}`,
                  'bg-red-500'
                )
              }
              onMouseLeave={handleMouseLeave}
              className={`w-full rounded-t hover:scale-105 transition-all duration-500 cursor-pointer ${
                isCompleted 
                  ? 'bg-red-500 hover:bg-red-400 glow-red' 
                  : 'bg-red-100/20 border border-dashed border-red-300'
              }`}
              style={{ height: `${hProposed}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center font-semibold text-xs text-gray-700 mt-3 pt-2 border-t border-gray-200">
          {title}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col gap-4 shadow-sm charts-container relative">
      {/* Header and Legend */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">
          5. Performance Comparison
        </h2>

        {/* Legends */}
        <div className="flex flex-wrap gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-gray-600">Baseline (FP16)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-gray-600">AWQ (INT4)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-gray-600">Proposed (Ours)</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-2">
        {renderBarGroup(
          'Model Size (GB)',
          {
            baseline: baseline.modelSize,
            awq: awqOnly.modelSize,
            proposed: proposed.modelSize,
          },
          (v) => v.toFixed(2),
          'GB'
        )}

        {renderBarGroup(
          'Perplexity (PPL)',
          {
            baseline: baseline.perplexity,
            awq: awqOnly.perplexity,
            proposed: proposed.perplexity,
          },
          (v) => v.toFixed(2),
          ''
        )}

        {renderBarGroup(
          'Latency (s)',
          {
            baseline: baseline.latency,
            awq: awqOnly.latency,
            proposed: proposed.latency,
          },
          (v) => v.toFixed(3),
          's'
        )}

        {renderBarGroup(
          'Throughput (tokens/s)',
          {
            baseline: baseline.throughput,
            awq: awqOnly.throughput,
            proposed: proposed.throughput,
          },
          (v) => Math.round(v).toString(),
          'tokens/s'
        )}
      </div>

      {/* Floating Tooltip */}
      {tooltip.visible && (
        <div
          className="absolute z-50 pointer-events-none bg-white border border-gray-200 text-gray-800 text-xs rounded px-2.5 py-1.5 shadow-lg transition-all duration-100 ease-out -translate-x-1/2 flex items-center gap-2 font-mono"
          style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
        >
          <div className={`w-2 h-2 rounded-full ${tooltip.color}`} />
          <span className="text-gray-500 font-sans">{tooltip.label}:</span>
          <span className="font-bold">{tooltip.value}</span>
        </div>
      )}
    </div>
  );
};
