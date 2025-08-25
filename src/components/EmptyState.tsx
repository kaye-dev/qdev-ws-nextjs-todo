import React from 'react';

const EmptyState: React.FC = () => {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 sm:py-16 px-4 text-center animate-in fade-in duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 mb-6 text-gray-400 transition-all duration-300 hover:text-gray-500 hover:scale-110 transform">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>

      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-3">
        タスクがありません
      </h3>

      <p className="text-sm sm:text-base text-gray-500 max-w-sm leading-relaxed">
        上のフォームから新しいタスクを追加して、やるべきことを管理しましょう。
      </p>

      <div className="mt-6 flex items-center gap-2 text-xs sm:text-sm text-gray-500 bg-white px-3 py-2 rounded-full border border-gray-100 shadow-sm">
        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Enterキーでも追加できます</span>
      </div>
    </div>
  );
};

export default EmptyState;
