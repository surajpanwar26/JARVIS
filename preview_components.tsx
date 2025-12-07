import React from 'react';

export const PreviewComponents: React.FC = () => {
  return (
    <div className="p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-center">Agent Status Icons & Loading Animations Preview</h1>
      
      <div className="max-w-4xl mx-auto">
        {/* Agent Status Icons Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Agent Status Icons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Editor Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Editor Agent (Active)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-xs font-bold text-blue-400">EDITOR</span>
                <span className="text-xs text-slate-500">(Active)</span>
              </div>
            </div>

            {/* Researcher Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Researcher Agent (Completed)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span className="text-xs font-bold text-amber-400">RESEARCHER</span>
                <span className="text-xs text-slate-500">(Completed)</span>
              </div>
            </div>

            {/* Writer Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Writer Agent (Error)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs font-bold text-red-400">WRITER</span>
                <span className="text-xs text-slate-500">(Error)</span>
              </div>
            </div>

            {/* Publisher Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Publisher Agent (Active)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-green-400">PUBLISHER</span>
                <span className="text-xs text-slate-500">(Active)</span>
              </div>
            </div>

            {/* Reviewer Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Reviewer Agent (Completed)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs font-bold text-purple-400">REVIEWER</span>
                <span className="text-xs text-slate-500">(Completed)</span>
              </div>
            </div>

            {/* Image Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Image Agent (Completed)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                <span className="text-xs font-bold text-cyan-400">IMAGE</span>
                <span className="text-xs text-slate-500">(Completed)</span>
              </div>
            </div>

            {/* Source Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Source Agent (Active)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-400">SOURCE</span>
                <span className="text-xs text-slate-500">(Active)</span>
              </div>
            </div>

            {/* AI Assistant Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">AI Assistant Agent (Completed)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                <span className="text-xs font-bold text-indigo-400">AI ASSISTANT</span>
                <span className="text-xs text-slate-500">(Completed)</span>
              </div>
            </div>

            {/* Document Analyzer Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Document Analyzer Agent (Error)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                <span className="text-xs font-bold text-pink-400">DOC ANALYZER</span>
                <span className="text-xs text-slate-500">(Error)</span>
              </div>
            </div>

            {/* Chief Agent Icon */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Chief Agent (Active)</h3>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse"></div>
                <span className="text-xs font-bold text-yellow-400">CHIEF</span>
                <span className="text-xs text-slate-500">(Active)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Loading Animations Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-cyan-400">Loading Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pulsing Dots */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Pulsing Dots</h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>

            {/* Rotating Spinner */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Rotating Spinner</h3>
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Wave Animation */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Wave Animation</h3>
              <div className="flex space-x-1">
                <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave delay-0"></div>
                <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave delay-100"></div>
                <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave delay-200"></div>
                <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave delay-300"></div>
                <div className="w-1.5 h-6 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-full animate-wave delay-400"></div>
              </div>
            </div>

            {/* Bouncing Balls */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Bouncing Balls</h3>
              <div className="flex space-x-1">
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce delay-0"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-3 h-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>

            {/* Breathing Box */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Breathing Box</h3>
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg animate-pulse opacity-70"></div>
            </div>

            {/* Fading Circles */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Fading Circles</h3>
              <div className="relative w-8 h-8">
                <div className="absolute w-full h-full border-4 border-cyan-500 rounded-full animate-ping opacity-75"></div>
                <div className="absolute w-full h-full border-4 border-cyan-500 rounded-full"></div>
              </div>
            </div>

            {/* Sliding Bar */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Sliding Bar</h3>
              <div className="w-24 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-progress"></div>
              </div>
            </div>

            {/* Rotating Squares */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Rotating Squares</h3>
              <div className="relative w-8 h-8">
                <div className="absolute w-full h-full border-2 border-cyan-500 animate-spin border-t-transparent"></div>
                <div className="absolute w-3/4 h-3/4 border-2 border-blue-500 animate-spin border-b-transparent"></div>
              </div>
            </div>

            {/* Typing Indicator */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Typing Indicator</h3>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>

            {/* Orbiting Dots */}
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-3 text-gray-300">Orbiting Dots</h3>
              <div className="relative w-8 h-8">
                <div className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-orbit"></div>
                <div className="absolute w-2 h-2 bg-blue-500 rounded-full animate-orbit delay-300"></div>
                <div className="absolute w-2 h-2 bg-purple-500 rounded-full animate-orbit delay-500"></div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};