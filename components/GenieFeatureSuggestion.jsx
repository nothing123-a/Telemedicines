'use client';

import { useRouter } from 'next/navigation';

export default function GenieFeatureSuggestion({ feature, onClose }) {
  const router = useRouter();

  if (!feature) return null;

  const handleClick = () => {
    router.push(feature.route);
    onClose?.();
  };

  return (
    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-800">{feature.name}</p>
          <p className="text-xs text-blue-600 mt-1">{feature.reason}</p>
        </div>
        <button
          onClick={handleClick}
          className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
        >
          Try Now
        </button>
      </div>
    </div>
  );
}