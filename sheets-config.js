/**
 * Google Sheets Configuration
 * 
 * Contains the IDs and ranges for the Google Sheets that power the wheel configurator
 * Update this file with your own spreadsheet IDs and ranges
 */

const SHEETS_CONFIG = {
  // API Key is optional when using service accounts
  // Only needed if not using the token server
  apiKey: '', // Can be left empty when using service account authentication
  
  // Vehicle data sheet
  vehicleSheetId: '1JT1Egr4dPyhml-ElL2-YIZczxjBamtpfbnaZ-qUg2yo', // Replace with your spreadsheet ID
  vehicleRange: 'Vehicles!A:G', // Adjust range as needed
  
  // Wheel data sheet (can be the same spreadsheet, different tab)
  wheelSheetId: '1JT1Egr4dPyhml-ElL2-YIZczxjBamtpfbnaZ-qUg2yo', // Replace with your spreadsheet ID
  wheelRange: 'Wheels!A:ZZ', // Adjust range as needed
  
  // How often to auto-refresh data (in milliseconds)
  // Set to 0 to disable auto-refresh
  autoRefreshInterval: 3600000 // 1 hour
}; 