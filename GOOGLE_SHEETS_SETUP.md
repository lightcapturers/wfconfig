# Google Sheets Integration Setup

This document explains how to set up and use the Google Sheets integration for the Wheel Configurator app.

## Prerequisites

1. A Google account with access to Google Sheets
2. A Google Cloud Platform project with the Google Sheets API enabled
3. A Service Account with access to your Google Sheets

## Step 1: Configure the sheets-config.js file

Open the `sheets-config.js` file and update the following values:

```javascript
const SHEETS_CONFIG = {
  // API Key is optional when using service accounts with the token server
  apiKey: '', // Can be left empty
  
  // Vehicle data sheet
  vehicleSheetId: 'YOUR_SPREADSHEET_ID', // The ID from your sheet URL
  vehicleRange: 'Vehicles', // Just use the sheet name to get all data
  
  // Wheel data sheet (can be the same spreadsheet, different tab)
  wheelSheetId: 'YOUR_SPREADSHEET_ID', // The ID from your sheet URL
  wheelRange: 'Wheels', // Just use the sheet name to get all data
  
  // How often to auto-refresh data (in milliseconds)
  autoRefreshInterval: 3600000 // 1 hour
};
```

### Finding your Spreadsheet ID

The spreadsheet ID is in the URL of your Google Sheet:
`https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### API Key (Optional)

With our token server implementation using service accounts, you don't need an API key. You can leave this field empty.

## Step 2: Set up the token server

The token server handles the authentication with Google's servers using your service account credentials without exposing private keys in client-side code.

1. Install dependencies:
   ```
   npm install express google-auth-library cors
   ```

2. Make sure your `credentials.json` file is in the root directory.

3. Start the server:
   ```
   node token-server.js
   ```

   Or to specify a custom port:
   ```
   PORT=4000 node token-server.js
   ```

The app will be served at http://localhost:3000 (or your specified port)

## Step 3: Share your Google Sheets with the Service Account

1. Open your Google Sheet
2. Click the "Share" button
3. Add the service account email from your `credentials.json` file:
   ```
   "client_email": "your-service-account@project-id.iam.gserviceaccount.com"
   ```
4. Give it "Viewer" access (read-only)

## Step 4: Format your Google Sheets

### Vehicle Sheet Format

The vehicle sheet should have these columns in the first row (header row):
- Year
- Make
- Model
- Color
- Image (URL to the vehicle image)
- Swatch (Color hex code e.g., #ff0000)

### Wheel Sheet Format

The wheel sheet should have these columns in the first row:
- Brand
- Model
- Finish
- Wheel Image (URL to wheel thumbnail)
- Swatch (URL to finish swatch image)
- ID (optional identifier)
- Additional columns with model names as headers and wheel overlay image URLs as values

For example, if you have a "WRX VB" vehicle model, you should have a column named "WRX VB" with wheel overlay image URLs for each wheel.

## Using the Admin Panel

The admin panel appears in the bottom-right corner of the app and provides these capabilities:

1. **Refresh Data**: Manually fetch the latest data from Google Sheets
2. **View Stats**: 
   - Last refresh time
   - Number of vehicles loaded
   - Number of wheels loaded
   - Total storage used in browser
3. **Auto-Refresh**: If configured, the app will automatically refresh data at the specified interval

### Data Compression

The app automatically compresses large datasets using LZString compression when they exceed browser storage limits. This allows the app to handle much larger wheel and vehicle datasets without issues.

When compression is active, you'll see:
- A warning message in the admin panel
- Storage statistics showing the compressed size
- Console logs with compression ratios

## Troubleshooting

If you experience issues:

1. **Check the browser console** for error messages (F12 → Console tab)
2. **Verify service account access**:
   - Ensure your service account email has access to the sheets
   - Check credentials.json is properly formatted and in the root directory
3. **Check connectivity**:
   - Make sure the token server is running
   - Look for network errors in the browser console
4. **Storage issues**:
   - If you see "Storage limit exceeded" errors even with compression enabled, your dataset may be too large
   - Try splitting your data across multiple sheets or removing unnecessary columns
5. **Token server issues**:
   - Check if the server is running on the expected port
   - Look for errors in the terminal where the server is running

## File Structure

```
wheel-configurator/
├── index.html              # Main application page
├── styles.css              # CSS styling
├── script.js               # Main application logic
├── google-sheets-api.js    # Google Sheets API integration
├── admin-panel.js          # Admin panel UI and functionality
├── token-server.js         # Server for secure API authentication
├── sheets-config.js        # Configuration for Google Sheets
├── credentials.json        # Service account credentials (private)
├── package.json            # Node.js dependencies
└── GOOGLE_SHEETS_SETUP.md  # This documentation
``` 