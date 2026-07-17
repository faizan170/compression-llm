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
      latency: 0.4076,
      throughput: 1256.26,
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

  // Check if we match default LLaMA2-7B full compression numbers
  if (config.model === 'LLaMA2-7B' && config.sparseGpt.enable && config.awq.enable && config.lora.enable) {
    size = 2.30;
    ppl = 7.021;
    lat = 0.245;
    thr = 2043.30;
  } else {
    // Standard simulation logic
    if (config.awq.enable) {
      let qFactor = 0.27; // 4-bit default
      let pplImpact = 0.52;
      let latencyFactor = 0.70;
      let throughputFactor = 1.43;

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

      size = size * qFactor;
      ppl = ppl + pplImpact;
      lat = lat * latencyFactor;
      thr = thr * throughputFactor;
    }

    if (config.sparseGpt.enable) {
      let sFactor = 0.50;
      if (config.sparseGpt.sparsityRatio === '30%') sFactor = 0.70;
      else if (config.sparseGpt.sparsityRatio === '70%') sFactor = 0.30;

      size = size * sFactor;
      ppl = ppl + 0.45;
      lat = lat * 0.80;
      thr = thr * 1.25;
    }

    if (config.lora.enable && (config.sparseGpt.enable || config.awq.enable)) {
      let recovery = 0.25;
      if (config.lora.rank === 32) recovery = 0.38;
      else if (config.lora.rank === 8) recovery = 0.15;
      ppl = Math.max(base.perplexity, ppl - recovery);
    }
  }

  // Clean rounding
  return {
    proposed: {
      modelSize: Number(size.toFixed(2)),
      perplexity: Number(ppl.toFixed(3)),
      latency: Number(lat.toFixed(4)),
      throughput: Number(thr.toFixed(2)),
    },
    awqOnly: {
      modelSize: Number((base.modelSize * 0.27).toFixed(2)),
      perplexity: Number((base.perplexity + 0.52).toFixed(3)),
      latency: Number((base.latency * 0.70).toFixed(4)),
      throughput: Number((base.throughput * 1.43).toFixed(2)),
    },
  };
}
