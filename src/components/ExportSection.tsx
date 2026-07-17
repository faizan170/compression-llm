import React from 'react';
import { Download } from 'lucide-react';
import type { CompressionConfig } from '../types';

interface ExportSectionProps {
  config: CompressionConfig;
  isCompleted: boolean;
}

export const ExportSection: React.FC<ExportSectionProps> = ({ config, isCompleted }) => {
  const handleExport = () => {
    if (!isCompleted) return;

    // Create a mock model configuration JSON string to download
    const exportData = {
      timestamp: new Date().toISOString(),
      tool: 'EdgeLLM Compression Tool',
      version: '1.0.0-optimized',
      source_model: config.model,
      calibration_dataset: config.dataset,
      target_device: config.device,
      optimization_steps: {
        structured_pruning: config.sparseGpt.enable
          ? {
              method: 'SparseGPT',
              sparsity_ratio: config.sparseGpt.sparsityRatio,
              pattern: config.sparseGpt.pattern,
            }
          : 'disabled',
        quantization: config.awq.enable
          ? {
              method: 'AWQ',
              bit_width: config.awq.bitWidth,
              group_size: config.awq.groupSize,
            }
          : 'disabled',
        fine_tuning: config.lora.enable
          ? {
              method: 'LoRA',
              rank: config.lora.rank,
              alpha: config.lora.alpha,
              dropout: config.lora.dropout,
              learning_rate: config.lora.lr,
            }
          : 'disabled',
      },
      export_path: config.outputFolder,
      status: 'SUCCESS',
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(exportData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `${config.model.toLowerCase()}_optimized_config.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
      <div className="flex flex-col gap-1 text-center sm:text-left">
        <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700">
          6. Export
        </h2>
        <p className="text-xs text-gray-600">
          {isCompleted
            ? 'Your model is fully optimized and verified. Export configuration file and weights structure now.'
            : 'Save the optimized model and configuration after compression is complete.'}
        </p>
      </div>

      <button
        type="button"
        disabled={!isCompleted}
        onClick={handleExport}
        className={`px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 border transition duration-200 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
          isCompleted
            ? 'bg-purple-600 border-purple-500/30 hover:bg-purple-500 text-white shadow-[0_0_15px_rgba(147,51,234,0.2)]'
            : 'bg-gray-100 border-gray-200 text-gray-400'
        }`}
      >
        <Download className="w-4 h-4" />
        Export Model
      </button>
    </div>
  );
};
