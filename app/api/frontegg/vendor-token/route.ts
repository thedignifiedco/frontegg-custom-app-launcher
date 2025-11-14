import { NextResponse } from 'next/server';

// Cache for vendor token
let cachedToken: { token: string; expiresAt: number } | null = null;

export async function GET() {
  try {
    const clientId = process.env.FRONTEGG_CLIENT_ID;
    const secret = process.env.FRONTEGG_SECRET;

    if (!clientId || !secret) {
      return NextResponse.json(
        { error: 'Frontegg credentials not configured' },
        { status: 500 }
      );
    }

    // Check if we have a valid cached token
    if (cachedToken && cachedToken.expiresAt > Date.now()) {
      return NextResponse.json({ token: cachedToken.token });
    }

    // Fetch new vendor token
    const response = await fetch('https://api.frontegg.com/auth/vendor/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        secret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to get vendor token:', errorText);
      return NextResponse.json(
        { error: 'Failed to get vendor token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const token = data.token || data.accessToken;

    if (!token) {
      return NextResponse.json(
        { error: 'No token in response' },
        { status: 500 }
      );
    }

    // Cache the token for 23 hours (to be safe, refresh daily)
    // expiresIn is typically in seconds, convert to milliseconds
    const expiresInSeconds = data.expiresIn || 23 * 60 * 60; // Default to 23 hours in seconds
    const expiresInMs = typeof expiresInSeconds === 'number' 
      ? expiresInSeconds * 1000 
      : 23 * 60 * 60 * 1000; // Fallback to 23 hours in milliseconds
    
    cachedToken = {
      token,
      expiresAt: Date.now() + expiresInMs,
    };

    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error getting vendor token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

