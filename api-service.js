// API Service for Anjaneya Borewells
class ApiService {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiURL = `${this.baseURL}/api`;
    }

    // Generic API request method
    async request(endpoint, options = {}) {
        const url = `${this.apiURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Get all settings
    async getSettings() {
        return await this.request('/settings');
    }

    // Update settings
    async updateSettings(settings) {
        return await this.request('/settings', {
            method: 'POST',
            body: JSON.stringify(settings)
        });
    }

    // Reset settings to default
    async resetSettings() {
        return await this.request('/settings/reset', {
            method: 'POST'
        });
    }

    // Download settings backup
    async downloadBackup() {
        try {
            const response = await fetch(`${this.apiURL}/settings/backup`);
            if (!response.ok) {
                throw new Error('Failed to download backup');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `anjaneya-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return { success: true, message: 'Backup downloaded successfully' };
        } catch (error) {
            console.error('Backup download failed:', error);
            throw error;
        }
    }

    // Submit contact form
    async submitContact(formData) {
        return await this.request('/contact', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
    }

    // Check API health
    async checkHealth() {
        return await this.request('/health');
    }

    // Fallback to localStorage if server is not available
    async getSettingsWithFallback() {
        try {
            return await this.getSettings();
        } catch (error) {
            console.warn('Server not available, using localStorage fallback');
            const localSettings = localStorage.getItem('anjaneya-settings');
            if (localSettings) {
                return {
                    success: true,
                    data: JSON.parse(localSettings),
                    source: 'localStorage'
                };
            }
            throw new Error('No settings available in localStorage');
        }
    }

    // Update with fallback to localStorage
    async updateSettingsWithFallback(settings) {
        try {
            const result = await this.updateSettings(settings);
            // Also save to localStorage as backup
            localStorage.setItem('anjaneya-settings', JSON.stringify(settings));
            return result;
        } catch (error) {
            console.warn('Server not available, saving to localStorage only');
            localStorage.setItem('anjaneya-settings', JSON.stringify(settings));
            return {
                success: true,
                message: 'Settings saved locally (server unavailable)',
                data: settings,
                source: 'localStorage'
            };
        }
    }
}

// Create global instance
window.apiService = new ApiService();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}
