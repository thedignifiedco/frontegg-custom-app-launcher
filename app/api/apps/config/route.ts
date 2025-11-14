import { NextResponse } from 'next/server';

interface AppConfig {
  id: string;
  appId: string;
  name: string;
  description: string;
  url: string;
  icon: string;
  color: string;
}

export async function GET() {
  try {
    // Read app configurations from environment variables
    // Format: APP_TRAVEL_APPID, APP_TRAVEL_URL, APP_TRAVEL_NAME, etc.
    const apps: AppConfig[] = [];
    
    const appTypes = ['TRAVEL', 'FINTECH', 'BIOPHARMA', 'LOGISTICS'];
    
    for (const appType of appTypes) {
      const appId = process.env[`APP_${appType}_APPID`];
      const url = process.env[`APP_${appType}_URL`];
      const name = process.env[`APP_${appType}_NAME`];
      const description = process.env[`APP_${appType}_DESCRIPTION`];
      const icon = process.env[`APP_${appType}_ICON`] || '📱';
      const color = process.env[`APP_${appType}_COLOR`] || 'from-gray-500 to-gray-600';
      
      // Convert appType to lowercase for id
      const id = appType.toLowerCase();
      
      if (appId && url && name) {
        apps.push({
          id,
          appId,
          name,
          description: description || `${name} application`,
          url,
          icon,
          color,
        });
      }
    }
    
    if (apps.length === 0) {
      return NextResponse.json(
        { error: 'No app configurations found in environment variables' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ apps });
  } catch (error) {
    console.error('Error getting app config:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

