/**
 * Admin Panel for Wheel Configurator
 * Provides interface for refreshing data from Google Sheets
 */

class AdminPanel {
  constructor(sheetsConnector) {
    this.sheetsConnector = sheetsConnector;
    this.lastRefresh = localStorage.getItem('lastDataRefresh') 
      ? new Date(parseInt(localStorage.getItem('lastDataRefresh'))) 
      : null;
    this.isPanelCreated = false;
    this.isRefreshing = false;
    this.maxStorageSize = 4.5 * 1024 * 1024; // ~4.5MB recommended max for localStorage
  }
  
  /**
   * Create and initialize the admin panel UI
   */
  createAdminUI() {
    // Don't create panel if it already exists
    if (this.isPanelCreated) return;
    
    // Create a hidden status element for internal use but don't display it
    const statusElement = document.createElement('div');
    statusElement.id = 'admin-status';
    statusElement.className = 'admin-status';
    statusElement.style.display = 'none';
    document.body.appendChild(statusElement);
    
    // Mark panel as created without showing UI
    this.isPanelCreated = true;
    
    // No longer auto refresh data on initial page load since we use the loading page now
  }
  
  /**
   * Add CSS styles for the admin panel
   */
  addAdminStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .admin-panel {
        position: fixed;
        bottom: 0;
        right: 0;
        width: 300px;
        background: rgba(0, 0, 0, 0.85);
        color: white;
        border-top-left-radius: 8px;
        z-index: 9999;
        transition: all 0.3s ease;
        font-family: 'Inter', Arial, sans-serif;
        box-shadow: 0 -3px 10px rgba(0, 0, 0, 0.2);
      }
      
      .admin-panel-collapsed {
        transform: translateY(calc(100% - 40px));
      }
      
      .admin-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: #222;
        border-top-left-radius: 8px;
        cursor: pointer;
      }
      
      .admin-header h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 500;
      }
      
      .admin-header-controls {
        display: flex;
        gap: 8px;
      }
      
      .admin-body {
        padding: 12px;
        max-height: 80vh;
        overflow-y: auto;
      }
      
      .admin-btn {
        background: #40B4B4;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      
      .admin-btn:hover {
        background: #36a0a0;
      }
      
      .admin-stat {
        margin-bottom: 8px;
        font-size: 12px;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 5px;
      }
      
      .admin-status {
        padding: 8px;
        margin-top: 12px;
        border-radius: 4px;
        font-size: 12px;
        display: none;
      }
      
      .admin-status.loading {
        display: block;
        background: #2196F3;
      }
      
      .admin-status.success {
        display: block;
        background: #4CAF50;
      }
      
      .admin-status.error {
        display: block;
        background: #F44336;
      }
      
      .admin-status.info {
        display: block;
        background: #607D8B;
      }
      
      .admin-status.warning {
        display: block;
        background: #FF9800;
      }
      
      /* Animation for refresh button when refreshing */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .admin-btn.refreshing {
        position: relative;
        padding-left: 24px;
        pointer-events: none;
        opacity: 0.8;
      }
      
      .admin-btn.refreshing::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 50%;
        margin-top: -6px;
        width: 12px;
        height: 12px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Setup event listeners for admin panel controls
   */
  setupEventListeners() {
    // Refresh data button
    document.getElementById('refresh-data-btn').addEventListener('click', () => {
      this.refreshData();
    });
    
    // Toggle panel visibility button
    document.getElementById('toggle-admin-panel').addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePanel();
    });
    
    // Click on header to toggle panel
    document.querySelector('.admin-header').addEventListener('click', (e) => {
      // Don't toggle if clicking on a button
      if (!e.target.closest('button')) {
        this.togglePanel();
      }
    });
  }
  
  /**
   * Refresh data from Google Sheets
   */
  async refreshData() {
    // Prevent multiple refreshes at once
    if (this.isRefreshing) return;
    
    this.isRefreshing = true;
    const refreshBtn = document.getElementById('refresh-data-btn');
    refreshBtn.textContent = 'Refreshing...';
    refreshBtn.classList.add('refreshing');
    
    try {
      this.setStatus('Refreshing data from Google Sheets...', 'loading');
      
      // Fetch vehicle data
      this.setStatus('Fetching vehicle data...', 'loading');
      const vehicleData = await this.sheetsConnector.getVehicleData();
      
      // Debug - check for Lower Image field in vehicle data
      console.log('Sample vehicle data after fetch:');
      if (vehicleData.length > 0) {
        const sample = vehicleData.slice(0, 3); // Get first 3 vehicles
        sample.forEach(v => {
          console.log(`${v.year} ${v.make} ${v.model} ${v.color} - Lower Image: "${v.lowerImage}"`);
        });
        
        // Count vehicles with Lower Image
        const withLowerImage = vehicleData.filter(v => v.lowerImage && v.lowerImage.trim() !== '').length;
        console.log(`Vehicles with Lower Image: ${withLowerImage} out of ${vehicleData.length}`);
      }
      
      // Fetch wheel data
      this.setStatus('Fetching wheel data...', 'loading');
      const wheelData = await this.sheetsConnector.getWheelData();
      
      // Check data sizes before saving
      const vehicleDataStr = JSON.stringify(vehicleData);
      const wheelDataStr = JSON.stringify(wheelData);
      
      const vehicleDataSize = this.getStringSizeInBytes(vehicleDataStr);
      const wheelDataSize = this.getStringSizeInBytes(wheelDataStr);
      const totalSize = vehicleDataSize + wheelDataSize;
      
      console.log(`Data sizes: Vehicles: ${this.formatBytes(vehicleDataSize)}, Wheels: ${this.formatBytes(wheelDataSize)}, Total: ${this.formatBytes(totalSize)}`);
      
      if (totalSize > this.maxStorageSize) {
        this.setStatus(`Warning: Data size (${this.formatBytes(totalSize)}) exceeds recommended localStorage limit. Using compression.`, 'warning');
        
        // Try to compress data before storing
        try {
          this.saveCompressedData('vehicleData', vehicleData);
          this.saveCompressedData('wheelData', wheelData);
        } catch (storageError) {
          console.error('Storage error:', storageError);
          this.setStatus(`Error: Could not save data. Browser storage limit exceeded. Try reducing the data size.`, 'error');
          
          // Still update the UI with what we have
          setTimeout(() => {
            this.reloadAppData();
          }, 2000);
          
          throw new Error('Storage limit exceeded');
        }
      } else {
        // Save to localStorage normally
        localStorage.setItem('vehicleData', vehicleDataStr);
        localStorage.setItem('wheelData', wheelDataStr);
      }
      
      // Update last refresh time
      this.lastRefresh = new Date();
      localStorage.setItem('lastDataRefresh', this.lastRefresh.getTime().toString());
      
      // Update stats
      this.updateStats();
      
      this.setStatus(`Data refreshed successfully! ${vehicleData.length} vehicles and ${wheelData.length} wheels loaded.`, 'success');
      
      // Reload the page data without fully refreshing
      this.reloadAppData();
      
    } catch (error) {
      console.error('Error refreshing data:', error);
      
      if (error.message.includes('Storage limit exceeded')) {
        // Already handled above
      } else {
        this.setStatus(`Failed to refresh data: ${error.message}`, 'error');
      }
    } finally {
      // Reset UI state
      this.isRefreshing = false;
      refreshBtn.textContent = 'Refresh Data';
      refreshBtn.classList.remove('refreshing');
    }
  }
  
  /**
   * Calculate string size in bytes
   */
  getStringSizeInBytes(str) {
    return new Blob([str]).size;
  }
  
  /**
   * Format bytes to human-readable format
   */
  formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
  
  /**
   * Save data with LZString compression to avoid localStorage limits
   */
  saveCompressedData(key, data) {
    try {
      // Check if LZString is available
      if (typeof LZString === 'undefined') {
        // Load LZString if not available
        this.loadLZString().then(() => {
          this.saveCompressedData(key, data);
        });
        return;
      }
      
      const compressed = LZString.compressToUTF16(JSON.stringify(data));
      localStorage.setItem(key + '_compressed', compressed);
      localStorage.setItem(key + '_isCompressed', 'true');
      
      // Remove the uncompressed version if it exists
      localStorage.removeItem(key);
      
      const originalSize = this.getStringSizeInBytes(JSON.stringify(data));
      const compressedSize = this.getStringSizeInBytes(compressed);
      console.log(`Compressed ${key}: ${this.formatBytes(originalSize)} → ${this.formatBytes(compressedSize)} (${Math.round((compressedSize/originalSize)*100)}%)`);
      
    } catch (error) {
      console.error('Error compressing data:', error);
      throw error;
    }
  }
  
  /**
   * Load LZString library dynamically
   */
  loadLZString() {
    return new Promise((resolve, reject) => {
      if (typeof LZString !== 'undefined') {
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  
  /**
   * Reload app data without page refresh
   */
  reloadAppData() {
    // This function calls init() from the main script to reload data
    // Only if it's available and we're not currently loading
    if (window.init && !window.state?.isLoading) {
      this.setStatus('Reloading app data...', 'loading');
      
      // Patch window.WHEELS_DATA and VEHICLES_DATA to handle compressed data
      this.patchDataLoading();
      
      // Small timeout to ensure UI updates
      setTimeout(() => {
        try {
          window.init();
          this.setStatus('App data reloaded successfully!', 'success');
        } catch (error) {
          console.error('Error reloading app data:', error);
          this.setStatus(`Failed to reload app data: ${error.message}. Try refreshing the page.`, 'error');
        }
      }, 500);
    } else {
      this.setStatus('Data updated. Refresh the page to see changes.', 'info');
    }
  }
  
  /**
   * Patch the data loading to handle compressed data
   */
  patchDataLoading() {
    // This makes the app able to load compressed data without modifying the original script.js
    try {
      // Check if we need to decompress vehicle data
      if (localStorage.getItem('vehicleData_isCompressed') === 'true') {
        const compressedData = localStorage.getItem('vehicleData_compressed');
        if (compressedData) {
          if (typeof LZString === 'undefined') {
            console.warn('LZString not loaded yet, cannot decompress data');
            return;
          }
          try {
            const decompressed = JSON.parse(LZString.decompressFromUTF16(compressedData));
            window.VEHICLES_DATA = decompressed;
            console.log('Decompressed vehicle data loaded:', decompressed.length, 'items');
          } catch (e) {
            console.error('Error decompressing vehicle data:', e);
          }
        }
      }
      
      // Check if we need to decompress wheel data
      if (localStorage.getItem('wheelData_isCompressed') === 'true') {
        const compressedData = localStorage.getItem('wheelData_compressed');
        if (compressedData) {
          if (typeof LZString === 'undefined') {
            console.warn('LZString not loaded yet, cannot decompress data');
            return;
          }
          try {
            const decompressed = JSON.parse(LZString.decompressFromUTF16(compressedData));
            window.WHEELS_DATA = decompressed;
            console.log('Decompressed wheel data loaded:', decompressed.length, 'items');
          } catch (e) {
            console.error('Error decompressing wheel data:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error patching data loading:', error);
    }
  }
  
  /**
   * Update statistics display (not visible in this version)
   */
  updateStats() {
    // Stats not displayed visually, but still calculate for internal use
    try {
      let vehicleData = [];
      let wheelData = [];
      
      // Try to get data from regular or compressed localStorage
      if (localStorage.getItem('vehicleData_isCompressed') === 'true') {
        if (typeof LZString !== 'undefined') {
          const compressed = localStorage.getItem('vehicleData_compressed');
          if (compressed) {
            vehicleData = JSON.parse(LZString.decompressFromUTF16(compressed));
          }
        }
      } else {
        const vehicleDataStr = localStorage.getItem('vehicleData');
        if (vehicleDataStr) {
          vehicleData = JSON.parse(vehicleDataStr);
        }
      }
      
      if (localStorage.getItem('wheelData_isCompressed') === 'true') {
        if (typeof LZString !== 'undefined') {
          const compressed = localStorage.getItem('wheelData_compressed');
          if (compressed) {
            wheelData = JSON.parse(LZString.decompressFromUTF16(compressed));
          }
        }
      } else {
        const wheelDataStr = localStorage.getItem('wheelData');
        if (wheelDataStr) {
          wheelData = JSON.parse(wheelDataStr);
        }
      }
      
      // Log stats to console instead of updating UI
      console.log(`Admin Panel Stats: ${vehicleData.length} vehicles, ${wheelData.length} wheels`);
      console.log(`Storage used: ${this.formatBytes(this.calculateStorageUsed())}`);
      
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  }
  
  /**
   * Calculate total storage used by the app
   */
  calculateStorageUsed() {
    let totalBytes = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      totalBytes += this.getStringSizeInBytes(key) + this.getStringSizeInBytes(value);
    }
    
    return totalBytes;
  }
  
  /**
   * Set status message with type (hidden in this version)
   */
  setStatus(message, type = 'info') {
    console.log(`Admin status (${type}): ${message}`);
    // Status is not displayed to users anymore, just logged to console
  }
  
  /**
   * Toggle panel visibility
   */
  togglePanel() {
    const panel = document.querySelector('.admin-panel');
    const isHidden = panel.classList.toggle('admin-panel-collapsed');
    const toggleBtn = document.getElementById('toggle-admin-panel');
    
    if (toggleBtn) {
      toggleBtn.textContent = isHidden ? 'Show' : 'Hide';
    }
  }
  
  /**
   * Set up auto-refresh if interval provided
   */
  setupAutoRefresh(interval) {
    if (!interval || typeof interval !== 'number' || interval < 60000) {
      return; // Don't set up if interval is invalid or less than 1 minute
    }
    
    // Set up interval for auto-refresh
    setInterval(() => {
      // Only auto-refresh if the app is not actively being used
      if (!window.state?.isLoading && !this.isRefreshing) {
        console.log(`Auto-refreshing data (interval: ${interval/60000} minutes)`);
        this.refreshData();
      }
    }, interval);
    
    console.log(`Auto-refresh set up with interval of ${interval/60000} minutes`);
  }
}

// Initialize the admin panel when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Create an instance of the admin panel with the Google Sheets connector
  // This assumes sheetsConnector is available globally
  if (window.sheetsConnector) {
    const adminPanel = new AdminPanel(window.sheetsConnector);
    window.adminPanel = adminPanel; // Make it accessible globally
    
    // We're not initializing the admin panel UI since we're using the loading page
    // adminPanel.createAdminUI();
    
    // Still set up auto-refresh using the interval from SHEETS_CONFIG for periodic updates
    if (window.SHEETS_CONFIG && window.SHEETS_CONFIG.autoRefreshInterval) {
      adminPanel.setupAutoRefresh(window.SHEETS_CONFIG.autoRefreshInterval);
    }
  }
}); 