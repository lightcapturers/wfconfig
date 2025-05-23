# Wheel Configurator

A responsive web application that functions as a visual wheel configurator for Subaru vehicles. This app allows users to select their vehicle make/model/year, choose from available wheel brands, models, and finishes, and preview selected wheels on a rendered side-profile image of the car with various paint color options.

## Table of Contents

- [Features](#features)
- [Technical Implementation](#technical-implementation)
- [Data Structure](#data-structure)
- [Component Breakdown](#component-breakdown)
- [Image Handling](#image-handling)
- [Wheel Overlay System](#wheel-overlay-system)
- [Dynamic Filters](#dynamic-filters)
- [Google Sheets Integration](#google-sheets-integration)
- [Data Compression](#data-compression)
- [Admin Panel](#admin-panel)
- [Local Storage](#local-storage)
- [Setup and Installation](#setup-and-installation)
- [Google Sheets Format](#google-sheets-format)
- [Error Handling](#error-handling)
- [Known Issues and Workarounds](#known-issues-and-workarounds)
- [File Structure](#file-structure)
- [Browser Compatibility](#browser-compatibility)

## Features

### Core Functionality

1. **Vehicle Selection**
   - Dynamic Year, Make, Model selection via dropdown menus
   - Cascading filters (changing Year updates available Makes, changing Make updates Models)
   - Configurable via Google Sheets data
   - Supports multiple years, makes, and models

2. **Wheel Configuration**
   - Brand selection (currently supports Titan 7)
   - Model selection with visual grid display (TR10, TP10, TP5, TS5, TD6LE, TC5)
   - Finish selection with color swatches 
   - Real-time visual updates

3. **Paint Color Customization**
   - Color swatch selection
   - Named paint colors with visual representations
   - Supports standard Subaru colors (WRB, CBS, ISM, IR, SOP, CWP, etc.)

4. **Real-time Visual Preview**
   - Vehicle side profile with applied wheel design
   - Dynamically changing paint colors
   - Wheel overlay with proper positioning for each vehicle model
   - Single overlay image for precise wheel placement

5. **Google Sheets Integration**
   - Direct connection to Google Sheets data source
   - Automatic data refresh at configurable intervals
   - Manual refresh via admin panel
   - Service account authentication for secure access
   - Data compression for handling large datasets

6. **Admin Panel**
   - Refresh data from Google Sheets
   - View data statistics (vehicle count, wheel count)
   - Monitor storage usage
   - Toggle panel visibility

## Technical Implementation

The application is built using modern web technologies:

- **HTML5**: Structure and semantic markup
- **CSS3**: Styling, responsive design, grid and flexbox layouts
- **JavaScript (ES6+)**: Dynamic functionality, data management
- **Google Sheets API**: Data source for vehicles and wheels
- **Node.js**: Server for token authentication
- **Express**: Token server framework
- **Google Auth Library**: Secure API authentication
- **LZString**: Data compression for large datasets
- **localStorage API**: Configuration and data persistence

## Data Structure

### Vehicle Data

```javascript
{
    year: "2024",  // Vehicle year (e.g., "2022", "2023", "2024")
    make: "Subaru", // Vehicle manufacturer
    model: "WRX VB", // Full model name with generation code
    color: "Ignition Red", // Color name
    image: "path/to/image.png", // URL to vehicle image
    swatch: "#d4161c" // Color hex code
}
```

### Wheel Data

```javascript
{
    brand: "Titan 7",
    model: "TR10",
    finish: "Speedline White",
    wheelImage: "path/to/wheel.png",
    compatibleVehicles: ["WRX VB", "BRZ 22"],
    swatch: "path/to/swatch.png",
    vehicleWheelImages: {
        "WRX VB": "path/to/wrx-overlay.png",
        "BRZ 22": "path/to/brz-overlay.png"
    },
    id: "unique-identifier"
}
```

### Application State

```javascript
{
    vehicle: {
        year: "2024",
        make: "Subaru",
        model: "WRX VB", // Full model name with generation code
        color: "Ignition Red"
    },
    wheel: {
        brand: "Titan 7",
        model: "TR10",
        finish: "Speedline White"
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 8,
        totalPages: 1
    },
    isLoading: false
}
```

## Component Breakdown

### 1. Header
- Logo and copyright information
- Spans full width of the application

### 2. Vehicle Selection Panel
- Year, Make, Model dropdowns with dynamic filtering
- Apply and Change buttons
- Current vehicle title display

### 3. Configuration Panel (left side)
- Brand selection dropdown
- Wheel model grid with images
- Finish swatch selection
- Current finish display

### 4. Preview Panel (right side)
- Vehicle image with wheel overlay
- Paint color swatches
- Current paint color display

### 5. Admin Panel (bottom-right corner)
- Refresh data button
- Data statistics display
- Storage usage monitor
- Status messages

## Image Handling

The application can handle images from multiple sources:

1. **Local Images**: Direct paths to images in the project directory
2. **Remote Images**: URLs to images hosted elsewhere (ImgBB used for fallbacks)
3. **Google Drive Images**: Support for Google Drive shared links
4. **Shopify Images**: Support for Shopify-hosted images

### Fallback Mechanism

The application includes comprehensive fallback mechanisms:

1. Error handlers for image loading failures
2. Fallback placeholder images 
3. HTML `onerror` attributes for immediate handling
4. CORS support with `crossorigin="anonymous"` attribute

## Wheel Overlay System

The application uses a single overlay image system to display wheels on vehicles:

### How It Works:

1. **Vehicle-Specific Overlays**: Each wheel has specific overlay images for each compatible vehicle model stored in the `vehicleWheelImages` property.

2. **HTML Structure**:
   ```html
   <div class="vehicle-preview">
       <img id="vehicle-image" src="..." alt="Vehicle Preview">
       <div class="wheel-overlay">
           <img id="wheel-overlay-image" src="" alt="Wheel Overlay" crossorigin="anonymous">
       </div>
   </div>
   ```

3. **CSS Positioning**:
   The wheel overlay is positioned absolutely over the vehicle image with appropriate z-index to ensure proper stacking.

4. **Dynamic Loading**:
   When a wheel is selected, the system:
   - Finds the appropriate overlay image for the current vehicle model
   - Clears any previous image to force reload
   - Applies the new overlay image with a short timeout to avoid caching issues
   - Handles any loading errors with detailed logging

## Dynamic Filters

The application implements cascading filters for year, make, and model selection:

1. **Filter Chain**:
   - Changing the year filters the available makes
   - Changing the make filters the available models
   - Each selection narrows down the options in dependent dropdowns

2. **Model Name Handling**:
   - The application maintains full model names with generation codes internally
   - This ensures proper matching with wheel overlay images which are keyed by full model names

## Google Sheets Integration

The application connects directly to Google Sheets for its data:

### Architecture:

1. **Token Server**: A Node.js/Express server that securely handles Google API authentication without exposing credentials in client-side code.

2. **Service Account**: Uses Google Service Account for secure, server-side authentication without requiring user login.

3. **Google Sheets API**: Fetches data directly from configured sheets using the Sheets API v4.

4. **Configuration**: Simple configuration file (`sheets-config.js`) with spreadsheet IDs and ranges.

5. **Auto-Refresh**: Configurable auto-refresh interval to keep data current.

### Security:

- Private keys never exposed in client-side code
- Token generation happens server-side
- Authentication tokens are temporary and auto-refreshed
- Read-only access to spreadsheets

For detailed setup instructions, see [Google Sheets Setup](GOOGLE_SHEETS_SETUP.md).

## Data Compression

To handle large datasets that might exceed browser storage limits:

1. **Automatic Detection**: The system monitors data size and automatically enables compression when needed.

2. **LZString Compression**: Uses the LZString library to compress data before storing in localStorage.

3. **Compression Ratio**: Typically achieves 40-70% size reduction.

4. **Transparent Usage**: The application seamlessly handles compressed data without affecting the user experience.

5. **Storage Monitoring**: The admin panel displays storage usage to help identify potential issues.

## Admin Panel

The admin panel provides tools for managing the application data:

1. **Data Refresh**: Manual refresh button to fetch the latest data from Google Sheets.

2. **Statistics**: Displays vehicle count, wheel count, and last refresh time.

3. **Storage Usage**: Shows current localStorage usage.

4. **Status Messages**: Provides feedback on operations and errors.

5. **Auto-Refresh**: Can be configured to automatically refresh data at specified intervals.

6. **Collapsible UI**: Can be minimized to avoid interfering with the main interface.

## Local Storage

The application uses localStorage for data persistence:

1. **Data Storage**: Stores vehicle and wheel data (compressed when necessary)
2. **Configuration**: Saves the last selected vehicle and wheel options
3. **Refresh Tracking**: Records when data was last refreshed
4. **Compression Flags**: Tracks whether data is stored in compressed format

Data is loaded on startup and automatically saved when updated.

## Setup and Installation

### Option 1: Basic Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure Google Sheets integration:
   - Update `sheets-config.js` with your spreadsheet IDs
   - Ensure your service account credentials are in `credentials.json`
4. Start the token server:
   ```
   node token-server.js
   ```
5. Access the app at http://localhost:3000

### Option 2: Environment Variables

For more flexibility, you can use environment variables:

```bash
PORT=4000 SHEETS_ID=your_spreadsheet_id node token-server.js
```

## Google Sheets Format

### Vehicle Sheet Format

Your vehicle sheet must have these columns in the first row:
- **Year**: Vehicle year (e.g., "2022", "2023", "2024")
- **Make**: Vehicle manufacturer (e.g., "Subaru")
- **Model**: Vehicle model with generation code (e.g., "WRX VB")
- **Color**: Color name (e.g., "World Rally Blue")
- **Image**: URL to side-profile image of the vehicle
- **Swatch**: Color hex code (e.g., "#004aad")

### Wheel Sheet Format

Your wheel sheet must have these columns in the first row:
- **Brand**: Wheel manufacturer (e.g., "Titan 7")
- **Model**: Wheel model (e.g., "TR10")
- **Finish**: Finish name (e.g., "Speedline White")
- **Wheel Image**: URL to wheel image (transparent PNG recommended)
- **Swatch**: URL to color swatch image
- **ID**: Unique identifier
- **Vehicle model columns**: Use vehicle model names as column headers with URLs for vehicle-specific overlay images

For example, if you have a "WRX VB" vehicle model, you should have a column named "WRX VB" with wheel overlay image URLs for each wheel.

## Error Handling

The application includes robust error handling:

1. **Network Errors**:
   - Failed API requests with detailed error messages
   - Token refresh on authentication failures
   - Retry mechanisms for transient errors

2. **Data Processing Errors**:
   - Validation of response data
   - Fallback to cached data when errors occur
   - Detailed error logging in the console

3. **Storage Errors**:
   - Automatic compression when storage limits are reached
   - Graceful degradation when compression isn't enough
   - Clear error messages in the admin panel

4. **Image Loading Errors**:
   - Fallback images for vehicles and wheels
   - Detailed error logging for failed image loads
   - CORS handling with crossorigin attributes

## Known Issues and Workarounds

### 1. Cross-Origin Resource Sharing (CORS)

**Issue**: Images hosted on external domains may have CORS restrictions preventing direct embedding.

**Workarounds**:
- Using `crossorigin="anonymous"` attribute on image elements
- Using proxy services for specific platforms like Google Drive
- Clearing image source before setting new URL to force reload
- Delayed image loading with setTimeout

### 2. Google Drive Image Access

**Issue**: Google Drive shared links have CORS restrictions preventing direct embedding.

**Workarounds**:
- Using appropriate proxy services 
- Fallback to placeholder images
- Alternative: could use Google Drive thumbnail API (`drive.google.com/thumbnail?id=FILE_ID`)

### 3. Storage Limitations

**Issue**: Browser localStorage has a 5-10MB limit depending on the browser.

**Workaround**: Data compression with LZString automatically activates when needed.

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
├── README.md               # This documentation
└── GOOGLE_SHEETS_SETUP.md  # Detailed Google Sheets setup guide
```

## Browser Compatibility

The wheel configurator is tested and compatible with:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is licensed under the MIT License - see the LICENSE file for details. # wfconfig
# wfconfig
