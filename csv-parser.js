/**
 * Simple CSV Parser Utility
 * In a production environment, this would be used to read data from CSV files
 */

class CSVParser {
    /**
     * Parse CSV string to array of objects
     * @param {string} csvString - The CSV data as a string
     * @param {boolean} hasHeader - Whether the CSV has a header row (defaults to true)
     * @returns {Array} - Array of objects with properties from CSV headers
     */
    static parse(csvString, hasHeader = true) {
        // Split the CSV into rows
        const rows = csvString.split(/\r?\n/).filter(row => row.trim() !== '');
        
        if (rows.length === 0) {
            return [];
        }
        
        // Get headers
        const headers = hasHeader ? 
            this.parseRow(rows[0]) : 
            Array.from({ length: this.parseRow(rows[0]).length }, (_, i) => `Column${i + 1}`);
        
        // Parse data rows
        const data = [];
        const startRow = hasHeader ? 1 : 0;
        
        for (let i = startRow; i < rows.length; i++) {
            const values = this.parseRow(rows[i]);
            
            // Skip rows with incorrect number of columns
            if (values.length !== headers.length) {
                console.warn(`Row ${i} has ${values.length} values, expected ${headers.length}. Skipping.`);
                continue;
            }
            
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index];
            });
            
            data.push(row);
        }
        
        return data;
    }
    
    /**
     * Parse a single CSV row into an array of values
     * @param {string} row - The CSV row
     * @returns {Array} - Array of values from the row
     */
    static parseRow(row) {
        const result = [];
        let inQuotes = false;
        let currentValue = '';
        
        for (let i = 0; i < row.length; i++) {
            const char = row[i];
            const nextChar = row[i + 1];
            
            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    // Escaped quote
                    currentValue += '"';
                    i++;
                } else {
                    // Toggle quote mode
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                // End of field
                result.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        
        // Add the last value
        result.push(currentValue.trim());
        
        return result;
    }
    
    /**
     * Load CSV data from file (for use in browser with File API)
     * @param {File} file - The CSV file
     * @returns {Promise} - Promise resolving to array of objects from CSV
     */
    static loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                try {
                    const csvData = this.parse(event.target.result);
                    resolve(csvData);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    }
    
    /**
     * Process vehicle data into the format needed by the app
     * @param {Array} data - The already parsed vehicle data
     * @returns {Array} - Processed vehicle data
     */
    static processVehicleData(data) {
        console.log("Processing vehicle data:", data.length, "rows");
        console.log("Sample row:", data[0]);
        console.log("Available columns:", Object.keys(data[0]));
        
        return data.map(row => {
            const processedRow = {
                year: row.Year,
                make: row.Make,
                model: row.Model,
                color: row.Color,
                image: row.Image,
                swatch: row.Swatch || '' // Include swatch value from CSV
            };
            
            console.log(`Processed vehicle: ${processedRow.year} ${processedRow.make} ${processedRow.model} (${processedRow.color}) - Swatch: ${processedRow.swatch}`);
            return processedRow;
        });
    }
    
    /**
     * Process wheel data into the format needed by the app
     * @param {Array} data - The already parsed wheel data
     * @returns {Array} - Processed wheel data
     */
    static processWheelData(data) {
        console.log("Processing wheel data:", data.length, "rows");
        console.log("Sample row:", data[0]);
        console.log("Available columns:", Object.keys(data[0]));
        
        return data.map(row => {
            // Create a map of vehicle models to their specific wheel overlay images
            const vehicleWheelImages = {};
            const compatibleVehicles = [];
            
            Object.keys(row).forEach(key => {
                // Columns that aren't standard properties are vehicle models with overlay image URLs
                if (!['Brand', 'Model', 'Finish', 'Wheel Image', 'Swatch', 'ID'].includes(key) && row[key]) {
                    // Store the overlay image URL for this vehicle model
                    // The key should exactly match the model name in the vehicles data
                    vehicleWheelImages[key] = row[key];
                    compatibleVehicles.push(key);
                    console.log(`Found overlay for vehicle model "${key}": ${row[key]}`);
                }
            });
            
            const wheelData = {
                brand: row.Brand,
                model: row.Model,
                finish: row.Finish,
                wheelImage: row['Wheel Image'], // Thumbnail image
                swatch: row.Swatch,
                id: row.ID,
                compatibleVehicles,
                vehicleWheelImages  // Map of vehicle model to overlay image URL
            };
            
            console.log(`Processed wheel: ${wheelData.brand} ${wheelData.model} ${wheelData.finish}`);
            console.log(`Compatible vehicles: ${wheelData.compatibleVehicles.join(', ')}`);
            
            return wheelData;
        });
    }
}

// Example usage:
/*
document.getElementById('vehicleFileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            const vehicleData = await CSVParser.loadFromFile(file);
            const processedData = CSVParser.processVehicleData(vehicleData);
            console.log('Processed vehicle data:', processedData);
        } catch (error) {
            console.error('Error loading vehicle data:', error);
        }
    }
});

document.getElementById('wheelFileInput').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (file) {
        try {
            const wheelData = await CSVParser.loadFromFile(file);
            const processedData = CSVParser.processWheelData(wheelData);
            console.log('Processed wheel data:', processedData);
        } catch (error) {
            console.error('Error loading wheel data:', error);
        }
    }
});
*/ 