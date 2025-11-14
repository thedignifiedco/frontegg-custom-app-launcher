# App Launcher

A Next.js application that serves as an app launcher, presenting authenticated users with applets for all the apps they are assigned to. Built with Frontegg authentication.

## Features

- 🔐 **Frontegg Authentication**: Secure user authentication using Frontegg's Next.js SDK
- 📱 **App Launcher Interface**: Beautiful, modern UI displaying applets for assigned apps
- 🎯 **Smart App Assignment**: Shows assigned apps and greys out unassigned ones
- 💡 **Upsell Section**: Promotes unassigned apps with request access functionality
- 🎨 **Modern Design**: Responsive design with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Frontegg account with your subdomain, client ID, and app ID

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Create a `.env.local` file in the root directory with your Frontegg credentials and app configurations:

```env
FRONTEGG_APP_URL='http://localhost:3000'
FRONTEGG_BASE_URL='https://[YOUR_SUBDOMAIN].frontegg.com'
FRONTEGG_CLIENT_ID='[YOUR_CLIENT_ID]'
FRONTEGG_APP_ID='[YOUR_APP_ID]'
FRONTEGG_SECRET='[YOUR_CLIENT_SECRET]'
FRONTEGG_ENCRYPTION_PASSWORD='[64_CHAR_SESSION_ENCRYPTION_PASSWORD]'
FRONTEGG_COOKIE_NAME='fe_session'
FRONTEGG_HOSTED_LOGIN='true'

# App Configurations
# Define your apps with their Frontegg appIds and URLs
APP_TRAVEL_APPID='[YOUR_TRAVEL_APP_ID]'
APP_TRAVEL_URL='[YOUR_TRAVEL_APP_URL]'
APP_TRAVEL_NAME='[YOUR_TRAVEL_APP_NAME]'
APP_TRAVEL_DESCRIPTION='[YOUR_TRAVEL_APP_DESCRIPTION]'
APP_TRAVEL_ICON='[YOUR_TRAVEL_APP_ICON]'
APP_TRAVEL_COLOR='from-blue-500 to-blue-600'

APP_FINTECH_APPID='[YOUR_FINTECH_APP_ID]'
APP_FINTECH_URL='[YOUR_FINTECH_APP_URL]'
APP_FINTECH_NAME='[YOUR_FINTECH_APP_NAME]'
APP_FINTECH_DESCRIPTION='[YOUR_FINTECH_APP_DESCRIPTION]'
APP_FINTECH_ICON='[YOUR_FINTECH_APP_ICON]'
APP_FINTECH_COLOR='from-green-500 to-green-600'

APP_BIOPHARMA_APPID='[YOUR_BIOPHARMA_APP_ID]'
APP_BIOPHARMA_URL='[YOUR_BIOPHARMA_APP_URL]'
APP_BIOPHARMA_NAME='[YOUR_BIOPHARMA_APP_NAME]'
APP_BIOPHARMA_DESCRIPTION='[YOUR_BIOPHARMA_APP_DESCRIPTION]'
APP_BIOPHARMA_ICON='[YOUR_BIOPHARMA_APP_ICON]'
APP_BIOPHARMA_COLOR='from-purple-500 to-purple-600'

APP_LOGISTICS_APPID='[YOUR_LOGISTICS_APP_ID]'
APP_LOGISTICS_URL='[YOUR_LOGISTICS_APP_URL]'
APP_LOGISTICS_NAME='[YOUR_LOGISTICS_APP_NAME]'
APP_LOGISTICS_DESCRIPTION='[YOUR_LOGISTICS_APP_DESCRIPTION]'
APP_LOGISTICS_ICON='[YOUR_LOGISTICS_APP_ICON]'
APP_LOGISTICS_COLOR='from-orange-500 to-orange-600'
```

**Important**: 
- You need to add `FRONTEGG_SECRET` which is your Frontegg client secret. This is used to authenticate API requests to Frontegg's backend.
- App configurations (appIds and URLs) are stored in environment variables for security. The app configuration is loaded from the server-side API route `/api/apps/config` to keep sensitive data secure.

To generate a secure 64-character encryption password, run:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## App Configuration

App configurations (appIds, URLs, names, etc.) are stored securely in environment variables. You can configure any number of apps by adding the appropriate environment variables.

### Adding or Modifying Apps

To add or modify apps, update the environment variables in your `.env.local` file. The format is:
- `APP_{APP_TYPE}_APPID` - The Frontegg application ID
- `APP_{APP_TYPE}_URL` - The URL to launch the app
- `APP_{APP_TYPE}_NAME` - Display name for the app
- `APP_{APP_TYPE}_DESCRIPTION` - Description of the app
- `APP_{APP_TYPE}_ICON` - Emoji icon (optional, defaults to 📱)
- `APP_{APP_TYPE}_COLOR` - Tailwind CSS gradient classes (optional, defaults to gray)

The `{APP_TYPE}` should be uppercase (e.g., `TRAVEL`, `FINTECH`, etc.). The app ID will be converted to lowercase for internal use (e.g., `TRAVEL` becomes `travel`).

### How App Assignment Works

The app launcher automatically fetches the user's assigned applications from Frontegg's API:

1. When a user logs in, the app makes a request to `/api/frontegg/user-apps`
2. This API route:
   - Extracts the user ID from the JWT token in the session cookie
   - Fetches a vendor token from Frontegg (cached for 23 hours)
   - Calls Frontegg's "Get Applications for User" endpoint
   - Returns the list of appIds assigned to the user
3. The appIds are mapped to the corresponding apps and displayed

The vendor token is automatically cached and refreshed daily to minimize API calls.

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with Frontegg provider
│   ├── page.tsx            # Main page with authentication check
│   └── globals.css         # Global styles
├── components/
│   ├── AppLauncher.tsx     # Main launcher component
│   ├── Applet.tsx          # Individual applet component
│   └── UpsellSection.tsx   # Upsell section for unassigned apps
└── frontegg.config.ts      # Frontegg configuration (deprecated, using env vars)
```

## Customization


### Styling

The app uses Tailwind CSS. Modify the component files to customize colors, spacing, and layout.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Frontegg Next.js SDK](https://developers.frontegg.com/sdks/frontend/next)
- [Tailwind CSS](https://tailwindcss.com/docs)

## License

MIT
