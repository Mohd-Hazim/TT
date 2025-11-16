import React from "react";

export default function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 rounded-2xl">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
        <p className="mt-4 text-lg font-semibold text-gray-700">
          AI is thinking…
        </p>
      </div>
    </div>
  );
}
