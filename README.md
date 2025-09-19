# Anjaneya Borewells - Professional Website with Server-Side Admin Panel

## 🚀 Features

- **Professional Website**: Modern, responsive design with advanced animations
- **Cost Calculator**: Interactive borewell cost estimation tool
- **Admin Panel**: Server-side data management for settings and content
- **Mobile Responsive**: Optimized for all devices
- **3D Background**: Animated cube patterns
- **Typewriter Effect**: Dynamic company name and Tamil slogan animation

## 🛠️ Setup Instructions

### Prerequisites
- **Node.js** (version 14 or higher)
- **npm** (comes with Node.js)

### Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Development Mode** (with auto-restart):
   ```bash
   npm run dev
   ```

### Access Points

- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **API Health Check**: http://localhost:3000/api/health

## 📊 API Endpoints

### Settings Management
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Update settings
- `POST /api/settings/reset` - Reset to defaults
- `GET /api/settings/backup` - Download settings backup

### Data Structure
```json
{
  "companyInfo": {
    "name": "Anjaneya Borewells",
    "phone1": "+91 83000 30123",
    "phone2": "+91 965 965 7777",
    "email": "anjaneyaborewells@gmail.com",
    "address": "...",
    "footerText": "© 2025 Anjaneya Borewells. All rights reserved."
  },
  "socialMedia": {
    "facebook": "...",
    "instagram": "...",
    "whatsapp": "...",
    "youtube": "...",
    "linkedin": "..."
  },
  "pricing": {
    "pvc7Rate": 450,
    "pvc10Rate": 750,
    "drillingRate": 50,
    "gstPercentage": 18
  }
}
```

## 🔧 Admin Panel Features

### Server-Side Storage
- **Persistent Data**: Settings stored in `data/settings.json`
- **Automatic Backup**: Local storage fallback when server unavailable
- **Real-time Status**: Server connection indicator
- **Backup Downloads**: Export settings as JSON files

### Enhanced Admin Features
- **Live Server Status**: Green (online) / Red (offline) indicator
- **Backup Downloads**: One-click settings backup
- **Fallback Mode**: Works offline with localStorage
- **Real-time Updates**: Instant synchronization across tabs

## 📱 Mobile Responsive

The website is fully optimized for:
- **Desktop** (1024px+)
- **Tablet** (768px - 1024px)
- **Mobile** (480px - 768px)
- **Small Mobile** (360px - 480px)

## 🎨 Design Features

- **Rainbow Logo**: Animated gradient company name
- **Tamil Slogan**: "ஆழமான நம்பிக்கை!" with typewriter effect
- **3D Cubes**: Animated background with dark outer shells
- **Glass Morphism**: Modern UI effects throughout
- **Professional Colors**: Fixed green and gray color scheme

## 🔒 Security Notes

- Settings are stored in local JSON files
- No sensitive data should be stored in the settings
- For production, consider using a proper database
- Implement authentication for admin panel access

## 🚀 Deployment

### Local Development
```bash
npm start
```

### Production Deployment
1. **Heroku**: Use the included `server.js`
2. **Vercel**: Configure for Node.js deployment
3. **DigitalOcean**: Use PM2 for process management
4. **Netlify**: Use serverless functions

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## 📞 Contact Information

- **Phone**: +91 83000 30123, +91 965 965 7777
- **Email**: anjaneyaborewells@gmail.com
- **Address**: Namakkal, Tamil Nadu 637001

## 🎯 Tamil Slogan
**"ஆழமான நம்பிக்கை!"** - Deep Trust!

---
© 2025 Anjaneya Borewells. All rights reserved.