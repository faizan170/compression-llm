export interface SparseGPTConfig {
  enable: boolean;
  sparsityRatio: string;
  pattern: string;
}

export interface AWQConfig {
  enable: boolean;
  bitWidth: string;
  groupSize: string;
}

export interface LoRAConfig {
  enable: boolean;
  rank: number;
  alpha: number;
  dropout: number;
  lr: string;
}

export interface CompressionConfig {
  model: string;
  dataset: string;
  device: string;
  outputFolder: string;
  sparseGpt: SparseGPTConfig;
  awq: AWQConfig;
  lora: LoRAConfig;
}

export interface Metrics {
  modelSize: number; // GB
  perplexity: number; // PPL
  latency: number; // Avg latency in seconds
  throughput: number; // tokens/s
}

export type CompressionStepId = 
  | 'load_model' 
  | 'sensitivity_analysis' 
  | 'sparsegpt_pruning' 
  | 'awq_quantization' 
  | 'lora_finetuning' 
  | 'evaluation';

export interface StepInfo {
  id: CompressionStepId;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'skipped';
}

export interface CompressionRunState {
  isCompressing: boolean;
  currentStepIndex: number;
  progress: number; // 0 to 100 overall
  steps: StepInfo[];
  logs: string[];
}
