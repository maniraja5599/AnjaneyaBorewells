// Admin Panel API Integration
// This file extends the existing admin panel with server-side storage

// Override the existing AdminPanel saveSettings method
document.addEventListener('DOMContentLoaded', function() {
    // Wait for AdminPanel to be initialized
    setTimeout(() => {
        if (window.adminPanel && window.apiService) {
            // Store original methods
            const originalSaveSettings = window.adminPanel.saveSettings.bind(window.adminPanel);
            const originalLoadSettings = window.adminPanel.loadSettings.bind(window.adminPanel);
            
            // Override saveSettings with API integration
            window.adminPanel.saveSettings = async function() {
                try {
                    this.showNotification('Saving settings to server...', 'info');
                    
                    const formData = new FormData(document.getElementById('adminForm'));
                    const data = Object.fromEntries(formData);
                    
                    // Update settings object (same as original)
                    this.settings.pvc7Rate = parseFloat(data.pvc7Rate);
                    this.settings.pvc10Rate = parseFloat(data.pvc10Rate);
                    this.settings.defaultDrillingRate = parseFloat(data.defaultDrillingRate);
                    this.settings.defaultGst = parseFloat(data.defaultGst);
                    this.settings.defaultTotalDepth = parseInt(data.defaultTotalDepth);
                    this.settings.defaultPvc7Length = parseInt(data.defaultPvc7Length);
                    this.settings.defaultPvc10Length = parseInt(data.defaultPvc10Length);
                    
                    this.settings.companyInfo.name = data.companyName;
                    this.settings.companyInfo.tagline = data.tagline;
                    this.settings.companyInfo.phone1 = data.phone1;
                    this.settings.companyInfo.phone2 = data.phone2;
                    this.settings.companyInfo.email = data.email;
                    this.settings.companyInfo.address = data.address;
                    this.settings.companyInfo.footerText = data.footerText;
                    
                    // Social media links
                    if (!this.settings.socialMedia) {
                        this.settings.socialMedia = {};
                    }
                    this.settings.socialMedia.facebook = data.facebookUrl || '';
                    this.settings.socialMedia.instagram = data.instagramUrl || '';
                    this.settings.socialMedia.whatsapp = data.whatsappUrl || '';
                    this.settings.socialMedia.youtube = data.youtubeUrl || '';
                    this.settings.socialMedia.linkedin = data.linkedinUrl || '';
                    
                    // Save to server with fallback to localStorage
                    const response = await window.apiService.updateSettingsWithFallback(this.settings);
                    
                    if (response.success) {
                        const source = response.source === 'localStorage' ? ' (offline mode)' : '';
                        this.showNotification(`Settings saved successfully${source}!`, 'success');
                        
                        // Trigger custom event for same-tab communication
                        window.dispatchEvent(new CustomEvent('anjaneyaSettingsUpdated', {
                            detail: {
                                settings: this.settings,
                                timestamp: Date.now(),
                                source: response.source || 'server'
                            }
                        }));
                    }
                    
                } catch (error) {
                    console.error('Error saving settings:', error);
                    this.showNotification('Error saving settings. Please try again.', 'error');
                }
            };
            
            // Override loadSettings with API integration
            window.adminPanel.loadSettings = async function() {
                try {
                    this.showNotification('Loading settings from server...', 'info');
                    const response = await window.apiService.getSettingsWithFallback();
                    
                    if (response.success) {
                        this.settings = { ...this.getDefaultSettings(), ...response.data };
                        this.populateForm();
                        
                        const source = response.source === 'localStorage' ? ' (offline mode)' : '';
                        this.showNotification(`Settings loaded successfully${source}`, 'success');
                    }
                } catch (error) {
                    console.error('Error loading settings:', error);
                    this.showNotification('Error loading settings. Using defaults.', 'error');
                    this.populateForm();
                }
            };
            
            // Add server status indicator
            const addServerStatus = () => {
                const header = document.querySelector('.admin-header');
                if (header && !document.getElementById('serverStatus')) {
                    const statusDiv = document.createElement('div');
                    statusDiv.id = 'serverStatus';
                    statusDiv.style.cssText = `
                        position: absolute;
                        top: 10px;
                        right: 20px;
                        padding: 5px 10px;
                        border-radius: 15px;
                        font-size: 0.8rem;
                        font-weight: 600;
                    `;
                    header.style.position = 'relative';
                    header.appendChild(statusDiv);
                    
                    // Check server status
                    checkServerStatus();
                }
            };
            
            const checkServerStatus = async () => {
                const statusDiv = document.getElementById('serverStatus');
                if (!statusDiv) return;
                
                try {
                    await window.apiService.checkHealth();
                    statusDiv.textContent = '🟢 Server Online';
                    statusDiv.style.background = '#dcfce7';
                    statusDiv.style.color = '#166534';
                } catch (error) {
                    statusDiv.textContent = '🔴 Offline Mode';
                    statusDiv.style.background = '#fef2f2';
                    statusDiv.style.color = '#dc2626';
                }
            };
            
            // Add server status indicator
            addServerStatus();
            
            // Check server status every 30 seconds
            setInterval(checkServerStatus, 30000);
            
            // Add backup download functionality
            const addBackupButton = () => {
                const actionsDiv = document.querySelector('.admin-actions');
                if (actionsDiv && !document.getElementById('backupBtn')) {
                    const backupBtn = document.createElement('button');
                    backupBtn.id = 'backupBtn';
                    backupBtn.type = 'button';
                    backupBtn.className = 'btn btn-secondary';
                    backupBtn.textContent = 'Download Backup';
                    backupBtn.addEventListener('click', async () => {
                        try {
                            await window.apiService.downloadBackup();
                            window.adminPanel.showNotification('Backup downloaded successfully!', 'success');
                        } catch (error) {
                            window.adminPanel.showNotification('Error downloading backup', 'error');
                        }
                    });
                    actionsDiv.appendChild(backupBtn);
                }
            };
            
            addBackupButton();
            
            console.log('✅ Admin Panel API integration loaded successfully');
        }
    }, 1000);
});
