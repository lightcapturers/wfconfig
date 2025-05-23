/**
 * Google Sheets API Integration for Wheel Configurator
 * Uses Google Service Account for direct access to sheet data
 */

class GoogleSheetsConnector {
  constructor(credentials, config) {
    this.credentials = credentials;
    this.config = config;
    this.tokenExpiration = 0;
    this.accessToken = null;
    this.initTime = Date.now();
    
    // Load credentials if provided as a string
    if (typeof this.credentials === 'string') {
      try {
        this.credentials = JSON.parse(this.credentials);
      } catch (error) {
        console.error('Error parsing credentials:', error);
        throw new Error('Invalid credentials format');
      }
    }
  }

  /**
   * Get an access token using service account credentials
   * This uses the JWT token flow for service accounts
   */
  async getAccessToken() {
    // Use existing token if still valid (with 5-minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiration - 300000) {
      return this.accessToken;
    }
    
    try {
      // For service accounts, we need to create a JWT and sign it
      const jwtHeader = {
        alg: 'RS256',
        typ: 'JWT'
      };
      
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 3600; // 1 hour
      
      const jwtClaimSet = {
        iss: this.credentials.client_email,
        scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
        aud: this.credentials.token_uri,
        exp: now + expiresIn,
        iat: now
      };
      
      // Encode JWT parts
      const encodedHeader = btoa(JSON.stringify(jwtHeader));
      const encodedClaimSet = btoa(JSON.stringify(jwtClaimSet));
      
      // In a real implementation, we'd sign the JWT here, but we can't do it in the browser
      // Instead, we'll use a server-side endpoint for token acquisition
      
      // For demonstration, simulate the token response
      // In production, replace with actual token endpoint call
      console.log('Getting new access token for service account:', this.credentials.client_email);
      
      const response = await fetch('/auth/google-sheets-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_email: this.credentials.client_email,
          // DO NOT include private_key in client-side requests
          // We're just sending the email to identify which service account to use
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Token acquisition failed: ${response.status} ${response.statusText} - ${errorData.message || errorData.error || 'Unknown error'}`);
      }
      
      const tokenData = await response.json();
      
      if (!tokenData.access_token) {
        throw new Error('No access token received from server');
      }
      
      this.accessToken = tokenData.access_token;
      
      // Calculate token expiration time
      const expirationSeconds = tokenData.expires_in || 3600; // Default to 1 hour if not specified
      this.tokenExpiration = Date.now() + (expirationSeconds * 1000);
      
      console.log(`Token acquired successfully. Expires in ${Math.floor(expirationSeconds / 60)} minutes`);
      
      return this.accessToken;
    } catch (error) {
      console.error('Error acquiring access token:', error);
      throw error;
    }
  }

  /**
   * Fetch data from Google Sheets
   */
  async fetchSheetData(spreadsheetId, range) {
    try {
      const token = await this.getAccessToken();
      // Remove the API key parameter - it's not needed when using OAuth token
      
      // Ensure we fetch all columns by appending ":Z" to the range if it doesn't specify a column range
      // This extends the range to column Z which should be more than enough
      let fullRange = range;
      if (!range.includes(':') && !range.match(/[A-Z]+[0-9]*$/)) {
        // If range is just a sheet name without any columns specified, append ":Z"
        fullRange = `${range}!A:Z`;
        console.log(`Expanding range to ensure all columns are fetched: ${fullRange}`);
      }
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${fullRange}`;
      
      console.log(`Fetching sheet data: ${spreadsheetId} - ${fullRange}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Google Sheets API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.values) {
        console.warn('No values found in sheet response:', data);
        return { values: [] }; // Return empty values array to prevent errors downstream
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }
  
  /**
   * Get vehicle data from Google Sheets
   */
  async getVehicleData() {
    try {
      const data = await this.fetchSheetData(
        this.config.vehicleSheetId,
        this.config.vehicleRange
      );
      
      if (!data.values || data.values.length < 2) {
        console.warn('No vehicle data found or insufficient rows in the vehicle sheet');
        return [];
      }
      
      return this.processVehicleData(data.values);
    } catch (error) {
      console.error('Error getting vehicle data:', error);
      throw error;
    }
  }
  
  /**
   * Get wheel data from Google Sheets
   */
  async getWheelData() {
    try {
      const data = await this.fetchSheetData(
        this.config.wheelSheetId,
        this.config.wheelRange
      );
      
      if (!data.values || data.values.length < 2) {
        console.warn('No wheel data found or insufficient rows in the wheel sheet');
        return [];
      }
      
      return this.processWheelData(data.values);
    } catch (error) {
      console.error('Error getting wheel data:', error);
      throw error;
    }
  }
  
  /**
   * Process vehicle data similar to CSVParser
   */
  processVehicleData(rows) {
    if (!rows || rows.length < 2) {
      console.warn('No vehicle data found in the sheet');
      return [];
    }
    
    const headers = rows[0];
    console.log('Google Sheets vehicle data headers:', headers);
    
    // Check for different possible header names for the lower image
    const possibleLowerHeaders = ['Lower Image', 'LowerImage', 'Lower_Image', 'Lower'];
    let lowerImageHeader = null;
    
    for (const headerName of possibleLowerHeaders) {
      if (headers.includes(headerName)) {
        lowerImageHeader = headerName;
        console.log(`Found lower image header: "${headerName}" at index ${headers.indexOf(headerName)}`);
        break;
      }
    }
    
    if (!lowerImageHeader) {
      console.warn('No lower image header found. Available headers:', headers);
    }
    
    // Track vehicles with lower images for debugging
    let vehiclesWithLowerImages = 0;
    let debugCount = 0;
    
    const data = rows.slice(1).map(row => {
      // Create a mapping of header to value
      const item = {};
      headers.forEach((header, index) => {
        item[header] = index < row.length ? row[index] : '';
      });
      
      // Try to find the lower image value using the detected header or fallbacks
      let lowerImageValue = '';
      if (lowerImageHeader) {
        lowerImageValue = item[lowerImageHeader] || '';
      } else {
        // Try each possible header as a fallback
        for (const headerName of possibleLowerHeaders) {
          if (item[headerName]) {
            lowerImageValue = item[headerName];
            break;
          }
        }
      }
      
      // Map to the expected vehicle data format - using the same structure as CSVParser
      const vehicle = {
        year: item.Year || '',
        make: item.Make || '',
        model: item.Model || '',
        color: item.Color || '',
        image: item.Image || '',
        swatch: item.Swatch || '',
        lowerImage: lowerImageValue
      };
      
      // Log the first few vehicles to check lower image
      if (debugCount < 3) {
        console.log(`Vehicle ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.color} - Lower Image: "${vehicle.lowerImage}"`);
        debugCount++;
      }
      
      // Count vehicles with lower images
      if (vehicle.lowerImage && vehicle.lowerImage.trim() !== '') {
        vehiclesWithLowerImages++;
      }
      
      return vehicle;
    });
    
    console.log(`Processed ${data.length} vehicles from Google Sheets, ${vehiclesWithLowerImages} with lower images`);
    return data;
  }
  
  /**
   * Process wheel data similar to CSVParser
   */
  processWheelData(rows) {
    if (!rows || rows.length < 2) {
      console.warn('No wheel data found in the sheet');
      return [];
    }
    
    const headers = rows[0];
    
    return rows.slice(1).filter(row => row.length > 0).map(row => {
      // Create a mapping of header to value
      const item = {};
      headers.forEach((header, index) => {
        item[header] = index < row.length ? row[index] : '';
      });
      
      // Extract compatible vehicles and wheel images
      const vehicleWheelImages = {};
      const compatibleVehicles = [];
      
      headers.forEach((header, index) => {
        // Columns that aren't standard properties are vehicle models with overlay image URLs
        // This matches the exact behavior in CSVParser.processWheelData
        if (!['Brand', 'Model', 'Finish', 'Wheel Image', 'Swatch', 'ID'].includes(header) && 
            index < row.length && row[index]) {
          vehicleWheelImages[header] = row[index];
          compatibleVehicles.push(header);
        }
      });
      
      // Map to the expected wheel data format - using the same structure as CSVParser
      return {
        brand: item.Brand || '',
        model: item.Model || '',
        finish: item.Finish || '',
        wheelImage: item['Wheel Image'] || '', // Thumbnail image
        swatch: item.Swatch || '',
        id: item.ID || '',
        compatibleVehicles,
        vehicleWheelImages  // Map of vehicle model to overlay image URL
      };
    });
  }
} 