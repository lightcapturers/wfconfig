/**
 * Token Authentication Server for Google Sheets API
 * 
 * This simple Express server provides a secure endpoint for Google token authentication
 * to avoid exposing service account private keys in client-side code.
 * 
 * For production, this would be expanded with proper error handling, logging, rate limiting, etc.
 */

const express = require('express');
const { GoogleAuth } = require('google-auth-library');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5175;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Load credentials once at startup
let credentials;
try {
  const credentialsFile = path.join(__dirname, 'credentials.json');
  credentials = JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
  console.log(`Loaded credentials for: ${credentials.client_email}`);
} catch (error) {
  console.error('Error loading credentials:', error);
  process.exit(1);
}

// Create the auth client
const auth = new GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
});

// Token endpoint
app.post('/auth/google-sheets-token', async (req, res) => {
  try {
    // Optional validation of client_email from request
    const requestEmail = req.body.client_email;
    
    if (requestEmail && requestEmail !== credentials.client_email) {
      return res.status(400).json({ 
        error: 'Invalid service account email' 
      });
    }
    
    // Get the access token
    const client = await auth.getClient();
    const tokenResponse = await client.getAccessToken();
    
    console.log('Token response:', JSON.stringify(tokenResponse, null, 2));
    
    // Fixed token response handling - handle different response structures
    // The structure of tokenResponse might vary between versions of google-auth-library
    let token, expiresIn;
    
    if (typeof tokenResponse === 'string') {
      // Simple string token
      token = tokenResponse;
      expiresIn = 3600; // Default to 1 hour if not provided
    } else if (tokenResponse && typeof tokenResponse === 'object') {
      // Object with token property
      if (tokenResponse.token) {
        token = tokenResponse.token;
        
        // Try to get expiration from various possible locations
        if (tokenResponse.res && tokenResponse.res.data && tokenResponse.res.data.expires_in) {
          expiresIn = tokenResponse.res.data.expires_in;
        } else if (tokenResponse.expires_in) {
          expiresIn = tokenResponse.expires_in;
        } else {
          expiresIn = 3600; // Default to 1 hour
        }
      } else if (tokenResponse.access_token) {
        // Direct access_token property
        token = tokenResponse.access_token;
        expiresIn = tokenResponse.expires_in || 3600;
      } else {
        throw new Error('Unexpected token response format');
      }
    } else {
      throw new Error('Invalid token response');
    }
    
    if (!token) {
      throw new Error('No token found in response');
    }
    
    // Return token information to the client
    res.json({
      access_token: token,
      expires_in: expiresIn,
      token_type: 'Bearer'
    });
    
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ 
      error: 'Failed to acquire access token',
      message: error.message 
    });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Token server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});

/**
 * Installation instructions:
 * 
 * 1. Install required packages:
 *    npm install express google-auth-library cors
 * 
 * 2. Start the server:
 *    node token-server.js
 * 
 * 3. The main configurator app will be served at http://localhost:3000
 */ 