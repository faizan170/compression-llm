import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConfigPanel } from './components/ConfigPanel';
import { ProgressStepper } from './components/ProgressStepper';
import { ResultsSummary } from './components/ResultsSummary';
import { ComparisonCharts } from './components/ComparisonCharts';
import { ExportSection } from './components/ExportSection';
import type { CompressionConfig, CompressionRunState, StepInfo } from './types';
import { MODELS, calculateProposedMetrics } from './mockData';

const DEFAULT_CONFIG: CompressionConfig = {
  model: 'LLaMA2-7B',
  dataset: 'WikiText-2',
  device: 'GPU: NVIDIA RTX 8000 (48GB)',
  outputFolder: '/home/user/edge_llm_compressed',
  sparseGpt: {
    enable: true,
    sparsityRatio: '50%',
    pattern: '2:4',
  },
  awq: {
    enable: true,
    bitWidth: '4-bit',
    groupSize: '128',
  },
  lora: {
    enable: true,
    rank: 16,
    alpha: 32,
    dropout: 0.1,
    lr: '2e-4',
  },
};

const DEFAULT_STEPS: StepInfo[] = [
  { id: 'load_model', label: 'Load Model', status: 'pending' },
  { id: 'sensitivity_analysis', label: 'Sensitivity Analysis', status: 'pending' },
  { id: 'sparsegpt_pruning', label: 'SparseGPT Pruning', status: 'pending' },
  { id: 'awq_quantization', label: 'AWQ Quantization', status: 'pending' },
  { id: 'lora_finetuning', label: 'LoRA Fine-tuning', status: 'pending' },
  { id: 'evaluation', label: 'Evaluation', status: 'pending' },
];

function App() {
  const [config, setConfig] = useState<CompressionConfig>(DEFAULT_CONFIG);
  const [isCompleted, setIsCompleted] = useState<boolean>(true); // Start completed as in user screenshot
  const [showLogs, setShowLogs] = useState<boolean>(false);

  // Compression Run State
  const [runState, setRunState] = useState<CompressionRunState>({
    isCompressing: false,
    currentStepIndex: 0,
    progress: 0,
    steps: DEFAULT_STEPS.map((s) => ({ ...s, status: 'completed' })), // start completed as in user screenshot
    logs: [
      '[INFO] LLaMA2-7B model loaded successfully into GPU VRAM (13.10 GB allocated).',
      '[INFO] Sensitivity analysis complete across all 32 transformer layers.',
      '[INFO] SparseGPT 50% structured pruning complete (pattern: 2:4).',
      '[INFO] AWQ 4-bit quantization complete (group size: 128).',
      '[INFO] Parameter-efficient fine-tuning complete (LoRA rank=16, alpha=32, dropout=0.1).',
      '[INFO] Evaluation completed: Perplexity: 7.02, Latency: 0.231s, Throughput: 2043 t/s.',
      '[SUCCESS] Model successfully compressed and verified.',
    ],
  });

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of logs on update
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [runState.logs, showLogs]);

  // Model-specific baselines
  const modelPreset = MODELS.find((m) => m.id === config.model) || MODELS[0];
  const baselineMetrics = modelPreset.baseline;

  // Proposed metrics calculations
  const { proposed: proposedMetrics, awqOnly: awqOnlyMetrics } = calculateProposedMetrics(config);

  // Trigger compression simulation
  const runCompressionSimulation = () => {
    setIsCompleted(false);
    setShowLogs(true);
    setRunState((prev) => ({
      ...prev,
      isCompressing: true,
      currentStepIndex: 0,
      progress: 0,
      logs: [`[INIT] Starting compression pipeline for ${config.model}...`],
      steps: DEFAULT_STEPS.map((s) => ({ ...s, status: 'pending' })),
    }));

    const stages: { id: string; label: string; logs: string[]; delay: number; checkCondition?: () => boolean }[] = [
      {
        id: 'load_model',
        label: 'Load Model',
        delay: 1500,
        logs: [
          `[INFO] Target environment detected: Ubuntu 22.04 | GPU: ${config.device}.`,
          `[INFO] Loading model ${config.model}...`,
          `[INFO] Allocating memory block (${baselineMetrics.modelSize.toFixed(2)} GB)...`,
          `[INFO] Weights loaded successfully in GPU VRAM.`,
        ],
      },
      {
        id: 'sensitivity_analysis',
        label: 'Sensitivity Analysis',
        delay: 2000,
        logs: [
          `[INFO] Loading calibration dataset: ${config.dataset}...`,
          `[INFO] Analyzing weight tensors gradient variance...`,
          `[INFO] Generating Fisher information profile for model layers.`,
        ],
      },
      {
        id: 'sparsegpt_pruning',
        label: 'SparseGPT Pruning',
        delay: 2000,
        checkCondition: () => config.sparseGpt.enable,
        logs: [
          `[INFO] Starting SparseGPT Structured Pruning...`,
          `[INFO] Sparsity ratio target: ${config.sparseGpt.sparsityRatio} with pattern ${config.sparseGpt.pattern}.`,
          `[INFO] Iteratively updating layers using second-order Taylor expansion coefficients.`,
          `[INFO] Layer-wise pruning complete. Sparsity achieved.`,
        ],
      },
      {
        id: 'awq_quantization',
        label: 'AWQ Quantization',
        delay: 2000,
        checkCondition: () => config.awq.enable,
        logs: [
          `[INFO] Starting AWQ (Activation-aware Weight Quantization)...`,
          `[INFO] Bit width: ${config.awq.bitWidth} | Group size: ${config.awq.groupSize}.`,
          `[INFO] Computing salient weight scale protection grids.`,
          `[INFO] Mapping tensors to INT formats and packing weights.`,
        ],
      },
      {
        id: 'lora_finetuning',
        label: 'LoRA Fine-tuning',
        delay: 2000,
        checkCondition: () => config.lora.enable,
        logs: [
          `[INFO] Initializing LoRA fine-tuning stage...`,
          `[INFO] Rank (r): ${config.lora.rank} | Alpha: ${config.lora.alpha} | Learning Rate: ${config.lora.lr}.`,
          `[INFO] Running fine-tuning adaptation epoch 1/1...`,
          `[INFO] Recovering structural perplexity from quantization loss...`,
        ],
      },
      {
        id: 'evaluation',
        label: 'Evaluation',
        delay: 1500,
        logs: [
          `[INFO] Running final evaluations...`,
          `[INFO] Evaluating Perplexity (PPL) on ${config.dataset} dataset...`,
          `[INFO] Benchmarking average token generation latency on ${config.device}...`,
          `[INFO] Calculating average throughput speed metrics...`,
        ],
      },
    ];

    let currentStageIndex = 0;

    const runNextStage = () => {
      if (currentStageIndex >= stages.length) {
        // Complete the compression
        setRunState((prev) => {
          const finalSteps = prev.steps.map((s) => {
            if (s.status === 'running') return { ...s, status: 'completed' as const };
            return s;
          });
          return {
            ...prev,
            isCompressing: false,
            steps: finalSteps,
            logs: [
              ...prev.logs,
              `[SUCCESS] Model successfully optimized.`,
              `[SUCCESS] Optimized model size: ${proposedMetrics.modelSize.toFixed(2)} GB.`,
              `[SUCCESS] Final Perplexity: ${proposedMetrics.perplexity.toFixed(2)}.`,
              `[SUCCESS] Saved path: ${config.outputFolder}.`,
            ],
          };
        });
        setIsCompleted(true);
        return;
      }

      const stage = stages[currentStageIndex];

      // If checkCondition is provided and returns false, skip this stage
      if (stage.checkCondition && !stage.checkCondition()) {
        setRunState((prev) => {
          const nextSteps = prev.steps.map((s) => {
            if (s.id === stage.id) return { ...s, status: 'skipped' as const };
            return s;
          });
          return {
            ...prev,
            steps: nextSteps,
            logs: [...prev.logs, `[INFO] Step "${stage.label}" disabled in configuration. Skipping...`],
          };
        });
        currentStageIndex++;
        runNextStage();
        return;
      }

      // Mark current stage as running
      setRunState((prev) => {
        const nextSteps = prev.steps.map((s) => {
          if (s.id === stage.id) return { ...s, status: 'running' as const };
          if (s.status === 'running') return { ...s, status: 'completed' as const };
          return s;
        });
        return {
          ...prev,
          currentStepIndex: currentStageIndex,
          steps: nextSteps,
          logs: [...prev.logs, ...stage.logs],
        };
      });

      setTimeout(() => {
        currentStageIndex++;
        runNextStage();
      }, stage.delay);
    };

    runNextStage();
  };

  // Reset completion state when configuration changes so they can run again
  const handleConfigChange = (updater: (prev: CompressionConfig) => CompressionConfig) => {
    setConfig(updater);
    setIsCompleted(false);
    // Reset stepper UI to pending
    setRunState((prev) => ({
      ...prev,
      steps: DEFAULT_STEPS,
      logs: ['[INFO] Configuration modified. Click "Run Compression" to update metrics.'],
    }));
  };

  return (
    <div className="h-screen bg-[#f0f2f5] flex flex-col font-sans overflow-hidden">
      {/* Header (Title and base parameters remain dark theme as in screenshot) */}
      <Header device={config.device} />

      {/* Main dashboard content area - taking full height and width with page padding, and a layout border enclosing sidebar and main workspace */}
      <div className="flex-1 p-4 md:p-6 min-h-0 overflow-hidden">
        <div className="w-full h-full bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col lg:flex-row overflow-hidden">
          {/* Sidebar controls (White background) */}
          <ConfigPanel
            config={config}
            onChange={handleConfigChange}
            onRun={runCompressionSimulation}
            isCompressing={runState.isCompressing}
          />

          {/* Main workspace panels (Light blue-gray background) */}
          <div className="flex-1 p-3.5 flex flex-col gap-3.5 overflow-y-auto bg-[#f0f2f5]">
            
            {/* Stepper progress (White background card) */}
            <ProgressStepper
              steps={runState.steps}
              currentStepIndex={runState.currentStepIndex}
              isCompressing={runState.isCompressing}
            />

            {/* Toggle Logs Button commented out as requested
            {(runState.isCompressing || runState.logs.length > 0) && (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowLogs(!showLogs)}
                  className="flex items-center gap-1.5 self-start text-xs font-semibold text-blue-700 hover:text-blue-800 transition cursor-pointer select-none bg-white px-3.5 py-2 rounded-lg border border-gray-200 shadow-sm"
                >
                  <Terminal className="w-3.5 h-3.5 text-blue-600" />
                  {showLogs ? 'Hide Console Outputs' : 'Show Console Outputs'}
                  {showLogs ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />}
                </button>

                {showLogs && (
                  <div className="bg-slate-900 border border-slate-950 rounded-lg p-3 h-36 font-mono text-[11px] text-emerald-400 overflow-y-auto flex flex-col gap-1 shadow-inner select-text">
                    {runState.logs.map((log, index) => {
                      let color = 'text-emerald-400';
                      if (log.includes('[ERROR]')) color = 'text-red-400 font-bold';
                      else if (log.includes('[SUCCESS]')) color = 'text-cyan-400 font-semibold';
                      else if (log.includes('[INIT]')) color = 'text-blue-400 font-bold';
                      else if (log.includes('[INFO]')) color = 'text-emerald-400/90';

                      return (
                        <div key={index} className={color}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={terminalEndRef} />
                  </div>
                )}
              </div>
            )}
            */}

            {/* Results Summary comparisons (White background card) */}
            <ResultsSummary
              baseline={baselineMetrics}
              proposed={proposedMetrics}
              isCompleted={isCompleted}
            />

            {/* Comparison Charts (White background card) */}
            <ComparisonCharts
              baseline={baselineMetrics}
              awqOnly={awqOnlyMetrics}
              proposed={proposedMetrics}
              isCompleted={isCompleted}
            />

            {/* Export Section (White background card) */}
            <ExportSection config={config} isCompleted={isCompleted} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
