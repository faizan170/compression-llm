import React, { useState } from 'react';
import type { Metrics } from '../types';

const CHART_HEIGHT = 'var(--chart-height, 160px)'; // Height is responsive via index.css --chart-height variable
const BAR_WIDTH = 'w-16'; // Adjust this variable to change the width of all bars (e.g. w-6, w-8, w-10)

interface ComparisonChartsProps {
  baseline: Metrics;
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

  // Helper to render a group of 2 bars (Baseline and Proposed)
  const renderBarGroup = (
    title: string,
    vals: { baseline: number; proposed: number },
    formatFn: (v: number) => string,
    unit: string
  ) => {
    const activeVals = {
      baseline: vals.baseline,
      proposed: isCompleted ? vals.proposed : vals.baseline,
    };

    const maxVal = Math.max(activeVals.baseline, activeVals.proposed, 1) * 1.15;

    const hBaseline = (activeVals.baseline / maxVal) * 100;
    const hProposed = (activeVals.proposed / maxVal) * 100;

    return (
      <div
        className="flex-1 min-w-[200px] bg-slate-50 border border-gray-200 p-4 rounded-xl flex flex-col justify-between relative group/chart shadow-sm"
        style={{ height: CHART_HEIGHT }}
      >
        {/* Y Axis Gridlines (Visual only) */}
        <div className="absolute inset-x-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none px-4">
          <div className="border-t border-gray-200/70 w-full" />
          <div className="border-t border-gray-200/70 w-full" />
          <div className="border-t border-gray-200/70 w-full" />
        </div>

        {/* Bars Container */}
        <div className="flex-1 flex items-end justify-around gap-4 px-4 relative z-10 h-full mt-4">
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
              className={`bg-blue-500 rounded-t hover:bg-blue-400 hover:scale-105 transition-all duration-500 cursor-pointer glow-blue ${BAR_WIDTH}`}
              style={{ height: `${hBaseline}%` }}
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
              className={`rounded-t hover:scale-105 transition-all duration-500 cursor-pointer ${BAR_WIDTH} ${isCompleted
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
    <div className="bg-white p-5 h-md:py-6 h-lg:py-8 rounded-xl border border-gray-200 flex flex-col gap-4 h-md:gap-5 h-lg:gap-6 shadow-sm charts-container relative">
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
            proposed: proposed.modelSize,
          },
          (v) => v.toFixed(2),
          'GB'
        )}

        {renderBarGroup(
          'Perplexity (PPL)',
          {
            baseline: baseline.perplexity,
            proposed: proposed.perplexity,
          },
          (v) => v.toFixed(2),
          ''
        )}

        {renderBarGroup(
          'Latency (s)',
          {
            baseline: baseline.latency,
            proposed: proposed.latency,
          },
          (v) => v.toFixed(3),
          's'
        )}

        {renderBarGroup(
          'Throughput (tokens/s)',
          {
            baseline: baseline.throughput,
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
