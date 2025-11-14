import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Verify user is authenticated by checking for Frontegg session cookie
    // Cookie name may be 'fe_session' or 'fe_session-{suffix}'
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    
    // Find any cookie that starts with 'fe_session'
    const sessionCookie = allCookies.find(cookie => 
      cookie.name.startsWith('fe_session')
    );
    
    if (!sessionCookie) {
      // No session cookie found - user is not authenticated
      return NextResponse.json(
        { error: 'Not authenticated. Please sign in.' },
        { status: 401 }
      );
    }

    // Get userId from query params (preferred method since cookie is encrypted)
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required. Please ensure userId is provided in the request.' },
        { status: 400 }
      );
    }

    // Get vendor token
    const vendorTokenResponse = await fetch(
      `${request.nextUrl.origin}/api/frontegg/vendor-token`,
      {
        method: 'GET',
        cache: 'no-store',
      }
    );

    if (!vendorTokenResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to get vendor token' },
        { status: 500 }
      );
    }

    const { token: vendorToken } = await vendorTokenResponse.json();

    // Get user applications from Frontegg
    const appsResponse = await fetch(
      `https://api.frontegg.com/identity/resources/applications/v1/${userId}/apps`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${vendorToken}`,
        },
      }
    );

    if (!appsResponse.ok) {
      let errorText = 'Unknown error';
      try {
        errorText = await appsResponse.text();
        console.error('Failed to get user apps:', errorText);
        // Try to parse as JSON for more details
        try {
          const errorJson = JSON.parse(errorText);
          return NextResponse.json(
            { 
              error: 'Failed to get user applications',
              details: errorJson.message || errorJson.error || errorText
            },
            { status: appsResponse.status }
          );
        } catch {
          // Not JSON, use text as is
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      return NextResponse.json(
        { 
          error: 'Failed to get user applications',
          details: errorText
        },
        { status: appsResponse.status }
      );
    }

    let appsData;
    try {
      const responseText = await appsResponse.text();
      appsData = JSON.parse(responseText);
    } catch (jsonError) {
      console.error('Failed to parse Frontegg response as JSON:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid response from Frontegg API',
          details: 'Response is not valid JSON'
        },
        { status: 500 }
      );
    }
    
    // Extract appIds from the response
    // The response structure may vary, so we handle different formats
    let appIds: string[] = [];
    
    try {
      if (Array.isArray(appsData)) {
        // If response is directly an array
        appIds = appsData
          .map((app: any) => {
            // Handle different possible structures
            if (typeof app === 'string') return app;
            if (typeof app === 'object' && app !== null) {
              return app?.appId || app?.id || app?.applicationId || app?.application?.id;
            }
            return null;
          })
          .filter((id: any): id is string => id != null && typeof id === 'string');
      } else if (appsData.apps && Array.isArray(appsData.apps)) {
        // If response has an 'apps' property that is an array
        appIds = appsData.apps
          .map((app: any) => {
            if (typeof app === 'string') return app;
            if (typeof app === 'object' && app !== null) {
              return app?.appId || app?.id || app?.applicationId || app?.application?.id;
            }
            return null;
          })
          .filter((id: any): id is string => id != null && typeof id === 'string');
      } else if (appsData.data && Array.isArray(appsData.data)) {
        // If response has a 'data' property that is an array
        appIds = appsData.data
          .map((app: any) => {
            if (typeof app === 'string') return app;
            if (typeof app === 'object' && app !== null) {
              return app?.appId || app?.id || app?.applicationId || app?.application?.id;
            }
            return null;
          })
          .filter((id: any): id is string => id != null && typeof id === 'string');
      } else if (appsData.appId) {
        // If response is a single app object
        appIds = [appsData.appId];
      } else if (appsData.id) {
        // If response has an id property
        appIds = [appsData.id];
      } else if (appsData.applicationId) {
        // If response has an applicationId property
        appIds = [appsData.applicationId];
      }
    } catch (parseError) {
      console.error('Error parsing appIds from response:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse application IDs from response',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ appIds });
  } catch (error) {
    console.error('Error getting user apps:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

