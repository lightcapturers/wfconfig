/**
 * Loading Page for Wheel Configurator
 * Shows a loading screen with initialization button when the app first loads
 */

class LoadingPage {
  constructor(sheetsConnector) {
    this.sheetsConnector = sheetsConnector;
    this.isLoading = false;
  }
  
  /**
   * Create the loading page UI
   */
  createLoadingUI() {
    // Add styles for the loading page
    this.addLoadingStyles();
    
    // Create the overlay
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    
    // Create the loading container
    const container = document.createElement('div');
    container.className = 'loading-container';
    
    // Add logo image
    const logoContainer = document.createElement('div');
    logoContainer.className = 'loading-logo';
    logoContainer.innerHTML = '<img src="https://cdn.shopify.com/s/files/1/0728/8720/6127/files/Untitled_design_22.png?v=1747787731" alt="W+1 Chrome Factory" class="logo-image">';
    
    // Add init button
    const button = document.createElement('button');
    button.id = 'init-configurator-btn';
    button.className = 'loading-button';
    button.textContent = 'Initialize Configurator';
    button.addEventListener('click', () => this.initializeConfigurator());
    
    // Add hidden status message area (for internal use only)
    const status = document.createElement('div');
    status.id = 'loading-status';
    status.className = 'loading-status';
    status.style.display = 'none';
    
    // Assemble the components
    container.appendChild(logoContainer);
    container.appendChild(button);
    container.appendChild(status);
    overlay.appendChild(container);
    
    // Add to document
    document.body.appendChild(overlay);
    
    // Return the overlay element
    return overlay;
  }
  
  /**
   * Add CSS styles for the loading page
   */
  addLoadingStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
      }
      
      .loading-container {
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }
      
      .loading-logo {
        margin-bottom: 40px;
      }
      
      .logo-image {
        max-width: 300px;
        width: 100%;
        height: auto;
      }
      
      .loading-button {
        background: transparent;
        color: #c41e1e;
        border: 1px solid #c41e1e;
        padding: 12px 24px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }
      
      .loading-button:hover {
        background: rgba(196, 30, 30, 0.1);
      }
      
      .loading-button:disabled {
        background: transparent;
        opacity: 0.7;
        cursor: not-allowed;
      }
      
      .loading-status {
        display: none;
      }
      
      /* Animation for loading button */
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .loading-button.loading {
        position: relative;
        padding-left: 44px;
        pointer-events: none;
      }
      
      .loading-button.loading::before {
        content: '';
        position: absolute;
        left: 16px;
        top: 50%;
        margin-top: -8px;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(196, 30, 30, 0.2);
        border-top-color: #c41e1e;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
    `;
    
    document.head.appendChild(styleEl);
  }
  
  /**
   * Initialize the configurator (same functionality as refresh data in admin panel)
   */
  async initializeConfigurator() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const button = document.getElementById('init-configurator-btn');
    button.disabled = true;
    button.classList.add('loading');
    button.textContent = 'Loading...';
    
    try {
      // Log status but don't show to user
      console.log('Refreshing data from Google Sheets...');
      
      // Fetch vehicle data
      console.log('Fetching vehicle data...');
      const vehicleData = await this.sheetsConnector.getVehicleData();
      
      // Fetch wheel data
      console.log('Fetching wheel data...');
      const wheelData = await this.sheetsConnector.getWheelData();
      
      // Check data sizes before saving
      const vehicleDataStr = JSON.stringify(vehicleData);
      const wheelDataStr = JSON.stringify(wheelData);
      
      const vehicleDataSize = new Blob([vehicleDataStr]).size;
      const wheelDataSize = new Blob([wheelDataStr]).size;
      const totalSize = vehicleDataSize + wheelDataSize;
      
      const maxStorageSize = 4.5 * 1024 * 1024; // ~4.5MB max for localStorage
      
      if (totalSize > maxStorageSize) {
        console.log('Optimizing data for your browser...');
        
        // Try to compress data before storing
        try {
          // Check if LZString is available
          if (typeof LZString === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/lz-string@1.4.4/libs/lz-string.min.js';
            document.head.appendChild(script);
            
            // Wait for script to load
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
            });
          }
          
          const vehicleCompressed = LZString.compressToUTF16(vehicleDataStr);
          localStorage.setItem('vehicleData_compressed', vehicleCompressed);
          localStorage.setItem('vehicleData_isCompressed', 'true');
          localStorage.removeItem('vehicleData');
          
          const wheelCompressed = LZString.compressToUTF16(wheelDataStr);
          localStorage.setItem('wheelData_compressed', wheelCompressed);
          localStorage.setItem('wheelData_isCompressed', 'true');
          localStorage.removeItem('wheelData');
          
        } catch (storageError) {
          console.error('Error: Could not load all data.', storageError);
          throw new Error('Storage limit exceeded');
        }
      } else {
        // Save to localStorage normally
        localStorage.setItem('vehicleData', vehicleDataStr);
        localStorage.setItem('wheelData', wheelDataStr);
      }
      
      // Update last refresh time
      localStorage.setItem('lastDataRefresh', new Date().getTime().toString());
      
      console.log(`Data refreshed successfully! ${vehicleData.length} vehicles and ${wheelData.length} wheels loaded.`);
      
      // Make sure the loading overlay is completely removed to avoid any reuse
      window.loadingPage = null;
      const overlay = document.getElementById('loading-overlay');
      if (overlay) {
        overlay.remove();
      }
      
      // Show the main container
      const container = document.querySelector('.container');
      if (container) {
        container.style.display = 'block';
      }
      
      // Initialize the app
      if (window.init && !window.state?.isLoading) {
        window.init();
        window.appInitialized = true; // Mark as initialized
      } else {
        // If no init function, reload the page
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error initializing configurator:', error);
      
      // Show minimal error on button
      button.disabled = false;
      button.classList.remove('loading');
      button.textContent = 'Try Again';
    } finally {
      this.isLoading = false;
    }
  }
  
  /**
   * Set status message - now only logs to console
   */
  setStatus(message, type = 'info') {
    console.log(`Loading status (${type}): ${message}`);
    // No longer updating the UI with status messages
  }
  
  /**
   * Hide the loading overlay with animation and completely clean up
   */
  hideLoadingOverlay() {
    // Make sure window.loadingPage is set to null to avoid any reuse
    window.loadingPage = null;
    
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      // Immediately remove the overlay without animation to prevent any issues
      overlay.remove();
      
      // Show the main container
      const container = document.querySelector('.container');
      if (container) {
        container.style.display = 'block';
      }
      
      // Remove any lingering event listeners by recreating the button if it exists
      const initButton = document.getElementById('init-configurator-btn');
      if (initButton) {
        const newButton = initButton.cloneNode(true);
        if (initButton.parentNode) {
          initButton.parentNode.replaceChild(newButton, initButton);
        }
      }
    }
  }
}

// Do NOT automatically initialize - let index.html do it after sheets connector is loaded 