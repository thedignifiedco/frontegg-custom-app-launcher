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

    // Get tenantId from query params (extracted from user's JWT token on client side)
    const tenantId = request.nextUrl.searchParams.get('tenantId');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID is required. Please ensure tenantId is provided in the request.' },
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

    // Get user applications from Frontegg using tenant assignments endpoint
    const appsResponse = await fetch(
      'https://api.frontegg.com/applications/resources/applications/tenant-assignments/v1',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vendorToken}`,
          'frontegg-tenant-id': tenantId,
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
    // Response format: [{ tenantId: "...", appIds: [...] }]
    let appIds: string[] = [];
    
    try {
      if (Array.isArray(appsData) && appsData.length > 0) {
        // Response is an array of tenant assignment objects
        // Find the assignment for the requested tenantId (should be the first one, but check to be safe)
        const tenantAssignment = appsData.find((assignment: any) => 
          assignment?.tenantId === tenantId
        ) || appsData[0]; // Fallback to first item if not found
        
        if (tenantAssignment?.appIds && Array.isArray(tenantAssignment.appIds)) {
          appIds = tenantAssignment.appIds.filter((id: any): id is string => 
            id != null && typeof id === 'string'
          );
        }
      } else if (appsData?.appIds && Array.isArray(appsData.appIds)) {
        // Handle case where response might be a single object
        appIds = appsData.appIds.filter((id: any): id is string => 
          id != null && typeof id === 'string'
        );
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

