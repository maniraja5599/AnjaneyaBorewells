// Anjaneya Borewells - Backend Server
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3000;
const SETTINGS_FILE = path.join(__dirname, 'data', 'settings.json');

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'anjaneyaborewells@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password-here'
    }
});

// Email template for contact form
const createContactEmailTemplate = (formData) => {
    return {
        from: process.env.EMAIL_USER || 'anjaneyaborewells@gmail.com',
        to: 'manirajankg@gmail.com',
        subject: `New Contact Form Submission - ${formData.name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #22c55e; text-align: center; margin-bottom: 30px;">
                    🔧 New Contact Form Submission
                </h2>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0;">Customer Details:</h3>
                    
                    <p style="margin: 8px 0;"><strong>👤 Name:</strong> ${formData.name}</p>
                    
                    ${formData.phone ? `<p style="margin: 8px 0;"><strong>📞 Mobile:</strong> <a href="tel:${formData.phone}" style="color: #22c55e; text-decoration: none;">${formData.phone}</a></p>` : ''}
                    
                    ${formData.address ? `<p style="margin: 8px 0;"><strong>📍 Address:</strong> ${formData.address}</p>` : ''}
                </div>
                
                ${formData.message ? `
                <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #374151; margin: 0 0 15px 0;">💬 Message:</h3>
                    <p style="line-height: 1.6; color: #4b5563; margin: 0;">${formData.message}</p>
                </div>
                ` : ''}
                
                <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; color: #065f46; font-size: 14px;">
                        📧 This email was sent from the Anjaneya Borewells website contact form<br>
                        🕒 Submitted on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                    </p>
                </div>
            </div>
        `
    };
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Ensure data directory exists
async function ensureDataDirectory() {
    const dataDir = path.join(__dirname, 'data');
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Default settings
const defaultSettings = {
    companyInfo: {
        name: "Anjaneya Borewells",
        phone1: "+91 83000 30123",
        phone2: "+91 965 965 7777",
        email: "anjaneyaborewells@gmail.com",
        address: "6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001",
        footerText: "© 2025 Anjaneya Borewells. All rights reserved."
    },
    socialMedia: {
        facebook: "https://facebook.com/anjaneyaborewells",
        instagram: "https://instagram.com/anjaneyaborewells",
        whatsapp: "https://wa.me/918300030123",
        youtube: "https://youtube.com/@anjaneyaborewells",
        linkedin: "https://linkedin.com/company/anjaneyaborewells"
    },
    pricing: {
        pvc7Rate: 450,
        pvc10Rate: 750,
        drillingRate: 50,
        gstPercentage: 18
    },
    lastUpdated: new Date().toISOString()
};

// Load settings from file
async function loadSettings() {
    try {
        const data = await fs.readFile(SETTINGS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Settings file not found, creating with defaults...');
        await saveSettings(defaultSettings);
        return defaultSettings;
    }
}

// Save settings to file
async function saveSettings(settings) {
    try {
        await ensureDataDirectory();
        settings.lastUpdated = new Date().toISOString();
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// API Routes

// Get all settings
app.get('/api/settings', async (req, res) => {
    try {
        const settings = await loadSettings();
        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to load settings'
        });
    }
});

// Update settings
app.post('/api/settings', async (req, res) => {
    try {
        const newSettings = req.body;
        
        // Validate required fields
        if (!newSettings.companyInfo || !newSettings.pricing) {
            return res.status(400).json({
                success: false,
                error: 'Missing required settings data'
            });
        }

        const success = await saveSettings(newSettings);
        
        if (success) {
            res.json({
                success: true,
                message: 'Settings updated successfully',
                data: newSettings
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to save settings'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Reset settings to default
app.post('/api/settings/reset', async (req, res) => {
    try {
        const success = await saveSettings(defaultSettings);
        
        if (success) {
            res.json({
                success: true,
                message: 'Settings reset to defaults',
                data: defaultSettings
            });
        } else {
            res.status(500).json({
                success: false,
                error: 'Failed to reset settings'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get settings backup
app.get('/api/settings/backup', async (req, res) => {
    try {
        const settings = await loadSettings();
        const filename = `anjaneya-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/json');
        res.json(settings);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to create backup'
        });
    }
});

// Contact form submission
app.post('/api/contact', async (req, res) => {
    try {
        const { name, phone, address, message } = req.body;
        
        // Validate required fields
        if (!name || name.trim() === '') {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }
        
        // Prepare email data
        const emailData = createContactEmailTemplate({
            name: name.trim(),
            phone: phone ? phone.trim() : '',
            address: address ? address.trim() : '',
            message: message ? message.trim() : ''
        });
        
        // Send email
        await transporter.sendMail(emailData);
        
        // Log the submission
        console.log(`📧 Contact form submitted by: ${name} at ${new Date().toISOString()}`);
        
        res.json({
            success: true,
            message: 'Message sent successfully! We will contact you soon.'
        });
        
    } catch (error) {
        console.error('Error sending contact email:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send message. Please try again or contact us directly.'
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Anjaneya Borewells API Server is running',
        timestamp: new Date().toISOString()
    });
});

// Serve admin panel
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve main website
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
    await ensureDataDirectory();
    console.log(`🚀 Anjaneya Borewells Server running on port ${PORT}`);
    console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
    console.log(`🌐 Website: http://localhost:${PORT}`);
    console.log(`🔧 API Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
