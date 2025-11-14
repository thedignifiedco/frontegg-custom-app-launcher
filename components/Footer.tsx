'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
        <div className="border-t border-gray-800 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-left order-2 sm:order-1">
              © {currentYear} Dignified Labs. All rights reserved.
            </p>
            <p className="text-gray-400 text-xs sm:text-sm text-center sm:text-right order-1 sm:order-2">
              Authentication & Authorization powered by{' '}
              <a
                href="https://frontegg.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Frontegg
              </a>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
