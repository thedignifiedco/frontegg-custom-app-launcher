'use client';

import { useState, useEffect } from 'react';
import { useAuth, useAuthActions, AdminPortal } from '@frontegg/nextjs';
import { useRouter } from 'next/navigation';
import Applet from './Applet';
import UpsellSection from './UpsellSection';
import AppSlideshow from './AppSlideshow';
import Footer from './Footer';

export interface App {
  id: string;
  appId: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
}

export type AppId = string;

export default function AppLauncher() {
  const { isAuthenticated, user } = useAuth();
  const { logout } = useAuthActions();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenSettings = () => {
    AdminPortal.show();
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    // Clear session cache on logout
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const tenantId = user?.tenantId;
      if (tenantId) {
        const cacheKey = `assignedApps_${tenantId}`;
        try {
          sessionStorage.removeItem(cacheKey);
        } catch (e) {
          // Ignore errors
        }
      }
    }
    router.replace('/account/logout');
    setIsMobileMenuOpen(false);
  };

  const handleSignIn = () => {
    // Redirect to Frontegg login page
    router.push('/account/login');
    setIsMobileMenuOpen(false);
  };

  const [availableApps, setAvailableApps] = useState<App[]>([]);
  const [assignedAppIds, setAssignedAppIds] = useState<AppId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch app configuration from API
  useEffect(() => {
    async function fetchAppConfig() {
      try {
        const response = await fetch('/api/apps/config');
        if (!response.ok) {
          throw new Error('Failed to fetch app configuration');
        }
        const data = await response.json();
        setAvailableApps(data.apps || []);
      } catch (err) {
        console.error('Error fetching app config:', err);
        setError('Failed to load app configuration');
      }
    }
    fetchAppConfig();
  }, []);

  useEffect(() => {
    async function fetchUserApps() {
      // Only fetch user apps if authenticated
      if (!isAuthenticated || !user || availableApps.length === 0) {
        if (!isAuthenticated) {
          setIsLoading(false);
        }
        return; // Wait for app config to load first or user to be authenticated
      }

      // Get tenantId from user object (from JWT token)
      const tenantId = user?.tenantId;
      
      if (!tenantId) {
        setError('Tenant ID not available. Please sign in again.');
        setIsLoading(false);
        return;
      }

      // Check sessionStorage for cached assigned apps
      const cacheKey = `assignedApps_${tenantId}`;
      
      // Check if sessionStorage is available (client-side only)
      if (typeof window !== 'undefined' && window.sessionStorage) {
        try {
          const cachedData = sessionStorage.getItem(cacheKey);
          if (cachedData) {
            try {
              const cachedAppIds = JSON.parse(cachedData);
              if (Array.isArray(cachedAppIds)) {
                setAssignedAppIds(cachedAppIds);
                setIsLoading(false);
                return; // Use cached data, no API call needed
              }
            } catch (e) {
              // Invalid cache, continue to fetch
              sessionStorage.removeItem(cacheKey);
            }
          }
        } catch (e) {
          // sessionStorage might be disabled, continue to fetch
          console.warn('sessionStorage not available:', e);
        }
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Pass tenantId as query param
        const url = `/api/frontegg/user-apps?tenantId=${encodeURIComponent(tenantId)}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          let errorMessage = 'Failed to fetch user applications';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch (e) {
            // If response is not JSON, use status text
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        const fronteggAppIds: string[] = (data.appIds || []).filter((id: any) => id != null);
        
        // Map Frontegg appIds to our app IDs using the availableApps from config
        const appIdMap: Record<string, string> = {};
        availableApps.forEach(app => {
          appIdMap[app.appId] = app.id;
        });
        
        const mappedAppIds = fronteggAppIds
          .map((appId) => appIdMap[appId])
          .filter((id): id is AppId => id !== undefined);
        
        // Cache the assigned app IDs in sessionStorage
        if (tenantId && typeof window !== 'undefined' && window.sessionStorage) {
          try {
            sessionStorage.setItem(cacheKey, JSON.stringify(mappedAppIds));
          } catch (e) {
            // sessionStorage might be disabled, ignore
            console.warn('Failed to cache in sessionStorage:', e);
          }
        }
        
        setAssignedAppIds(mappedAppIds);
      } catch (err) {
        console.error('Error fetching user apps:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    if (isAuthenticated && user && availableApps.length > 0) {
      fetchUserApps();
    } else if (!isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, availableApps]);
  
  const assignedApplets = availableApps.filter(app => 
    assignedAppIds.includes(app.id)
  );
  
  const unassignedApplets = availableApps.filter(app => 
    !assignedAppIds.includes(app.id)
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg
                className="w-8 h-8 text-indigo-700"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="8" y="8" width="20" height="20" rx="4" fill="currentColor"/>
                <rect x="36" y="8" width="20" height="20" rx="4" fill="currentColor" opacity="0.8"/>
                <rect x="8" y="36" width="20" height="20" rx="4" fill="currentColor" opacity="0.8"/>
                <rect x="36" y="36" width="20" height="20" rx="4" fill="currentColor"/>
                <circle cx="18" cy="18" r="3" fill="white"/>
                <circle cx="46" cy="18" r="3" fill="white"/>
                <circle cx="18" cy="46" r="3" fill="white"/>
                <circle cx="46" cy="46" r="3" fill="white"/>
              </svg>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">App Launcher</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-gray-600 truncate max-w-[200px]">
                    {user?.name || user?.email || 'User'}
                  </span>
                  <button
                    onClick={handleOpenSettings}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    title="Open Settings"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="hidden lg:inline">Settings</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium"
                >
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="px-2 py-2 text-sm text-gray-600 border-b border-gray-100 pb-3">
                      <span className="font-medium text-gray-900">Signed in as:</span>
                      <div className="mt-1 truncate">{user?.name || user?.email || 'User'}</div>
                    </div>
                    <button
                      onClick={handleOpenSettings}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors font-medium text-center"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl flex-1">
        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {isAuthenticated 
              ? `Welcome back${user?.name ? `, ${user.name}` : user?.email ? `, ${user.email.split('@')[0]}` : ''}!` 
              : 'Welcome to App Launcher'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {isAuthenticated 
              ? 'Launch your apps from one place'
              : 'Sign in to access your apps and launch them from one convenient place'}
          </p>
        </div>

        {/* App Slideshow - Only show for unauthenticated users */}
        {!isAuthenticated && availableApps.length > 0 && (
          <AppSlideshow apps={availableApps} />
        )}

        {/* Hero Section for Authenticated Users */}
        {isAuthenticated && (
          <div className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-lg mb-8 sm:mb-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="relative px-6 sm:px-8 md:px-16 py-12 sm:py-16 md:py-20">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="8" y="8" width="20" height="20" rx="4" fill="currentColor"/>
                    <rect x="36" y="8" width="20" height="20" rx="4" fill="currentColor" opacity="0.8"/>
                    <rect x="8" y="36" width="20" height="20" rx="4" fill="currentColor" opacity="0.8"/>
                    <rect x="36" y="36" width="20" height="20" rx="4" fill="currentColor"/>
                    <circle cx="18" cy="18" r="3" fill="white"/>
                    <circle cx="46" cy="18" r="3" fill="white"/>
                    <circle cx="18" cy="46" r="3" fill="white"/>
                    <circle cx="46" cy="46" r="3" fill="white"/>
                  </svg>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                    Your Workspace Hub
                  </h2>
                </div>
                <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-6">
                  Access all your applications from one central location. Launch, manage, and stay productive.
                </p>
                <div className="flex flex-wrap gap-4 text-white/80">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base">Quick Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base">Secure & Fast</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm sm:text-base">Organized</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
            </div>
          </div>
        )}

      {/* Assigned Apps Section - Only show for authenticated users */}
      {isAuthenticated && (
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Your Apps
          </h2>
          {isLoading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">Loading your apps...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-red-200">
              <p className="text-red-500">Error loading apps: {error}</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {assignedApplets.map((app) => (
                  <Applet
                    key={app.id}
                    app={app}
                    isAssigned={true}
                  />
                ))}
              </div>
              {assignedApplets.length === 0 && (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <p className="text-gray-500">You don't have access to any apps yet.</p>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Show all apps as unassigned for unauthenticated users */}
      {!isAuthenticated && availableApps.length > 0 && (
        <section className="mb-8 sm:mb-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
            Available Apps
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableApps.map((app) => (
              <Applet
                key={app.id}
                app={app}
                isAssigned={false}
              />
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">
              Sign in to access your assigned apps
            </p>
            <button
              onClick={handleSignIn}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg"
            >
              Sign In to Continue
            </button>
          </div>
        </section>
      )}

      {/* Upsell Section for Unassigned Apps - Only show for authenticated users */}
      {isAuthenticated && unassignedApplets.length > 0 && (
        <UpsellSection unassignedApps={unassignedApplets} />
      )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

