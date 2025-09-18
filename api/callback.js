// Vercel Serverless Function for Callback Request
// This file should be placed in /api/callback.js for Vercel deployment

const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
        const { name, phone, time, quoteData } = req.body;

        // Basic validation
        if (!name || !phone) {
            return res.status(400).json({ 
                success: false, 
                message: 'Name and phone are required' 
            });
        }

        // Phone validation
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid phone number' 
            });
        }

        // Create transporter
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Parse quote data if available
        let quoteHtml = '';
        if (quoteData) {
            try {
                const quote = JSON.parse(quoteData);
                const { inputs, results } = quote;
                
                quoteHtml = `
                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
                        <h3 style="color: #065f46; margin-top: 0;">Quote Details</h3>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                            <p><strong>Total Depth:</strong> ${inputs.totalDepth} ft</p>
                            <p><strong>7" PVC:</strong> ${inputs.pvc7Length} ft</p>
                            <p><strong>10" PVC:</strong> ${inputs.pvc10Length} ft</p>
                            <p><strong>Drilling Rate:</strong> ₹${inputs.drillingRate}/ft</p>
                        </div>
                        <div style="background: white; padding: 15px; border-radius: 4px;">
                            <h4 style="color: #065f46; margin-top: 0;">Cost Breakdown:</h4>
                            <p><strong>Total Estimated Cost:</strong> ₹${results.totalCost.toLocaleString('en-IN')}</p>
                            <p><strong>Per Foot Rate:</strong> ₹${results.perFootRate.toFixed(2)}</p>
                        </div>
                    </div>
                `;
            } catch (error) {
                console.error('Error parsing quote data:', error);
            }
        }

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'anjaneyaborewells@gmail.com',
            to: process.env.EMAIL_TO || 'anjaneyaborewells@gmail.com',
            subject: `Callback Request - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">New Callback Request</h2>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">Customer Details</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Preferred Time:</strong> ${time || 'Not specified'}</p>
                        <p><strong>Request Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                    </div>
                    ${quoteHtml}
                    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="color: #92400e; margin: 0;"><strong>Action Required:</strong> Please call the customer back within 24 hours.</p>
                    </div>
                </div>
            `,
            text: `
                New Callback Request
                
                Customer Details:
                Name: ${name}
                Phone: ${phone}
                Preferred Time: ${time || 'Not specified'}
                Request Time: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                
                ${quoteData ? 'Quote details included in email.' : ''}
                
                Action Required: Please call the customer back within 24 hours.
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send confirmation SMS (if Twilio is configured)
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            try {
                const twilio = require('twilio');
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                
                await client.messages.create({
                    body: `Hi ${name}, thank you for your callback request. We will contact you within 24 hours. - Anjaneya Borewells`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone.replace(/\s/g, '')
                });
            } catch (smsError) {
                console.error('SMS sending failed:', smsError);
                // Don't fail the request if SMS fails
            }
        }

        return res.status(200).json({ 
            success: true, 
            message: 'Callback request submitted successfully' 
        });

    } catch (error) {
        console.error('Callback request error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to submit callback request. Please try calling us directly.' 
        });
    }
}
