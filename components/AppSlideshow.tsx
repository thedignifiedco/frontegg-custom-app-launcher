'use client';

import { useState, useEffect } from 'react';
import { App } from './AppLauncher';

interface AppSlideshowProps {
  apps: App[];
}

export default function AppSlideshow({ apps }: AppSlideshowProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (apps.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % apps.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [apps.length]);

  if (apps.length === 0) return null;

  const currentApp = apps[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + apps.length) % apps.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % apps.length);
  };

  return (
    <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mb-8 sm:mb-12">
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentApp.color} opacity-90`} />

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4 sm:px-8 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-center">
            {/* Left side - Text */}
            <div className="text-white">
              <div className="text-4xl sm:text-6xl mb-2 sm:mb-4">{currentApp.icon}</div>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
                {currentApp.name}
              </h3>
              <p className="text-sm sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-6">
                {currentApp.description}
              </p>
              <div className="flex gap-2">
                {apps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-white w-8'
                        : 'bg-white/50 w-2 hover:bg-white/75'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right side - Visual element */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative">
                <div className="w-48 h-48 bg-white/20 rounded-full blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-9xl">{currentApp.icon}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-1.5 sm:p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <svg
          className="w-5 h-5 sm:w-6 sm:h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    </div>
  );
}

