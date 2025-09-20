// Anjaneya Borewells Website JavaScript
class AnjaneyaBorewells {
    constructor() {
        this.init();
        this.calculator = new CostCalculator();
        this.formHandler = new FormHandler();
        this.navigation = new Navigation();
        this.modal = new Modal();
    }

    init() {
        this.setupEventListeners();
        this.initializeAnimations();
        this.setupIntersectionObserver();
        this.initTypewriterEffect();
    }

    setupEventListeners() {
        // Smooth scrolling for navigation links (only for internal hash links)
        document.querySelectorAll('a[href^="#"]:not([href^="https://"]):not([href^="http://"])').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Close mobile menu if it's open (for nav-link clicks)
                if (link.classList.contains('nav-link') || link.id === 'navWhatsappBtn') {
                    this.navigation.closeMobileMenu();
                }
            });
        });

        // Get Quote button goes to calculator section
        document.getElementById('navWhatsappBtn')?.addEventListener('click', (e) => {
            // Let the smooth scrolling handle navigation to #calculator
            console.log('Get Quote button clicked - going to calculator');
        });

        // Window scroll events
        window.addEventListener('scroll', () => {
            this.navigation.handleScroll();
        });

        // Listen for storage changes (admin panel updates from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'anjaneya-admin-settings' || e.key === 'anjaneya-settings') {
                this.calculator.refreshSettings();
                this.updateCompanyInfo();
            }
        });
        
        // Listen for custom event (admin panel updates from same tab)
        window.addEventListener('anjaneyaSettingsUpdated', (e) => {
            this.calculator.refreshSettings();
            this.updateCompanyInfo();
        });

        // Form submissions
        document.getElementById('calculatorForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.calculator.calculate();
        });

        document.getElementById('contactForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.formHandler.handleContactForm();
        });

        document.getElementById('callbackForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.formHandler.handleCallbackForm();
        });

        // Calculator input changes - trigger calculation on any input change
        document.querySelectorAll('#calculatorForm input').forEach(input => {
            input.addEventListener('input', () => {
                this.calculator.calculate();
            });
            input.addEventListener('change', () => {
                this.calculator.calculate();
            });
            
            // Select all text on focus for easier editing (especially on mobile)
            input.addEventListener('focus', (e) => {
                // Small delay to ensure the focus event completes
                setTimeout(() => {
                    e.target.select();
                }, 50);
            });
            
            // Also select all on click for mobile devices
            input.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    e.target.select();
                }
            });
        });

        // GST toggle functionality
        document.getElementById('gstToggle')?.addEventListener('change', (e) => {
            this.calculator.handleGstToggle(e.target.checked);
        });

        // Reset button
        document.getElementById('resetBtn')?.addEventListener('click', () => {
            this.calculator.reset();
        });

        // Refresh settings button
        document.getElementById('refreshSettingsBtn')?.addEventListener('click', () => {
            this.calculator.refreshSettings();
        });

        // PDF download
        document.getElementById('downloadPdfBtn')?.addEventListener('click', () => {
            this.calculator.downloadPDF();
        });

        // Save as Image
        document.getElementById('saveImageBtn')?.addEventListener('click', () => {
            this.calculator.saveAsImage();
        });

        // WhatsApp callback
        document.getElementById('whatsappCallbackBtn')?.addEventListener('click', () => {
            this.calculator.sendWhatsAppQuote();
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.modal.close('emailModal');
        });

        // FAQ toggles
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                this.toggleFAQ(question);
            });
        });

        // Mobile navigation toggle
        document.getElementById('navToggle')?.addEventListener('click', () => {
            this.navigation.toggleMobileMenu();
        });
        
        // Close mobile menu when clicking outside of it
        document.addEventListener('click', (e) => {
            const navMenu = document.getElementById('navMenu');
            const navToggle = document.getElementById('navToggle');
            const navbar = document.getElementById('navbar');
            
            if (navMenu && navMenu.classList.contains('active')) {
                // Check if click is outside the navbar and not on the toggle button
                if (!navbar.contains(e.target) && !navToggle.contains(e.target)) {
                    this.navigation.closeMobileMenu();
                }
            }
        });
        
        // Close mobile menu when pressing Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.navigation.closeMobileMenu();
            }
        });
        
        // Mobile input increment/decrement buttons
        document.querySelectorAll('.input-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                const step = parseFloat(button.getAttribute('data-step')) || 1;
                const isUp = button.classList.contains('input-btn-up');
                const input = document.getElementById(targetId);
                
                if (input) {
                    const currentValue = parseFloat(input.value) || 0;
                    const min = parseFloat(input.getAttribute('min')) || 0;
                    const max = parseFloat(input.getAttribute('max')) || Infinity;
                    
                    let newValue;
                    if (isUp) {
                        newValue = Math.min(currentValue + step, max);
                    } else {
                        newValue = Math.max(currentValue - step, min);
                    }
                    
                    input.value = newValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    input.dispatchEvent(new Event('change', { bubbles: true }));
                }
            });
        });
    }

    initializeAnimations() {
        // Add fade-in class to elements that should animate
        const serviceCards = document.querySelectorAll('.service-card');
        const faqItems = document.querySelectorAll('.faq-item');
        const contactItems = document.querySelectorAll('.contact-item');
        const calculatorContainer = document.querySelector('.calculator-container');
        
        serviceCards.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.animationDelay = `${index * 0.2}s`;
        });
        
        faqItems.forEach((el, index) => {
            el.classList.add('fade-in-left');
            el.style.animationDelay = `${index * 0.1}s`;
        });
        
        contactItems.forEach((el, index) => {
            el.classList.add('fade-in-right');
            el.style.animationDelay = `${index * 0.1}s`;
        });
        
        if (calculatorContainer) {
            calculatorContainer.classList.add('fade-in');
        }
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Add staggered animation for child elements
                    const children = entry.target.querySelectorAll('.service-card, .faq-item, .contact-item');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe all animated elements
        document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right').forEach(el => {
            observer.observe(el);
        });
        
        // Add parallax effect to hero background
        this.addParallaxEffect();
    }
    
    addParallaxEffect() {
        const heroBackground = document.querySelector('.hero-background');
        const hero = document.querySelector('.hero');
        
        if (heroBackground && hero) {
            window.addEventListener('scroll', () => {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;
                const heroHeight = hero.offsetHeight;
                
                if (scrolled < heroHeight) {
                    heroBackground.style.transform = `translateY(${rate}px)`;
                }
            });
        }
    }

    initTypewriterEffect() {
        const companyText = document.getElementById('companyText');
        const tamilSlogan = document.getElementById('tamilSlogan');
        
        if (!companyText || !tamilSlogan) return;
        
        const companyName = 'ANJANEYA BOREWELLS';
        const tamilText = 'ஆழமான நம்பிக்கை!';
        
        let companyIndex = 0;
        let tamilIndex = 0;
        
        // Type company name first
        const typeCompanyName = () => {
            if (companyIndex < companyName.length) {
                companyText.textContent = companyName.slice(0, companyIndex + 1);
                companyIndex++;
                setTimeout(typeCompanyName, 150); // 150ms delay between letters
            } else {
                // Company name complete, start Tamil text (keep cursor)
                setTimeout(() => {
                    tamilSlogan.classList.add('visible');
                    setTimeout(typeTamilText, 500); // Wait 500ms before starting Tamil
                }, 1000); // Wait 1 second after company name
            }
        };
        
        // Type Tamil slogan
        const typeTamilText = () => {
            if (tamilIndex < tamilText.length) {
                tamilSlogan.textContent = tamilText.slice(0, tamilIndex + 1);
                tamilIndex++;
                setTimeout(typeTamilText, 200); // 200ms delay between characters
            } else {
                // Tamil text complete (keep cursor blinking)
                // No action needed - cursors remain visible
            }
        };
        
        // Start the animation after a short delay
        setTimeout(typeCompanyName, 1000);
    }

    toggleFAQ(question) {
        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');
        
        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked item if it wasn't active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    }

    updateCompanyInfo() {
        // Get admin settings from localStorage
        const adminSettings = localStorage.getItem('anjaneya-admin-settings');
        if (!adminSettings) {
            return;
        }
        
        try {
            const settings = JSON.parse(adminSettings);
            const companyInfo = settings.companyInfo;
            
            if (!companyInfo) {
                return;
            }
            
            // Update phone numbers in navigation
            const navPhoneLink = document.querySelector('a[href^="tel:+919659657777"]');
            if (navPhoneLink && companyInfo.phone1) {
                navPhoneLink.href = `tel:${companyInfo.phone1.replace(/\s+/g, '')}`;
            }
            
            // Update phone numbers in hero section
            const heroPhoneLinks = document.querySelectorAll('.hero-contact .contact-item');
            if (heroPhoneLinks.length >= 2) {
                // First phone link (Primary)
                if (companyInfo.phone1) {
                    const firstPhoneLink = heroPhoneLinks[0];
                    firstPhoneLink.href = `tel:${companyInfo.phone1.replace(/\s+/g, '')}`;
                    const firstPhoneSpan = firstPhoneLink.querySelector('span');
                    if (firstPhoneSpan) {
                        firstPhoneSpan.textContent = companyInfo.phone1;
                    }
                }
                
                // Second phone link (Secondary)
                if (companyInfo.phone2) {
                    const secondPhoneLink = heroPhoneLinks[1];
                    secondPhoneLink.href = `tel:${companyInfo.phone2.replace(/\s+/g, '')}`;
                    const secondPhoneSpan = secondPhoneLink.querySelector('span');
                    if (secondPhoneSpan) {
                        secondPhoneSpan.textContent = companyInfo.phone2;
                    }
                }
            }
            
            // Update contact section phone numbers
            const contactPhoneContainer = document.querySelector('.contact-info .contact-item:nth-child(2) div');
            if (contactPhoneContainer) {
                const phoneLinks = contactPhoneContainer.querySelectorAll('a[href^="tel:"]');
                if (phoneLinks.length >= 2) {
                    // First phone (Primary)
                    if (companyInfo.phone1) {
                        phoneLinks[0].href = `tel:${companyInfo.phone1.replace(/\s+/g, '')}`;
                        phoneLinks[0].textContent = companyInfo.phone1;
                    }
                    
                    // Second phone (Secondary)
                    if (companyInfo.phone2) {
                        phoneLinks[1].href = `tel:${companyInfo.phone2.replace(/\s+/g, '')}`;
                        phoneLinks[1].textContent = companyInfo.phone2;
                    }
                }
            }
            
            // Update email in contact section
            const contactEmail = document.querySelector('.contact-info a[href^="mailto:anjaneyaborewells@gmail.com"]');
            if (contactEmail && companyInfo.email) {
                contactEmail.href = `mailto:${companyInfo.email}`;
                contactEmail.textContent = companyInfo.email;
            }
            
            // Update address in contact section
            const addressElement = document.querySelector('.contact-info .contact-item:first-child p');
            if (addressElement && companyInfo.address) {
                addressElement.innerHTML = companyInfo.address.replace(/\n/g, '<br>');
            }
            
            // Update footer contact info
            const footerPhones = document.querySelectorAll('.footer-contact p');
            if (footerPhones.length >= 3) {
                // First phone (Primary)
                if (companyInfo.phone1) {
                    footerPhones[0].textContent = companyInfo.phone1;
                }
                // Second phone (Secondary)
                if (companyInfo.phone2) {
                    footerPhones[1].textContent = companyInfo.phone2;
                }
                // Email
                if (companyInfo.email) {
                    footerPhones[2].textContent = companyInfo.email;
                }
            }
            
            // Update company name and tagline in navigation
            const navBrand = document.querySelector('.nav-brand h1');
            const navTagline = document.querySelector('.nav-brand .tagline');
            
            if (navBrand && companyInfo.name) {
                navBrand.textContent = companyInfo.name;
            }
            
            if (navTagline && companyInfo.tagline) {
                navTagline.textContent = companyInfo.tagline;
            }
            
            // Update footer brand
            const footerBrand = document.querySelector('.footer-brand h3');
            const footerTagline = document.querySelector('.footer-brand p:first-of-type');
            
            if (footerBrand && companyInfo.name) {
                footerBrand.textContent = companyInfo.name;
            }
            
            if (footerTagline && companyInfo.tagline) {
                footerTagline.textContent = companyInfo.tagline;
            }
            
            // Update footer-bottom copyright text
            const footerBottom = document.querySelector('.footer-bottom p');
            if (footerBottom && companyInfo.footerText) {
                footerBottom.innerHTML = companyInfo.footerText;
            }
            
            // Update social media links
            if (settings.socialMedia) {
                const socialMedia = settings.socialMedia;
                
                const facebookLink = document.getElementById('facebookLink');
                if (facebookLink && socialMedia.facebook) {
                    facebookLink.href = socialMedia.facebook;
                }
                
                const instagramLink = document.getElementById('instagramLink');
                if (instagramLink && socialMedia.instagram) {
                    instagramLink.href = socialMedia.instagram;
                }
                
                const whatsappLink = document.getElementById('whatsappLink');
                if (whatsappLink && socialMedia.whatsapp) {
                    whatsappLink.href = socialMedia.whatsapp;
                }
                
                // Update WhatsApp URL based on primary phone if social media WhatsApp not set
                if (whatsappLink && companyInfo.phone1 && !socialMedia.whatsapp) {
                    const cleanPhone = companyInfo.phone1.replace(/[\s\-\(\)]/g, '');
                    whatsappLink.href = `https://wa.me/${cleanPhone}`;
                }
                
                const youtubeLink = document.getElementById('youtubeLink');
                if (youtubeLink && socialMedia.youtube) {
                    youtubeLink.href = socialMedia.youtube;
                }
                
                const linkedinLink = document.getElementById('linkedinLink');
                if (linkedinLink && socialMedia.linkedin) {
                    linkedinLink.href = socialMedia.linkedin;
                }
            }
            
            // Both Get Quote buttons now go to calculator section
            // No WhatsApp override needed - they use href="#calculator"
            
            // Show notification
            this.showCompanyUpdateNotification();
            
        } catch (error) {
            console.error('Error updating company info:', error);
        }
    }

    showCompanyUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #3b82f6;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        `;
        notification.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
            Company information updated!
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.navToggle = document.getElementById('navToggle');
    }

    handleScroll() {
        if (window.scrollY > 100) {
            this.navbar.classList.add('scrolled');
        } else {
            this.navbar.classList.remove('scrolled');
        }
    }

    toggleMobileMenu() {
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
    }
    
    closeMobileMenu() {
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
    }
    
    openMobileMenu() {
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
    }
}

class CostCalculator {
    constructor() {
        this.defaults = {
            totalDepth: 800,
            pvc7Length: 30,
            pvc10Length: 15,
            drillingRate: 90,
            gstPercentage: 18,
            pvc7Rate: 450,
            pvc10Rate: 750
        };
        
        this.loadSettings();
        
        // Trigger initial calculation after page loads
        setTimeout(() => {
            this.updateFormDefaults();
            setTimeout(() => {
                this.calculate();
            }, 50);
        }, 200);
    }

    loadSettings() {
        // Load settings from localStorage or use defaults
        const saved = localStorage.getItem('anjaneya-settings');
        const adminSaved = localStorage.getItem('anjaneya-admin-settings');
        
        if (saved) {
            const parsedSaved = JSON.parse(saved);
            this.defaults = { ...this.defaults, ...parsedSaved };
        }
        
        // Also check admin settings for updated rates and all other settings
        if (adminSaved) {
            const adminSettings = JSON.parse(adminSaved);
            // Update all relevant settings from admin panel
            this.defaults.pvc7Rate = adminSettings.pvc7Rate || this.defaults.pvc7Rate;
            this.defaults.pvc10Rate = adminSettings.pvc10Rate || this.defaults.pvc10Rate;
            this.defaults.drillingRate = adminSettings.defaultDrillingRate || this.defaults.drillingRate;
            this.defaults.gstPercentage = adminSettings.defaultGst || this.defaults.gstPercentage;
            this.defaults.totalDepth = adminSettings.defaultTotalDepth || this.defaults.totalDepth;
            this.defaults.pvc7Length = adminSettings.defaultPvc7Length || this.defaults.pvc7Length;
            this.defaults.pvc10Length = adminSettings.defaultPvc10Length || this.defaults.pvc10Length;
        }
        
        this.updateFormDefaults();
    }

    updateFormDefaults() {
        // Update form field values
        const totalDepthEl = document.getElementById('totalDepth');
        const pvc7LengthEl = document.getElementById('pvc7Length');
        const pvc10LengthEl = document.getElementById('pvc10Length');
        const drillingRateEl = document.getElementById('drillingRate');
        const gstPercentageEl = document.getElementById('gstPercentage');
        
        if (totalDepthEl) {
            totalDepthEl.value = this.defaults.totalDepth;
        }
        if (pvc7LengthEl) {
            pvc7LengthEl.value = this.defaults.pvc7Length;
        }
        if (pvc10LengthEl) {
            pvc10LengthEl.value = this.defaults.pvc10Length;
        }
        if (drillingRateEl) {
            drillingRateEl.value = this.defaults.drillingRate;
            // Force the input to display the value
            drillingRateEl.setAttribute('value', this.defaults.drillingRate);
            // Trigger input event to ensure visibility
            drillingRateEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (gstPercentageEl) {
            gstPercentageEl.value = this.defaults.gstPercentage;
        }
        
        // Update the cost display labels
        this.updateCostLabels();
    }
    
    updateCostLabels() {
        // Update the cost labels in the form to show current rates
        const pvc7Label = document.querySelector('label[for="pvc7Length"] + small');
        const pvc10Label = document.querySelector('label[for="pvc10Length"] + small');
        
        if (pvc7Label) {
            pvc7Label.textContent = `Cost: Rs.${this.defaults.pvc7Rate} per ft`;
        }
        if (pvc10Label) {
            pvc10Label.textContent = `Cost: Rs.${this.defaults.pvc10Rate} per ft`;
        }
    }
    
    // Method to refresh settings from admin panel
    refreshSettings() {
        const oldSettings = {
            pvc7Rate: this.defaults.pvc7Rate,
            pvc10Rate: this.defaults.pvc10Rate,
            drillingRate: this.defaults.drillingRate,
            gstPercentage: this.defaults.gstPercentage,
            totalDepth: this.defaults.totalDepth,
            pvc7Length: this.defaults.pvc7Length,
            pvc10Length: this.defaults.pvc10Length
        };
        
        this.loadSettings();
        this.calculate(); // Recalculate with new settings
        
        // Show notification if any settings changed
        const settingsChanged = 
            oldSettings.pvc7Rate !== this.defaults.pvc7Rate ||
            oldSettings.pvc10Rate !== this.defaults.pvc10Rate ||
            oldSettings.drillingRate !== this.defaults.drillingRate ||
            oldSettings.gstPercentage !== this.defaults.gstPercentage ||
            oldSettings.totalDepth !== this.defaults.totalDepth ||
            oldSettings.pvc7Length !== this.defaults.pvc7Length ||
            oldSettings.pvc10Length !== this.defaults.pvc10Length;
            
        if (settingsChanged) {
            this.showRateUpdateNotification();
        }
    }
    
    showRateUpdateNotification() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #22c55e;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 500;
            z-index: 3000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideDown 0.3s ease;
        `;
        notification.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 8px; vertical-align: middle;">
                <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
            Settings updated! Rates: 7" PVC Rs.${this.defaults.pvc7Rate}/ft, 10" PVC Rs.${this.defaults.pvc10Rate}/ft, Drilling Rs.${this.defaults.drillingRate}/ft
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
        
        // Add CSS animation if not already added
        if (!document.getElementById('rate-update-styles')) {
            const style = document.createElement('style');
            style.id = 'rate-update-styles';
            style.textContent = `
                @keyframes slideDown {
                    from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                    to { transform: translateX(-50%) translateY(0); opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateX(-50%) translateY(0); opacity: 1; }
                    to { transform: translateX(-50%) translateY(-100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    calculate() {
        const inputs = this.getInputs();
        console.log('Calculator inputs:', inputs); // Debug log
        const results = this.performCalculation(inputs);
        console.log('Calculator results:', results); // Debug log
        this.displayResults(results);
    }

    getInputs() {
        const gstToggle = document.getElementById('gstToggle');
        const gstEnabled = gstToggle ? gstToggle.checked : false;
        
        return {
            totalDepth: parseFloat(document.getElementById('totalDepth').value) || 0,
            pvc7Length: parseFloat(document.getElementById('pvc7Length').value) || 0,
            pvc10Length: parseFloat(document.getElementById('pvc10Length').value) || 0,
            drillingRate: parseFloat(document.getElementById('drillingRate').value) || 0,
            gstPercentage: gstEnabled ? (parseFloat(document.getElementById('gstPercentage').value) || 0) : 0,
            gstEnabled: gstEnabled
        };
    }

    handleGstToggle(isEnabled) {
        const gstPercentageGroup = document.getElementById('gstPercentageGroup');
        if (isEnabled) {
            gstPercentageGroup.classList.remove('hidden');
        } else {
            gstPercentageGroup.classList.add('hidden');
        }
        this.calculate();
    }

    performCalculation(inputs) {
        const { totalDepth, pvc7Length, pvc10Length, drillingRate, gstPercentage } = inputs;

        // Validate inputs
        if (totalDepth <= 0 || drillingRate <= 0) {
            return null;
        }

        // Material costs
        console.log('PVC calculation debug:', {
            pvc7Length, 
            pvc10Length, 
            pvc7Rate: this.defaults.pvc7Rate, 
            pvc10Rate: this.defaults.pvc10Rate
        });
        const pvc7Cost = pvc7Length * this.defaults.pvc7Rate;
        const pvc10Cost = pvc10Length * this.defaults.pvc10Rate;
        const materialCost = pvc7Cost + pvc10Cost;
        console.log('PVC costs:', { pvc7Cost, pvc10Cost, materialCost });

        // Calculate drilling cost using slab rates
        const slabCalculation = this.calculateSlabRate(totalDepth, drillingRate);
        const drillingCost = slabCalculation.totalCost;

        // Bore Bata cost (fixed ₹2000 per bore)
        const boreBataCost = 2000;

        // Subtotal
        const subtotal = materialCost + drillingCost + boreBataCost;
        console.log('Subtotal calculation:', {
            materialCost,
            drillingCost,
            boreBataCost,
            subtotal
        });

        // Taxes
        const gstAmount = (subtotal * gstPercentage) / 100;

        // Total
        const totalCost = subtotal + gstAmount;
        console.log('Final totals:', { gstAmount, totalCost });

        // Per foot rate
        const perFootRate = totalDepth > 0 ? totalCost / totalDepth : 0;

        return {
            pvc7Cost,
            pvc10Cost,
            drillingCost,
            boreBataCost,
            subtotal,
            gstAmount,
            totalCost,
            perFootRate,
            gstPercentage,
            slabCalculation
        };
    }

    calculateSlabRate(totalDepth, baseRate) {
        // Calculate progressive rates based on base rate
        // Rate progression: base, base+5, base+15, base+35, base+65, base+105, base+155, base+215, base+315, base+415, base+515, base+615, base+715, base+815
        const rateIncrements = [0, 5, 15, 35, 65, 105, 155, 215, 315, 415, 515, 615, 715, 815];
        const slabDetails = [];
        let totalCost = 0;
        let remainingDepth = totalDepth;

        for (let i = 0; i < rateIncrements.length && remainingDepth > 0; i++) {
            const rate = baseRate + rateIncrements[i];
            let depthInThisSlab;
            
            if (i === 0) {
                // First slab: 300 feet at base rate
                depthInThisSlab = Math.min(300, remainingDepth);
            } else if (i < 8) {
                // Slabs 2-8: 100 feet each
                depthInThisSlab = Math.min(100, remainingDepth);
            } else {
                // Slabs 9+: 100 feet each (after 1000 feet)
                depthInThisSlab = Math.min(100, remainingDepth);
            }

            if (depthInThisSlab > 0) {
                const slabCost = depthInThisSlab * rate;
                totalCost += slabCost;
                
                const startDepth = totalDepth - remainingDepth + 1;
                const endDepth = startDepth + depthInThisSlab - 1;
                
                slabDetails.push({
                    range: `${startDepth}-${endDepth} ft`,
                    rate: rate,
                    depth: depthInThisSlab,
                    cost: slabCost
                });
                
                remainingDepth -= depthInThisSlab;
            }
        }

        return {
            totalCost,
            slabDetails,
            averageRate: totalDepth > 0 ? totalCost / totalDepth : 0
        };
    }

    displayResults(results) {
        if (!results) {
            this.hideResults();
            return;
        }

        const gstToggle = document.getElementById('gstToggle');
        const gstEnabled = gstToggle ? gstToggle.checked : false;

        // Get current inputs
        const inputs = this.getInputs();

        // Display input summary
        this.displayInputSummary();

        // Display slab breakdown first
        this.displaySlabBreakdown(results.slabCalculation);
        
        // Display drilling cost
        document.getElementById('drillingCost').textContent = this.formatCurrency(results.drillingCost);
        
        // Display individual PVC costs with details
        let pvc7Details, pvc10Details;
        
        if (inputs.pvc7Length > 0) {
            pvc7Details = `${inputs.pvc7Length} ft × ₹${this.defaults.pvc7Rate}/ft = ${this.formatCurrency(results.pvc7Cost)}`;
        } else {
            pvc7Details = this.formatCurrency(0);
        }
        
        if (inputs.pvc10Length > 0) {
            pvc10Details = `${inputs.pvc10Length} ft × ₹${this.defaults.pvc10Rate}/ft = ${this.formatCurrency(results.pvc10Cost)}`;
        } else {
            pvc10Details = this.formatCurrency(0);
        }
            
        document.getElementById('pvc7Cost').textContent = pvc7Details;
        document.getElementById('pvc10Cost').textContent = pvc10Details;
        
        // Display Bore Bata cost (fixed ₹2000)
        document.getElementById('boreBataCost').textContent = this.formatCurrency(results.boreBataCost);
        
        document.getElementById('subtotal').textContent = this.formatCurrency(results.subtotal);
        
        // Update GST display based on toggle state
        const gstAmountElement = document.getElementById('gstAmount');
        const gstLabelElement = gstAmountElement.parentElement.querySelector('span:first-child');
        
        if (gstEnabled) {
            gstAmountElement.textContent = this.formatCurrency(results.gstAmount);
            gstLabelElement.textContent = `GST (${results.gstPercentage}%):`;
            gstAmountElement.parentElement.style.display = 'flex';
        } else {
            gstAmountElement.textContent = this.formatCurrency(0);
            gstLabelElement.textContent = 'GST (0%):';
            gstAmountElement.parentElement.style.display = 'none';
        }
        
        document.getElementById('totalCost').textContent = this.formatCurrency(results.totalCost);

        // Show results section
        document.getElementById('calculatorResults').style.display = 'block';
    }

    displayInputSummary() {
        const inputSummary = document.getElementById('inputSummary');
        const inputs = this.getInputs();
        const gstToggle = document.getElementById('gstToggle');
        const gstEnabled = gstToggle ? gstToggle.checked : false;

        // Show input summary
        inputSummary.style.display = 'block';

        // Populate input details
        document.getElementById('inputDepth').textContent = `${inputs.totalDepth} ft`;
        document.getElementById('inputDrillingRate').textContent = `₹${inputs.drillingRate}/ft`;
        document.getElementById('inputPvc7Length').textContent = `${inputs.pvc7Length} ft`;
        document.getElementById('inputPvc10Length').textContent = `${inputs.pvc10Length} ft`;
        document.getElementById('inputGstStatus').textContent = gstEnabled ? `Included (${inputs.gstPercentage}%)` : 'Not Included';
    }

    displaySlabBreakdown(slabCalculation) {
        const slabBreakdown = document.getElementById('slabBreakdown');
        const slabDetails = document.getElementById('slabDetails');
        
        if (slabCalculation.slabDetails.length > 1) {
            // Show breakdown if multiple slabs
            slabBreakdown.style.display = 'block';
            
            let html = '';
            slabCalculation.slabDetails.forEach(slab => {
                html += `
                    <div class="slab-item">
                        <span class="slab-range">${slab.range}</span>
                        <span class="slab-rate">₹${slab.rate}/ft</span>
                        <span class="slab-cost">${this.formatCurrency(slab.cost)}</span>
                    </div>
                `;
            });
            
            html += `
                <div class="slab-item">
                    <span>Total Drilling Cost</span>
                    <span></span>
                    <span class="slab-cost">${this.formatCurrency(slabCalculation.totalCost)}</span>
                </div>
            `;
            
            slabDetails.innerHTML = html;
        } else {
            // Hide breakdown if single slab
            slabBreakdown.style.display = 'none';
        }
    }

    hideResults() {
        document.getElementById('calculatorResults').style.display = 'none';
    }

    reset() {
        this.updateFormDefaults();
        this.calculate();
    }

    formatCurrency(amount) {
        return `Rs.${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }

    downloadPDF() {
        const results = this.performCalculation(this.getInputs());
        if (!results) {
            alert('Please calculate costs first');
            return;
        }

        // Show loading state
        const downloadBtn = document.getElementById('downloadPdfBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<span class="loading-spinner"></span> Generating PDF...';
        downloadBtn.disabled = true;

        const inputs = this.getInputs();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Dark green top section
        doc.setFillColor(16, 85, 48); // Dark green
        doc.rect(0, 0, 210, 8, 'F');
        
        // Main green header
        doc.setFillColor(34, 197, 94);
        doc.rect(0, 8, 210, 30, 'F');
        
        // Company name - simple and clean
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('ANJANEYA BOREWELLS', 20, 23);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Phone: +91 965 965 7777 | +91 944 33 73573', 20, 30);

        // Simple quote info (top right)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const quoteNum = `QUOTE-${Date.now().toString().slice(-6)}`;
        doc.text(`Quote #: ${quoteNum}`, 140, 23);
        doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, 140, 30);

        // Reset text color
        doc.setTextColor(0, 0, 0);

        // Simple title
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('BOREWELL COST ESTIMATE', 20, 53);

        // Simple project details
        let yPos = 63;
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Details', 20, yPos);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Total Depth: ${inputs.totalDepth} ft`, 20, yPos + 10);
        doc.text(`Base Drilling Rate: Rs.${inputs.drillingRate}/ft`, 20, yPos + 17);
        doc.text(`7" PVC Length: ${inputs.pvc7Length} ft (Rs.${this.defaults.pvc7Rate}/ft)`, 20, yPos + 24);
        doc.text(`10" PVC Length: ${inputs.pvc10Length} ft (Rs.${this.defaults.pvc10Rate}/ft)`, 20, yPos + 31);
        
        yPos += 45;

        // Simple cost breakdown header
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text('Cost Breakdown', 20, yPos);
        
        // Table headers with borders
        doc.setFillColor(34, 197, 94);
        doc.rect(15, yPos + 5, 180, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Description', 20, yPos + 10);
        doc.text('Amount', 160, yPos + 10);
        
        // Draw only outer table border
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.rect(15, yPos + 5, 180, 8); // Header border only
        
        yPos += 18;
        
        // Table format for slab rate breakdown
        if (results.slabCalculation.slabDetails.length > 1) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text('Drilling Cost Breakdown (Slab Rate):', 20, yPos);
            yPos += 8;
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            
            results.slabCalculation.slabDetails.forEach((slab, index) => {
                // Simple alternating row colors without borders
                if (index % 2 === 0) {
                    doc.setFillColor(248, 250, 252);
                    doc.rect(15, yPos - 3, 180, 7, 'F');
                }
                
                doc.text(`${slab.range}: Rs.${slab.rate}/ft`, 20, yPos);
                doc.text(`Rs.${slab.cost.toLocaleString('en-IN')}`, 160, yPos);
                yPos += 7;
            });
            
            // Total drilling cost without internal borders
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Total Drilling Cost', 20, yPos);
            doc.text(`Rs.${results.drillingCost.toLocaleString('en-IN')}`, 160, yPos);
            yPos += 8;
        } else {
            // Single slab - show as regular drilling cost
            const costItems = [
                { desc: 'Drilling Cost', amount: results.drillingCost }
            ];
            
            costItems.forEach((item, index) => {
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(249, 250, 251);
                    doc.rect(15, yPos - 3, 180, 8, 'F');
                }
                
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
                
                doc.text(item.desc, 20, yPos);
                doc.text(`Rs. ${item.amount.toLocaleString('en-IN')}`, 160, yPos);
                yPos += 8;
            });
        }
        
        // Other cost items with detailed PVC information
        const otherCostItems = [];
        
        // Add detailed PVC costs
        if (inputs.pvc7Length > 0) {
            otherCostItems.push({
                desc: `7" PVC: ${inputs.pvc7Length} ft x Rs.${this.defaults.pvc7Rate}/ft`,
                amount: results.pvc7Cost
            });
        }
        if (inputs.pvc10Length > 0) {
            otherCostItems.push({
                desc: `10" PVC: ${inputs.pvc10Length} ft x Rs.${this.defaults.pvc10Rate}/ft`,
                amount: results.pvc10Cost
            });
        }
        
        // Add other items
        otherCostItems.push(
            { desc: 'Bore Bata (per bore)', amount: results.boreBataCost },
            { desc: 'Subtotal', amount: results.subtotal }
        );
        
        // Add GST if enabled
        const gstToggle = document.getElementById('gstToggle');
        const gstEnabled = gstToggle ? gstToggle.checked : false;
        
        if (gstEnabled) {
            otherCostItems.push({ desc: `GST (${results.gstPercentage}%)`, amount: results.gstAmount });
        }
        
        otherCostItems.forEach((item, index) => {
            // Simple alternating row colors without borders
            if ((index + (results.slabCalculation.slabDetails.length > 1 ? results.slabCalculation.slabDetails.length + 1 : 1)) % 2 === 0) {
                doc.setFillColor(248, 250, 252);
                doc.rect(15, yPos - 3, 180, 8, 'F');
            }
            
            if (item.desc === 'Subtotal') {
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(0, 0, 0);
            } else {
                doc.setFont('helvetica', 'normal');
                doc.setTextColor(0, 0, 0);
            }
            
            doc.text(item.desc, 20, yPos);
            doc.text(`Rs.${item.amount.toLocaleString('en-IN')}`, 160, yPos);
            yPos += 8;
        });

        // Total cost section without internal borders
        doc.setFillColor(34, 197, 94);
        doc.rect(15, yPos - 3, 180, 10, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('TOTAL COST', 20, yPos + 2);
        doc.text(`Rs.${results.totalCost.toLocaleString('en-IN')}`, 160, yPos + 2);
        yPos += 12;

        // Simple footer
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for choosing Anjaneya Borewells!', 20, yPos + 10);
        doc.text('Address: 6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001', 20, yPos + 17);
        doc.text('Email: anjaneyaborewells@gmail.com', 20, yPos + 24);
        
        // Simple footer line
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(1);
        doc.line(15, yPos + 30, 195, yPos + 30);
        doc.text('Professional Borewell Solutions | Makers of Green India', 20, yPos + 35);
        
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN')}`, 20, yPos + 58);
        doc.text('Powered by Anjaneya Borewells Digital Platform', 20, yPos + 65);

        // Save with enhanced filename
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`Anjaneya-Borewells-Premium-Quote-${timestamp}-${quoteNum}.pdf`);

        // Restore button state
        setTimeout(() => {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }, 1000);
    }

    saveAsImage() {
        const resultsContainer = document.getElementById('calculatorResults');
        const resultsActions = document.querySelector('.results-actions');
        
        if (!resultsContainer) {
            alert('No results to save');
            return;
        }

        // Show loading state
        const saveBtn = document.getElementById('saveImageBtn');
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<span class="loading-spinner"></span> Saving Image...';
        saveBtn.disabled = true;

        // Hide the action buttons before capturing
        if (resultsActions) {
            resultsActions.style.display = 'none';
        }

        // Use html2canvas to capture the results section
        if (typeof html2canvas !== 'undefined') {
            html2canvas(resultsContainer, {
                backgroundColor: '#ffffff',
                scale: 2,
                useCORS: true,
                allowTaint: true
            }).then(canvas => {
                // Create download link
                const link = document.createElement('a');
                link.download = `anjaneya-borewell-quote-${new Date().toISOString().split('T')[0]}.png`;
                link.href = canvas.toDataURL('image/png');
                
                // Trigger download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Show action buttons again
                if (resultsActions) {
                    resultsActions.style.display = 'flex';
                }

                // Restore button state
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            }).catch(error => {
                console.error('Error saving image:', error);
                alert('Failed to save image. Please try again.');
                
                // Show action buttons again
                if (resultsActions) {
                    resultsActions.style.display = 'flex';
                }

                // Restore button state
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
            });
        } else {
            // Fallback: try to use browser's built-in screenshot capability
            alert('Image saving feature requires additional setup. Please use the PDF download option instead.');
            
            // Show action buttons again
            if (resultsActions) {
                resultsActions.style.display = 'flex';
            }
            
            // Restore button state
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    sendWhatsAppQuote() {
        const results = this.performCalculation(this.getInputs());
        if (!results) {
            alert('Please calculate costs first');
            return;
        }

        const inputs = this.getInputs();
        const gstToggle = document.getElementById('gstToggle');
        const gstEnabled = gstToggle ? gstToggle.checked : false;

        // Create WhatsApp message
        let message = `🏗️ *Borewell Quote Request*\n\n`;
        
        // Project details
        message += `📋 *Project Details:*\n`;
        message += `• Depth: ${inputs.totalDepth} ft\n`;
        message += `• Base Rate: ₹${inputs.drillingRate}/ft\n`;
        message += `• 7" PVC: ${inputs.pvc7Length} ft\n`;
        message += `• 10" PVC: ${inputs.pvc10Length} ft\n`;
        message += `• GST: ${gstEnabled ? `Included (${inputs.gstPercentage}%)` : 'Not Included'}\n\n`;

        // Cost breakdown
        message += `💰 *Cost Breakdown:*\n`;
        
        // Drilling cost
        if (results.slabCalculation.slabDetails.length > 1) {
            message += `🔨 *Drilling Cost (Slab Rate):*\n`;
            results.slabCalculation.slabDetails.forEach(slab => {
                message += `• ${slab.range}: ₹${slab.rate}/ft = ${this.formatCurrency(slab.cost)}\n`;
            });
        }
        
        message += `• Total Drilling: ${this.formatCurrency(results.drillingCost)}\n`;
        
        // Add detailed PVC information
        if (inputs.pvc7Length > 0) {
            message += `• 7" PVC: ${inputs.pvc7Length} ft × ₹${this.defaults.pvc7Rate}/ft = ${this.formatCurrency(results.pvc7Cost)}\n`;
        }
        if (inputs.pvc10Length > 0) {
            message += `• 10" PVC: ${inputs.pvc10Length} ft × ₹${this.defaults.pvc10Rate}/ft = ${this.formatCurrency(results.pvc10Cost)}\n`;
        }
        message += `• Bore Bata: ${this.formatCurrency(results.boreBataCost)}\n`;
        message += `• Subtotal: ${this.formatCurrency(results.subtotal)}\n`;
        
        if (gstEnabled) {
            message += `• GST (${results.gstPercentage}%): ${this.formatCurrency(results.gstAmount)}\n`;
        }
        
        message += `• *Total Cost: ${this.formatCurrency(results.totalCost)}*\n\n`;
        
        message += `📞 *Contact:* +91 965 965 7777\n`;
        message += `🌐 *Website:* Anjaneya Borewells\n\n`;
        message += `Please confirm this quote and schedule a site visit.`;

        // Encode message for WhatsApp URL
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/919659657777?text=${encodedMessage}`;

        // Open WhatsApp
        window.open(whatsappUrl, '_blank');
    }
}

class FormHandler {
    constructor() {
        this.contactEndpoint = '/api/contact';
        this.callbackEndpoint = '/api/callback';
    }

    async handleContactForm() {
        const form = document.getElementById('contactForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Validate required fields
        if (!data.name || data.name.trim() === '') {
            this.showError('Name is required');
            return;
        }

        try {
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            // Use API service for contact form submission
            const response = await window.apiService.submitContact(data);
            
            if (response.success) {
                this.showSuccess(response.message || 'Message sent successfully! We will contact you soon.');
                form.reset();
            } else {
                this.showError(response.error || 'Failed to send message. Please try again.');
            }

            // Restore button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;

        } catch (error) {
            console.error('Contact form error:', error);
            this.showError('Failed to send message. Please try again or call us directly.');
            
            // Restore button
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.textContent = 'Send Message';
            submitBtn.disabled = false;
        }
    }

    async handleCallbackForm() {
        const form = document.getElementById('callbackForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Add calculator data if available
        const calculator = window.anjaneyaApp.calculator;
        const results = calculator.performCalculation(calculator.getInputs());
        if (results) {
            data.quoteData = JSON.stringify({
                inputs: calculator.getInputs(),
                results: results
            });
        }

        try {
            await this.submitForm(this.callbackEndpoint, data);
            this.showSuccess('Callback request submitted! We will contact you within 24 hours.');
            form.reset();
            window.anjaneyaApp.modal.close('emailModal');
        } catch (error) {
            this.showError('Failed to submit callback request. Please try calling us directly.');
        }
    }

    async submitForm(endpoint, data) {
        // For demo purposes, simulate API call
        // In production, replace with actual API endpoint
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate success/failure
                if (Math.random() > 0.1) { // 90% success rate
                    resolve({ success: true });
                } else {
                    reject(new Error('Simulated API error'));
                }
            }, 1000);
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 5000);
    }
}

class Modal {
    constructor() {
        this.modals = {};
        this.setupModalEvents();
    }

    setupModalEvents() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.close(e.target.id);
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.close(openModal.id);
                }
            }
        });
    }

    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = '';
        }
    }
}

// Admin Panel Class
class AdminPanel {
    constructor() {
        this.settings = {
            pvc7Rate: 450,
            pvc10Rate: 750,
            defaultDrillingRate: 50,
            defaultGst: 18,
            companyInfo: {
                name: 'Anjaneya Borewells',
                tagline: 'Makers of Green India!',
                phone1: '+91 965 965 7777',
                phone2: '+91 944 33 73573',
                email: 'anjaneyaborewells@gmail.com',
                address: '6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal'
            }
        };
        
        this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('anjaneya-admin-settings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    saveSettings() {
        localStorage.setItem('anjaneya-admin-settings', JSON.stringify(this.settings));
        localStorage.setItem('anjaneya-settings', JSON.stringify({
            pvc7Rate: this.settings.pvc7Rate,
            pvc10Rate: this.settings.pvc10Rate,
            drillingRate: this.settings.defaultDrillingRate,
            gstPercentage: this.settings.defaultGst
        }));
    }

    updateRate(rateType, value) {
        this.settings[rateType] = parseFloat(value);
        this.saveSettings();
    }

    updateDefault(key, value) {
        this.settings[key] = parseFloat(value);
        this.saveSettings();
    }

    updateCompanyInfo(key, value) {
        this.settings.companyInfo[key] = value;
        this.saveSettings();
    }
}

// Utility Functions
const utils = {
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.anjaneyaApp = new AnjaneyaBorewells();
    window.adminPanel = new AdminPanel();
    
        // Calculate initial values
        window.anjaneyaApp.calculator.calculate();
        
        // Check for updated settings on page load
        window.anjaneyaApp.calculator.refreshSettings();
        
        // Update company information on page load
        window.anjaneyaApp.updateCompanyInfo();
        
});

// Service Worker Registration (for PWA features)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
