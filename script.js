// Default dummy data (in production, this would be loaded from CSV files)
const DEFAULT_VEHICLES_DATA = [
    { year: "2024", make: "Subaru", model: "WRX VB", color: "Crystal Black Silica", image: "", swatch: "#171515", lowerImage: "" },
    { year: "2024", make: "Subaru", model: "WRX VB", color: "Ignition Red", image: "", swatch: "#d4161c", lowerImage: "" },
    { year: "2024", make: "Subaru", model: "WRX VB", color: "World Rally Blue", image: "", swatch: "#004aad", lowerImage: "" },
    { year: "2024", make: "Subaru", model: "WRX VB", color: "Ceramic White", image: "", swatch: "#f1f1f1", lowerImage: "" },
    { year: "2024", make: "Subaru", model: "WRX VB", color: "Magnetite Gray Metallic", image: "", swatch: "#545454", lowerImage: "" },
    { year: "2024", make: "Subaru", model: "BRZ 22", color: "World Rally Blue", image: "", swatch: "#004aad", lowerImage: "" },
];

const DEFAULT_WHEELS_DATA = [
    { 
        brand: "Titan 7", 
        model: "TR10", 
        finish: "Speedline White", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    },
    { 
        brand: "Titan 7", 
        model: "TR10", 
        finish: "Techna Bronze", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    },
    { 
        brand: "Titan 7", 
        model: "TR10", 
        finish: "Machine Black", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    },
    { 
        brand: "Titan 7", 
        model: "TP5", 
        finish: "Techna Bronze", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    },
    { 
        brand: "Titan 7", 
        model: "TS5", 
        finish: "Satin Titanium", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    },
    { 
        brand: "Titan 7", 
        model: "TD6LE", 
        finish: "Machine Black", 
        wheelImage: "",
        compatibleVehicles: ["WRX VB", "BRZ 22"],
        swatch: "",
        vehicleWheelImages: {
            "WRX VB": "",
            "BRZ 22": ""
        }
    }
];

// Create data indexes for faster lookups
let wheelsByVehicle = {};
let brandsByVehicle = {};
let finishesByBrandModel = {};

/**
 * Create indexes from wheel data for faster lookups
 */
function createDataIndexes() {
    console.log("Creating data indexes for faster lookups...");
    
    // Clear existing indexes
    wheelsByVehicle = {};
    brandsByVehicle = {};
    finishesByBrandModel = {};
    
    // Create vehicle model → compatible wheels index
    WHEELS_DATA.forEach(wheel => {
        wheel.compatibleVehicles.forEach(vehicle => {
            if (!wheelsByVehicle[vehicle]) wheelsByVehicle[vehicle] = [];
            wheelsByVehicle[vehicle].push(wheel);
            
            // Also track brands by vehicle
            if (!brandsByVehicle[vehicle]) brandsByVehicle[vehicle] = new Set();
            brandsByVehicle[vehicle].add(wheel.brand);
        });
    });
    
    // Create brand+model → finishes index
    WHEELS_DATA.forEach(wheel => {
        const key = `${wheel.brand}|${wheel.model}`;
        if (!finishesByBrandModel[key]) finishesByBrandModel[key] = [];
        finishesByBrandModel[key].push(wheel);
    });
    
    console.log(`Indexed data: ${Object.keys(wheelsByVehicle).length} vehicles, ${Object.keys(finishesByBrandModel).length} wheel models`);
}

// Get data from localStorage if available, otherwise use default data
let VEHICLES_DATA;
let WHEELS_DATA;

/**
 * Load data from localStorage, handling both regular and compressed formats
 */
function loadStoredData() {
    try {
        // First check for compressed data
        if (localStorage.getItem('vehicleData_isCompressed') === 'true' && 
            localStorage.getItem('vehicleData_compressed')) {
            // Data is compressed, try to decompress if LZString is available
            if (typeof LZString !== 'undefined') {
                const compressedData = localStorage.getItem('vehicleData_compressed');
                VEHICLES_DATA = JSON.parse(LZString.decompressFromUTF16(compressedData));
                console.log(`Loaded compressed vehicle data: ${VEHICLES_DATA.length} vehicles`);
            } else {
                console.warn('LZString not available, cannot decompress vehicle data');
                VEHICLES_DATA = DEFAULT_VEHICLES_DATA;
            }
        } else {
            // Try regular storage
            const storedVehicleData = localStorage.getItem('vehicleData');
            VEHICLES_DATA = storedVehicleData ? JSON.parse(storedVehicleData) : DEFAULT_VEHICLES_DATA;
        }
        
        // Same for wheel data
        if (localStorage.getItem('wheelData_isCompressed') === 'true' && 
            localStorage.getItem('wheelData_compressed')) {
            // Data is compressed, try to decompress if LZString is available
            if (typeof LZString !== 'undefined') {
                const compressedData = localStorage.getItem('wheelData_compressed');
                WHEELS_DATA = JSON.parse(LZString.decompressFromUTF16(compressedData));
                console.log(`Loaded compressed wheel data: ${WHEELS_DATA.length} wheels`);
            } else {
                console.warn('LZString not available, cannot decompress wheel data');
                WHEELS_DATA = DEFAULT_WHEELS_DATA;
            }
        } else {
            // Try regular storage
            const storedWheelData = localStorage.getItem('wheelData');
            WHEELS_DATA = storedWheelData ? JSON.parse(storedWheelData) : DEFAULT_WHEELS_DATA;
        }
        
        console.log(`Loaded data: ${VEHICLES_DATA.length} vehicles, ${WHEELS_DATA.length} wheels`);
        if (WHEELS_DATA.length > 0) {
            console.log('Sample wheel data:', WHEELS_DATA[0]);
        }
    } catch (error) {
        console.error('Error loading data from localStorage, using defaults:', error);
        VEHICLES_DATA = DEFAULT_VEHICLES_DATA;
        WHEELS_DATA = DEFAULT_WHEELS_DATA;
    }
}

// Load stored data when the script is first executed
loadStoredData();

// State management
let state = {
    vehicle: {
        year: "2024",
        make: "Subaru",
        model: "WRX VB",
        color: "Ignition Red",
        isLowered: false // Track whether we're showing the lowered version
    },
    wheel: {
        brand: "Titan 7",
        model: "",
        finish: ""
    },
    pagination: {
        currentPage: 1,
        itemsPerPage: 8,
        totalPages: 1
    },
    isLoading: false
};

// Utility function to debounce frequent function calls
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// DOM Elements
const yearSelect = document.getElementById('year');
const makeSelect = document.getElementById('make');
const modelSelect = document.getElementById('model');
const applyBtn = document.getElementById('apply-btn');
const changeBtn = document.getElementById('change-btn');
const vehicleTitle = document.getElementById('vehicle-title');
const brandSelect = document.getElementById('brand');
const wheelGrid = document.getElementById('wheel-grid');
const finishSwatches = document.getElementById('finish-swatches');
const finishDisplay = document.getElementById('finish-display');
const vehicleImage = document.getElementById('vehicle-image');
const wheelOverlayImage = document.getElementById('wheel-overlay-image');
const paintSwatches = document.getElementById('paint-swatches');
const paintDisplay = document.getElementById('paint-display');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageEl = document.getElementById('current-page');
const totalPagesEl = document.getElementById('total-pages');

// Initialize the app
function init() {
    // Make sure data is loaded
    loadStoredData();
    
    // Create loading overlay
    createLoadingOverlay();
    
    // Add CSS for lower toggle button
    addLowerToggleButtonStyles();
    
    // Create indexes for faster lookups
    createDataIndexes();
    
    // Properly load all vehicle years, makes, and models into dropdowns
    loadVehicleData();
    
    // Try to load last saved configuration
    try {
        const lastConfig = localStorage.getItem('lastConfig');
        if (lastConfig) {
            const savedState = JSON.parse(lastConfig);
            
            // Check if the saved state has valid values that exist in our current data
            const yearExists = VEHICLES_DATA.some(v => v.year === savedState.vehicle.year);
            const makeExists = VEHICLES_DATA.some(v => 
                v.year === savedState.vehicle.year && 
                v.make === savedState.vehicle.make);
            const modelExists = VEHICLES_DATA.some(v => 
                v.year === savedState.vehicle.year && 
                v.make === savedState.vehicle.make && 
                v.model === savedState.vehicle.model);
            
            if (yearExists && makeExists && modelExists) {
                console.log('Loaded previous configuration:', savedState);
                
                // Update state vehicle data
                state.vehicle.year = savedState.vehicle.year;
                state.vehicle.make = savedState.vehicle.make;
                state.vehicle.model = savedState.vehicle.model;
                state.vehicle.color = savedState.vehicle.color;
                
                // Force the proper UI update sequence
                yearSelect.value = state.vehicle.year;
                
                // Update make dropdown for this year
                const makes = [...new Set(VEHICLES_DATA
                    .filter(vehicle => vehicle.year === state.vehicle.year)
                    .map(vehicle => vehicle.make))].sort();
                
                makeSelect.innerHTML = '';
                makes.forEach(make => {
                    const option = document.createElement('option');
                    option.value = make;
                    option.textContent = make.toUpperCase();
                    makeSelect.appendChild(option);
                });
                
                makeSelect.value = state.vehicle.make;
                
                // Update model dropdown for this year and make
                const models = [...new Set(VEHICLES_DATA
                    .filter(vehicle => 
                        vehicle.year === state.vehicle.year && 
                        vehicle.make === state.vehicle.make)
                    .map(vehicle => vehicle.model))].sort();
                
                modelSelect.innerHTML = '';
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model;
                    option.textContent = model;
                    modelSelect.appendChild(option);
                });
                
                // Set the model dropdown to the saved state
                modelSelect.value = state.vehicle.model;
                
                // For wheels, only restore the model and finish, always use W+1 Chrome Factory brand
                if (savedState.wheel) {
                    state.wheel.brand = "W+1 Chrome Factory";
                    state.wheel.model = savedState.wheel.model;
                    state.wheel.finish = savedState.wheel.finish;
                }
            } else {
                console.warn('Last configuration does not match current data, using defaults');
                resetStateToDefaults();
            }
        }
    } catch (error) {
        console.warn('Could not load previous configuration', error);
        resetStateToDefaults();
    }
    
    // Set fixed brand to W+1 Chrome Factory
    state.wheel.brand = "W+1 Chrome Factory";
    
    // Show loading initially
    showLoading();
    
    setupEventListeners();
    
    // Set default state
    updateVehicleDisplay();
    
    // Make sure to load wheel models AFTER setting up the vehicle state and brand state
    console.log('Initial brand setting:', state.wheel.brand);
    loadWheelModels();
    
    // Setup pagination event listeners
    setupPaginationControls();
    
    // Ensure loading is hidden after 1 second (in case of any issues)
    setTimeout(() => {
        hideLoading();
    }, 1000);
}

// Reset state to defaults when there's an issue with saved state
function resetStateToDefaults() {
    // Set defaults based on first available data
    if (VEHICLES_DATA.length > 0) {
        const firstVehicle = VEHICLES_DATA[0];
        state.vehicle.year = firstVehicle.year;
        state.vehicle.make = firstVehicle.make;
        state.vehicle.model = firstVehicle.model;
        state.vehicle.color = firstVehicle.color;
    }
    
    // Reset wheel state
    if (WHEELS_DATA.length > 0) {
        state.wheel.brand = "W+1 Chrome Factory"; // Fixed brand
        state.wheel.model = ""; // Will be populated by loadWheelModels()
        state.wheel.finish = ""; // Will be populated by loadFinishes()
    }
    
    // Update UI to match reset state
    if (yearSelect) yearSelect.value = state.vehicle.year;
    if (makeSelect) makeSelect.value = state.vehicle.make;
    if (modelSelect) modelSelect.value = state.vehicle.model;
}

// Create loading overlay element
function createLoadingOverlay() {
    const vehiclePreview = document.querySelector('.vehicle-preview');
    if (!vehiclePreview) return;
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'component-loading-overlay';
    loadingOverlay.style.display = 'none';
    
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    
    loadingOverlay.appendChild(spinner);
    vehiclePreview.appendChild(loadingOverlay);
}

// Show loading state
function showLoading() {
    state.isLoading = true;
    const vehiclePreview = document.querySelector('.vehicle-preview');
    const loadingOverlay = document.querySelector('.component-loading-overlay');
    
    if (vehiclePreview && loadingOverlay) {
        vehiclePreview.classList.add('loading');
        loadingOverlay.style.display = 'flex';
        
        // Add blur effect to vehicle image during loading
        const vehicleImage = document.getElementById('vehicle-image');
        if (vehicleImage) {
            vehicleImage.classList.add('loading-blur');
        }
        
        // Hide wheel overlay during loading to prevent stale images
        const wheelOverlayImage = document.getElementById('wheel-overlay-image');
        if (wheelOverlayImage) {
            wheelOverlayImage.style.opacity = '0';
        }
    }
}

// Hide loading state
function hideLoading() {
    state.isLoading = false;
    const vehiclePreview = document.querySelector('.vehicle-preview');
    const loadingOverlay = document.querySelector('.component-loading-overlay');
    
    if (vehiclePreview && loadingOverlay) {
        setTimeout(() => {
            vehiclePreview.classList.remove('loading');
            loadingOverlay.style.display = 'none';
            
            // Remove blur from vehicle image
            const vehicleImage = document.getElementById('vehicle-image');
            if (vehicleImage) {
                vehicleImage.classList.remove('loading-blur');
            }
            
            // Show wheel overlay after loading
            const wheelOverlayImage = document.getElementById('wheel-overlay-image');
            if (wheelOverlayImage) {
                wheelOverlayImage.style.opacity = '1';
            }
        }, 300); // Short delay to allow transition to complete
    }
}

// Load vehicle data into dropdowns
function loadVehicleData() {
    // Get unique years from the data
    const years = [...new Set(VEHICLES_DATA.map(vehicle => vehicle.year))].sort().reverse();
    
    // Populate year dropdown
    yearSelect.innerHTML = '';
    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    });
    
    // Set default year (most recent) or use current state
    if (years.length > 0 && !state.vehicle.year) {
        state.vehicle.year = years[0];
    }
    yearSelect.value = state.vehicle.year;
    
    // Get unique makes based on selected year
    const makes = [...new Set(VEHICLES_DATA
        .filter(vehicle => vehicle.year === state.vehicle.year)
        .map(vehicle => vehicle.make))].sort();
    
    // Populate make dropdown
    makeSelect.innerHTML = '';
    makes.forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make.toUpperCase();
        makeSelect.appendChild(option);
    });
    
    // Set default make or use current state
    if (makes.length > 0 && !state.vehicle.make) {
        state.vehicle.make = makes[0];
    }
    // Make sure to set the dropdown to match the current state
    makeSelect.value = state.vehicle.make;
    
    // Get models for selected year and make
    const models = [...new Set(VEHICLES_DATA
        .filter(vehicle => 
            vehicle.year === state.vehicle.year && 
            vehicle.make === state.vehicle.make)
        .map(vehicle => vehicle.model))].sort();
    
    // Debug log to see available models
    console.log('Available models:', models);
    
    // Populate model dropdown
    modelSelect.innerHTML = '';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model; // Use the full model name
        option.textContent = model; // Show the full model name
        modelSelect.appendChild(option);
    });
    
    // Set default model to the full model name or use current state
    if (models.length > 0 && !state.vehicle.model) {
        state.vehicle.model = models[0]; // Use the full model name for compatibility
    } else if (models.length > 0 && !models.includes(state.vehicle.model)) {
        // If current model is not in the available models, reset it
        state.vehicle.model = models[0];
    }
    
    // Set the model dropdown to display the full model name
    modelSelect.value = state.vehicle.model;
    console.log('Setting model dropdown to:', state.vehicle.model);
}

// Load unique brands from wheel data
function loadBrands() {
    // Only load brands that have wheels compatible with the selected vehicle
    const compatibleBrands = brandsByVehicle[state.vehicle.model];
    
    // If we don't have any indexed brands for this vehicle, fall back to all brands
    let brands = [];
    if (compatibleBrands && compatibleBrands.size > 0) {
        brands = [...compatibleBrands].sort();
        console.log(`Loading ${brands.length} compatible brands for ${state.vehicle.model}`);
    } else {
        brands = [...new Set(WHEELS_DATA.map(wheel => wheel.brand))];
        console.log(`No indexed brands for ${state.vehicle.model}, using all ${brands.length} brands`);
    }
    
    brandSelect.innerHTML = '';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand.toUpperCase();
        brandSelect.appendChild(option);
    });
    
    // Don't overwrite the state.wheel.brand if it's already set
    if (!state.wheel.brand || !brands.includes(state.wheel.brand)) {
        // Select first brand in the list if current one is invalid
        state.wheel.brand = brands.length > 0 ? brands[0] : "";
    }
    
    // Set the dropdown to match the state
    brandSelect.value = state.wheel.brand;
    
    // Style the brand select dropdown
    brandSelect.classList.add('brand-select-styled');
}

// Load wheel models based on selected brand
function loadWheelModels() {
    console.log('Loading wheel models for:', state.wheel.brand, 'compatible with vehicle:', state.vehicle.model);
    
    // Ensure wheel brand is set
    if (!state.wheel.brand) {
        state.wheel.brand = "W+1 Chrome Factory";
    }
    
    // Use indexed data for better performance
    let compatibleWheels = [];
    
    // Since we're using the fixed "W+1 Chrome Factory" brand, but the data might use a different brand,
    // we'll get all wheels compatible with the vehicle regardless of brand
    if (wheelsByVehicle[state.vehicle.model]) {
        if (state.wheel.brand === "W+1 Chrome Factory") {
            // For W+1 Chrome Factory, get all wheels for this vehicle (ignore brand)
            compatibleWheels = wheelsByVehicle[state.vehicle.model];
            console.log(`Using all ${compatibleWheels.length} wheels for ${state.vehicle.model} since brand is W+1 Chrome Factory`);
        } else {
            // For other brands, filter as usual
            compatibleWheels = wheelsByVehicle[state.vehicle.model].filter(wheel => 
                wheel.brand === state.wheel.brand
            );
            console.log(`Found ${compatibleWheels.length} wheels from index for ${state.vehicle.model} and brand ${state.wheel.brand}`);
        }
    } else {
        // Fallback to old method if index doesn't have the vehicle
        if (state.wheel.brand === "W+1 Chrome Factory") {
            // For W+1 Chrome Factory, get all wheels for this vehicle (ignore brand)
            compatibleWheels = WHEELS_DATA.filter(wheel => 
                wheel.compatibleVehicles && wheel.compatibleVehicles.some(v => v === state.vehicle.model)
            );
        } else {
            compatibleWheels = WHEELS_DATA.filter(wheel => {
                const brandMatch = wheel.brand === state.wheel.brand;
                const vehicleCompatible = wheel.compatibleVehicles && 
                                      wheel.compatibleVehicles.some(v => v === state.vehicle.model);
                return brandMatch && vehicleCompatible;
            });
        }
        console.log(`Used fallback method, found ${compatibleWheels.length} wheels`);
    }
    
    // Get unique models
    const uniqueModels = [];
    const uniqueModelObjects = [];
    
    compatibleWheels.forEach(wheel => {
        if (!uniqueModels.includes(wheel.model)) {
            uniqueModels.push(wheel.model);
            uniqueModelObjects.push(wheel);
        }
    });
    
    // Calculate pagination
    const totalWheels = uniqueModelObjects.length;
    const paginationControls = document.querySelector('.pagination-controls');
    
    // Hide pagination if we have 8 or fewer wheels
    if (totalWheels <= state.pagination.itemsPerPage) {
        state.pagination.totalPages = 1;
        state.pagination.currentPage = 1;
        if (paginationControls) {
            paginationControls.style.display = 'none';
        }
    } else {
        state.pagination.totalPages = Math.ceil(totalWheels / state.pagination.itemsPerPage);
        if (state.pagination.currentPage > state.pagination.totalPages) {
            state.pagination.currentPage = state.pagination.totalPages || 1;
        }
        if (paginationControls) {
            paginationControls.style.display = 'flex';
        }
    }
    
    // Update pagination display
    updatePaginationDisplay();
    
    // Calculate slice based on current page
    const startIndex = (state.pagination.currentPage - 1) * state.pagination.itemsPerPage;
    const endIndex = startIndex + state.pagination.itemsPerPage;
    let currentPageItems = uniqueModelObjects.slice(startIndex, endIndex);
    
    // Determine grid layout based on number of wheels on the current page
    const wheelGrid = document.getElementById('wheel-grid');
    
    // Optimize grid layout based on items on current page (max 8)
    if (currentPageItems.length <= 2) {
        // One or two items - use 2 columns max
        wheelGrid.className = 'wheel-grid wheel-grid-compact';
    } else if (currentPageItems.length <= 4) {
        // 3-4 items - use 2x2 layout (Assuming wheel-grid-row-1 maps to this in CSS)
        wheelGrid.className = 'wheel-grid wheel-grid-row-1';
    } else {
        // 5-8 items - use 4x2 layout (Assuming wheel-grid-row-2 maps to this)
        wheelGrid.className = 'wheel-grid wheel-grid-row-2';
    }
    
    // Updated Placeholder logic:
    // Only add placeholders if paginating AND there are *more than 2* items on the current page,
    // but fewer than the max items per page.
    let placeholdersNeeded = 0;
    if (state.pagination.totalPages > 1 && 
        currentPageItems.length > 2 && 
        currentPageItems.length < state.pagination.itemsPerPage) 
    {
        placeholdersNeeded = state.pagination.itemsPerPage - currentPageItems.length;
    }
    
    // Clear wheel grid and add current page items
    wheelGrid.innerHTML = '';
    
    // Add actual wheel items
    currentPageItems.forEach(wheel => {
        const wheelOption = document.createElement('div');
        wheelOption.className = 'wheel-option';
        wheelOption.dataset.model = wheel.model;
        
        // Update to avoid broken image placeholders
        wheelOption.innerHTML = `
            <img src="${wheel.wheelImage}" alt="${wheel.model}" crossorigin="anonymous"
                 onerror="this.onerror=null; this.classList.add('error'); this.src='';">
            <div class="wheel-model-name">${wheel.model}</div>
        `;
        
        wheelGrid.appendChild(wheelOption);
    });
    
    // Add empty placeholders if needed
    if (placeholdersNeeded > 0) {
        for (let i = 0; i < placeholdersNeeded; i++) {
            const emptyPlaceholder = document.createElement('div');
            emptyPlaceholder.className = 'wheel-option placeholder';
            emptyPlaceholder.innerHTML = `
                <div class="empty-wheel"></div>
                <div class="wheel-model-name">&nbsp;</div>
            `;
            wheelGrid.appendChild(emptyPlaceholder);
        }
    }
    
    // No more lazy loading - load images directly to ensure proper error handling
    
    // Find and select the current wheel model in the grid if it exists
    let selectedWheel = null;
    if (state.wheel.model) {
        const wheelOptions = wheelGrid.querySelectorAll('.wheel-option');
        for (let option of wheelOptions) {
            if (option.dataset.model === state.wheel.model) {
                option.classList.add('selected');
                selectedWheel = option;
                break;
            }
        }
    }
    
    // If current model isn't found or no model is selected, select the first one by default
    if (!selectedWheel && uniqueModelObjects.length > 0) {
        const firstOption = wheelGrid.querySelector('.wheel-option');
        if (firstOption) {
            firstOption.classList.add('selected');
            state.wheel.model = currentPageItems[0].model;
            
            // Set the first available finish
            if (currentPageItems[0]) {
                state.wheel.finish = currentPageItems[0].finish;
            }
            
            console.log('Default wheel model:', state.wheel.model);
            
            // Update the wheel display
            updateWheelDisplay();
        }
    } else if (selectedWheel) {
        // If a wheel is selected, just update the display
        updateWheelDisplay();
    } else {
        console.warn('No compatible wheels found for vehicle:', state.vehicle.model);
        // Clear finishes if no wheels are compatible
        wheelOverlayImage.src = '';
        wheelOverlayImage.style.opacity = '0';
    }
}

// Load finishes based on selected wheel model
function loadFinishes() {
    console.log('Loading finishes for wheel model:', state.wheel.model, 'compatible with vehicle:', state.vehicle.model);
    
    // Use the indexed data for better performance
    let compatibleFinishes = [];
    
    if (state.wheel.brand === "W+1 Chrome Factory") {
        // For W+1 Chrome Factory, search for any wheel with the matching model
        // Get keys that end with the model name
        const allKeys = Object.keys(finishesByBrandModel);
        const matchingKeys = allKeys.filter(key => key.endsWith(`|${state.wheel.model}`));
        
        if (matchingKeys.length > 0) {
            // Get all finishes from matching models
            matchingKeys.forEach(key => {
                const wheelFinishes = finishesByBrandModel[key].filter(wheel => 
                    wheel.compatibleVehicles.includes(state.vehicle.model)
                );
                compatibleFinishes = [...compatibleFinishes, ...wheelFinishes];
            });
            
            console.log(`Found ${compatibleFinishes.length} finishes for model ${state.wheel.model} across all brands`);
        } else {
            // Fallback if no keys found
            compatibleFinishes = WHEELS_DATA.filter(wheel => 
                wheel.model === state.wheel.model &&
                wheel.compatibleVehicles.includes(state.vehicle.model)
            );
            console.log(`Used fallback, found ${compatibleFinishes.length} finishes for model ${state.wheel.model}`);
        }
    } else {
        // Original logic for specific brands
        const key = `${state.wheel.brand}|${state.wheel.model}`;
        if (finishesByBrandModel[key]) {
            // Filter from indexed finishes by vehicle compatibility
            compatibleFinishes = finishesByBrandModel[key].filter(wheel => 
                wheel.compatibleVehicles.includes(state.vehicle.model)
            );
            console.log(`Found ${compatibleFinishes.length} finishes from index for model ${state.wheel.model}`);
        } else {
            // Fallback to old method if index doesn't have the key
            compatibleFinishes = WHEELS_DATA.filter(wheel => 
                wheel.brand === state.wheel.brand && 
                wheel.model === state.wheel.model &&
                wheel.compatibleVehicles.includes(state.vehicle.model)
            );
            console.log(`Used fallback method, found ${compatibleFinishes.length} finishes`);
        }
    }
    
    finishSwatches.innerHTML = '';
    
    compatibleFinishes.forEach(wheel => {
        const finishSwatch = document.createElement('div');
        finishSwatch.className = 'finish-swatch';
        finishSwatch.dataset.finish = wheel.finish;
        finishSwatch.style.backgroundImage = `url(${wheel.swatch})`;
        finishSwatch.style.backgroundSize = '80% 80%';
        finishSwatch.style.backgroundPosition = 'center';
        finishSwatch.style.backgroundRepeat = 'no-repeat';
        
        finishSwatch.addEventListener('click', () => {
            // Show loading state when finish is changed
            showLoading();
            
            document.querySelectorAll('.finish-swatch').forEach(el => {
                el.classList.remove('selected');
            });
            
            finishSwatch.classList.add('selected');
            state.wheel.finish = wheel.finish;
            console.log('Selected finish:', state.wheel.finish);
            finishDisplay.textContent = wheel.finish;
            
            // Small delay to ensure loading animation is visible
            setTimeout(() => {
                updateWheelDisplay();
            }, 100);
        });
        
        finishSwatches.appendChild(finishSwatch);
    });
    
    // Select the first finish by default
    if (compatibleFinishes.length > 0) {
        const firstSwatch = finishSwatches.querySelector('.finish-swatch');
        firstSwatch.classList.add('selected');
        state.wheel.finish = compatibleFinishes[0].finish;
        console.log('Default finish:', state.wheel.finish);
        finishDisplay.textContent = compatibleFinishes[0].finish;
        updateWheelDisplay();
    } else {
        console.warn('No compatible finishes found for wheel:', state.wheel.model, 'and vehicle:', state.vehicle.model);
        // Clear finish display if no finishes are compatible
        finishDisplay.textContent = 'No compatible finishes';
        wheelOverlayImage.src = '';
    }
}

// Load paint colors for the selected vehicle
function loadPaintColors() {
    // Use more flexible matching for models like in updateVehicleDisplay
    const vehicleColors = VEHICLES_DATA.filter(v => {
        const yearMatch = v.year === state.vehicle.year;
        const makeMatch = v.make.toLowerCase() === state.vehicle.make.toLowerCase();
        
        // For model, be more flexible due to potential variations
        const modelA = v.model.toLowerCase();
        const modelB = state.vehicle.model.toLowerCase();
        const modelMatch = modelA.includes(modelB) || modelB.includes(modelA);
        
        return yearMatch && makeMatch && modelMatch;
    });

    console.log(`Found ${vehicleColors.length} colors for vehicle ${state.vehicle.year} ${state.vehicle.make} ${state.vehicle.model}`);

    paintSwatches.innerHTML = ''; // Clear existing swatches

    vehicleColors.forEach(vehicle => {
        const paintSwatchButton = document.createElement('button');

        const color = vehicle.swatch || '#e82c2c'; // Use swatch color or fallback red

        // Apply a radial gradient for a shiny effect
        // Starts lighter in the top-left, goes to the main color, then slightly darker
        paintSwatchButton.style.backgroundImage = `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%), radial-gradient(circle at 70% 70%, rgba(0,0,0,0.2), transparent 70%), linear-gradient(to bottom right, ${color}, ${color})`;
        // Set the base background color as well, in case the gradient fails or for print styles
        paintSwatchButton.style.backgroundColor = color;


        // Add border for very light colors to ensure visibility (check against base color)
        if (color === '#f1f1f1' || color === '#ffffff' || color.toLowerCase() === '#fff') {
            paintSwatchButton.style.borderColor = '#D1D5DB'; // light gray
        } else {
            paintSwatchButton.style.borderColor = 'transparent'; // Use default from CSS otherwise
        }

        paintSwatchButton.dataset.color = vehicle.color;
        paintSwatchButton.setAttribute('aria-label', `Select paint color: ${vehicle.color}`); // Accessibility

        paintSwatchButton.addEventListener('click', () => {
            showLoading();

            // Remove 'selected' class from all buttons
            paintSwatches.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('selected');
                // Reset border color for non-selected light swatches
                const btnBgColor = btn.style.backgroundColor;
                if (btnBgColor === 'rgb(241, 241, 241)' || btnBgColor === 'rgb(255, 255, 255)' || btnBgColor.toLowerCase() === '#fff') {
                    btn.style.borderColor = '#D1D5DB';
                } else {
                    // Rely on CSS for the default border of non-selected swatches
                    btn.style.borderColor = ''; // Clear inline border style
                }
            });

            // Add 'selected' class to the clicked button
            paintSwatchButton.classList.add('selected');
            // Border for selected state is handled by CSS now

            state.vehicle.color = vehicle.color;
            paintDisplay.textContent = vehicle.color; // Update the text display

            // --- Image Preloading Logic (modified to handle lowered state) ---
            const img = new Image();
            let imageLoadTimeout = setTimeout(() => {
                console.warn('Color image load timeout exceeded, but still attempting to load');
            }, 5000);

            // Determine which image to load based on lowered state
            const imageToLoad = state.vehicle.isLowered && vehicle.lowerImage ? vehicle.lowerImage : vehicle.image;

            img.onload = function() {
                clearTimeout(imageLoadTimeout);
                vehicleImage.src = imageToLoad;
                updateWheelDisplay();
            };

            img.onerror = function() {
                clearTimeout(imageLoadTimeout);
                console.error('Failed to load paint color image:', imageToLoad);
                vehicleImage.src = '';
                vehicleImage.classList.add('error');
                updateWheelDisplay();
            };

            img.setAttribute('crossorigin', 'anonymous');
            console.log('Loading color image:', imageToLoad);
            img.src = imageToLoad;
            // --- End Image Preloading Logic ---
            
            // Update lowered toggle button visibility
            const vehiclePreview = document.querySelector('.vehicle-preview');
            const existingBtn = document.getElementById('lower-toggle-btn');
            
            // Remove the existing button if there is one
            if (existingBtn) {
                existingBtn.remove();
            }
            
            // Create lowered mode toggle button if a lower image is available
            if (vehicle.lowerImage && vehicle.lowerImage.trim() !== '' && vehiclePreview) {
                console.log('Creating lower toggle button in loadPaintColors with URL:', vehicle.lowerImage);
                
                // Create toggle button container
                const lowerToggleBtn = document.createElement('div');
                lowerToggleBtn.id = 'lower-toggle-btn';
                lowerToggleBtn.className = 'lower-toggle-btn';
                
                // Create stock option
                const stockOption = document.createElement('div');
                stockOption.className = `toggle-option ${!state.vehicle.isLowered ? 'active' : 'inactive'}`;
                stockOption.textContent = 'STOCK';
                stockOption.dataset.mode = 'stock';
                
                // Create lowered option
                const loweredOption = document.createElement('div');
                loweredOption.className = `toggle-option ${state.vehicle.isLowered ? 'active' : 'inactive'}`;
                loweredOption.textContent = 'LOWERED';
                loweredOption.dataset.mode = 'lowered';
                
                // Add click handlers to each option
                stockOption.addEventListener('click', () => {
                    if (state.vehicle.isLowered) toggleLoweredMode();
                });
                
                loweredOption.addEventListener('click', () => {
                    if (!state.vehicle.isLowered) toggleLoweredMode();
                });
                
                // Append options to toggle button
                lowerToggleBtn.appendChild(stockOption);
                lowerToggleBtn.appendChild(loweredOption);
                
                vehiclePreview.appendChild(lowerToggleBtn);
            } else {
                console.log('Not creating button in loadPaintColors - lowerImage:', vehicle.lowerImage);
                // If there's no lower image available for this color, reset lowered state
                state.vehicle.isLowered = false;
            }
        });

        paintSwatches.appendChild(paintSwatchButton);
    });

    // Select the current color in the UI after generating swatches
    const currentColorSwatchButton = [...paintSwatches.querySelectorAll('button')]
        .find(button => button.dataset.color === state.vehicle.color);

    if (currentColorSwatchButton) {
        currentColorSwatchButton.classList.add('selected');
        paintDisplay.textContent = state.vehicle.color;
    } else if (paintSwatches.children.length > 0) {
        const firstSwatchButton = paintSwatches.querySelector('button');
        if (firstSwatchButton) {
            firstSwatchButton.classList.add('selected');
            const firstColor = firstSwatchButton.dataset.color;
            state.vehicle.color = firstColor;
            paintDisplay.textContent = firstColor;
        }
    }
}

// Update vehicle display based on current state
function updateVehicleDisplay() {
    // Show loading state
    showLoading();
    
    // Update the vehicle title - use the full model name
    vehicleTitle.textContent = `${state.vehicle.year} ${state.vehicle.make} ${state.vehicle.model}`;
    
    // Debug - log what we're looking for
    console.log('Looking for vehicle:', state.vehicle.year, state.vehicle.make, state.vehicle.model, state.vehicle.color);
    
    // Find the vehicle image URL with more flexible matching
    // This handles case sensitivity and F8X vs F8x 3 Series naming differences
    const vehicle = VEHICLES_DATA.find(v => {
        // Log the first few matches to debug
        const yearMatch = v.year === state.vehicle.year;
        const makeMatch = v.make.toLowerCase() === state.vehicle.make.toLowerCase();
        
        // For model, we need to be more flexible due to potential variations (F8X vs F8x 3 Series)
        // Check if either model contains the other, ignoring case
        const modelA = v.model.toLowerCase();
        const modelB = state.vehicle.model.toLowerCase();
        const modelMatch = modelA.includes(modelB) || modelB.includes(modelA);
        
        const colorMatch = v.color.toLowerCase() === state.vehicle.color.toLowerCase();
        
        if (yearMatch && makeMatch && modelMatch) {
            console.log('Potential match found:', v.year, v.make, v.model, v.color, 'Lower Image:', v.lowerImage);
        }
        
        return yearMatch && makeMatch && modelMatch && colorMatch;
    });
    
    // Debug - log vehicle data to check for lowerImage
    console.log('Vehicle data:', vehicle);
    if (vehicle && vehicle.lowerImage) {
        console.log('Lower image URL found:', vehicle.lowerImage);
    } else {
        console.log('No lower image URL found for this vehicle');
    }
    
    // Check for lowered image toggle button
    const vehiclePreview = document.querySelector('.vehicle-preview');
    const existingBtn = document.getElementById('lower-toggle-btn');
    
    // Remove the existing button if there is one
    if (existingBtn) {
        existingBtn.remove();
    }
    
    if (vehicle) {
        // Create lowered mode toggle button if a lower image is available
        // Updated condition to check that lowerImage exists and is not empty
        if (vehicle.lowerImage && vehicle.lowerImage.trim() !== '' && vehiclePreview) {
            console.log('Creating lower toggle button in updateVehicleDisplay with URL:', vehicle.lowerImage);
            
            // Create toggle button container
            const lowerToggleBtn = document.createElement('div');
            lowerToggleBtn.id = 'lower-toggle-btn';
            lowerToggleBtn.className = 'lower-toggle-btn';
            
            // Create stock option
            const stockOption = document.createElement('div');
            stockOption.className = `toggle-option ${!state.vehicle.isLowered ? 'active' : 'inactive'}`;
            stockOption.textContent = 'STOCK';
            stockOption.dataset.mode = 'stock';
            
            // Create lowered option
            const loweredOption = document.createElement('div');
            loweredOption.className = `toggle-option ${state.vehicle.isLowered ? 'active' : 'inactive'}`;
            loweredOption.textContent = 'LOWERED';
            loweredOption.dataset.mode = 'lowered';
            
            // Add click handlers to each option
            stockOption.addEventListener('click', () => {
                if (state.vehicle.isLowered) toggleLoweredMode();
            });
            
            loweredOption.addEventListener('click', () => {
                if (!state.vehicle.isLowered) toggleLoweredMode();
            });
            
            // Append options to toggle button
            lowerToggleBtn.appendChild(stockOption);
            lowerToggleBtn.appendChild(loweredOption);
            
            vehiclePreview.appendChild(lowerToggleBtn);
        } else {
            console.log('Not creating button in updateVehicleDisplay - lowerImage:', vehicle.lowerImage);
            // If there's no lower image available for this color, reset lowered state
            state.vehicle.isLowered = false;
        }
        
        // Determine which image URL to use based on lowered state
        const imageUrl = state.vehicle.isLowered && vehicle.lowerImage ? vehicle.lowerImage : vehicle.image;
        
        // Create a new image object to preload
        const img = new Image();
        
        // Set a longer timeout to prevent premature fallback to placeholder
        let imageLoadTimeout = setTimeout(() => {
            console.warn('Image load timeout exceeded, but still attempting to load');
        }, 5000);
        
        img.onload = function() {
            // Once loaded, update the src
            clearTimeout(imageLoadTimeout);
            vehicleImage.src = imageUrl;
            vehicleImage.classList.remove('error');
            
            // Load paint colors only after the vehicle image loads
            loadPaintColors();
            
            // Update wheel display (will manage its own loading state)
            updateWheelDisplay();
        };
        
        img.onerror = function() {
            clearTimeout(imageLoadTimeout);
            console.error('Failed to load vehicle image:', imageUrl);
            
            // Instead of showing a fallback, keep loading state visible
            vehicleImage.src = '';
            vehicleImage.classList.add('error');
            
            // Continue with the rest
            loadPaintColors();
            updateWheelDisplay();
        };
        
        // Set crossorigin attribute for the image
        img.setAttribute('crossorigin', 'anonymous');
        
        // Start loading the image
        console.log('Loading vehicle image:', imageUrl);
        img.src = imageUrl;
    } else {
        // If no vehicle found, show empty state instead of default image
        vehicleImage.src = '';
        vehicleImage.classList.add('error');
        
        // Load paint colors
        loadPaintColors();
        
        // Update wheel display
        updateWheelDisplay();
    }
}

// Update wheel display based on current state
function updateWheelDisplay() {
    console.log('Updating wheel display with model:', state.vehicle.model);
    
    // Find the wheel data - use more efficient method with our indexes
    let wheel = null;
    const vehicleWheels = wheelsByVehicle[state.vehicle.model];
    
    if (vehicleWheels) {
        if (state.wheel.brand === "W+1 Chrome Factory") {
            // For W+1 Chrome Factory, find any wheel that matches model regardless of brand and finish
            // Just get the first finish available for the model
            wheel = vehicleWheels.find(w => w.model === state.wheel.model);
            
            // If wheel is found, set the finish in the state
            if (wheel) {
                state.wheel.finish = wheel.finish;
            }
        } else {
            // Find the specific wheel from the indexed list with exact brand match
            wheel = vehicleWheels.find(w => 
                w.brand === state.wheel.brand && 
                w.model === state.wheel.model && 
                w.finish === state.wheel.finish
            );
        }
    }
    
    // Fallback to the original method if not found in index
    if (!wheel) {
        if (state.wheel.brand === "W+1 Chrome Factory") {
            wheel = WHEELS_DATA.find(w => 
                w.model === state.wheel.model && 
                w.compatibleVehicles && w.compatibleVehicles.includes(state.vehicle.model)
            );
            
            // If wheel is found, set the finish in the state
            if (wheel) {
                state.wheel.finish = wheel.finish;
            }
        } else {
            wheel = WHEELS_DATA.find(w => 
                w.brand === state.wheel.brand && 
                w.model === state.wheel.model && 
                w.finish === state.wheel.finish &&
                w.compatibleVehicles && w.compatibleVehicles.includes(state.vehicle.model)
            );
        }
    }
    
    console.log('Selected wheel:', wheel ? `${wheel.brand} ${wheel.model} ${wheel.finish}` : 'None found');
    
    if (wheel) {
        // Get the vehicle-specific wheel overlay image URL
        const overlayImageUrl = wheel.vehicleWheelImages && wheel.vehicleWheelImages[state.vehicle.model];
        
        if (overlayImageUrl) {
            // Preload the wheel overlay image
            const img = new Image();
            
            img.onload = function() {
                // Successfully loaded, update the src
                console.log('Setting overlay image to:', overlayImageUrl);
                wheelOverlayImage.src = overlayImageUrl;
                wheelOverlayImage.style.border = 'none';
                wheelOverlayImage.style.opacity = '1'; // Ensure visibility
                wheelOverlayImage.classList.remove('error');
                // Hide loading state after successful load
                hideLoading();
            };
            
            img.onerror = function(event) {
                console.error('Failed to load wheel overlay image:', overlayImageUrl);
                console.error('Error details:', event);
                
                // Do not set any src on error - keep it empty to avoid placeholder
                wheelOverlayImage.src = '';
                wheelOverlayImage.style.opacity = '0'; // Hide completely on error
                wheelOverlayImage.classList.add('error');
                
                // Still hide loading state even on error
                hideLoading();
            };
            
            // Start loading the image
            img.src = overlayImageUrl;
        } else {
            // If no vehicle-specific overlay, don't show any overlay
            console.warn(`No overlay image found for vehicle ${state.vehicle.model} and wheel ${wheel.model}`);
            wheelOverlayImage.src = '';
            wheelOverlayImage.style.opacity = '0'; // Hide completely
            wheelOverlayImage.classList.add('error');
            // Hide loading state
            hideLoading();
        }
    } else {
        // Clear wheel overlay image if not found
        console.warn('No matching wheel found to display overlay');
        wheelOverlayImage.src = '';
        wheelOverlayImage.style.opacity = '0'; // Hide completely
        wheelOverlayImage.classList.add('error');
        // Hide loading state
        hideLoading();
    }
}

// Update pagination display elements
function updatePaginationDisplay() {
    // Update page indicator with dots
    if (currentPageEl) {
        // Clear current dots
        currentPageEl.innerHTML = '';
        
        // Create dots for each page
        for (let i = 1; i <= state.pagination.totalPages; i++) {
            const dot = document.createElement('span');
            dot.className = 'page-dot';
            if (i === state.pagination.currentPage) {
                dot.classList.add('active');
            }
            
            // Add click event to dot
            dot.addEventListener('click', () => {
                state.pagination.currentPage = i;
                loadWheelModels();
            });
            
            currentPageEl.appendChild(dot);
        }
    }
    
    // Update button states (but they're hidden with CSS)
    if (prevPageBtn) prevPageBtn.disabled = state.pagination.currentPage <= 1;
    if (nextPageBtn) nextPageBtn.disabled = state.pagination.currentPage >= state.pagination.totalPages;
}

// Set up pagination control event listeners
function setupPaginationControls() {
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage > 1) {
                state.pagination.currentPage--;
                loadWheelModels();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            if (state.pagination.currentPage < state.pagination.totalPages) {
                state.pagination.currentPage++;
                loadWheelModels();
            }
        });
    }
}

// Set up event listeners
function setupEventListeners() {
    // Don't use debounced functions for user-initiated actions
    yearSelect.addEventListener('change', () => {
        state.vehicle.year = yearSelect.value;
        
        // Update make dropdown when year changes
        const makes = [...new Set(VEHICLES_DATA
            .filter(vehicle => vehicle.year === state.vehicle.year)
            .map(vehicle => vehicle.make))].sort();
        
        makeSelect.innerHTML = '';
        makes.forEach(make => {
            const option = document.createElement('option');
            option.value = make;
            option.textContent = make.toUpperCase();
            makeSelect.appendChild(option);
        });
        
        // Set default make after changing year
        if (makes.length > 0) {
            state.vehicle.make = makes[0];
            makeSelect.value = state.vehicle.make;
            
            // Update model dropdown when make changes after year change
            const models = [...new Set(VEHICLES_DATA
                .filter(vehicle => 
                    vehicle.year === state.vehicle.year && 
                    vehicle.make === state.vehicle.make)
                .map(vehicle => vehicle.model))].sort();
            
            modelSelect.innerHTML = '';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model; // Use the full model name
                option.textContent = model; // Show the full model name
                modelSelect.appendChild(option);
            });
            
            // Set default model after changing make - use the full model name
            if (models.length > 0) {
                state.vehicle.model = models[0];
                // Make sure the dropdown shows the correct value
                modelSelect.value = models[0];
            }
        }
    });
    
    applyBtn.addEventListener('click', () => {
        // Show loading state before updating
        showLoading();
        
        // Capture the current values - this is important to ensure we're using the most recent selections
        const selectedYear = yearSelect.value;
        const selectedMake = makeSelect.value;
        const selectedModel = modelSelect.value;
        
        // Update state with the current values
        state.vehicle.year = selectedYear;
        state.vehicle.make = selectedMake;
        state.vehicle.model = selectedModel;
        
        // Reset lowered state when changing vehicle
        state.vehicle.isLowered = false;
        
        console.log('Applying vehicle changes:', state.vehicle);
        
        // First, update the vehicle title immediately
        vehicleTitle.textContent = `${state.vehicle.year} ${state.vehicle.make} ${state.vehicle.model}`;
        
        // **** IMPORTANT CHANGE ****
        // Clear current wheel selection when vehicle changes to force proper reloading
        state.wheel.model = "";
        state.wheel.finish = "";
        state.pagination.currentPage = 1;
        
        // Recreate data indexes for the new selection BEFORE updating displays
        createDataIndexes();
        
        // Set fixed brand for W+1 Chrome Factory
        state.wheel.brand = "W+1 Chrome Factory"; 
        
        // Find the vehicle image URL - ADDED THIS CODE FOR BETTER HANDLING
        const vehicle = VEHICLES_DATA.find(v => 
            v.year === state.vehicle.year &&
            v.make === state.vehicle.make && 
            v.model === state.vehicle.model && 
            v.color === state.vehicle.color
        );
        
        // Check if vehicle exists before trying to load it
        if (vehicle) {
            // Then update the vehicle display synchronously (no debounce)
            updateVehicleDisplay();
            
            // Force the wheel model update with a slight delay to ensure vehicle display is ready
            setTimeout(() => {
                loadWheelModels();
            }, 200);
        } else {
            console.warn('Vehicle not found in data:', state.vehicle);
            
            // If no vehicle is found, try to find a vehicle with matching year/make/model but different color
            const similarVehicle = VEHICLES_DATA.find(v => 
                v.year === state.vehicle.year &&
                v.make === state.vehicle.make && 
                v.model === state.vehicle.model
            );
            
            if (similarVehicle) {
                // Update color to match found vehicle
                state.vehicle.color = similarVehicle.color;
                console.log('Using alternate color:', state.vehicle.color);
                updateVehicleDisplay();
                
                setTimeout(() => {
                    loadWheelModels();
                }, 200);
            } else {
                // No similar vehicle found, hide loading and show error
                console.error('No compatible vehicle found for:', state.vehicle);
                hideLoading();
                
                // Optionally reset to a known good state here
                // resetStateToDefaults();
            }
        }
    });
    
    changeBtn.addEventListener('click', () => {
        // Reset selected values to current state
        yearSelect.value = state.vehicle.year;
        makeSelect.value = state.vehicle.make;
        modelSelect.value = state.vehicle.model;
        
        console.log('Change button clicked - resetting dropdowns to current state');
    });
    
    makeSelect.addEventListener('change', () => {
        state.vehicle.make = makeSelect.value;
        
        // Update model dropdown when make changes
        const models = [...new Set(VEHICLES_DATA
            .filter(vehicle => 
                vehicle.year === state.vehicle.year && 
                vehicle.make === state.vehicle.make)
            .map(vehicle => vehicle.model))].sort();
        
        modelSelect.innerHTML = '';
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model; // Use the full model name
            option.textContent = model; // Show the full model name
            modelSelect.appendChild(option);
        });
        
        // Set default model after changing make - use the full model name
        if (models.length > 0) {
            state.vehicle.model = models[0];
            // Make sure the dropdown shows the correct value
            modelSelect.value = models[0];
        }
    });
    
    modelSelect.addEventListener('change', () => {
        // Use the full model name directly
        state.vehicle.model = modelSelect.value;
    });
    
    // Save configuration to localStorage
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('lastConfig', JSON.stringify(state));
    });
    
    // Add event listeners for wheel selection
    wheelGrid.addEventListener('click', (event) => {
        const wheelOption = event.target.closest('.wheel-option');
        if (!wheelOption) return;
        
        // Get wheel details from the clicked element
        const wheelModel = wheelOption.getAttribute('data-model');
        if (!wheelModel) return;
        
        // Show loading state immediately when wheel is selected
        showLoading();
        
        // Update state with selected wheel model
        state.wheel.model = wheelModel;
        
        // Update UI to show selected wheel
        const allWheelOptions = document.querySelectorAll('.wheel-option');
        allWheelOptions.forEach(option => {
            option.classList.remove('selected');
        });
        wheelOption.classList.add('selected');
        
        // Find a wheel with this model and get the first available finish
        let finishWheel = null;
        
        if (wheelsByVehicle[state.vehicle.model]) {
            finishWheel = wheelsByVehicle[state.vehicle.model].find(w => 
                w.model === wheelModel && 
                w.compatibleVehicles.includes(state.vehicle.model)
            );
        }
        
        if (!finishWheel) {
            finishWheel = WHEELS_DATA.find(w => 
                w.model === wheelModel && 
                w.compatibleVehicles && w.compatibleVehicles.includes(state.vehicle.model)
            );
        }
        
        if (finishWheel) {
            state.wheel.finish = finishWheel.finish;
        }
        
        // Small delay to ensure loading animation is visible
        setTimeout(() => {
            // Update wheel display with new wheel data
            updateWheelDisplay();
        }, 100);
    });
}

// Toggle between regular and lowered vehicle images
function toggleLoweredMode() {
    // Show loading state
    showLoading();
    
    // Find the current vehicle
    const vehicle = VEHICLES_DATA.find(v => {
        const yearMatch = v.year === state.vehicle.year;
        const makeMatch = v.make.toLowerCase() === state.vehicle.make.toLowerCase();
        
        // For model, we need to be more flexible due to potential variations
        const modelA = v.model.toLowerCase();
        const modelB = state.vehicle.model.toLowerCase();
        const modelMatch = modelA.includes(modelB) || modelB.includes(modelA);
        
        const colorMatch = v.color.toLowerCase() === state.vehicle.color.toLowerCase();
        
        return yearMatch && makeMatch && modelMatch && colorMatch;
    });
    
    if (!vehicle) {
        console.warn('Vehicle not found for toggling lowered mode');
        hideLoading();
        return;
    }
    
    console.log('Toggling lowered mode:', vehicle);
    console.log('Lower image URL:', vehicle.lowerImage);
    
    // Only toggle if we actually have a lower image
    if (!vehicle.lowerImage || vehicle.lowerImage.trim() === '') {
        console.warn('No lower image available for this vehicle');
        hideLoading();
        return;
    }
    
    // Toggle the lowered state
    state.vehicle.isLowered = !state.vehicle.isLowered;
    
    // Determine which image URL to use based on lowered state
    const imageUrl = state.vehicle.isLowered ? vehicle.lowerImage : vehicle.image;
    
    if (imageUrl) {
        // Preload the image
        const img = new Image();
        let imageLoadTimeout = setTimeout(() => {
            console.warn('Image load timeout exceeded, but still attempting to load');
        }, 5000);
        
        img.onload = function() {
            clearTimeout(imageLoadTimeout);
            vehicleImage.src = imageUrl;
            vehicleImage.classList.remove('error');
            hideLoading();
            
            // Update toggle switch state
            const lowerToggleBtn = document.getElementById('lower-toggle-btn');
            if (lowerToggleBtn) {
                const stockOption = lowerToggleBtn.querySelector('[data-mode="stock"]');
                const loweredOption = lowerToggleBtn.querySelector('[data-mode="lowered"]');
                
                if (stockOption && loweredOption) {
                    if (state.vehicle.isLowered) {
                        stockOption.classList.remove('active');
                        stockOption.classList.add('inactive');
                        loweredOption.classList.remove('inactive');
                        loweredOption.classList.add('active');
                    } else {
                        stockOption.classList.remove('inactive');
                        stockOption.classList.add('active');
                        loweredOption.classList.remove('active');
                        loweredOption.classList.add('inactive');
                    }
                }
            }
        };
        
        img.onerror = function() {
            clearTimeout(imageLoadTimeout);
            console.error('Failed to load vehicle image:', imageUrl);
            hideLoading();
            
            // Revert the state if image failed to load
            state.vehicle.isLowered = !state.vehicle.isLowered;
        };
        
        img.setAttribute('crossorigin', 'anonymous');
        img.src = imageUrl;
    } else {
        console.warn('No image URL available for the selected state');
        hideLoading();
        
        // Revert the state if no image is available
        state.vehicle.isLowered = !state.vehicle.isLowered;
    }
}

// Add styles for the lower toggle button
function addLowerToggleButtonStyles() {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .lower-toggle-btn {
            position: absolute;
            bottom: 10px;
            right: 10px;
            display: flex;
            border-radius: 30px;
            background: rgba(0, 0, 0, 0.75);
            color: white;
            border: none;
            font-size: 11px;
            font-weight: 600;
            z-index: 1000;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            width: 200px;
            height: 30px;
            transition: all 0.3s ease;
            cursor: pointer;
            letter-spacing: 0.5px;
        }
        
        .lower-toggle-btn .toggle-option {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 50%;
            height: 100%;
            padding: 0;
            text-align: center;
            transition: all 0.3s ease;
        }
        
        .lower-toggle-btn .toggle-option.active {
            background: #000;
            color: white;
        }
        
        .lower-toggle-btn .toggle-option.inactive {
            background: transparent;
            color: rgba(255,255,255,0.7);
        }
    `;
    document.head.appendChild(styleEl);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init); 