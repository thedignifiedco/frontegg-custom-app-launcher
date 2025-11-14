'use client';

import { useState } from 'react';
import { App } from './AppLauncher';
import Applet from './Applet';
import BookDemoModal from './BookDemoModal';

interface UpsellSectionProps {
  unassignedApps: App[];
}

export default function UpsellSection({ unassignedApps }: UpsellSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-indigo-100">
        <div className="mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
            Unlock More Apps
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Get access to additional apps to enhance your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {unassignedApps.map((app) => (
            <Applet
              key={app.id}
              app={app}
              isAssigned={false}
            />
          ))}
        </div>

        <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-indigo-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Need access to these apps?
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">
                Book a demo to see how these apps can transform your workflow
              </p>
            </div>
            <button
              className="w-full sm:w-auto px-6 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg text-sm sm:text-base"
              onClick={() => setIsModalOpen(true)}
            >
              Request Access
            </button>
          </div>
        </div>
      </section>

      <BookDemoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
