'use client';

import { App } from './AppLauncher';

interface AppletProps {
  app: App;
  isAssigned: boolean;
}

export default function Applet({ app, isAssigned }: AppletProps) {
  const handleClick = () => {
    if (isAssigned) {
      window.open(app.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`
        relative group cursor-pointer transition-all duration-200
        ${isAssigned 
          ? 'hover:scale-105 hover:shadow-xl' 
          : 'cursor-not-allowed opacity-50'
        }
      `}
    >
      <div
        className={`
          bg-white rounded-xl shadow-md p-6 h-full
          border-2 transition-colors duration-200
          ${isAssigned
            ? 'border-transparent hover:border-gray-200'
            : 'border-gray-200'
          }
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-16 h-16 rounded-lg flex items-center justify-center text-3xl mb-4
            bg-gradient-to-br ${app.color}
            ${!isAssigned && 'grayscale'}
          `}
        >
          {app.icon}
        </div>

        {/* App Name */}
        <h3
          className={`
            text-xl font-semibold mb-2
            ${isAssigned ? 'text-gray-900' : 'text-gray-400'}
          `}
        >
          {app.name}
        </h3>

        {/* Description */}
        <p
          className={`
            text-sm mb-4
            ${isAssigned ? 'text-gray-600' : 'text-gray-400'}
          `}
        >
          {app.description}
        </p>

        {/* Status Badge */}
        {!isAssigned && (
          <div className="absolute top-4 right-4">
            <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
              Not Assigned
            </span>
          </div>
        )}

        {/* Hover Effect Indicator */}
        {isAssigned && (
          <div className="flex items-center text-sm text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Open app</span>
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

