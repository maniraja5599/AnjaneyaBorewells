# Anjaneya Borewells Website

A production-ready, responsive website for Anjaneya Borewells - professional water well drilling services. Features a cost calculator, admin panel, and modern design with SEO optimization.

## 🚀 Features

### Core Features
- **Responsive Design**: Mobile-first approach with clean, modern UI
- **Cost Calculator**: Interactive calculator with real-time updates and PDF export
- **Admin Panel**: Simple interface to update rates, settings, and company information
- **SEO Optimized**: Meta tags, structured data, and accessibility features
- **Contact Forms**: Email integration with anti-spam measures
- **PDF Generation**: Downloadable quotes with company branding

### Calculator Features
- **Material Cost Calculation**: 7" PVC (₹450/ft), 10" PVC (₹750/ft)
- **Drilling Cost**: Configurable rate per foot with slab-tier support
- **Tax Calculations**: GST percentage calculations
- **Live Updates**: Real-time calculation as inputs change
- **PDF Export**: Professional quote generation with company details
- **Input Validation**: Prevents invalid inputs and provides warnings

### Admin Features
- **Rate Management**: Update PVC rates, drilling rates, taxes
- **Company Info**: Manage contact details, address, branding
- **Default Settings**: Configure calculator defaults
- **Import/Export**: Backup and restore settings
- **Real-time Sync**: Changes reflect immediately on the website

## 📁 Project Structure

```
anjaneya-borewells/
├── index.html              # Main website
├── admin.html              # Admin panel
├── styles.css              # Main stylesheet
├── script.js               # Main JavaScript
├── api/                    # API endpoints
│   ├── contact.js          # Contact form handler
│   └── callback.js         # Callback request handler
├── .env.example           # Environment variables template
├── package.json           # Dependencies and scripts
├── netlify.toml          # Netlify deployment config
├── vercel.json           # Vercel deployment config
├── manifest.json         # PWA manifest
├── sw.js                 # Service worker
└── README.md             # This file
```

## 🛠️ Installation & Setup

### Option 1: Static Hosting (Recommended)

1. **Clone or download** the project files
2. **Upload to hosting service**:
   - Netlify: Drag and drop the folder
   - Vercel: Connect GitHub repository
   - GitHub Pages: Push to repository

### Option 2: Local Development

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd anjaneya-borewells
   ```

2. **Serve locally**:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**: `http://localhost:8000`

## ⚙️ Configuration

### Admin Panel Access
1. Navigate to `/admin.html` on your website
2. Update rates, company information, and defaults
3. Settings are saved to browser's localStorage
4. Changes reflect immediately on the main website

### Environment Variables (Optional)
Create `.env` file for email functionality:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=anjaneyaborewells@gmail.com
```

## 🧪 Testing

### Run Unit Tests
```bash
node tests/calculator.test.js
```

### Manual Testing Checklist
- [ ] Calculator calculates correctly with different inputs
- [ ] PDF generation works properly
- [ ] Admin panel saves and loads settings
- [ ] Contact forms submit successfully
- [ ] Mobile responsiveness on different devices
- [ ] SEO meta tags are present
- [ ] All links and navigation work

## 🚀 Deployment

### Netlify (Recommended)
1. **Connect repository** to Netlify
2. **Build settings**:
   - Build command: `echo "No build required"`
   - Publish directory: `/`
3. **Deploy**: Automatic deployment on push

### Vercel
1. **Import project** from GitHub
2. **Framework preset**: Other
3. **Build settings**:
   - Build command: `echo "Static site"`
   - Output directory: `.`
4. **Deploy**: Automatic deployment

### Traditional Hosting
1. **Upload files** via FTP/SFTP
2. **Ensure** all files are in the root directory
3. **Set** `index.html` as the default page
4. **Test** all functionality

## 📊 Calculator Configuration

### Default Rates (Configurable via Admin)
- **7" PVC**: ₹450 per foot
- **10" PVC**: ₹750 per foot
- **Drilling Rate**: ₹50 per foot
- **GST**: 18%
- **Contingency**: 5%

### Slab-Based Pricing (Future Enhancement)
The calculator is designed to support slab-based pricing tiers:
```javascript
// Example slab configuration
const slabRates = [
    { from: 0, to: 100, rate: 60 },
    { from: 101, to: 300, rate: 55 },
    { from: 301, to: 500, rate: 50 },
    { from: 501, to: 1000, rate: 45 },
    { from: 1001, to: Infinity, rate: 40 }
];
```

## 🎨 Customization

### Branding
- **Colors**: Update CSS variables in `styles.css`
- **Logo**: Replace SVG icons with your logo
- **Company Info**: Update in admin panel or directly in HTML

### Calculator Customization
- **Add new materials**: Extend the calculator form
- **Change rates**: Use admin panel or edit `script.js`
- **Modify calculations**: Update `performCalculation()` method

### Styling
- **CSS Variables**: Located at the top of `styles.css`
- **Responsive Breakpoints**: Modify media queries
- **Animations**: Adjust transition durations and effects

## 📱 Browser Support

- **Modern Browsers**: Chrome 60+, Firefox 60+, Safari 12+, Edge 79+
- **Mobile**: iOS Safari 12+, Chrome Mobile 60+
- **Features**: CSS Grid, Flexbox, ES6+, LocalStorage

## 🔧 Troubleshooting

### Common Issues

1. **Calculator not updating**:
   - Check browser console for JavaScript errors
   - Ensure all input fields have valid values
   - Verify localStorage is enabled

2. **PDF not generating**:
   - Check if jsPDF library is loaded
   - Ensure browser supports PDF generation
   - Try different browser

3. **Admin panel not saving**:
   - Check localStorage permissions
   - Clear browser cache and try again
   - Verify all required fields are filled

4. **Mobile layout issues**:
   - Clear browser cache
   - Check viewport meta tag
   - Test on different devices

### Performance Optimization
- **Images**: Use WebP format when possible
- **CSS**: Minify stylesheet for production
- **JavaScript**: Minify script files
- **Caching**: Set appropriate cache headers

## 📈 Analytics & Monitoring

### Google Analytics (Optional)
Add tracking code to `index.html`:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### Performance Monitoring
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Page Speed**: Use Google PageSpeed Insights
- **Mobile Testing**: Test on real devices

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For technical support or questions:
- **Email**: anjaneyaborewells@gmail.com
- **Phone**: +91 83000 30123, +91 965 965 7777
- **Address**: 6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001

## 🚀 Future Enhancements

- [ ] Slab-based pricing tiers
- [ ] Multi-language support
- [ ] Advanced project management
- [ ] Customer portal
- [ ] Payment integration
- [ ] SMS notifications
- [ ] Progressive Web App (PWA)
- [ ] Advanced analytics dashboard

---

**Built with ❤️ for Anjaneya Borewells - Makers of Green India!**
