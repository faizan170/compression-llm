import React from 'react';
import { Check, Loader2 } from 'lucide-react';
import type { StepInfo } from '../types';

interface ProgressStepperProps {
  steps: StepInfo[];
  currentStepIndex: number;
  isCompressing: boolean;
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({
  steps,
  isCompressing,
}) => {
  return (
    <div className="bg-white pt-2 px-4 rounded-xl border border-gray-200 flex flex-col gap-2 shadow-sm select-none">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">
          3. Compression Progress
        </h2>
        {isCompressing && (
          <span className="text-xs bg-blue-5/80 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 animate-pulse font-medium">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
            Optimizing in background
          </span>
        )}
      </div>

      {/* Stepper container - 100% fluid, no horizontal scrollbars */}
      <div className="w-full mt-1.5 pb-0.5 pt-1">
        <div className="w-full flex items-start justify-between">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isRunning = step.status === 'running';
            const isSkipped = step.status === 'skipped';

            let circleClass = 'bg-slate-50 border-2 border-gray-300 text-gray-400';
            let titleClass = 'text-gray-500';

            if (isCompleted) {
              circleClass = 'bg-emerald-50 border-2 border-emerald-500 text-emerald-600 glow-green';
              titleClass = 'text-gray-900 font-semibold';
            } else if (isRunning) {
              circleClass = 'bg-blue-50 border-2 border-blue-500 text-blue-600 animate-step-pulse glow-blue';
              titleClass = 'text-blue-900 font-bold';
            } else if (isSkipped) {
              circleClass = 'bg-gray-100 border-2 border-dashed border-gray-300 text-gray-400';
              titleClass = 'text-gray-400 line-through';
            }

            // Special style for Step 6 (Evaluation) in reference image when completed
            const isEvaluationAndCompleted = step.id === 'evaluation' && isCompleted;

            return (
              <React.Fragment key={step.id}>
                {/* Step node */}
                <div className="flex flex-col items-center text-center flex-1 min-w-[55px] max-w-[120px] shrink">
                  {/* Stepper Circle */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all duration-300 ${isEvaluationAndCompleted
                      ? 'bg-blue-600 border-2 border-blue-400 text-white font-bold glow-blue'
                      : circleClass
                      }`}
                  >
                    {isCompleted && !isEvaluationAndCompleted ? (
                      <Check className="w-4.5 h-4.5 sm:w-5 sm:h-5 stroke-[3]" />
                    ) : isRunning ? (
                      <Loader2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <span>{idx + 1}</span>
                    )}
                  </div>

                  {/* Labels */}
                  <span className={`text-[10px] sm:text-[11px] font-medium mt-1 block h-8 line-clamp-2 leading-tight px-0.5 ${titleClass}`}>
                    {step.label}
                  </span>

                </div>

                {/* Connecting Arrow */}
                {idx < steps.length - 1 && (
                  <div className="flex-1 flex items-center h-8 sm:h-10 px-0.5 sm:px-1 min-w-[10px] max-w-[60px] shrink">
                    <div className="w-full h-[1px] bg-gray-300 relative">
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[1px] border-y-[3px] border-y-transparent border-l-[5px] border-l-gray-300" />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
