import type { CompressionConfig, Metrics } from './types';

export interface ModelPreset {
  id: string;
  name: string;
  baseline: Metrics;
}

export const MODELS: ModelPreset[] = [
  {
    id: 'LLaMA2-7B',
    name: 'LLaMA2-7B',
    baseline: {
      modelSize: 13.10,
      perplexity: 6.80,
      latency: 0.408,
      throughput: 1256,
    },
  },
  {
    id: 'LLaMA2-13B',
    name: 'LLaMA2-13B',
    baseline: {
      modelSize: 24.30,
      perplexity: 5.90,
      latency: 0.780,
      throughput: 820,
    },
  },
  {
    id: 'Mistral-7B',
    name: 'Mistral-7B',
    baseline: {
      modelSize: 14.50,
      perplexity: 6.20,
      latency: 0.350,
      throughput: 1450,
    },
  },
];

export const DATASETS = ['WikiText-2', 'C4', 'PTB', 'OpenWebText'];

export const DEVICES = [
  'GPU: NVIDIA RTX 8000 (48GB)',
  'GPU: NVIDIA RTX 4090 (24GB)',
  'GPU: NVIDIA A100 (80GB)',
  'CPU: Intel Xeon (64 Cores)',
];

/**
 * Calculates the compression metrics based on baseline and configuration.
 */
export function calculateProposedMetrics(config: CompressionConfig): {
  proposed: Metrics;
  awqOnly: Metrics;
} {
  const modelPreset = MODELS.find((m) => m.id === config.model) || MODELS[0];
  const base = modelPreset.baseline;

  // Let's copy baselines to start calculations
  let size = base.modelSize;
  let ppl = base.perplexity;
  let lat = base.latency;
  let thr = base.throughput;

  // Calculate AWQ Only Metrics (for the comparison charts)
  let awqSize = base.modelSize;
  let awqPpl = base.perplexity;
  let awqLat = base.latency;
  let awqThr = base.throughput;

  if (config.awq.enable) {
    // Quantization factor
    let qFactor = 0.27; // 4-bit default
    let pplImpact = 0.52; // increase in perplexity
    let latencyFactor = 0.70; // 30% reduction
    let throughputFactor = 1.43; // 43% increase

    if (config.awq.bitWidth === '3-bit') {
      qFactor = 0.22;
      pplImpact = 0.95;
      latencyFactor = 0.65;
      throughputFactor = 1.54;
    } else if (config.awq.bitWidth === '8-bit') {
      qFactor = 0.55;
      pplImpact = 0.10;
      latencyFactor = 0.85;
      throughputFactor = 1.18;
    }

    awqSize = Number((base.modelSize * qFactor).toFixed(2));
    awqPpl = Number((base.perplexity + pplImpact).toFixed(2));
    awqLat = Number((base.latency * latencyFactor).toFixed(3));
    awqThr = Math.round(base.throughput * throughputFactor);

    // Apply AWQ to Proposed
    size = size * qFactor;
    ppl = ppl + pplImpact;
    lat = lat * latencyFactor;
    thr = thr * throughputFactor;
  } else {
    // If AWQ is disabled, AWQ Only on chart acts like baseline or a default state. Let's make it slightly different for visual interest.
    awqSize = Number((base.modelSize * 0.55).toFixed(2));
    awqPpl = Number((base.perplexity + 0.15).toFixed(2));
    awqLat = Number((base.latency * 0.85).toFixed(3));
    awqThr = Math.round(base.throughput * 1.18);
  }

  // SparseGPT (Structured Pruning)
  if (config.sparseGpt.enable) {
    let sFactor = 0.50; // Sparsity ratio default 50%
    if (config.sparseGpt.sparsityRatio === '30%') sFactor = 0.70;
    else if (config.sparseGpt.sparsityRatio === '70%') sFactor = 0.30;

    size = size * sFactor;
    ppl = ppl + 0.45;
    lat = lat * 0.80; // 20% faster
    thr = thr * 1.25; // 25% throughput
  }

  // LoRA (Fine-tuning)
  if (config.lora.enable && (config.sparseGpt.enable || config.awq.enable)) {
    // LoRA recovers perplexity loss from compression
    let recovery = 0.25;
    if (config.lora.rank === 32) recovery = 0.38;
    else if (config.lora.rank === 8) recovery = 0.15;

    // Ensure we don't go below baseline PPL
    ppl = Math.max(base.perplexity, ppl - recovery);

    // LoRA adds a tiny negligible overhead to latency/throughput, but let's keep it clean
  }

  // Clean rounding
  return {
    proposed: {
      modelSize: Number(size.toFixed(2)),
      perplexity: Number(ppl.toFixed(2)),
      latency: Number(lat.toFixed(3)),
      throughput: Math.round(thr),
    },
    awqOnly: {
      modelSize: awqSize,
      perplexity: awqPpl,
      latency: awqLat,
      throughput: awqThr,
    },
  };
}
