// Email Configuration Example
// Copy this file to email-config.js and update with your credentials

module.exports = {
    // Gmail Configuration (Recommended)
    gmail: {
        service: 'gmail',
        auth: {
            user: 'anjaneyaborewells@gmail.com',
            pass: 'your-gmail-app-password-here' // Use App Password, not regular password
        }
    },
    
    // Alternative: Custom SMTP Configuration
    smtp: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: 'anjaneyaborewells@gmail.com',
            pass: 'your-gmail-app-password-here'
        }
    },
    
    // Email Settings
    settings: {
        from: 'anjaneyaborewells@gmail.com',
        to: 'manirajankg@gmail.com',
        replyTo: 'anjaneyaborewells@gmail.com'
    }
};

/* 
Gmail App Password Setup Instructions:
1. Go to your Google Account (myaccount.google.com)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate app password for "Mail"
5. Use the 16-character app password (not your regular password)
6. Copy this file to email-config.js and update credentials
*/
