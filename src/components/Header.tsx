import React from 'react';
import { Cpu } from 'lucide-react';

interface HeaderProps {
  device: string;
}

export const Header: React.FC<HeaderProps> = ({ device }) => {
  // Extract GPU name from the device string, e.g. "GPU: NVIDIA RTX 8000 (48GB)" -> "NVIDIA RTX 8000 (48GB)"
  const gpuName = device.includes('GPU:') ? device.replace('GPU: ', '') : device;

  return (
    <header className="flex flex-col md:flex-row items-center justify-between px-6 py-4 h-md:py-5 h-lg:py-6 bg-[#111625] border-b border-[#1f293d] shadow-lg sticky top-0 z-50">
      {/* Left side: Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600/20 p-2 rounded-lg border border-blue-500/30 flex items-center justify-center glow-blue">
          <Cpu className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            EdgeLLM Compression Tool
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">Real-time Model Pruning & Quantization Dashboard</p>
        </div>
      </div>

      {/* Right side: Environment details */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 md:mt-0 text-xs font-mono text-gray-400 bg-[#0d111b] px-4 py-2 rounded-lg border border-[#1f293d]">
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-sans">System:</span>
          <span className="text-blue-400 font-semibold">Ubuntu 22.04</span>
        </div>
        <span className="text-gray-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-sans">GPU:</span>
          <span className="text-emerald-400 font-semibold">{gpuName}</span>
        </div>
        <span className="text-gray-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500 font-sans">Python:</span>
          <span className="text-indigo-400 font-semibold">3.10.12</span>
        </div>
      </div>
    </header>
  );
};
