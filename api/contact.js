// Vercel Serverless Function for Contact Form
// This file should be placed in /api/contact.js for Vercel deployment

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
        const { name, email, phone, message } = req.body;

        // Basic validation
        if (!name || !email || !phone || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
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

        // Create transporter (using environment variables)
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'anjaneyaborewells@gmail.com',
            to: process.env.EMAIL_TO || 'anjaneyaborewells@gmail.com',
            subject: `New Contact Form Submission - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">New Contact Form Submission</h2>
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #1f2937; margin-top: 0;">Contact Details</h3>
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Phone:</strong> ${phone}</p>
                        <p><strong>Message:</strong></p>
                        <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e;">
                            ${message.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        <p style="color: #6b7280; font-size: 14px;">
                            This email was sent from the Anjaneya Borewells website contact form.<br>
                            Sent on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                        </p>
                    </div>
                </div>
            `,
            text: `
                New Contact Form Submission
                
                Name: ${name}
                Email: ${email}
                Phone: ${phone}
                Message: ${message}
                
                Sent on: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        // Send auto-reply to customer
        const autoReplyOptions = {
            from: process.env.EMAIL_FROM || 'anjaneyaborewells@gmail.com',
            to: email,
            subject: 'Thank you for contacting Anjaneya Borewells',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #22c55e; margin-bottom: 10px;">Anjaneya Borewells</h1>
                        <p style="color: #6b7280; font-style: italic;">Makers of Green India!</p>
                    </div>
                    
                    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h2 style="color: #1f2937; margin-top: 0;">Thank you for your inquiry!</h2>
                        <p>Dear ${name},</p>
                        <p>Thank you for contacting Anjaneya Borewells. We have received your message and will get back to you within 24 hours.</p>
                        
                        <h3 style="color: #1f2937;">Your Message:</h3>
                        <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #22c55e;">
                            ${message.replace(/\n/g, '<br>')}
                        </p>
                    </div>
                    
                    <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #065f46; margin-top: 0;">Contact Information</h3>
                        <p><strong>Phone:</strong> +91 83000 30123, +91 965 965 7777</p>
                        <p><strong>Email:</strong> anjaneyaborewells@gmail.com</p>
                        <p><strong>Address:</strong> 6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                        <p style="color: #6b7280; font-size: 14px;">
                            This is an automated response. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            `,
            text: `
                Anjaneya Borewells - Makers of Green India!
                
                Dear ${name},
                
                Thank you for contacting Anjaneya Borewells. We have received your message and will get back to you within 24 hours.
                
                Your Message:
                ${message}
                
                Contact Information:
                Phone: +91 83000 30123, +91 965 965 7777
                Email: anjaneyaborewells@gmail.com
                Address: 6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001
                
                This is an automated response. Please do not reply to this email.
            `
        };

        await transporter.sendMail(autoReplyOptions);

        return res.status(200).json({ 
            success: true, 
            message: 'Message sent successfully' 
        });

    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Failed to send message. Please try again later.' 
        });
    }
}
