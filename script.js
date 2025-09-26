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

        // Company name click goes to home page
        document.querySelector('.company-name')?.addEventListener('click', (e) => {
            e.preventDefault();
            const homeSection = document.querySelector('#home');
            if (homeSection) {
                homeSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            // Close mobile menu if it's open
            this.navigation.closeMobileMenu();
        });

        // Sync Total Depth fields between main form and repair section
        this.setupTotalDepthSync();

        // Window scroll events
        window.addEventListener('scroll', () => {
            this.navigation.handleScroll();
        });

        // Listen for storage changes (settings updates from other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'anjaneya-settings') {
                this.calculator.refreshSettings();
                this.updateCompanyInfo();
            }
        });
        
        // Listen for custom event (settings updates from same tab)
        window.addEventListener('anjaneyaSettingsUpdated', (e) => {
            this.calculator.refreshSettings();
            this.updateCompanyInfo();
        });
        
        // Listen for calculator settings updates
        window.addEventListener('calculatorSettingsUpdated', (e) => {
            console.log('Calculator settings updated:', e.detail);
            // The calculator should already be updated by the HiddenSettingsManager
            // but we can add additional UI refresh logic here if needed
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
                if (this.calculator) {
                    this.calculator.calculate();
                }
            });
            input.addEventListener('change', () => {
                if (this.calculator) {
                    this.calculator.calculate();
                }
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
        
        // Compact GST toggle functionality
        document.getElementById('gstToggleCompact')?.addEventListener('change', (e) => {
            const isOn = e.target.checked;
            this.calculator.handleGstToggle(isOn);
            const gstWrapper = document.querySelector('.gst-toggle-compact');
            if (gstWrapper) {
                if (isOn) {
                    gstWrapper.classList.add('gst-on');
                } else {
                    gstWrapper.classList.remove('gst-on');
                }
            }
        });
        
        // Price settings button
        document.getElementById('priceSettingsBtn')?.addEventListener('click', () => {
            this.settingsManager.toggleSettings();
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

        // Increase/Decrease buttons
        this.setupInputButtons();

        // Save as Image
        document.getElementById('saveImageBtn')?.addEventListener('click', () => {
            this.calculator.saveAsImage();
        });

        // WhatsApp callback
        document.getElementById('whatsappCallbackBtn')?.addEventListener('click', () => {
            this.calculator.sendWhatsAppQuote();
        });
    }

    setupTotalDepthSync() {
        const mainTotalDepth = document.getElementById('totalDepth');
        const repairTotalDepth = document.getElementById('totalDepthRepair');
        
        if (mainTotalDepth && repairTotalDepth) {
            // Sync from main form to repair section
            mainTotalDepth.addEventListener('input', () => {
                repairTotalDepth.value = mainTotalDepth.value;
                // Trigger calculation
                if (this.calculator) {
                    this.calculator.calculate();
                }
            });
            
            mainTotalDepth.addEventListener('change', () => {
                repairTotalDepth.value = mainTotalDepth.value;
                // Trigger calculation
                if (this.calculator) {
                    this.calculator.calculate();
                }
            });
            
            // Sync from repair section to main form
            repairTotalDepth.addEventListener('input', () => {
                mainTotalDepth.value = repairTotalDepth.value;
                // Trigger calculation
                if (this.calculator) {
                    this.calculator.calculate();
                }
            });
            
            repairTotalDepth.addEventListener('change', () => {
                mainTotalDepth.value = repairTotalDepth.value;
                // Trigger calculation
                if (this.calculator) {
                    this.calculator.calculate();
                }
            });
        }
    }

    setupInputButtons() {
        // Increase buttons
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input) {
                    const currentValue = parseFloat(input.value) || 0;
                    const step = parseFloat(input.getAttribute('step')) || 1;
                    const max = parseFloat(input.getAttribute('max')) || Infinity;
                    const newValue = Math.min(currentValue + step, max);
                    input.value = newValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        // Decrease buttons
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const targetId = e.target.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input) {
                    const currentValue = parseFloat(input.value) || 0;
                    const step = parseFloat(input.getAttribute('step')) || 1;
                    const min = parseFloat(input.getAttribute('min')) || 0;
                    const newValue = Math.max(currentValue - step, min);
                    input.value = newValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.modal.close('emailModal');
        });


        // Mobile navigation toggle
        document.getElementById('navToggle')?.addEventListener('click', (e) => {
            console.log('Mobile menu toggle clicked');
            e.preventDefault();
            e.stopPropagation();
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
        const contactItems = document.querySelectorAll('.contact-item');
        const calculatorContainer = document.querySelector('.calculator-container');
        
        serviceCards.forEach((el, index) => {
            el.classList.add('fade-in');
            el.style.animationDelay = `${index * 0.2}s`;
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
                    const children = entry.target.querySelectorAll('.service-card, .contact-item');
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
        
        // Setup navigation highlighting
        this.setupNavigationHighlighting();
    }
    
    setupNavigationHighlighting() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        const navObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.getAttribute('id');
                    
                    // Remove active class from all nav links
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                    });
                    
                    // Add active class to corresponding nav link
                    const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '-20% 0px -20% 0px'
        });
        
        // Observe all sections with IDs
        sections.forEach(section => {
            navObserver.observe(section);
        });
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
        
        // Display company name directly without typewriter effect
        companyText.textContent = 'ANJANEYA BOREWELLS';
        
        // Display Tamil slogan directly and center it
        tamilSlogan.textContent = 'ஆழமான நம்பிக்கை!';
        tamilSlogan.classList.add('visible');
    }


    updateCompanyInfo() {
        // Get settings from localStorage
        const settings = localStorage.getItem('anjaneya-settings');
        if (!settings) {
            return;
        }
        
        try {
            const parsedSettings = JSON.parse(settings);
            const companyInfo = parsedSettings.companyInfo;
            
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
        console.log('toggleMobileMenu called');
        console.log('navMenu:', this.navMenu);
        console.log('navToggle:', this.navToggle);
        this.navMenu.classList.toggle('active');
        this.navToggle.classList.toggle('active');
        console.log('navMenu classes:', this.navMenu.classList.toString());
        console.log('navToggle classes:', this.navToggle.classList.toString());
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
            pvc10Rate: 750,
            oldBoreRate: 40
        };
        
        this.loadSettings();
        
        // Setup event listeners for form inputs
        this.setupEventListeners();
        
        // Trigger initial calculation after page loads
        setTimeout(() => {
            this.updateFormDefaults();
            setTimeout(() => {
                this.calculate();
            }, 50);
        }, 200);
    }

    setupEventListeners() {
        // Add event listeners for all form inputs to trigger recalculation
        const formInputs = ['totalDepth', 'totalDepthRepair', 'pvc7Length', 'pvc10Length', 'drillingRate', 'gstPercentage', 'oldBoreDepth'];
        
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.calculate());
                input.addEventListener('change', () => this.calculate());
            }
        });
        
        // Add event listeners for drilling type buttons
        const drillingButtons = document.querySelectorAll('.drilling-button');
        drillingButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Remove selected class from all buttons
                drillingButtons.forEach(b => b.classList.remove('selected'));
                
                // Add selected class to clicked button
                button.classList.add('selected');
                
                // Update the hidden radio button
                const radio = button.querySelector('input[type="radio"]');
                radio.checked = true;
                
                // Trigger change event
                this.handleDrillingTypeChange(radio.value);
            });
        });
        
        // Initialize with first button selected
        const firstButton = document.querySelector('.drilling-button[data-type="new"]');
        if (firstButton) {
            firstButton.classList.add('selected');
        }
        
        // Add event listener for compact GST toggle
        const gstToggleCompact = document.getElementById('gstToggleCompact');
        if (gstToggleCompact) {
            gstToggleCompact.addEventListener('change', () => this.calculate());
            // Initialize class state on load
            const gstWrapperInit = document.querySelector('.gst-toggle-compact');
            if (gstWrapperInit) {
                gstWrapperInit.classList.toggle('gst-on', gstToggleCompact.checked);
            }
        }
    }

    loadSettings() {
        // Load settings from localStorage or use defaults
        const saved = localStorage.getItem('anjaneya-settings');
        if (saved) {
            const parsedSaved = JSON.parse(saved);
            this.defaults = { ...this.defaults, ...parsedSaved };
        }
        
        this.updateFormDefaults();
    }

    updateFormDefaults() {
        // Update form field values
        const totalDepthEl = document.getElementById('totalDepth');
        const totalDepthRepairEl = document.getElementById('totalDepthRepair');
        const pvc7LengthEl = document.getElementById('pvc7Length');
        const pvc10LengthEl = document.getElementById('pvc10Length');
        const drillingRateEl = document.getElementById('drillingRate');
        
        if (totalDepthEl) {
            totalDepthEl.value = this.defaults.totalDepth;
        }
        if (totalDepthRepairEl) {
            totalDepthRepairEl.value = this.defaults.totalDepth;
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
            // Trigger input event to ensure visibility and calculation
            drillingRateEl.dispatchEvent(new Event('input', { bubbles: true }));
            drillingRateEl.dispatchEvent(new Event('change', { bubbles: true }));
        }
        
        // Update the cost display labels
        this.updateCostLabels();
    }
    
    updateCostLabels() {
        // Cost labels have been removed from the UI
        // This method is kept for potential future use
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
    
    // Method to update settings from hidden settings panel
    updateSettings(settings) {
        this.defaults.pvc7Rate = settings.pvc7Rate;
        this.defaults.pvc10Rate = settings.pvc10Rate;
        this.defaults.oldBoreRate = settings.oldBoreRate;
        // Only update drilling rate if baseDrillingRate is provided and different
        if (settings.baseDrillingRate !== undefined) {
            this.defaults.drillingRate = settings.baseDrillingRate;
        }
        this.defaults.gstPercentage = settings.gstPercentage;
        
        // Update slab rates if available
        if (settings.slabRates) {
            this.slabRates = settings.slabRates;
        }
        
        // Update form field values to reflect new settings
        this.updateFormDefaults();
        
        // Update cost labels to show new rates
        this.updateCostLabels();
        
        // Recalculate with new settings
        this.calculate();
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
        this.updateLiveCalculator(results);
    }

    // Unified GST enabled check for both desktop and mobile toggles
    isGstEnabled() {
        const compact = document.getElementById('gstToggleCompact');
        if (compact) return !!compact.checked;
        const legacy = document.getElementById('gstToggle');
        return legacy ? !!legacy.checked : false;
    }

    getInputs() {
        const gstToggle = document.getElementById('gstToggleCompact');
        const gstEnabled = gstToggle ? gstToggle.checked : false;
        // Keep CSS class in sync
        const gstWrapperSync = document.querySelector('.gst-toggle-compact');
        if (gstWrapperSync) {
            gstWrapperSync.classList.toggle('gst-on', !!gstEnabled);
        }
        
        // Get the correct total depth based on drilling type
        const drillingType = document.querySelector('input[name="drillingType"]:checked').value;
        let totalDepth = 0;
        
        if (drillingType === 'repair') {
            // For repair, use the totalDepthRepair field
            totalDepth = parseFloat(document.getElementById('totalDepthRepair').value) || 0;
        } else {
            // For new drilling, use the totalDepth field
            totalDepth = parseFloat(document.getElementById('totalDepth').value) || 0;
        }
        
        console.log('Drilling type:', drillingType, 'Total depth:', totalDepth); // Debug log
        
        return {
            drillingType: drillingType,
            oldBoreDepth: parseFloat(document.getElementById('oldBoreDepth').value) || 0,
            totalDepth: totalDepth,
            pvc7Length: parseFloat(document.getElementById('pvc7Length').value) || 0,
            pvc10Length: parseFloat(document.getElementById('pvc10Length').value) || 0,
            drillingRate: parseFloat(document.getElementById('drillingRate').value) || 0,
            gstPercentage: gstEnabled ? (parseFloat(document.getElementById('gstPercentageSetting').value) || 18) : 0,
            gstEnabled: gstEnabled
        };
    }

    handleGstToggle(isEnabled) {
        // GST toggle is now handled by the compact toggle in the drilling rate section
        // No need to show/hide elements as GST percentage is now in settings
        this.calculate();
    }

    handleDrillingTypeChange(drillingType) {
        const depthInputsCard = document.getElementById('depthInputsCard');
        
        if (drillingType === 'repair') {
            // Show the grouped depth inputs card for Rebore
            if (depthInputsCard) {
                depthInputsCard.style.display = 'block';
            }
        } else {
            // Hide the grouped depth inputs card for New Drilling
            if (depthInputsCard) {
                depthInputsCard.style.display = 'none';
            }
            // Reset old bore depth when switching to new drilling
            const oldBoreDepth = document.getElementById('oldBoreDepth');
            if (oldBoreDepth) {
                oldBoreDepth.value = 0;
            }
        }
        this.calculate();
    }

    performCalculation(inputs) {
        const { drillingType, oldBoreDepth, totalDepth, pvc7Length, pvc10Length, drillingRate, gstPercentage } = inputs;

        // Validate inputs
        if (totalDepth <= 0 || drillingRate <= 0) {
            return null;
        }

        // Additional validation for repair type
        if (drillingType === 'repair' && oldBoreDepth >= totalDepth) {
            alert('Old bore depth must be less than total depth for repair work');
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

        // Calculate drilling cost based on type
        let drillingCost, slabCalculation;
        if (drillingType === 'repair') {
            // Repair calculation: old bore + regular slabs
            const oldBoreCost = oldBoreDepth * this.defaults.oldBoreRate; // Use configurable old bore rate
            const remainingDepth = totalDepth - oldBoreDepth;
            const regularSlabCalculation = this.calculateSlabRate(remainingDepth, drillingRate);
            
            // Adjust slab calculation to start from oldBoreDepth + 1
            const adjustedSlabCalculation = this.calculateRepairSlabRate(oldBoreDepth, totalDepth, drillingRate);
            
            drillingCost = oldBoreCost + adjustedSlabCalculation.totalCost;
            slabCalculation = {
                totalCost: drillingCost,
                slabDetails: [
                    { range: `0-${oldBoreDepth} ft (Old Bore)`, rate: this.defaults.oldBoreRate, cost: oldBoreCost },
                    ...adjustedSlabCalculation.slabDetails
                ]
            };
        } else {
            // New drilling calculation (existing logic)
            slabCalculation = this.calculateSlabRate(totalDepth, drillingRate);
            drillingCost = slabCalculation.totalCost;
        }

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
        // Always calculate slab rates dynamically from the current base rate
        const slabRates = this.calculateSlabRatesFromBaseRate(baseRate);
        console.log('Calculating slab rates with base rate:', baseRate, 'slabRates:', slabRates);
        const slabDetails = [];
        let totalCost = 0;
        let remainingDepth = totalDepth;
        let currentDepth = 1;

        for (const slab of slabRates) {
            if (remainingDepth <= 0) break;

            // Parse the range to get start and end depths
            const rangeMatch = slab.range.match(/(\d+)-(\d+)\s*ft/);
            if (!rangeMatch) continue;

            const rangeStart = parseInt(rangeMatch[1]);
            const rangeEnd = parseInt(rangeMatch[2]);
            const rangeDepth = rangeEnd - rangeStart + 1;

            // Calculate how much of this slab applies to our total depth
            const applicableDepth = Math.min(rangeDepth, remainingDepth);
            
            if (applicableDepth > 0) {
                const slabCost = applicableDepth * slab.rate;
                totalCost += slabCost;
                
                const endDepth = currentDepth + applicableDepth - 1;
                
                slabDetails.push({
                    range: `${currentDepth}-${endDepth} ft`,
                    rate: slab.rate,
                    depth: applicableDepth,
                    cost: slabCost
                });
                
                currentDepth += applicableDepth;
                remainingDepth -= applicableDepth;
            }
        }

        return {
            totalCost,
            slabDetails,
            averageRate: totalDepth > 0 ? totalCost / totalDepth : 0
        };
    }

    calculateRepairSlabRate(oldBoreDepth, totalDepth, baseRate) {
        // Calculate slab rates for repair work using same rates as new drilling
        const slabRates = this.calculateSlabRatesFromBaseRate(baseRate);
        const slabDetails = [];
        let totalCost = 0;
        let remainingDepth = totalDepth - oldBoreDepth;
        let currentDepth = oldBoreDepth + 1;

        for (const slab of slabRates) {
            if (remainingDepth <= 0) break;

            // Parse the range to get start and end depths
            const rangeMatch = slab.range.match(/(\d+)-(\d+)\s*ft/);
            if (!rangeMatch) continue;

            const rangeStart = parseInt(rangeMatch[1]);
            const rangeEnd = parseInt(rangeMatch[2]);
            
            // For repair work, we need to adjust the range to start from current depth
            // but respect the original slab boundaries
            const adjustedRangeStart = Math.max(rangeStart, currentDepth);
            const adjustedRangeEnd = Math.min(rangeEnd, totalDepth);
            
            // Only process if we have a valid range
            if (adjustedRangeStart <= adjustedRangeEnd) {
                const applicableDepth = adjustedRangeEnd - adjustedRangeStart + 1;
                const cost = applicableDepth * slab.rate;
                totalCost += cost;
                
                slabDetails.push({
                    range: `${adjustedRangeStart.toString().padStart(3, '0')}-${adjustedRangeEnd} ft`,
                    rate: slab.rate,
                    cost: cost,
                    depth: applicableDepth
                });
                
                remainingDepth -= applicableDepth;
                currentDepth = adjustedRangeEnd + 1;
            }
        }

        return {
            totalCost,
            slabDetails,
            averageRate: (totalDepth - oldBoreDepth) > 0 ? totalCost / (totalDepth - oldBoreDepth) : 0
        };
    }

    getDefaultSlabRates() {
        return [
            { range: '1-300 ft', rate: 50 },
            { range: '301-400 ft', rate: 55 },
            { range: '401-500 ft', rate: 65 },
            { range: '501-600 ft', rate: 85 },
            { range: '601-700 ft', rate: 115 },
            { range: '701-800 ft', rate: 155 },
            { range: '801-900 ft', rate: 215 },
            { range: '901-1000 ft', rate: 315 },
            { range: '1001-1100 ft', rate: 415 },
            { range: '1101-1200 ft', rate: 515 },
            { range: '1201-1300 ft', rate: 615 },
            { range: '1301-1400 ft', rate: 715 },
            { range: '1401-1500 ft', rate: 815 },
            { range: '1501-1600 ft', rate: 915 },
            { range: '1601-1700 ft', rate: 1015 },
            { range: '1701-1800 ft', rate: 1115 },
            { range: '1801-1900 ft', rate: 1215 },
            { range: '1901-2000 ft', rate: 1315 }
        ];
    }

    calculateSlabRatesFromBaseRate(baseRate) {
        // Progressive rate increments based on the original logic
        const rateIncrements = [0, 5, 15, 35, 65, 105, 155, 215, 315, 415, 515, 615, 715, 815, 915, 1015, 1115, 1215];
        const depthRanges = [
            { start: 1, end: 300 },      // First slab: 300 feet
            { start: 301, end: 400 },    // Second slab: 100 feet
            { start: 401, end: 500 },    // Third slab: 100 feet
            { start: 501, end: 600 },    // Fourth slab: 100 feet
            { start: 601, end: 700 },   // Fifth slab: 100 feet
            { start: 701, end: 800 },   // Sixth slab: 100 feet
            { start: 801, end: 900 },   // Seventh slab: 100 feet
            { start: 901, end: 1000 },  // Eighth slab: 100 feet
            { start: 1001, end: 1100 }, // Ninth slab: 100 feet
            { start: 1101, end: 1200 }, // Tenth slab: 100 feet
            { start: 1201, end: 1300 }, // Eleventh slab: 100 feet
            { start: 1301, end: 1400 }, // Twelfth slab: 100 feet
            { start: 1401, end: 1500 }, // Thirteenth slab: 100 feet
            { start: 1501, end: 1600 }, // Fourteenth slab: 100 feet
            { start: 1601, end: 1700 }, // Fifteenth slab: 100 feet
            { start: 1701, end: 1800 }, // Sixteenth slab: 100 feet
            { start: 1801, end: 1900 }, // Seventeenth slab: 100 feet
            { start: 1901, end: 2000 }  // Eighteenth slab: 100 feet
        ];

        return depthRanges.map((range, index) => ({
            range: `${range.start.toString().padStart(3, '0')}-${range.end} ft`,
            rate: baseRate + (rateIncrements[index] || 0)
        }));
    }

    displayResults(results) {
        if (!results) {
            this.hideResults();
            return;
        }

        const gstEnabled = this.isGstEnabled();

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
        const gstEnabled = this.isGstEnabled();

        // Show input summary
        inputSummary.style.display = 'block';

        // Populate input details
        document.getElementById('inputDepth').textContent = `${inputs.totalDepth} ft`;
        document.getElementById('inputDrillingRate').textContent = `₹${inputs.drillingRate}/ft`;
        document.getElementById('inputPvc7Length').textContent = `${inputs.pvc7Length} ft`;
        document.getElementById('inputPvc10Length').textContent = `${inputs.pvc10Length} ft`;
    }

    displaySlabBreakdown(slabCalculation) {
        console.log('Displaying slab breakdown:', slabCalculation);
        const slabBreakdown = document.getElementById('slabBreakdown');
        const slabDetails = document.getElementById('slabDetails');
        
        if (slabCalculation.slabDetails.length > 1) {
            // Show breakdown if multiple slabs
            slabBreakdown.style.display = 'block';
            
            let html = '';
            slabCalculation.slabDetails.forEach(slab => {
                // Format the range display with leading zeros
                const formattedRange = slab.range.replace(/(\d+)-(\d+)\s*ft/, (match, start, end) => {
                    const paddedStart = start.padStart(3, '0');
                    return `${paddedStart}-${end} ft`;
                });
                
                html += `
                    <div class="slab-item">
                        <span class="slab-range">${formattedRange}</span>
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

    updateLiveCalculator(results) {
        if (!results) return;
        
        // Update total cost using existing cost breakdown data
        const totalCostEl = document.getElementById('liveTotalCost');
        if (totalCostEl) {
            totalCostEl.textContent = this.formatCurrency(results.totalCost);
        }
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
        downloadBtn.innerHTML = '<span class="loading-spinner"></span> Generating Quotation PDF...';
        downloadBtn.disabled = true;

        const inputs = this.getInputs();
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // Explicitly set A4 size

        // Company header section
        doc.setTextColor(76, 175, 80); // Green color for company name
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('ANJANEYA BOREWELLS', 20, 25);

        doc.setTextColor(0, 0, 0); // Reset to black for other details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('6/906-1, Sri Mahal Thirumana Mandapam, Trichy Road, Namakkal, Tamil Nadu 637001', 20, 35);
        doc.text('Phone: +91 965 965 7777 | +91 944 33 73573', 20, 42);
        doc.text('Email: anjaneyaborewells@gmail.com', 20, 49);

        // Quotation title in top right corner
        doc.setTextColor(76, 175, 80);
        doc.setFontSize(16); // Reduced size
        doc.setFont('helvetica', 'bold');
        doc.text('QUOTATION', 150, 25);

        // Reset text color
        doc.setTextColor(0, 0, 0);

        const quoteNum = `ABW/QUO/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}`;

        let yPos = 60;

        // Quotation details
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Quotation No:', 20, yPos);
        doc.text('Date:', 20, yPos + 8);

        doc.setFont('helvetica', 'normal');
        doc.text(`${quoteNum}`, 75, yPos);
        doc.text(`${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}`, 75, yPos + 8);

        yPos += 25;

        // Green line separator (like in image)
        doc.setDrawColor(76, 175, 80);
        doc.setLineWidth(2);
        doc.line(20, yPos, 190, yPos);
        
        yPos += 8;

        // Table header (like in image)
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('Items', 20, yPos);
        doc.text('Quantity', 90, yPos);
        doc.text('Price', 130, yPos);
        doc.text('Total Amount', 170, yPos);
        
        yPos += 5;
        
        // Header underline
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        
        yPos += 8;
        
        // Reset text color for table content
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        let itemCounter = 1;

        // Add drilling cost breakdown items
        if (results.slabCalculation.slabDetails.length > 1) {
            results.slabCalculation.slabDetails.forEach((slab, index) => {
                const rangeParts = slab.range.split('-');
                const startDepth = parseInt(rangeParts[0]);
                const endDepth = parseInt(rangeParts[1].replace(' ft', ''));
                const quantity = endDepth - startDepth + 1;

                doc.text(`Drilling (${slab.range})`, 20, yPos);
                doc.text(`${quantity}`, 90, yPos);
                doc.text(`Rs.${slab.rate}`, 130, yPos);
                doc.text(`Rs.${slab.cost.toLocaleString('en-IN')}`, 170, yPos);
                
                yPos += 12;
            });
        } else {
            // Single drilling cost
            doc.text('Drilling Cost', 20, yPos);
            doc.text('1', 90, yPos);
            doc.text(`Rs.${results.drillingCost.toLocaleString('en-IN')}`, 130, yPos);
            doc.text(`Rs.${results.drillingCost.toLocaleString('en-IN')}`, 170, yPos);
            yPos += 12;
        }
        
        // Add PVC and other items
        if (inputs.pvc7Length > 0) {
            doc.text('7" PVC', 20, yPos);
            doc.text(`${inputs.pvc7Length}`, 90, yPos);
            doc.text(`Rs.${this.defaults.pvc7Rate}`, 130, yPos);
            doc.text(`Rs.${results.pvc7Cost.toLocaleString('en-IN')}`, 170, yPos);
            yPos += 12;
        }

        if (inputs.pvc10Length > 0) {
            doc.text('10" PVC', 20, yPos);
            doc.text(`${inputs.pvc10Length}`, 90, yPos);
            doc.text(`Rs.${this.defaults.pvc10Rate}`, 130, yPos);
            doc.text(`Rs.${results.pvc10Cost.toLocaleString('en-IN')}`, 170, yPos);
            yPos += 12;
        }

        // Bore Bata
        doc.text('BATA', 20, yPos);
        doc.text('1', 90, yPos);
        doc.text('Rs.500', 130, yPos);
        doc.text(`Rs.${results.boreBataCost.toLocaleString('en-IN')}`, 170, yPos);
        yPos += 20;

        // Bottom line separator
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, yPos, 190, yPos);
        
        yPos += 15;

        // Summary section (like in image)
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        
        // Subtotal
        doc.text('SUBTOTAL', 130, yPos);
        doc.text(`Rs.${results.subtotal.toLocaleString('en-IN')}`, 170, yPos);
        yPos += 10;
        
        // GST if enabled
        if (this.isGstEnabled()) {
            doc.text(`TAX (${results.gstPercentage}%)`, 130, yPos);
            doc.text(`Rs.${results.gstAmount.toLocaleString('en-IN')}`, 170, yPos);
            yPos += 10;
        }
        
        // Bottom line before total
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(1);
        doc.line(130, yPos, 190, yPos);
        yPos += 8;
        
        // Total (like in image)
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('TOTAL', 130, yPos);
        doc.text(`Rs.${results.totalCost.toLocaleString('en-IN')}`, 170, yPos);
        
        // Approximate note near total
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150); // Light gray
        doc.text('(Approximate)', 130, yPos + 8);
        
        // Reset text color
        doc.setTextColor(0, 0, 0);
        
        yPos += 25;

        // Check if we need a new page for terms and conditions
        const currentPageHeight = doc.internal.pageSize.getHeight();
        const remainingSpace = currentPageHeight - yPos;
        
        if (remainingSpace < 80) { // If less than 80mm remaining, add new page
            doc.addPage();
            yPos = 20; // Reset position for new page
        }
        
        // Terms and conditions
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('Terms & Conditions:', 20, yPos);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        yPos += 8;
        doc.text('• This quotation is valid for 30 days from the date of issue', 20, yPos);
        yPos += 6;
        doc.text('• Payment: 50% advance, balance on completion', 20, yPos);
        yPos += 6;
        doc.text('• GST will be charged as applicable', 20, yPos);
        yPos += 6;
        doc.text('• Final costs may vary based on site conditions', 20, yPos);
        
        yPos += 12;
        
        // Thank you section
        doc.setTextColor(76, 175, 80);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14); // Slightly smaller
        doc.text('THANK YOU!', 20, yPos);
        
        yPos += 8;
        
        // Company signature
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('For ANJANEYA BOREWELLS', 20, yPos);
        yPos += 12;
        doc.text('Authorized Signatory', 20, yPos);
        
        // Generated date and time in bottom right corner
        const now = new Date();
        const generatedDateTime = `Generated on: ${now.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        })} at ${now.toLocaleTimeString('en-IN', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        })}`;
        
        // Ensure we have enough space at bottom
        const pageHeight = doc.internal.pageSize.getHeight();
        const bottomMargin = 15;
        
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100); // Gray color
        doc.text(generatedDateTime, 190, pageHeight - bottomMargin, { align: 'right' });

        // Save with professional filename
        const timestamp = new Date().toISOString().split('T')[0];
        doc.save(`Anjaneya-Borewells-Quotation-${timestamp}-${quoteNum}.pdf`);

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
        const gstEnabled = this.isGstEnabled();

        // Create clean itemized WhatsApp message
        let message = `*ANJANEYA BOREWELLS*
Professional Borewell Solutions
━━━━━━━━━━━━━━━━━━━━━━

*BOREWELL QUOTATION*
Date: ${new Date().toLocaleDateString('en-IN')}

*PROJECT DETAILS:*
Total Depth: ${inputs.totalDepth} ft
Drilling Type: ${inputs.drillingType === 'repair' ? 'Rebore (Repair)' : 'New Drilling'}`;
        
        if (inputs.drillingType === 'repair') {
            message += `
Old Bore: ${inputs.oldBoreDepth} ft`;
        }
        
        message += `
Base Rate: Rs.${inputs.drillingRate}/ft`;

        if (inputs.pvc7Length > 0) message += `
7" PVC: ${inputs.pvc7Length} ft`;
        if (inputs.pvc10Length > 0) message += `
10" PVC: ${inputs.pvc10Length} ft`;

        // Itemized cost breakdown table format
        message += `

*ITEMIZED COST BREAKDOWN:*

┌────────────────────────────────┐
│ ITEM | QTY | RATE | AMOUNT     │
├────────────────────────────────┤`;
        
        // Drilling costs
        if (results.slabCalculation.slabDetails.length > 1) {
            results.slabCalculation.slabDetails.forEach(slab => {
                const rangeParts = slab.range.split('-');
                const startDepth = parseInt(rangeParts[0]);
                const endDepth = parseInt(rangeParts[1].replace(' ft', ''));
                const quantity = endDepth - startDepth + 1;
                message += `
│ Drilling (${slab.range})
│ ${quantity} ft | Rs.${slab.rate}/ft | Rs.${slab.cost.toLocaleString('en-IN')}`;
            });
        } else {
            message += `
│ Drilling Cost
│ 1 | - | Rs.${results.drillingCost.toLocaleString('en-IN')}`;
        }
        
        // Additional items
        if (inputs.pvc7Length > 0) {
            message += `
│ 7" PVC Pipe
│ ${inputs.pvc7Length} ft | Rs.${this.defaults.pvc7Rate}/ft | Rs.${results.pvc7Cost.toLocaleString('en-IN')}`;
        }
        if (inputs.pvc10Length > 0) {
            message += `
│ 10" PVC Pipe
│ ${inputs.pvc10Length} ft | Rs.${this.defaults.pvc10Rate}/ft | Rs.${results.pvc10Cost.toLocaleString('en-IN')}`;
        }
        
        message += `
│ Bore Bata
│ 1 | Rs.500 | Rs.${results.boreBataCost.toLocaleString('en-IN')}
├────────────────────────────────┤
│ SUBTOTAL: Rs.${results.subtotal.toLocaleString('en-IN')}`;

        if (gstEnabled) {
            message += `
│ GST (${results.gstPercentage}%): Rs.${results.gstAmount.toLocaleString('en-IN')}`;
        }

        message += `
├────────────────────────────────┤
│ *TOTAL: Rs.${results.totalCost.toLocaleString('en-IN')}*
│ *(Approximate)*
└────────────────────────────────┘

*TERMS & CONDITIONS:*
• Valid for 30 days
• Payment: 50% advance, 50% completion  
• GST as applicable
• Costs may vary per site conditions

*CONTACT US:*
📞 +91 965 965 7777
📞 +91 944 33 73573
📧 anjaneyaborewells@gmail.com

Thank you for choosing Anjaneya Borewells!`;

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

    updateCompanyInfoField(key, value) {
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


// Hidden Settings Manager
class HiddenSettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.manualEdits = {}; // Track manually edited slab rates
        this.init();
    }
    
    init() {
        this.settingsPanel = document.getElementById('hiddenSettingsPanel');
        this.closeSettingsBtn = document.getElementById('closeSettingsBtn');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
        
        this.setupEventListeners();
        this.populateSettings();
        this.populateSlabRates();
    }
    
    setupEventListeners() {
        this.closeSettingsBtn?.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn?.addEventListener('click', () => this.saveSettings());
        this.resetSettingsBtn?.addEventListener('click', () => this.resetSettings());
        
        // Add event listener for the price settings button inside the calculator form
        const priceSettingsBtn = document.getElementById('priceSettingsBtn');
        if (priceSettingsBtn) {
            priceSettingsBtn.addEventListener('click', () => this.toggleSettings());
        }
        
        // Add event listener for main calculator drilling rate changes to update slab rates
        const mainDrillingRateInput = document.getElementById('drillingRate');
        if (mainDrillingRateInput) {
            mainDrillingRateInput.addEventListener('input', () => {
                // Update slab rates when main drilling rate changes
                this.updateSlabRatesFromMainDrillingRate();
                // Also trigger calculator recalculation
                if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
                    window.anjaneyaApp.calculator.calculate();
                }
            });
            mainDrillingRateInput.addEventListener('change', () => {
                // Update slab rates when main drilling rate changes
                this.updateSlabRatesFromMainDrillingRate();
                // Also trigger calculator recalculation
                if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
                    window.anjaneyaApp.calculator.calculate();
                }
            });
        }
        
        // Add instant update listeners for price settings inputs
        const pvc7RateInput = document.getElementById('pvc7RateSetting');
        const pvc10RateInput = document.getElementById('pvc10RateSetting');
        const oldBoreRateInput = document.getElementById('oldBoreRateSetting');
        const gstPercentageInput = document.getElementById('gstPercentageSetting');
        
        if (pvc7RateInput) {
            pvc7RateInput.addEventListener('input', () => this.updateSettingsInstantly());
            pvc7RateInput.addEventListener('change', () => this.updateSettingsInstantly());
        }
        
        if (pvc10RateInput) {
            pvc10RateInput.addEventListener('input', () => this.updateSettingsInstantly());
            pvc10RateInput.addEventListener('change', () => this.updateSettingsInstantly());
        }
        
        if (oldBoreRateInput) {
            oldBoreRateInput.addEventListener('input', () => this.updateSettingsInstantly());
            oldBoreRateInput.addEventListener('change', () => this.updateSettingsInstantly());
        }
        
        if (gstPercentageInput) {
            gstPercentageInput.addEventListener('input', () => this.updateSettingsInstantly());
            gstPercentageInput.addEventListener('change', () => this.updateSettingsInstantly());
        }
    }
    
    toggleSettings() {
        const isOpening = this.settingsPanel.style.display === 'none';
        this.settingsPanel.style.display = isOpening ? 'block' : 'none';
        
        if (isOpening) {
            // Always calculate slab rates from current main drilling rate
            this.updateSlabRatesFromMainDrillingRate();
        }
    }
    
    closeSettings() {
        this.settingsPanel.style.display = 'none';
    }
    
    loadSettings() {
        const defaultSettings = {
            pvc7Rate: 450,
            pvc10Rate: 750,
            oldBoreRate: 40,
            baseDrillingRate: 90,
            gstPercentage: 18,
            slabRates: []
        };
        
        const saved = localStorage.getItem('anjaneya-calculator-settings');
        const loadedSettings = saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
        
        // Always ensure we have slab rates calculated from the current main drilling rate
        const mainDrillingRate = document.getElementById('drillingRate');
        const currentBaseRate = mainDrillingRate ? parseFloat(mainDrillingRate.value) || loadedSettings.baseDrillingRate : loadedSettings.baseDrillingRate;
        
        // Calculate slab rates from current base rate
        loadedSettings.slabRates = this.calculateSlabRatesFromBaseRate(currentBaseRate);
        
        return loadedSettings;
    }
    
    saveSettings() {
        // Get current main drilling rate to preserve it
        const mainDrillingRate = document.getElementById('drillingRate');
        const currentBaseRate = mainDrillingRate ? parseFloat(mainDrillingRate.value) || 90 : 90;
        
        const newSettings = {
            pvc7Rate: parseFloat(document.getElementById('pvc7RateSetting').value) || 450,
            pvc10Rate: parseFloat(document.getElementById('pvc10RateSetting').value) || 750,
            oldBoreRate: parseFloat(document.getElementById('oldBoreRateSetting').value) || 40,
            baseDrillingRate: currentBaseRate, // Preserve the current base drilling rate
            gstPercentage: parseFloat(document.getElementById('gstPercentageSetting').value) || 18,
            slabRates: this.getSlabRatesFromInputs()
        };
        
        this.settings = newSettings;
        localStorage.setItem('anjaneya-calculator-settings', JSON.stringify(newSettings));
        
        // Update calculator with new settings
        if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
            window.anjaneyaApp.calculator.updateSettings(newSettings);
        }
        
        // Trigger a custom event to notify other components
        window.dispatchEvent(new CustomEvent('calculatorSettingsUpdated', {
            detail: {
                settings: newSettings,
                timestamp: Date.now()
            }
        }));
        
        alert('Settings saved successfully!');
        this.closeSettings();
    }
    
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            localStorage.removeItem('anjaneya-calculator-settings');
            this.settings = this.loadSettings();
            this.populateSettings();
            this.populateSlabRates();
            
            // Update calculator with default settings
            if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
                window.anjaneyaApp.calculator.updateSettings(this.settings);
            }
        }
    }
    
    populateSettings() {
        document.getElementById('pvc7RateSetting').value = this.settings.pvc7Rate;
        document.getElementById('pvc10RateSetting').value = this.settings.pvc10Rate;
        document.getElementById('oldBoreRateSetting').value = this.settings.oldBoreRate;
        document.getElementById('gstPercentageSetting').value = this.settings.gstPercentage;
    }
    
    populateSlabRates() {
        // Calculate slab rates based on current main calculator drilling rate
        const mainDrillingRate = document.getElementById('drillingRate');
        const baseRate = mainDrillingRate ? parseFloat(mainDrillingRate.value) || 90 : 90;
        const calculatedSlabRates = this.calculateSlabRatesFromBaseRate(baseRate);
        
        // Preserve manually edited rates
        if (this.manualEdits) {
            calculatedSlabRates.forEach((slab, index) => {
                if (this.manualEdits[index]) {
                    slab.rate = this.manualEdits[index].rate;
                }
            });
        }
        
        // Update settings with calculated rates
        this.settings.slabRates = calculatedSlabRates;
        
        // Populate the UI with calculated rates
        this.populateSlabRatesWithRates(calculatedSlabRates);
    }
    
    addSlabRate() {
        const container = document.getElementById('slabRateSettings');
        const newIndex = this.settings.slabRates.length;
        
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.gap = '10px';
        div.style.marginBottom = '10px';
        div.style.alignItems = 'center';
        
        div.innerHTML = `
            <input type="text" value="New Range" style="flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;" data-index="${newIndex}" data-field="range">
            <input type="number" value="0" style="width: 80px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;" data-index="${newIndex}" data-field="rate">
            <button onclick="this.parentElement.remove()" style="background: #ef4444; color: white; border: none; border-radius: 3px; padding: 6px 8px; cursor: pointer; font-size: 12px;">×</button>
        `;
        
        container.insertBefore(div, container.lastElementChild);
    }
    
    getSlabRatesFromInputs() {
        const container = document.getElementById('slabRateSettings');
        const inputs = container.querySelectorAll('input[data-field="range"], input[data-field="rate"]');
        const slabRates = [];
        
        for (let i = 0; i < inputs.length; i += 2) {
            const rangeInput = inputs[i];
            const rateInput = inputs[i + 1];
            
            if (rangeInput && rateInput) {
                slabRates.push({
                    range: rangeInput.value,
                    rate: parseFloat(rateInput.value) || 0
                });
            }
        }
        
        return slabRates;
    }

    updateSlabRatesFromMainDrillingRate() {
        const mainDrillingRate = document.getElementById('drillingRate');
        const baseRate = mainDrillingRate ? parseFloat(mainDrillingRate.value) || 90 : 90;
        
        // Always calculate new slab rates based on current base rate
        const newSlabRates = this.calculateSlabRatesFromBaseRate(baseRate);
        
        // Preserve manually edited rates if they exist
        if (this.manualEdits && Object.keys(this.manualEdits).length > 0) {
            newSlabRates.forEach((slab, index) => {
                if (this.manualEdits[index]) {
                    slab.rate = this.manualEdits[index].rate;
                }
            });
        }
        
        // Update the slab rate inputs in the UI
        this.populateSlabRatesWithRates(newSlabRates);
        
        // Update the settings object
        this.settings.slabRates = newSlabRates;
    }

    // Update settings instantly without save button
    updateSettingsInstantly() {
        // Preserve existing slab rates when updating other settings
        const currentSlabRates = this.settings.slabRates || [];
        
        // Get current main drilling rate to preserve it
        const mainDrillingRate = document.getElementById('drillingRate');
        const currentBaseRate = mainDrillingRate ? parseFloat(mainDrillingRate.value) || 90 : 90;
        
        const newSettings = {
            pvc7Rate: parseFloat(document.getElementById('pvc7RateSetting').value) || 450,
            pvc10Rate: parseFloat(document.getElementById('pvc10RateSetting').value) || 750,
            oldBoreRate: parseFloat(document.getElementById('oldBoreRateSetting').value) || 40,
            baseDrillingRate: currentBaseRate, // Preserve the current base drilling rate
            gstPercentage: parseFloat(document.getElementById('gstPercentageSetting').value) || 18,
            slabRates: currentSlabRates // Preserve existing slab rates
        };
        
        // Update local settings
        this.settings = newSettings;
        
        // Save to localStorage immediately
        localStorage.setItem('anjaneya-calculator-settings', JSON.stringify(newSettings));
        
        // Update calculator with new settings
        if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
            window.anjaneyaApp.calculator.updateSettings(newSettings);
        }
        
        // Show instant update notification
        this.showInstantUpdateNotification();
    }

    showInstantUpdateNotification() {
        // Remove any existing notification
        const existingNotification = document.querySelector('.instant-update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'instant-update-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #0bc524;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(11, 197, 36, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.innerHTML = '✓ Settings Updated';
        
        document.body.appendChild(notification);
        
        // Auto remove after 2 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 2000);
    }


    toggleSlabRateEdit(index) {
        const container = document.getElementById('slabRateSettings');
        const rateInput = container.querySelector(`input[data-index="${index}"][data-field="rate"]`);
        const editButton = container.querySelector(`button[data-index="${index}"]`);
        const statusSpan = editButton.nextElementSibling;
        
        if (rateInput.readOnly) {
            // Enable editing
            rateInput.readOnly = false;
            rateInput.style.backgroundColor = '#fff3cd';
            rateInput.style.borderColor = '#ffc107';
            editButton.textContent = 'Save';
            editButton.style.background = '#22c55e';
            statusSpan.textContent = 'Editing';
            statusSpan.style.color = '#ffc107';
            
            // Focus on the input
            rateInput.focus();
            rateInput.select();
        } else {
            // Save the edit
            const newRate = parseFloat(rateInput.value);
            if (isNaN(newRate) || newRate < 0) {
                alert('Please enter a valid rate');
                return;
            }
            
            // Store the manual edit
            if (!this.manualEdits) {
                this.manualEdits = {};
            }
            this.manualEdits[index] = {
                rate: newRate,
                range: this.settings.slabRates[index].range
            };
            
            // Update the settings
            this.settings.slabRates[index].rate = newRate;
            
            // Update calculator with new settings
            if (window.anjaneyaApp && window.anjaneyaApp.calculator) {
                window.anjaneyaApp.calculator.updateSettings(this.settings);
            }
            
            // Disable editing
            rateInput.readOnly = true;
            rateInput.style.backgroundColor = '';
            rateInput.style.borderColor = '#ddd';
            editButton.textContent = 'Edit';
            editButton.style.background = '#3b82f6';
            statusSpan.textContent = 'Manual';
            statusSpan.style.color = '#22c55e';
            
            // Show instant update notification
            this.showInstantUpdateNotification();
        }
    }

    populateSlabRatesWithRates(slabRates) {
        const container = document.getElementById('slabRateSettings');
        container.innerHTML = '';
        
        slabRates.forEach((slab, index) => {
            const div = document.createElement('div');
            div.style.display = 'flex';
            div.style.gap = '10px';
            div.style.marginBottom = '10px';
            div.style.alignItems = 'center';
            
            // Check if this rate was manually edited
            const isManualEdit = this.manualEdits && this.manualEdits[index];
            const statusText = isManualEdit ? 'Manual' : 'Auto';
            const statusColor = isManualEdit ? '#22c55e' : '#666';
            
            div.innerHTML = `
                <input type="text" value="${slab.range}" style="flex: 1; padding: 6px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;" data-index="${index}" data-field="range" readonly>
                <input type="number" value="${slab.rate}" style="width: 80px; padding: 6px 8px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;" data-index="${index}" data-field="rate" readonly>
                <button class="edit-slab-btn" data-index="${index}" style="background: #3b82f6; color: white; border: none; border-radius: 3px; padding: 6px 8px; cursor: pointer; font-size: 12px; width: 50px;">Edit</button>
                <span style="width: 30px; text-align: center; font-size: 12px; color: ${statusColor};">${statusText}</span>
            `;
            
            container.appendChild(div);
        });
        
        // Add event listeners for edit buttons
        container.querySelectorAll('.edit-slab-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.getAttribute('data-index'));
                this.toggleSlabRateEdit(index);
            });
        });
        
        // Add new slab rate button
        const addButton = document.createElement('button');
        addButton.textContent = '+ Add Custom Slab Rate';
        addButton.style.width = '100%';
        addButton.style.padding = '8px';
        addButton.style.background = '#22c55e';
        addButton.style.color = 'white';
        addButton.style.border = 'none';
        addButton.style.borderRadius = '5px';
        addButton.style.cursor = 'pointer';
        addButton.style.marginTop = '10px';
        addButton.onclick = () => this.addSlabRate();
        
        container.appendChild(addButton);
    }

    calculateSlabRatesFromBaseRate(baseRate) {
        // Progressive rate increments based on the original logic
        const rateIncrements = [0, 5, 15, 35, 65, 105, 155, 215, 315, 415, 515, 615, 715, 815, 915, 1015, 1115, 1215];
        const depthRanges = [
            { start: 1, end: 300 },      // First slab: 300 feet
            { start: 301, end: 400 },    // Second slab: 100 feet
            { start: 401, end: 500 },    // Third slab: 100 feet
            { start: 501, end: 600 },    // Fourth slab: 100 feet
            { start: 601, end: 700 },   // Fifth slab: 100 feet
            { start: 701, end: 800 },   // Sixth slab: 100 feet
            { start: 801, end: 900 },   // Seventh slab: 100 feet
            { start: 901, end: 1000 },  // Eighth slab: 100 feet
            { start: 1001, end: 1100 }, // Ninth slab: 100 feet
            { start: 1101, end: 1200 }, // Tenth slab: 100 feet
            { start: 1201, end: 1300 }, // Eleventh slab: 100 feet
            { start: 1301, end: 1400 }, // Twelfth slab: 100 feet
            { start: 1401, end: 1500 }, // Thirteenth slab: 100 feet
            { start: 1501, end: 1600 }, // Fourteenth slab: 100 feet
            { start: 1601, end: 1700 }, // Fifteenth slab: 100 feet
            { start: 1701, end: 1800 }, // Sixteenth slab: 100 feet
            { start: 1801, end: 1900 }, // Seventeenth slab: 100 feet
            { start: 1901, end: 2000 }  // Eighteenth slab: 100 feet
        ];

        return depthRanges.map((range, index) => ({
            range: `${range.start.toString().padStart(3, '0')}-${range.end} ft`,
            rate: baseRate + (rateIncrements[index] || 0)
        }));
    }
}

// Enterprise-Level Features
class EnterpriseFeatures {
    constructor() {
        this.initScrollAnimations();
        this.initLightbox();
        this.initTestimonialCarousel();
        this.initStatsCounters();
        this.initProgressBars();
    }

    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                }
            });
        }, observerOptions);

        // Observe all elements with animation classes
        document.querySelectorAll('.animate-on-scroll, .animate-left, .animate-right, .animate-scale').forEach(el => {
            observer.observe(el);
        });
    }

    initLightbox() {
        const photoItems = document.querySelectorAll('.photo-item');
        const lightbox = this.createLightbox();

        photoItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const img = item.querySelector('img');
                if (img) {
                    this.openLightbox(lightbox, img.src, img.alt);
                }
            });
        });
    }

    createLightbox() {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="" alt="" style="max-width: 100%; max-height: 100%; border-radius: 8px;">
                <button class="lightbox-close">&times;</button>
            </div>
        `;
        document.body.appendChild(lightbox);

        // Close lightbox events
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox(lightbox);
        });

        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                this.closeLightbox(lightbox);
            }
        });

        // ESC key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                this.closeLightbox(lightbox);
            }
        });

        return lightbox;
    }

    openLightbox(lightbox, src, alt) {
        const img = lightbox.querySelector('img');
        img.src = src;
        img.alt = alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeLightbox(lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    initTestimonialCarousel() {
        const carousel = document.querySelector('.testimonial-carousel');
        if (!carousel) return;

        const slides = carousel.querySelectorAll('.testimonial-slide');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let currentSlide = 0;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev');
                if (i === index) {
                    slide.classList.add('active');
                } else if (i < index) {
                    slide.classList.add('prev');
                }
            });

            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        };

        // Auto-advance carousel
        setInterval(() => {
            currentSlide = (currentSlide + 1) % slides.length;
            showSlide(currentSlide);
        }, 5000);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
            });
        });

        showSlide(0);
    }

    initStatsCounters() {
        const counters = document.querySelectorAll('.stats-counter');
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        counters.forEach(counter => {
            observer.observe(counter);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    initProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');
        const observerOptions = {
            threshold: 0.5
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const width = progressBar.dataset.width || '100%';
                    progressBar.style.width = width;
                    observer.unobserve(progressBar);
                }
            });
        }, observerOptions);

        progressBars.forEach(bar => {
            observer.observe(bar);
        });
    }
}

// Enhanced Form Validation
class EnterpriseFormValidation {
    constructor() {
        this.initValidation();
    }

    initValidation() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        const type = field.type;
        const required = field.hasAttribute('required');

        if (required && !value) {
            this.showError(field, 'This field is required');
            return false;
        }

        if (type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                this.showError(field, 'Please enter a valid email address');
                return false;
            }
        }

        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(value.replace(/\s/g, ''))) {
                this.showError(field, 'Please enter a valid phone number');
                return false;
            }
        }

        this.clearErrors(field);
        return true;
    }

    showError(field, message) {
        this.clearErrors(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#ef4444';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#ef4444';
    }

    clearErrors(field) {
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        field.style.borderColor = '';
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.anjaneyaApp = new AnjaneyaBorewells();
    window.hiddenSettings = new HiddenSettingsManager();
    window.enterpriseFeatures = new EnterpriseFeatures();
    window.formValidation = new EnterpriseFormValidation();
    
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
