import React from 'react';

interface WaveLoaderProps {
  message?: string;
}

export const WaveLoader: React.FC<WaveLoaderProps> = ({ message = "Generating Report..." }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black/30 rounded-xl p-4">
      <div className="flex space-x-1 mb-6 h-20 overflow-hidden">
        {[...Array(12)].map((_, col) => (
          <div key={col} className="flex flex-col">
            {[...Array(8)].map((_, row) => (
              <div 
                key={row}
                className="text-cyan-400/30 font-mono text-xs animate-pulse"
                style={{ animationDelay: `${(row + col) * 0.1}s` }}
              >
                {Math.random() > 0.5 ? '1' : '0'}
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-cyan-400 font-mono text-sm tracking-wider">
        {message}
      </p>
    </div>
  );
};