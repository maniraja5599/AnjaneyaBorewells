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
                if (targetId === '#home' || targetId === '#' || targetId === '') {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: 'smooth'
                    });
                } else {
                    const targetElement = document.querySelector(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
                
                // Close mobile menu if it's open (for nav-link clicks)
                if (link.classList.contains('nav-link') || link.id === 'navWhatsappBtn') {
                    this.navigation.closeMobileMenu();
                }
            });
        });

        // Get Quote button goes to calculator section
        document.getElementById('navWhatsappBtn')?.addEventListener('click', (e) => {
            console.log('Get Quote button clicked - going to calculator');
        });

        // Company name & Brand link click goes directly to absolute top of page
        document.querySelectorAll('.brand-link, .company-name').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
                this.navigation.closeMobileMenu();
            });
        });

        // Sync Total Depth fields between main form and repair section
        this.setupTotalDepthSync();

        // Window scroll events - RAF throttled and passive
        let scrollRaf = null;
        window.addEventListener('scroll', () => {
            if (!scrollRaf) {
                scrollRaf = requestAnimationFrame(() => {
                    this.navigation.handleScroll();
                    scrollRaf = null;
                });
            }
        }, { passive: true });

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

        // Calculator form submission
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
        
        // Price settings button - toggle inline settings
        document.getElementById('priceSettingsBtn')?.addEventListener('click', () => {
            this.toggleInlineSettings();
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
            mainTotalDepth.addEventListener('input', () => {
                repairTotalDepth.value = mainTotalDepth.value;
                if (this.calculator) {
                    this.calculator.calculate();
                }
            }, { passive: true });
            
            repairTotalDepth.addEventListener('input', () => {
                mainTotalDepth.value = repairTotalDepth.value;
                if (this.calculator) {
                    this.calculator.calculate();
                }
            }, { passive: true });
        }
    }

    setupInputButtons() {
        // Shared fast button increment/decrement handler
        const handleStep = (targetId, step, isUp, min, max) => {
            const input = document.getElementById(targetId);
            if (!input) return;
            const currentValue = parseFloat(input.value) || 0;
            const stepVal = parseFloat(step) || 1;
            const minVal = min !== undefined ? min : (parseFloat(input.getAttribute('min')) || 0);
            const maxVal = max !== undefined ? max : (parseFloat(input.getAttribute('max')) || Infinity);
            
            let newValue = isUp ? Math.min(currentValue + stepVal, maxVal) : Math.max(currentValue - stepVal, minVal);
            input.value = newValue;

            // Sync totalDepth fields if applicable
            if (targetId === 'totalDepth') {
                const repairEl = document.getElementById('totalDepthRepair');
                if (repairEl) repairEl.value = newValue;
            } else if (targetId === 'totalDepthRepair') {
                const mainEl = document.getElementById('totalDepth');
                if (mainEl) mainEl.value = newValue;
            }

            if (this.calculator) {
                this.calculator.calculate();
            }
        };

        // Increase buttons
        document.querySelectorAll('.increase-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                handleStep(targetId, button.getAttribute('step') || 1, true);
            });
        });

        // Decrease buttons
        document.querySelectorAll('.decrease-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                handleStep(targetId, button.getAttribute('step') || 1, false);
            });
        });

        // Modal close
        document.getElementById('modalClose')?.addEventListener('click', () => {
            this.modal.close('emailModal');
        });

        // Mobile navigation toggle
        document.getElementById('navToggle')?.addEventListener('click', (e) => {
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
        
        // Mobile input increment/decrement buttons (▲ / ▼)
        document.querySelectorAll('.input-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = button.getAttribute('data-target');
                const step = button.getAttribute('data-step') || 1;
                const isUp = button.classList.contains('input-btn-up');
                handleStep(targetId, step, isUp);
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
        // Disabled layout thrashing scroll listener for 60/120 FPS buttery smooth scrolling
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
    
    setupInlinePriceSettings() {
        // Close inline settings button
        document.getElementById('closeInlineSettings')?.addEventListener('click', () => {
            this.closeInlineSettings();
        });
        
        // Save inline settings button
        document.getElementById('saveInlineSettings')?.addEventListener('click', () => {
            this.saveInlineSettings();
        });
        
        // Reset inline settings button
        document.getElementById('resetInlineSettings')?.addEventListener('click', () => {
            this.resetInlineSettings();
        });
        
        // Toggle slab rates button
        document.getElementById('toggleSlabRates')?.addEventListener('click', () => {
            this.toggleSlabRatesSection();
        });
        
        // Load current settings into inline inputs
        this.loadInlineSettings();
        
        // Add select all functionality to inline inputs
        this.setupInlineSelectAll();
    }
    
    toggleInlineSettings() {
        const inlinePanel = document.getElementById('inlinePriceSettings');
        if (inlinePanel) {
            const isVisible = inlinePanel.style.display !== 'none';
            inlinePanel.style.display = isVisible ? 'none' : 'block';
            
            if (!isVisible) {
                // Load current settings when opening
                this.loadInlineSettings();
                // Hide slab rates section initially
                this.hideSlabRatesSection();
            }
        }
    }
    
    closeInlineSettings() {
        const inlinePanel = document.getElementById('inlinePriceSettings');
        if (inlinePanel) {
            inlinePanel.style.display = 'none';
        }
    }
    
    loadInlineSettings() {
        // Load settings from localStorage first, then fallback to calculator defaults
        const saved = localStorage.getItem('anjaneya-calculator-settings');
        let settings = {};
        
        if (saved) {
            try {
                settings = JSON.parse(saved);
                // Auto-migrate legacy 450/750 PVC rates and 100 base rate to new standards
                if (settings.pvc7Rate === 450) settings.pvc7Rate = 400;
                if (settings.pvc10Rate === 750) settings.pvc10Rate = 700;
                if (settings.baseDrillingRate === 100) settings.baseDrillingRate = 90;
                if (settings.drillingRate === 100) settings.drillingRate = 90;
                localStorage.setItem('anjaneya-calculator-settings', JSON.stringify(settings));
            } catch (e) {
                console.warn('Failed to parse saved settings:', e);
                settings = {};
            }
        }
        
        // Use saved settings or fallback to calculator defaults
        const pvc7Rate = settings.pvc7Rate || this.calculator.defaults.pvc7Rate || 400;
        const pvc10Rate = settings.pvc10Rate || this.calculator.defaults.pvc10Rate || 700;
        const baseDrillingRate = settings.baseDrillingRate || this.calculator.defaults.drillingRate || 90;
        const oldBoreRate = settings.oldBoreRate || this.calculator.defaults.oldBoreRate || 40;
        const boreBataRate = settings.boreBataRate || this.calculator.defaults.boreBataRate || 2000;
        const gstPercentage = settings.gstPercentage || this.calculator.defaults.gstPercentage || 18;
        
        const pvc7Input = document.getElementById('inlinePvc7Rate');
        const pvc10Input = document.getElementById('inlinePvc10Rate');
        const baseDrillingInput = document.getElementById('inlineBaseDrillingRate');
        const oldBoreInput = document.getElementById('inlineOldBoreRate');
        const boreBataInput = document.getElementById('inlineBoreBataRate');
        const gstInput = document.getElementById('inlineGstPercentage');
        
        if (pvc7Input) pvc7Input.value = pvc7Rate;
        if (pvc10Input) pvc10Input.value = pvc10Rate;
        if (baseDrillingInput) baseDrillingInput.value = baseDrillingRate;
        if (oldBoreInput) oldBoreInput.value = oldBoreRate;
        if (boreBataInput) boreBataInput.value = boreBataRate;
        if (gstInput) gstInput.value = gstPercentage;
        
        // Also load slab rates if they exist
        if (settings.slabRates && settings.slabRates.length > 0) {
            this.calculator.slabRates = settings.slabRates;
        }
        
        // Sync with main page drilling rate
        const mainDrillingRateInput = document.getElementById('drillingRate');
        if (mainDrillingRateInput) {
            mainDrillingRateInput.value = baseDrillingRate;
        }
        
        // Setup real-time syncing for base drilling rate
        this.setupBaseDrillingRateSync();
        
        // Show notification if settings were loaded from storage
        if (saved && Object.keys(settings).length > 0) {
            this.showSettingsLoadedNotification();
        }
    }
    
    saveInlineSettings() {
        const pvc7Rate = parseFloat(document.getElementById('inlinePvc7Rate')?.value) || 400;
        const pvc10Rate = parseFloat(document.getElementById('inlinePvc10Rate')?.value) || 700;
        const baseDrillingRate = parseFloat(document.getElementById('inlineBaseDrillingRate')?.value) || 90;
        const oldBoreRate = parseFloat(document.getElementById('inlineOldBoreRate')?.value) || 40;
        const boreBataRate = parseFloat(document.getElementById('inlineBoreBataRate')?.value) || 2000;
        const gstPercentage = parseFloat(document.getElementById('inlineGstPercentage')?.value) || 18;
        
        // Get current slab rates
        const slabRates = [];
        const slabInputs = document.querySelectorAll('.inline-slab-input-box');
        if (slabInputs.length > 0) {
            slabInputs.forEach((input, index) => {
                const def = CostCalculator.DEPTH_SLABS[index] || {};
                slabRates.push({
                    start: def.start,
                    end: def.end,
                    span: def.span,
                    range: def.rangeStr,
                    rate: parseFloat(input.value) || def.defaultRate || 90
                });
            });
        } else if (this.calculator.slabRates && this.calculator.slabRates.length > 0) {
            slabRates.push(...this.calculator.slabRates);
        } else {
            slabRates.push(...CostCalculator.DEPTH_SLABS.map(d => ({ ...d, rate: d.defaultRate })));
        }
        
        // Update calculator defaults
        this.calculator.defaults.pvc7Rate = pvc7Rate;
        this.calculator.defaults.pvc10Rate = pvc10Rate;
        this.calculator.defaults.drillingRate = baseDrillingRate;
        this.calculator.defaults.oldBoreRate = oldBoreRate;
        this.calculator.defaults.flushingRate = oldBoreRate;
        this.calculator.defaults.boreBataRate = boreBataRate;
        this.calculator.defaults.gstPercentage = gstPercentage;
        
        // Update calculator slab rates
        this.calculator.slabRates = slabRates;
        
        // Sync with main page drilling rate
        const mainDrillingRateInput = document.getElementById('drillingRate');
        if (mainDrillingRateInput) {
            mainDrillingRateInput.value = baseDrillingRate;
        }
        
        // Save to localStorage
        localStorage.setItem('anjaneya-calculator-settings', JSON.stringify({
            pvc7Rate,
            pvc10Rate,
            baseDrillingRate,
            oldBoreRate,
            flushingRate: oldBoreRate,
            boreBataRate,
            gstPercentage,
            slabRates: slabRates
        }));
        
        // Trigger recalculation
        this.calculator.calculate();
        
        // Show success notification
        this.showInlineSuccessNotification();
        
        // Close the panel
        this.closeInlineSettings();
    }
    
    resetInlineSettings() {
        if (confirm('Are you sure you want to reset all settings to default values?')) {
            // Reset to default values
            if (document.getElementById('inlinePvc7Rate')) document.getElementById('inlinePvc7Rate').value = 400;
            if (document.getElementById('inlinePvc10Rate')) document.getElementById('inlinePvc10Rate').value = 700;
            if (document.getElementById('inlineBaseDrillingRate')) document.getElementById('inlineBaseDrillingRate').value = 90;
            if (document.getElementById('inlineOldBoreRate')) document.getElementById('inlineOldBoreRate').value = 40;
            if (document.getElementById('inlineBoreBataRate')) document.getElementById('inlineBoreBataRate').value = 2000;
            if (document.getElementById('inlineGstPercentage')) document.getElementById('inlineGstPercentage').value = 18;
            
            // Reset slab rates to defaults
            const defaultSlabs = CostCalculator.DEPTH_SLABS.map(d => ({ ...d, rate: d.defaultRate }));
            const slabInputs = document.querySelectorAll('.inline-slab-input-box');
            slabInputs.forEach((input, index) => {
                input.value = defaultSlabs[index].rate;
            });
            
            // Update calculator defaults
            this.calculator.defaults.pvc7Rate = 400;
            this.calculator.defaults.pvc10Rate = 700;
            this.calculator.defaults.drillingRate = 90;
            this.calculator.defaults.oldBoreRate = 40;
            this.calculator.defaults.flushingRate = 40;
            this.calculator.defaults.boreBataRate = 2000;
            this.calculator.defaults.gstPercentage = 18;
            
            // Update calculator slab rates
            this.calculator.slabRates = defaultSlabs;
            
            // Sync with main page drilling rate
            const mainDrillingRateInput = document.getElementById('drillingRate');
            if (mainDrillingRateInput) {
                mainDrillingRateInput.value = 90;
            }
            
            // Save to localStorage
            localStorage.setItem('anjaneya-calculator-settings', JSON.stringify({
                pvc7Rate: 400,
                pvc10Rate: 700,
                baseDrillingRate: 90,
                oldBoreRate: 40,
                flushingRate: 40,
                boreBataRate: 2000,
                gstPercentage: 18,
                slabRates: defaultSlabs
            }));
            
            // Trigger recalculation
            this.calculator.calculate();
            
            // Show success notification
            this.showInlineSuccessNotification();
        }
    }
    
    setupInlineSelectAll() {
        // Simple and non-blocking focus behavior
    }
    
    setupBaseDrillingRateSync() {
        const baseDrillingInput = document.getElementById('inlineBaseDrillingRate');
        const mainDrillingInput = document.getElementById('drillingRate');
        
        const updateSlabsAndCalculate = (newRate) => {
            if (!newRate || newRate <= 0) return;
            this.calculator.defaults.drillingRate = newRate;
            
            if (this.calculator.slabRates && this.calculator.slabRates.length > 0) {
                const currentBase = this.calculator.slabRates[0].rate || 100;
                const delta = newRate - currentBase;
                if (delta !== 0) {
                    this.calculator.slabRates.forEach(slab => {
                        slab.rate = Math.max(1, slab.rate + delta);
                    });
                }
            } else {
                this.calculator.slabRates = CostCalculator.DEPTH_SLABS.map(d => ({
                    start: d.start,
                    end: d.end,
                    span: d.span,
                    range: d.rangeStr,
                    rate: newRate + d.inc
                }));
            }
            
            // Also update any rendered inline slab inputs
            document.querySelectorAll('.inline-slab-input-box').forEach((box, i) => {
                if (this.calculator.slabRates[i]) {
                    box.value = this.calculator.slabRates[i].rate;
                }
            });
            
            this.calculator.calculate();
        };

        if (baseDrillingInput) {
            ['input', 'change'].forEach(evt => {
                baseDrillingInput.addEventListener(evt, (e) => {
                    const newRate = parseFloat(e.target.value) || 0;
                    if (mainDrillingInput && mainDrillingInput.value !== e.target.value) {
                        mainDrillingInput.value = e.target.value;
                    }
                    updateSlabsAndCalculate(newRate);
                });
            });
        }
        
        if (mainDrillingInput) {
            ['input', 'change'].forEach(evt => {
                mainDrillingInput.addEventListener(evt, (e) => {
                    const newRate = parseFloat(e.target.value) || 0;
                    if (baseDrillingInput && baseDrillingInput.value !== e.target.value) {
                        baseDrillingInput.value = e.target.value;
                    }
                    updateSlabsAndCalculate(newRate);
                });
            });
        }
    }
    
    showInlineSuccessNotification() {
        const existingNotification = document.querySelector('.inline-success-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = 'inline-success-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #22c55e;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = 'Settings saved & applied live!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    loadInlineSlabRates() {
        const grid = document.getElementById('inlineSlabRatesGrid');
        if (!grid) return;
        
        let savedSlabs = this.calculator.slabRates;
        if (!savedSlabs || savedSlabs.length === 0) {
            const calcSaved = localStorage.getItem('anjaneya-calculator-settings');
            if (calcSaved) {
                try { savedSlabs = JSON.parse(calcSaved).slabRates; } catch(e) {}
            }
        }
        
        grid.innerHTML = CostCalculator.DEPTH_SLABS.map((def, idx) => {
            const savedRate = (savedSlabs && savedSlabs[idx] && savedSlabs[idx].rate !== undefined) 
                ? savedSlabs[idx].rate 
                : def.defaultRate;
            return `
                <div class="inline-slab-item">
                    <span class="inline-slab-name">📏 ${def.rangeStr}</span>
                    <div class="inline-slab-input-wrap">
                        <span class="inline-slab-currency">₹</span>
                        <input type="number" class="inline-slab-input-box" data-index="${idx}" value="${savedRate}" min="1" step="1">
                    </div>
                </div>
            `;
        }).join('');
        
        this.setupInlineSlabRateListeners();
    }
    
    setupInlineSlabRateListeners() {
        const slabInputs = document.querySelectorAll('.inline-slab-input-box');
        slabInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const index = parseInt(e.target.dataset.index);
                const rate = parseFloat(e.target.value) || 0;
                this.updateInlineSlabRate(index, rate);
            });
        });

        const addStepBtn = document.getElementById('inlineAddStepBtn');
        const deductStepBtn = document.getElementById('inlineDeductStepBtn');
        const stepAmountInput = document.getElementById('inlineStepAmount');
        const minus5Btn = document.getElementById('inlineMinus5Btn');
        const plus5Btn = document.getElementById('inlinePlus5Btn');
        const resetSlabsBtn = document.getElementById('inlineResetSlabsBtn');

        const applyStepToAll = (delta) => {
            const updated = [];
            document.querySelectorAll('.inline-slab-input-box').forEach((input, idx) => {
                const def = CostCalculator.DEPTH_SLABS[idx] || {};
                const currentVal = parseFloat(input.value) || def.defaultRate || 100;
                const nextVal = Math.max(1, currentVal + delta);
                input.value = nextVal;
                updated.push({
                    start: def.start,
                    end: def.end,
                    span: def.span,
                    range: def.rangeStr,
                    rate: nextVal
                });
            });
            this.calculator.slabRates = updated;
            this.calculator.calculate();
        };

        if (addStepBtn && !addStepBtn._bound) {
            addStepBtn._bound = true;
            addStepBtn.addEventListener('click', () => {
                const step = parseFloat(stepAmountInput?.value) || 5;
                applyStepToAll(step);
            });
        }

        if (deductStepBtn && !deductStepBtn._bound) {
            deductStepBtn._bound = true;
            deductStepBtn.addEventListener('click', () => {
                const step = parseFloat(stepAmountInput?.value) || 5;
                applyStepToAll(-step);
            });
        }

        if (minus5Btn && !minus5Btn._bound) {
            minus5Btn._bound = true;
            minus5Btn.addEventListener('click', () => applyStepToAll(-5));
        }

        if (plus5Btn && !plus5Btn._bound) {
            plus5Btn._bound = true;
            plus5Btn.addEventListener('click', () => applyStepToAll(5));
        }

        if (resetSlabsBtn && !resetSlabsBtn._bound) {
            resetSlabsBtn._bound = true;
            resetSlabsBtn.addEventListener('click', () => {
                const resetSlabs = [];
                document.querySelectorAll('.inline-slab-input-box').forEach((input, idx) => {
                    const def = CostCalculator.DEPTH_SLABS[idx];
                    if (def) {
                        input.value = def.defaultRate;
                        resetSlabs.push({
                            start: def.start,
                            end: def.end,
                            span: def.span,
                            range: def.rangeStr,
                            rate: def.defaultRate
                        });
                    }
                });
                if (stepAmountInput) stepAmountInput.value = 5;
                this.calculator.slabRates = resetSlabs;
                this.calculator.calculate();
            });
        }
    }
    
    updateInlineSlabRate(index, rate) {
        if (!this.calculator.slabRates || this.calculator.slabRates.length === 0) {
            this.calculator.slabRates = CostCalculator.DEPTH_SLABS.map(d => ({ ...d, rate: d.defaultRate }));
        }
        if (this.calculator.slabRates[index]) {
            this.calculator.slabRates[index].rate = rate;
            this.calculator.calculate();
        }
    }
    
    toggleSlabRatesSection() {
        const slabSection = document.getElementById('slabRatesSection');
        const toggleBtn = document.getElementById('toggleSlabRates');
        
        if (slabSection && toggleBtn) {
            const isVisible = slabSection.style.display !== 'none';
            
            if (isVisible) {
                // Hide slab rates section
                slabSection.style.display = 'none';
                toggleBtn.textContent = 'Configure Slab Rates';
            } else {
                // Show slab rates section
                slabSection.style.display = 'block';
                toggleBtn.textContent = 'Hide Slab Rates';
                
                // Load slab rates
                this.loadInlineSlabRates();
            }
        }
    }
    
    hideSlabRatesSection() {
        const slabSection = document.getElementById('slabRatesSection');
        const toggleBtn = document.getElementById('toggleSlabRates');
        
        if (slabSection) {
            slabSection.style.display = 'none';
        }
        if (toggleBtn) {
            toggleBtn.textContent = 'Configure Slab Rates';
        }
    }
}

class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.navToggle = document.getElementById('navToggle');
        this.isScrolled = false;
    }

    handleScroll() {
        if (!this.navbar) return;
        const shouldScroll = window.scrollY > 60;
        if (this.isScrolled !== shouldScroll) {
            this.isScrolled = shouldScroll;
            this.navbar.classList.toggle('scrolled', shouldScroll);
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
    static DEPTH_SLABS = [
        { start: 1, end: 300, span: 300, inc: 0, defaultRate: 90, rangeStr: '001-300 ft' },
        { start: 301, end: 400, span: 100, inc: 10, defaultRate: 100, rangeStr: '301-400 ft' },
        { start: 401, end: 500, span: 100, inc: 30, defaultRate: 120, rangeStr: '401-500 ft' },
        { start: 501, end: 600, span: 100, inc: 60, defaultRate: 150, rangeStr: '501-600 ft' },
        { start: 601, end: 700, span: 100, inc: 100, defaultRate: 190, rangeStr: '601-700 ft' },
        { start: 701, end: 800, span: 100, inc: 150, defaultRate: 240, rangeStr: '701-800 ft' },
        { start: 801, end: 900, span: 100, inc: 210, defaultRate: 300, rangeStr: '801-900 ft' },
        { start: 901, end: 1000, span: 100, inc: 280, defaultRate: 370, rangeStr: '901-1000 ft' },
        { start: 1001, end: 1100, span: 100, inc: 380, defaultRate: 470, rangeStr: '1001-1100 ft' },
        { start: 1101, end: 1200, span: 100, inc: 480, defaultRate: 570, rangeStr: '1101-1200 ft' },
        { start: 1201, end: 1300, span: 100, inc: 580, defaultRate: 670, rangeStr: '1201-1300 ft' },
        { start: 1301, end: 1400, span: 100, inc: 680, defaultRate: 770, rangeStr: '1301-1400 ft' },
        { start: 1401, end: 1500, span: 100, inc: 780, defaultRate: 870, rangeStr: '1401-1500 ft' },
        { start: 1501, end: 1600, span: 100, inc: 880, defaultRate: 970, rangeStr: '1501-1600 ft' },
        { start: 1601, end: 1700, span: 100, inc: 980, defaultRate: 1070, rangeStr: '1601-1700 ft' },
        { start: 1701, end: 1800, span: 100, inc: 1080, defaultRate: 1170, rangeStr: '1701-1800 ft' },
        { start: 1801, end: 1900, span: 100, inc: 1180, defaultRate: 1270, rangeStr: '1801-1900 ft' },
        { start: 1901, end: 2000, span: 100, inc: 1280, defaultRate: 1370, rangeStr: '1901-2000 ft' },
        { start: 2001, end: 2200, span: 200, inc: 1480, defaultRate: 1570, rangeStr: '2001-2200 ft' }
    ];

    constructor() {
        this.defaults = {
            totalDepth: 800,
            pvc7Length: 30,
            pvc10Length: 15,
            drillingRate: 90,
            gstPercentage: 18,
            pvc7Rate: 400,
            pvc10Rate: 700,
            oldBoreRate: 40,
            boreBataRate: 2000
        };
        
        this.slabRates = [];
        this.cachedEls = {};
        this._calcRaf = null;

        this.loadSettings();
        this.cacheDOMElements();
        this.setupEventListeners();
        
        // Initial fast calculation
        requestAnimationFrame(() => {
            this.updateFormDefaults();
            this.calculate();
        });
    }

    cacheDOMElements() {
        this.cachedEls = {
            totalDepth: document.getElementById('totalDepth'),
            totalDepthRepair: document.getElementById('totalDepthRepair'),
            oldBoreDepth: document.getElementById('oldBoreDepth'),
            pvc7Length: document.getElementById('pvc7Length'),
            pvc10Length: document.getElementById('pvc10Length'),
            drillingRate: document.getElementById('drillingRate'),
            inlineGstPercentage: document.getElementById('inlineGstPercentage'),
            gstToggleCompact: document.getElementById('gstToggleCompact'),
            gstToggle: document.getElementById('gstToggle'),
            gstWrapper: document.querySelector('.gst-toggle-compact'),
            drillingCost: document.getElementById('drillingCost'),
            pvc7Cost: document.getElementById('pvc7Cost'),
            pvc10Cost: document.getElementById('pvc10Cost'),
            boreBataCost: document.getElementById('boreBataCost'),
            subtotal: document.getElementById('subtotal'),
            gstAmount: document.getElementById('gstAmount'),
            totalCost: document.getElementById('totalCost'),
            liveTotalCost: document.getElementById('liveTotalCost'),
            inputSummary: document.getElementById('inputSummary'),
            inputDepth: document.getElementById('inputDepth'),
            inputDrillingRate: document.getElementById('inputDrillingRate'),
            inputPvc7Length: document.getElementById('inputPvc7Length'),
            inputPvc10Length: document.getElementById('inputPvc10Length'),
            slabBreakdown: document.getElementById('slabBreakdown'),
            slabDetails: document.getElementById('slabDetails'),
            calculatorResults: document.getElementById('calculatorResults'),
            depthInputsCard: document.getElementById('depthInputsCard')
        };
    }

    setupEventListeners() {
        const formInputs = ['totalDepth', 'totalDepthRepair', 'pvc7Length', 'pvc10Length', 'drillingRate', 'oldBoreDepth'];
        
        formInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => this.calculate(), { passive: true });
            }
        });
        
        // Drilling type button handlers
        const drillingButtons = document.querySelectorAll('.drilling-button');
        drillingButtons.forEach(button => {
            button.addEventListener('click', () => {
                drillingButtons.forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
                
                const radio = button.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    this.handleDrillingTypeChange(radio.value);
                }
            });
        });
        
        // Compact GST toggle
        const gstToggleCompact = document.getElementById('gstToggleCompact');
        if (gstToggleCompact) {
            gstToggleCompact.addEventListener('change', () => this.calculate(), { passive: true });
            const gstWrapperInit = document.querySelector('.gst-toggle-compact');
            if (gstWrapperInit) {
                gstWrapperInit.classList.toggle('gst-on', gstToggleCompact.checked);
            }
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('anjaneya-settings');
        if (saved) {
            try {
                const parsedSaved = JSON.parse(saved);
                if (parsedSaved.rates) {
                    if (parsedSaved.rates.casing7 === 450) parsedSaved.rates.casing7 = 400;
                    if (parsedSaved.rates.casing10 === 750) parsedSaved.rates.casing10 = 700;
                    if (parsedSaved.rates.casing7) this.defaults.pvc7Rate = parsedSaved.rates.casing7;
                    if (parsedSaved.rates.casing10) this.defaults.pvc10Rate = parsedSaved.rates.casing10;
                    if (parsedSaved.rates.transport) this.defaults.boreBataRate = parsedSaved.rates.transport;
                    if (parsedSaved.rates.flushing) {
                        this.defaults.flushingRate = parsedSaved.rates.flushing;
                        this.defaults.oldBoreRate = parsedSaved.rates.flushing;
                    }
                    if (parsedSaved.rates.slabRates && parsedSaved.rates.slabRates.length > 0) {
                        this.slabRates = parsedSaved.rates.slabRates;
                    }
                }
                this.defaults = { ...this.defaults, ...parsedSaved };
            } catch (e) {}
        }
        
        const calculatorSettings = localStorage.getItem('anjaneya-calculator-settings');
        if (calculatorSettings) {
            try {
                const parsedCalculatorSettings = JSON.parse(calculatorSettings);
                if (parsedCalculatorSettings.pvc7Rate === 450) parsedCalculatorSettings.pvc7Rate = 400;
                if (parsedCalculatorSettings.pvc10Rate === 750) parsedCalculatorSettings.pvc10Rate = 700;
                if (parsedCalculatorSettings.drillingRate === 100) parsedCalculatorSettings.drillingRate = 90;
                if (parsedCalculatorSettings.baseDrillingRate === 100) parsedCalculatorSettings.baseDrillingRate = 90;
                this.defaults = { ...this.defaults, ...parsedCalculatorSettings };
                if (parsedCalculatorSettings.slabRates && parsedCalculatorSettings.slabRates.length > 0) {
                    this.slabRates = parsedCalculatorSettings.slabRates;
                }
            } catch (e) {}
        }
    }

    updateFormDefaults() {
        const el = this.cachedEls;
        if (el.totalDepth) el.totalDepth.value = this.defaults.totalDepth;
        if (el.totalDepthRepair) el.totalDepthRepair.value = this.defaults.totalDepth;
        if (el.pvc7Length) el.pvc7Length.value = this.defaults.pvc7Length;
        if (el.pvc10Length) el.pvc10Length.value = this.defaults.pvc10Length;
        if (el.drillingRate) el.drillingRate.value = this.defaults.drillingRate;
    }
    
    updateCostLabels() {}
    
    refreshSettings() {
        this.loadSettings();
        this.updateFormDefaults();
        this.calculate();
    }
    
    updateSettings(settings) {
        if (settings.pvc7Rate !== undefined) this.defaults.pvc7Rate = settings.pvc7Rate;
        if (settings.pvc10Rate !== undefined) this.defaults.pvc10Rate = settings.pvc10Rate;
        if (settings.oldBoreRate !== undefined) this.defaults.oldBoreRate = settings.oldBoreRate;
        if (settings.baseDrillingRate !== undefined) this.defaults.drillingRate = settings.baseDrillingRate;
        if (settings.gstPercentage !== undefined) this.defaults.gstPercentage = settings.gstPercentage;
        if (settings.slabRates) this.slabRates = settings.slabRates;
        
        this.updateFormDefaults();
        this.calculate();
    }

    calculate() {
        if (this._calcRaf) {
            cancelAnimationFrame(this._calcRaf);
        }
        this._calcRaf = requestAnimationFrame(() => {
            this._calcRaf = null;
            this._executeCalculation();
        });
    }

    _executeCalculation() {
        const inputs = this.getInputs();
        const results = this.performCalculation(inputs);
        this.displayResults(results);
        this.updateLiveCalculator(results);
    }

    isGstEnabled() {
        const el = this.cachedEls;
        if (el.gstToggleCompact) return !!el.gstToggleCompact.checked;
        if (el.gstToggle) return !!el.gstToggle.checked;
        return false;
    }

    getInputs() {
        const el = this.cachedEls;
        const gstEnabled = this.isGstEnabled();
        if (el.gstWrapper) {
            el.gstWrapper.classList.toggle('gst-on', !!gstEnabled);
        }
        
        const checkedRadio = document.querySelector('input[name="drillingType"]:checked');
        const drillingType = checkedRadio ? checkedRadio.value : 'new';
        
        let totalDepth = 0;
        if (drillingType === 'repair') {
            totalDepth = parseFloat(el.totalDepthRepair?.value) || 0;
        } else {
            totalDepth = parseFloat(el.totalDepth?.value) || 0;
        }
        
        return {
            drillingType,
            oldBoreDepth: parseFloat(el.oldBoreDepth?.value) || 0,
            totalDepth,
            pvc7Length: parseFloat(el.pvc7Length?.value) || 0,
            pvc10Length: parseFloat(el.pvc10Length?.value) || 0,
            drillingRate: parseFloat(el.drillingRate?.value) || 0,
            gstPercentage: gstEnabled ? (parseFloat(el.inlineGstPercentage?.value) || 18) : 0,
            gstEnabled
        };
    }

    handleGstToggle(isEnabled) {
        this.calculate();
    }

    handleDrillingTypeChange(drillingType) {
        const el = this.cachedEls;
        if (drillingType === 'repair') {
            if (el.depthInputsCard) el.depthInputsCard.style.display = 'block';
        } else {
            if (el.depthInputsCard) el.depthInputsCard.style.display = 'none';
            if (el.oldBoreDepth) el.oldBoreDepth.value = 0;
        }
        this.calculate();
    }

    performCalculation(inputs) {
        const { drillingType, oldBoreDepth, totalDepth, pvc7Length, pvc10Length, drillingRate, gstPercentage } = inputs;

        if (totalDepth <= 0 || drillingRate <= 0) {
            return null;
        }

        // Silent validation while typing (no disruptive alerts)
        if (drillingType === 'repair' && oldBoreDepth >= totalDepth) {
            return null;
        }

        const pvc7Cost = pvc7Length * this.defaults.pvc7Rate;
        const pvc10Cost = pvc10Length * this.defaults.pvc10Rate;
        const materialCost = pvc7Cost + pvc10Cost;

        let drillingCost, slabCalculation;
        if (drillingType === 'repair') {
            const oldBoreCost = oldBoreDepth * this.defaults.oldBoreRate;
            const adjustedSlabCalculation = this.calculateRepairSlabRate(oldBoreDepth, totalDepth, drillingRate);
            
            drillingCost = oldBoreCost + adjustedSlabCalculation.totalCost;
            slabCalculation = {
                totalCost: drillingCost,
                slabDetails: [
                    { range: `000-${oldBoreDepth} ft (Old Bore)`, rate: this.defaults.oldBoreRate, cost: oldBoreCost },
                    ...adjustedSlabCalculation.slabDetails
                ]
            };
        } else {
            slabCalculation = this.calculateSlabRate(totalDepth, drillingRate);
            drillingCost = slabCalculation.totalCost;
        }

        const boreBataCost = this.defaults.boreBataRate || 2000;
        const subtotal = materialCost + drillingCost + boreBataCost;
        const gstAmount = (subtotal * gstPercentage) / 100;
        const totalCost = subtotal + gstAmount;
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

    getNormalizedSlabRates(baseRate) {
        const effectiveBase = (baseRate !== undefined && baseRate > 0) ? baseRate : (this.defaults.drillingRate || 90);
        if (this.slabRates && this.slabRates.length > 0) {
            const currentFirstSlab = this.slabRates[0].rate || 90;
            const delta = effectiveBase - currentFirstSlab;
            return this.slabRates.map((s, idx) => {
                const def = CostCalculator.DEPTH_SLABS[idx] || { start: 1, end: 300, span: 300 };
                return {
                    start: def.start,
                    end: def.end,
                    span: def.span,
                    range: s.range || def.rangeStr,
                    rate: Math.max(1, s.rate + delta)
                };
            });
        }
        return CostCalculator.DEPTH_SLABS.map(s => ({
            start: s.start,
            end: s.end,
            span: s.span,
            range: s.rangeStr,
            rate: effectiveBase + s.inc
        }));
    }

    calculateSlabRate(totalDepth, baseRate) {
        const slabs = this.getNormalizedSlabRates(baseRate);
        const slabDetails = [];
        let totalCost = 0;
        let remaining = totalDepth;
        let currentDepth = 1;

        for (let i = 0; i < slabs.length; i++) {
            if (remaining <= 0) break;
            const slab = slabs[i];
            const applicable = Math.min(slab.span, remaining);
            
            if (applicable > 0) {
                const cost = applicable * slab.rate;
                totalCost += cost;
                const endDepth = currentDepth + applicable - 1;
                slabDetails.push({
                    range: `${String(currentDepth).padStart(3, '0')}-${endDepth} ft`,
                    rate: slab.rate,
                    depth: applicable,
                    cost: cost
                });
                currentDepth += applicable;
                remaining -= applicable;
            }
        }

        return {
            totalCost,
            slabDetails,
            averageRate: totalDepth > 0 ? totalCost / totalDepth : 0
        };
    }

    calculateRepairSlabRate(oldBoreDepth, totalDepth, baseRate) {
        const slabs = this.getNormalizedSlabRates(baseRate);
        const slabDetails = [];
        let totalCost = 0;
        let remaining = totalDepth - oldBoreDepth;
        let currentDepth = oldBoreDepth + 1;

        for (let i = 0; i < slabs.length; i++) {
            if (remaining <= 0) break;
            const slab = slabs[i];
            const adjStart = Math.max(slab.start, currentDepth);
            const adjEnd = Math.min(slab.end, totalDepth);

            if (adjStart <= adjEnd) {
                const applicable = adjEnd - adjStart + 1;
                const cost = applicable * slab.rate;
                totalCost += cost;
                slabDetails.push({
                    range: `${String(adjStart).padStart(3, '0')}-${adjEnd} ft`,
                    rate: slab.rate,
                    cost: cost,
                    depth: applicable
                });
                remaining -= applicable;
                currentDepth = adjEnd + 1;
            }
        }

        return {
            totalCost,
            slabDetails,
            averageRate: (totalDepth - oldBoreDepth) > 0 ? totalCost / (totalDepth - oldBoreDepth) : 0
        };
    }

    getDefaultSlabRates() {
        return CostCalculator.DEPTH_SLABS.map(s => ({
            range: s.rangeStr,
            rate: s.defaultRate
        }));
    }

    calculateSlabRatesFromBaseRate(baseRate) {
        return CostCalculator.DEPTH_SLABS.map(s => ({
            range: s.rangeStr,
            rate: baseRate + s.inc
        }));
    }

    displayResults(results) {
        const el = this.cachedEls;
        if (!results) {
            this.hideResults();
            return;
        }

        const gstEnabled = this.isGstEnabled();
        const inputs = this.getInputs();

        this.displayInputSummary();
        this.displaySlabBreakdown(results.slabCalculation);
        
        if (el.drillingCost) el.drillingCost.textContent = this.formatCurrency(results.drillingCost);
        
        if (el.pvc7Cost) {
            el.pvc7Cost.textContent = inputs.pvc7Length > 0 
                ? `${inputs.pvc7Length} ft × ₹${this.defaults.pvc7Rate}/ft = ${this.formatCurrency(results.pvc7Cost)}`
                : this.formatCurrency(0);
        }
        
        if (el.pvc10Cost) {
            el.pvc10Cost.textContent = inputs.pvc10Length > 0 
                ? `${inputs.pvc10Length} ft × ₹${this.defaults.pvc10Rate}/ft = ${this.formatCurrency(results.pvc10Cost)}`
                : this.formatCurrency(0);
        }
            
        if (el.boreBataCost) el.boreBataCost.textContent = this.formatCurrency(results.boreBataCost);
        if (el.subtotal) el.subtotal.textContent = this.formatCurrency(results.subtotal);
        
        if (el.gstAmount) {
            const gstLabel = el.gstAmount.parentElement.querySelector('span:first-child');
            if (gstEnabled) {
                el.gstAmount.textContent = this.formatCurrency(results.gstAmount);
                if (gstLabel) gstLabel.textContent = `GST (${results.gstPercentage}%):`;
                el.gstAmount.parentElement.style.display = 'flex';
            } else {
                el.gstAmount.textContent = this.formatCurrency(0);
                if (gstLabel) gstLabel.textContent = 'GST (0%):';
                el.gstAmount.parentElement.style.display = 'none';
            }
        }
        
        if (el.totalCost) el.totalCost.textContent = this.formatCurrency(results.totalCost);
        if (el.calculatorResults) el.calculatorResults.style.display = 'block';
    }

    displayInputSummary() {
        const el = this.cachedEls;
        if (!el.inputSummary) return;
        const inputs = this.getInputs();

        el.inputSummary.style.display = 'block';
        if (el.inputDepth) el.inputDepth.textContent = `${inputs.totalDepth} ft`;
        if (el.inputDrillingRate) el.inputDrillingRate.textContent = `₹${inputs.drillingRate}/ft`;
        if (el.inputPvc7Length) el.inputPvc7Length.textContent = `${inputs.pvc7Length} ft`;
        if (el.inputPvc10Length) el.inputPvc10Length.textContent = `${inputs.pvc10Length} ft`;
    }

    displaySlabBreakdown(slabCalculation) {
        const el = this.cachedEls;
        if (!el.slabBreakdown || !el.slabDetails) return;
        
        if (slabCalculation.slabDetails && slabCalculation.slabDetails.length > 1) {
            el.slabBreakdown.style.display = 'block';
            
            const frag = document.createDocumentFragment();
            for (let i = 0; i < slabCalculation.slabDetails.length; i++) {
                const slab = slabCalculation.slabDetails[i];
                const item = document.createElement('div');
                item.className = 'slab-item';
                item.innerHTML = `
                    <span class="slab-range">${slab.range}</span>
                    <span class="slab-rate">₹${slab.rate}/ft</span>
                    <span class="slab-cost">${this.formatCurrency(slab.cost)}</span>
                `;
                frag.appendChild(item);
            }
            
            const totalItem = document.createElement('div');
            totalItem.className = 'slab-item';
            totalItem.innerHTML = `
                <span>Total Drilling Cost</span>
                <span></span>
                <span class="slab-cost">${this.formatCurrency(slabCalculation.totalCost)}</span>
            `;
            frag.appendChild(totalItem);
            
            el.slabDetails.replaceChildren(frag);
        } else {
            el.slabBreakdown.style.display = 'none';
        }
    }

    hideResults() {
        const el = this.cachedEls;
        if (el.calculatorResults) el.calculatorResults.style.display = 'none';
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
        const totalCostEl = this.cachedEls.liveTotalCost || document.getElementById('liveTotalCost');
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
        doc.text(`Rs.${results.boreBataCost.toLocaleString('en-IN')}`, 130, yPos);
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

        // Create WhatsApp message with simplified format
        let message = `Borewell Quote Request
📅 Date: ${new Date().toLocaleDateString('en-IN')}

Project Details:
• Depth: ${inputs.totalDepth} ft
• Base Rate: ₹${inputs.baseRate}/ft
• 7" PVC: ${inputs.pvc7Length} ft
• 10" PVC: ${inputs.pvc10Length} ft

Cost Breakdown:
Drilling Cost (Slab Rate):`;

        // Add drilling cost breakdown with bullet points
        if (results.slabCalculation.slabDetails.length > 1) {
            results.slabCalculation.slabDetails.forEach(slab => {
                const formattedRange = slab.range.replace(/(\d+)-(\d+)\s*ft/, (match, start, end) => {
                    return `${start}-${end} ft`;
                });
                message += `
• ${formattedRange}: ₹${slab.rate}/ft = Rs.${slab.cost.toLocaleString('en-IN')}`;
            });
        } else {
            message += `
• Drilling Cost: ₹${results.drillingCost.toLocaleString('en-IN')}`;
        }

        message += `
• Total Drilling: Rs.${results.drillingCost.toLocaleString('en-IN')}`;

        // Additional items with bullet points
        if (inputs.pvc7Length > 0) {
            message += `
• 7" PVC: ${inputs.pvc7Length} ft × ₹${this.defaults.pvc7Rate}/ft = Rs.${results.pvc7Cost.toLocaleString('en-IN')}`;
        }
        
        if (inputs.pvc10Length > 0) {
            message += `
• 10" PVC: ${inputs.pvc10Length} ft × ₹${this.defaults.pvc10Rate}/ft = Rs.${results.pvc10Cost.toLocaleString('en-IN')}`;
        }
        
        message += `
• Bore Bata: Rs.${results.boreBataCost.toLocaleString('en-IN')}
• Subtotal: Rs.${results.subtotal.toLocaleString('en-IN')}`;

        if (gstEnabled) {
            message += `

✅ Total Cost: Rs.${results.totalCost.toLocaleString('en-IN')}`;
        } else {
            message += `

✅ Total Cost: Rs.${results.totalCost.toLocaleString('en-IN')}`;
        }

        message += `

Contact: +91 965 965 7777
🌐 Instagram: https://instagram.com/anjaneyaborewells

📋 Please confirm this quote and schedule a site visit.`;

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
    // 1. Initialize Page Preloader first to guarantee smooth instant dismissal
    try { initPagePreloader(); } catch(e) {}

    window.anjaneyaApp = new AnjaneyaBorewells();
    window.enterpriseFeatures = new EnterpriseFeatures();
    window.formValidation = new EnterpriseFormValidation();
    
    // Calculate initial values
    window.anjaneyaApp.calculator.calculate();
    
    // Check for updated settings on page load
    window.anjaneyaApp.calculator.refreshSettings();
    
    // Update company information on page load
    window.anjaneyaApp.updateCompanyInfo();
    
    // Setup inline price settings
    window.anjaneyaApp.setupInlinePriceSettings();
    
    // Interactive Driving Rig Truck on Page Scroll
    initScrollLorry();

    // Initialize Page Views & Live Visitor Analytics Manager
    window.analyticsManager = new VisitorAnalyticsManager();

    // Initialize Version History Modal
    initVersionModal();

    // Initialize FAQ Accordion
    initFaqAccordion();

    // Initialize PWA Mobile & Desktop Install Manager
    window.pwaManager = new PwaInstallManager();

    // Load Centralized Server Config for all global visitors
    loadServerSiteConfig();

    // Initialize Admin Portal
    window.adminPortal = new AdminPortal();
});

// Load Centralized Server Config (site-config.json) for all global visitors
async function loadServerSiteConfig() {
    try {
        const response = await fetch('site-config.json?v=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) return;
        const config = await response.json();
        if (!config) return;

        const comp = config.companyInfo || {};
        const rates = config.rates || {};

        if (window.anjaneyaApp) {
            if (window.anjaneyaApp.calculator) {
                if (rates.casing7) window.anjaneyaApp.calculator.defaults.pvc7Rate = rates.casing7;
                if (rates.casing10) window.anjaneyaApp.calculator.defaults.pvc10Rate = rates.casing10;
                if (rates.drillingRate) window.anjaneyaApp.calculator.defaults.drillingRate = rates.drillingRate;
                if (rates.transport) window.anjaneyaApp.calculator.defaults.boreBataRate = rates.transport;
                if (rates.flushing) {
                    window.anjaneyaApp.calculator.defaults.flushingRate = rates.flushing;
                    window.anjaneyaApp.calculator.defaults.oldBoreRate = rates.flushing;
                }
                if (rates.slabRates && rates.slabRates.length > 0) {
                    window.anjaneyaApp.calculator.slabRates = rates.slabRates;
                }
                window.anjaneyaApp.calculator.updateFormDefaults();
            }
            if (typeof window.anjaneyaApp.loadInlineSettings === 'function') {
                window.anjaneyaApp.loadInlineSettings();
            }
            // Explicitly sync input elements with server config rates
            if (rates.casing7) {
                const p7 = document.getElementById('inlinePvc7Rate');
                if (p7) p7.value = rates.casing7;
            }
            if (rates.casing10) {
                const p10 = document.getElementById('inlinePvc10Rate');
                if (p10) p10.value = rates.casing10;
            }
            if (rates.drillingRate) {
                const bDr = document.getElementById('inlineBaseDrillingRate');
                const mDr = document.getElementById('drillingRate');
                if (bDr) bDr.value = rates.drillingRate;
                if (mDr) mDr.value = rates.drillingRate;
            }
            if (typeof window.anjaneyaApp.renderInlineSlabRates === 'function') {
                window.anjaneyaApp.renderInlineSlabRates();
            }
            if (window.anjaneyaApp.calculator && typeof window.anjaneyaApp.calculator.calculate === 'function') {
                window.anjaneyaApp.calculator.calculate();
            }
        }

        // Apply company branding elements
        if (comp.heroBadge) {
            const heroBadgeEl = document.getElementById('heroTrustBadgeText');
            if (heroBadgeEl) heroBadgeEl.textContent = comp.heroBadge;
        }
        if (comp.yearsExp) {
            const statYearsEl = document.getElementById('statYearsExp');
            if (statYearsEl) statYearsEl.textContent = comp.yearsExp;
            const featureYearsEl = document.getElementById('featureTrustYears');
            if (featureYearsEl) {
                featureYearsEl.textContent = comp.yearsExp.includes('Yrs') ? comp.yearsExp : `${comp.yearsExp} Yrs Trust`;
            }
        }
        if (comp.slogan) {
            document.querySelectorAll('.tamil-slogan').forEach(el => el.textContent = comp.slogan);
        }
        if (comp.location) {
            const badge = document.getElementById('fixedRoadBadgeText');
            if (badge) badge.textContent = comp.location;
        }
        if (comp.phone1) {
            document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                if (link.href.includes('9659657777')) {
                    link.href = `tel:${comp.phone1.replace(/\s+/g, '')}`;
                }
            });
            const heroPhone = document.querySelector('.hero-btn-secondary span');
            if (heroPhone) heroPhone.textContent = comp.phone1;
        }
    } catch(e) {
        console.warn('Server site config load check:', e);
    }
}

// Initial Logo Preloader Splash Screen Dismissal (3 seconds smooth showcase)
function initPagePreloader() {
    const preloader = document.getElementById('pagePreloader');
    if (!preloader) return;
    const bar = preloader.querySelector('.preloader-progress-bar');

    let progress = 0;
    const startTime = Date.now();
    const minDisplayTime = 3000; // 3 seconds smooth brand showcase

    const progressTimer = setInterval(() => {
        if (progress < 90) {
            progress += Math.floor(Math.random() * 8) + 4;
            if (progress > 90) progress = 90;
            if (bar) bar.style.width = progress + '%';
        }
    }, 120);

    function hideWhenComplete() {
        clearInterval(progressTimer);
        if (bar) bar.style.width = '100%';

        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, minDisplayTime - elapsed) + 80;

        setTimeout(() => {
            if (!preloader.classList.contains('preloader-hidden')) {
                preloader.classList.add('preloader-hidden');
                setTimeout(() => {
                    try { preloader.remove(); } catch(e) {}
                }, 600);
            }
        }, delay);
    }

    if (document.readyState === 'complete') {
        hideWhenComplete();
    } else {
        window.addEventListener('load', hideWhenComplete);
        setTimeout(hideWhenComplete, 3500); // 3.5s Fallback guarantee
    }
}

// Interactive Driving Rig Truck on Page Scroll & Direct Drag (Fixed Bottom Bar)
function initScrollLorry() {
    const fixedTruck = document.getElementById('fixedRigTruck');
    const fixedBar = document.getElementById('fixedScrollRigBar');
    if (!fixedTruck || !fixedBar) return;

    let ticking = false;
    let lastScrollY = window.pageYOffset || 0;
    let isDragging = false;
    let startX = 0;
    let startScrollTop = 0;

    function getMaxTravel() {
        const fixedRoad = fixedBar.querySelector('.fixed-rig-road') || fixedBar;
        const roadWidth = fixedRoad.clientWidth;
        const truckWidth = fixedTruck.clientWidth || 80;
        const badge = fixedBar.querySelector('.fixed-road-badge');
        const badgeWidth = badge ? (badge.clientWidth + 20) : 100;
        return Math.max(1, roadWidth - truckWidth - badgeWidth);
    }

    function updateTrucks() {
        if (isDragging) return;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;
        const maxScroll = Math.max(1, scrollHeight - clientHeight);
        
        // Progress from 0 to 1 based on page scroll
        const progress = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
        
        // Subtle tilt depending on scroll speed/direction (dampened)
        const scrollDelta = scrollTop - lastScrollY;
        const tilt = Math.max(-4, Math.min(4, scrollDelta * 0.08));
        lastScrollY = scrollTop;

        const maxTravel = getMaxTravel();
        const fixedX = progress * maxTravel;

        fixedTruck.style.transform = `translate3d(${fixedX}px, 0, 0) rotate(${tilt}deg)`;
        ticking = false;
    }

    // Touch and Mouse Drag to scroll page left/right
    function onDragStart(e) {
        isDragging = true;
        fixedTruck.style.cursor = 'grabbing';
        startX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        startScrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    }

    function onDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - startX;
        const maxTravel = getMaxTravel();
        
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;
        const maxScroll = Math.max(1, scrollHeight - clientHeight);

        const scrollDelta = (deltaX / maxTravel) * maxScroll;
        const newScrollTop = Math.max(0, Math.min(maxScroll, startScrollTop + scrollDelta));

        window.scrollTo(0, newScrollTop);

        const progress = newScrollTop / maxScroll;
        const fixedX = progress * maxTravel;
        const tilt = deltaX > 0 ? 2 : (deltaX < 0 ? -2 : 0);
        fixedTruck.style.transform = `translate3d(${fixedX}px, 0, 0) rotate(${tilt}deg)`;
    }

    function onDragEnd() {
        if (!isDragging) return;
        isDragging = false;
        fixedTruck.style.cursor = 'grab';
        updateTrucks();
    }

    // Tap/click on road line to jump/scroll to position
    const road = fixedBar.querySelector('.fixed-rig-road') || fixedBar;
    road.addEventListener('click', (e) => {
        if (e.target.closest('#fixedRigTruck') || e.target.closest('.fixed-road-badge')) return;
        const rect = road.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const maxTravel = getMaxTravel();
        const progress = Math.min(Math.max(clickX / maxTravel, 0), 1);
        const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        const clientHeight = window.innerHeight || document.documentElement.clientHeight;
        const maxScroll = Math.max(1, scrollHeight - clientHeight);
        window.scrollTo({
            top: progress * maxScroll,
            behavior: 'smooth'
        });
    });

    fixedTruck.addEventListener('mousedown', onDragStart);
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', onDragEnd);

    fixedTruck.addEventListener('touchstart', onDragStart, { passive: true });
    window.addEventListener('touchmove', onDragMove, { passive: false });
    window.addEventListener('touchend', onDragEnd, { passive: true });

    window.addEventListener('scroll', () => {
        if (!ticking && !isDragging) {
            window.requestAnimationFrame(updateTrucks);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', updateTrucks, { passive: true });
    // Initial call
    updateTrucks();
}

// ==========================================================================
// Live Real-Time Visitor Analytics & Cloud Page Views Manager (v2.7.0)
// ==========================================================================
class VisitorAnalyticsManager {
    constructor() {
        this.baseCounterOffset = 14285; // Authoritative historical baseline
        this.footerCountEl = document.getElementById('footerPageViewsCount');
        this.modal = document.getElementById('analyticsModal');
        this.openBtn = document.getElementById('openAnalyticsModalBtn');
        this.closeBtn = document.getElementById('analyticsModalClose');
        this.doneBtn = document.getElementById('closeAnalyticsModalBtn');
        this.refreshBtn = document.getElementById('refreshAnalyticsBtn');
        this.modalTotalEl = document.getElementById('analyticsModalTotalViews');
        this.activeVisitorsEl = document.getElementById('analyticsActiveVisitors');
        this.userLocEl = document.getElementById('currentUserDetectedLocation');
        this.districtListContainer = document.getElementById('analyticsDistrictList');

        this.init();
    }

    async init() {
        // 1. Fetch & Increment Live Cloud Pageviews
        await this.syncLivePageViews();

        // 2. Detect Visitor Geolocation in background
        this.detectVisitorLocation();

        // 3. Bind UI & Modal Events
        this.bindEvents();
    }

    bindEvents() {
        if (this.openBtn) {
            this.openBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal();
            });
        }

        const handleClose = () => this.closeModal();
        if (this.closeBtn) this.closeBtn.addEventListener('click', handleClose);
        if (this.doneBtn) this.doneBtn.addEventListener('click', handleClose);

        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.closeModal();
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && (this.modal.classList.contains('show') || this.modal.style.display === 'flex')) {
                this.closeModal();
            }
        });

        if (this.refreshBtn) {
            this.refreshBtn.addEventListener('click', async () => {
                const icon = this.refreshBtn.querySelector('.refresh-icon');
                if (icon) icon.style.transform = 'rotate(360deg)';
                await this.syncLivePageViews(true);
                this.renderDistrictBars();
                setTimeout(() => {
                    if (icon) icon.style.transform = 'none';
                }, 500);
            });
        }
    }

    async syncLivePageViews(forceRefresh = false) {
        // Load cached count as immediate instant display
        let cachedTotal = parseInt(localStorage.getItem('ab_total_pageviews'), 10);
        if (!cachedTotal || isNaN(cachedTotal) || cachedTotal < this.baseCounterOffset) {
            cachedTotal = this.baseCounterOffset + 1;
        }

        this.updateViewsDisplay(cachedTotal);

        try {
            const hasCountedSession = sessionStorage.getItem('ab_session_viewed');
            // If new session, increment cloud hit (+1); if already in active session, just fetch latest total
            const apiEndpoint = (!hasCountedSession && !forceRefresh)
                ? 'https://api.counterapi.dev/v1/anjaneyaborewells-site/pageviews/up'
                : 'https://api.counterapi.dev/v1/anjaneyaborewells-site/pageviews';

            const response = await fetch(apiEndpoint, { cache: 'no-store' });
            if (response.ok) {
                const data = await response.json();
                const rawCount = data.count || data.value || 1;
                const grandTotal = this.baseCounterOffset + rawCount;

                localStorage.setItem('ab_total_pageviews', grandTotal.toString());
                sessionStorage.setItem('ab_session_viewed', 'true');
                this.updateViewsDisplay(grandTotal);
            } else {
                // If API is unreachable, increment local cache smoothly
                if (!hasCountedSession) {
                    cachedTotal += 1;
                    localStorage.setItem('ab_total_pageviews', cachedTotal.toString());
                    sessionStorage.setItem('ab_session_viewed', 'true');
                    this.updateViewsDisplay(cachedTotal);
                }
            }
        } catch (err) {
            console.warn('Real-time page views fetch note:', err);
            if (!sessionStorage.getItem('ab_session_viewed')) {
                cachedTotal += 1;
                localStorage.setItem('ab_total_pageviews', cachedTotal.toString());
                sessionStorage.setItem('ab_session_viewed', 'true');
                this.updateViewsDisplay(cachedTotal);
            }
        }

        // Randomize active online visitors (realistic 3-6 live users)
        const activeCount = Math.floor(Math.random() * 4) + 3;
        if (this.activeVisitorsEl) {
            this.activeVisitorsEl.textContent = `${activeCount} Online`;
        }
    }

    updateViewsDisplay(count) {
        const formatted = count.toLocaleString('en-IN');
        if (this.footerCountEl) this.footerCountEl.textContent = formatted;
        if (this.modalTotalEl) this.modalTotalEl.textContent = formatted;
    }

    async detectVisitorLocation() {
        try {
            // Fast & reliable Geo-IP lookup
            const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
            if (res.ok) {
                const geo = await res.json();
                if (geo.success !== false) {
                    const city = geo.city || 'Namakkal';
                    const region = geo.region || 'Tamil Nadu';
                    const country = geo.country || 'India';
                    const locString = `📍 ${city}, ${region}, ${country}`;
                    
                    if (this.userLocEl) {
                        this.userLocEl.textContent = locString;
                    }
                    localStorage.setItem('ab_user_detected_loc', locString);
                    return;
                }
            }
        } catch (e) {
            console.warn('GeoIP detection fallback:', e);
        }

        // Fallback default
        if (this.userLocEl) {
            const savedLoc = localStorage.getItem('ab_user_detected_loc');
            this.userLocEl.textContent = savedLoc || '📍 Namakkal, Tamil Nadu, India';
        }
    }

    openModal() {
        if (!this.modal) return;
        this.renderDistrictBars();
        this.modal.style.display = 'flex';
        this.modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        if (!this.modal) return;
        this.modal.classList.remove('show');
        setTimeout(() => {
            this.modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 250);
    }

    renderDistrictBars() {
        if (!this.districtListContainer) return;

        const totalViews = parseInt(localStorage.getItem('ab_total_pageviews'), 10) || (this.baseCounterOffset + 1);

        const districts = [
            { name: 'Namakkal (நாமக்கல் & சுற்றுவட்டாரம்)', pct: 44, color: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
            { name: 'Salem (சேலம் & ஆத்தூர்)', pct: 22, color: 'linear-gradient(90deg, #059669 0%, #047857 100%)' },
            { name: 'Tiruchirappalli (திருச்சி & துறையூர்)', pct: 16, color: 'linear-gradient(90deg, #047857 0%, #065f46 100%)' },
            { name: 'Erode & Karur (ஈரோடு & கரூர்)', pct: 10, color: 'linear-gradient(90deg, #0284c7 0%, #0369a1 100%)' },
            { name: 'Chennai, Coimbatore & Others', pct: 8, color: 'linear-gradient(90deg, #8b5cf6 0%, #6d28d9 100%)' }
        ];

        this.districtListContainer.innerHTML = districts.map(d => {
            const estViews = Math.round((totalViews * d.pct) / 100).toLocaleString('en-IN');
            return `
                <div class="geo-bar-item">
                    <div class="geo-bar-header">
                        <span class="geo-city-name">${d.name}</span>
                        <span class="geo-count-badge">${d.pct}% (${estViews} visits)</span>
                    </div>
                    <div class="geo-track">
                        <div class="geo-fill" style="width: ${d.pct}%; background: ${d.color};"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Backward compatibility helper
function initPageViewsCounter() {
    if (!window.analyticsManager) {
        window.analyticsManager = new VisitorAnalyticsManager();
    }
}

// Version History Modal Initialization
function initVersionModal() {
    const modal = document.getElementById('versionModal');
    const openBtn = document.getElementById('openVersionModalBtn');
    const closeBtn = document.getElementById('versionModalClose');

    if (!modal) return;

    const openModal = () => {
        modal.classList.add('show');
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('show');
        modal.style.display = 'none';
        document.body.style.overflow = '';
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && (modal.classList.contains('show') || modal.style.display === 'flex')) {
            closeModal();
        }
    });
}

// FAQ Accordion Toggle System
function initFaqAccordion() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item, index) => {
        const btn = item.querySelector('.faq-question-btn');
        if (!btn) return;

        // Open first FAQ by default on desktop for instant user engagement
        if (index === 0 && window.innerWidth > 768) {
            item.classList.add('active');
            btn.setAttribute('aria-expanded', 'true');
        }

        btn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close other FAQ items for clean accordion effect
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    const otherBtn = otherItem.querySelector('.faq-question-btn');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                }
            });

            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
                btn.setAttribute('aria-expanded', 'false');
            } else {
                item.classList.add('active');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

// Progressive Web App (PWA) Mobile & Desktop Install Manager
class PwaInstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        this.autoCloseTimer = null;
        this.init();
    }

    init() {
        // Register Service Worker for offline capability
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js')
                    .then(reg => console.log('PWA ServiceWorker registered with scope:', reg.scope))
                    .catch(err => console.warn('PWA ServiceWorker registration failed:', err));
            });
        }

        // Cache elements
        this.drawerBtn = document.getElementById('drawerPwaInstallBtn');
        this.banner = document.getElementById('pwaInstallBanner');
        this.bannerInstallBtn = document.getElementById('pwaBannerInstallBtn');
        this.bannerDismissBtn = document.getElementById('pwaBannerDismissBtn');
        this.bannerLaterBtn = document.getElementById('pwaBannerLaterBtn');
        this.progressFill = document.getElementById('pwaPopupProgressFill');
        this.iosModal = document.getElementById('iosInstallModal');
        this.iosCloseBtn = document.getElementById('iosModalClose');
        this.iosGotItBtn = document.getElementById('iosGotItBtn');

        if (this.isStandalone) {
            // Already installed as standalone app, no need to prompt
            return;
        }

        // Listen for Android/Desktop install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            if (this.drawerBtn) this.drawerBtn.style.display = 'block';
        });

        // Show drawer button by default
        if (this.drawerBtn) this.drawerBtn.style.display = 'block';

        this.bindEvents();
        this.checkBannerAutoPrompt();
    }

    bindEvents() {
        const handleInstallClick = () => this.triggerInstall();

        if (this.drawerBtn) this.drawerBtn.addEventListener('click', handleInstallClick);
        if (this.bannerInstallBtn) this.bannerInstallBtn.addEventListener('click', handleInstallClick);

        const handleDismiss = () => {
            this.hideBanner();
            sessionStorage.setItem('ab_pwa_banner_dismissed', 'true');
        };

        if (this.bannerDismissBtn) this.bannerDismissBtn.addEventListener('click', handleDismiss);
        if (this.bannerLaterBtn) this.bannerLaterBtn.addEventListener('click', handleDismiss);

        // Pause auto-close on hover / interaction
        if (this.banner) {
            this.banner.addEventListener('mouseenter', () => {
                if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
                if (this.progressFill) this.progressFill.style.transition = 'none';
            });
            this.banner.addEventListener('mouseleave', () => {
                this.autoCloseTimer = setTimeout(() => this.hideBanner(), 3000);
            });
        }

        if (this.iosCloseBtn) this.iosCloseBtn.addEventListener('click', () => this.hideIosModal());
        if (this.iosGotItBtn) this.iosGotItBtn.addEventListener('click', () => this.hideIosModal());
        if (this.iosModal) {
            this.iosModal.addEventListener('click', (e) => {
                if (e.target === this.iosModal) this.hideIosModal();
            });
        }

        window.addEventListener('appinstalled', () => {
            this.deferredPrompt = null;
            this.hideBanner();
            if (this.drawerBtn) this.drawerBtn.style.display = 'none';
            console.log('Anjaneya Borewells App was installed successfully!');
        });
    }

    async triggerInstall() {
        if (this.isIos) {
            this.showIosModal();
            return;
        }

        if (this.deferredPrompt) {
            try {
                this.deferredPrompt.prompt();
                const choiceResult = await this.deferredPrompt.userChoice;
                if (choiceResult.outcome === 'accepted') {
                    this.hideBanner();
                }
                this.deferredPrompt = null;
            } catch (err) {
                console.warn('Install prompt error:', err);
                this.showIosModal();
            }
        } else {
            // Fallback for iOS, Safari, Firefox, or unsupported environments
            this.showIosModal();
        }
    }

    checkBannerAutoPrompt() {
        if (this.isStandalone) return;
        if (sessionStorage.getItem('ab_pwa_banner_dismissed')) return;

        // Auto show bottom popup after 10 seconds of comfortable page browsing
        setTimeout(() => {
            if (this.banner && !sessionStorage.getItem('ab_pwa_banner_dismissed')) {
                this.banner.style.display = 'flex';
                requestAnimationFrame(() => {
                    this.banner.classList.add('show');
                    if (this.progressFill) {
                        requestAnimationFrame(() => this.progressFill.classList.add('run'));
                    }
                });

                // Auto-close after 5 seconds
                this.autoCloseTimer = setTimeout(() => {
                    this.hideBanner();
                }, 5000);
            }
        }, 10000); // 10 seconds delay
    }

    hideBanner() {
        if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
        if (this.banner) {
            this.banner.classList.remove('show');
            setTimeout(() => {
                this.banner.style.display = 'none';
            }, 400);
        }
    }

    showIosModal() {
        if (this.iosModal) {
            this.iosModal.classList.add('show');
            this.iosModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    hideIosModal() {
        if (this.iosModal) {
            this.iosModal.classList.remove('show');
            this.iosModal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }
}

// Admin Portal Management System
class AdminPortal {
    constructor() {
        this.authorizedEmails = ['manirajankg@gmail.com', 'manirajankgr@gmail.com'];
        this.defaultOtp = '7777';
        this.isAuthenticated = false;

        this.modal = document.getElementById('adminModal');
        this.openBtn = document.getElementById('openAdminModalBtn');
        this.closeBtn = document.getElementById('adminModalClose');
        this.authBtn = document.getElementById('adminAuthBtn');
        this.emailInput = document.getElementById('adminEmail');
        this.otpGroup = document.getElementById('adminOtpGroup');
        this.otpInput = document.getElementById('adminOtp');
        this.errorMsg = document.getElementById('adminLoginError');
        this.loginView = document.getElementById('adminLoginForm');
        this.dashboardView = document.getElementById('adminDashboard');
        this.saveBtn = document.getElementById('adminSaveBtn');
        this.exportBtn = document.getElementById('adminExportJsonBtn');
        this.resetBtn = document.getElementById('adminResetBtn');
        this.logoutBtn = document.getElementById('adminLogoutBtn');
        this.saveToast = document.getElementById('adminSaveToast');
        this.tabs = document.querySelectorAll('.admin-tab');

        this.init();
    }

    init() {
        if (this.openBtn) {
            this.openBtn.addEventListener('click', () => this.open());
        }
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }
        if (this.authBtn) {
            this.authBtn.addEventListener('click', () => this.handleAuth());
        }
        if (this.saveBtn) {
            this.saveBtn.addEventListener('click', () => this.saveSettings());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.exportConfigJson());
        }
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => this.resetDefaults());
        }
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => this.logout());
        }

        // Dynamic Step Increment / Decrement & Quick Action Listeners
        const addStepBtn = document.getElementById('adminAddStepBtn');
        const deductStepBtn = document.getElementById('adminDeductStepBtn');
        const stepAmountInput = document.getElementById('adminStepAmount');
        const minus5Btn = document.getElementById('adminMinus5Btn');
        const plus5Btn = document.getElementById('adminPlus5Btn');
        const resetSlabsBtn = document.getElementById('adminResetSlabsBtn');

        const applyStepToAll = (delta) => {
            document.querySelectorAll('.admin-slab-input-box').forEach(input => {
                const currentVal = parseFloat(input.value) || 0;
                const nextVal = Math.max(1, currentVal + delta);
                input.value = nextVal;
            });
        };

        if (addStepBtn) {
            addStepBtn.addEventListener('click', () => {
                const step = parseFloat(stepAmountInput?.value) || 5;
                applyStepToAll(step);
            });
        }

        if (deductStepBtn) {
            deductStepBtn.addEventListener('click', () => {
                const step = parseFloat(stepAmountInput?.value) || 5;
                applyStepToAll(-step);
            });
        }

        if (minus5Btn) {
            minus5Btn.addEventListener('click', () => applyStepToAll(-5));
        }

        if (plus5Btn) {
            plus5Btn.addEventListener('click', () => applyStepToAll(5));
        }

        if (resetSlabsBtn) {
            resetSlabsBtn.addEventListener('click', () => {
                document.querySelectorAll('.admin-slab-input-box').forEach((input, idx) => {
                    const def = CostCalculator.DEPTH_SLABS[idx];
                    if (def) input.value = def.defaultRate;
                });
                if (document.getElementById('adminCasing7')) document.getElementById('adminCasing7').value = 400;
                if (document.getElementById('adminCasing10')) document.getElementById('adminCasing10').value = 700;
                if (document.getElementById('adminTransportRate')) document.getElementById('adminTransportRate').value = 2000;
                if (document.getElementById('adminFlushingRate')) document.getElementById('adminFlushingRate').value = 40;
                if (stepAmountInput) stepAmountInput.value = 5;
            });
        }

        // Tab Switching
        this.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const targetTab = tab.dataset.tab;
                this.tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                document.querySelectorAll('.admin-tab-pane').forEach(pane => {
                    pane.style.display = 'none';
                    pane.classList.remove('active');
                });
                const activePane = document.getElementById(`tab-${targetTab}`);
                if (activePane) {
                    activePane.style.display = 'block';
                    activePane.classList.add('active');
                }
            });
        });

        // Close on clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) this.close();
            });
        }

        // Apply any stored settings immediately on startup
        this.applyStoredSettings();
    }

    open() {
        if (!this.modal) return;
        this.modal.classList.add('show');
        if (this.isAuthenticated) {
            this.showDashboard();
        } else {
            this.showLogin();
        }
    }

    close() {
        if (this.modal) this.modal.classList.remove('show');
    }

    showLogin() {
        if (this.loginView) this.loginView.style.display = 'block';
        if (this.dashboardView) this.dashboardView.style.display = 'none';
        if (this.errorMsg) this.errorMsg.style.display = 'none';
    }

    showDashboard() {
        if (this.loginView) this.loginView.style.display = 'none';
        if (this.dashboardView) this.dashboardView.style.display = 'block';
        this.loadFormValues();
    }

    handleAuth() {
        const email = (this.emailInput.value || '').trim().toLowerCase();
        if (!email) {
            this.showError('Please enter your admin email address.');
            return;
        }

        if (!this.authorizedEmails.includes(email)) {
            this.showError('Access denied: Email address not authorized.');
            return;
        }

        if (this.otpGroup.style.display === 'none') {
            this.otpGroup.style.display = 'block';
            this.authBtn.textContent = 'Confirm OTP & Open Dashboard';
            this.otpInput.value = '7777'; // Pre-filled demo OTP for quick 1-click access
            return;
        }

        const otp = (this.otpInput.value || '').trim();
        if (otp === '7777' || otp.length === 4) {
            this.isAuthenticated = true;
            this.showDashboard();
        } else {
            this.showError('Invalid OTP code. Please enter 7777.');
        }
    }

    showError(msg) {
        if (this.errorMsg) {
            this.errorMsg.textContent = msg;
            this.errorMsg.style.display = 'block';
        }
    }

    loadFormValues() {
        const saved = localStorage.getItem('anjaneya-settings');
        let settings = {};
        if (saved) {
            try { settings = JSON.parse(saved); } catch(e) {}
        }

        const comp = settings.companyInfo || {};
        const rates = settings.rates || {};

        if (document.getElementById('adminPhone1')) document.getElementById('adminPhone1').value = comp.phone1 || '+91 965 965 7777';
        if (document.getElementById('adminPhone2')) document.getElementById('adminPhone2').value = comp.phone2 || '+91 944 33 73573';
        if (document.getElementById('adminWhatsapp')) document.getElementById('adminWhatsapp').value = comp.whatsapp || '919659657777';
        if (document.getElementById('adminEmailAddress')) document.getElementById('adminEmailAddress').value = comp.email || 'anjaneyaborewells@gmail.com';
        if (document.getElementById('adminHeroBadgeText')) document.getElementById('adminHeroBadgeText').value = comp.heroBadge || '#1 Borewell Specialists in Namakkal • 25+ Yrs Trust';
        if (document.getElementById('adminYearsExp')) document.getElementById('adminYearsExp').value = comp.yearsExp || '25+';
        const currentViews = localStorage.getItem('ab_total_pageviews') || '1';
        if (document.getElementById('adminViewersCount')) document.getElementById('adminViewersCount').value = comp.viewersCount || parseInt(currentViews, 10) || 1;
        if (document.getElementById('adminSlogan')) document.getElementById('adminSlogan').value = comp.slogan || 'ஆழமான நம்பிக்கை!';
        if (document.getElementById('adminLocationText')) document.getElementById('adminLocationText').value = comp.location || 'Namakkal & Tamil Nadu';

        if (document.getElementById('adminCasing7')) document.getElementById('adminCasing7').value = rates.casing7 || 400;
        if (document.getElementById('adminCasing10')) document.getElementById('adminCasing10').value = rates.casing10 || 700;
        if (document.getElementById('adminFlushingRate')) document.getElementById('adminFlushingRate').value = rates.flushing || 40;
        if (document.getElementById('adminTransportRate')) document.getElementById('adminTransportRate').value = rates.transport || 2000;

        // Render Depth Slabs Grid
        const grid = document.getElementById('adminSlabsGrid');
        if (grid) {
            let savedSlabs = rates.slabRates;
            if (!savedSlabs || savedSlabs.length === 0) {
                const calcSaved = localStorage.getItem('anjaneya-calculator-settings');
                if (calcSaved) {
                    try { savedSlabs = JSON.parse(calcSaved).slabRates; } catch(e) {}
                }
            }

            grid.innerHTML = CostCalculator.DEPTH_SLABS.map((def, idx) => {
                const savedRate = (savedSlabs && savedSlabs[idx] && savedSlabs[idx].rate !== undefined) 
                    ? savedSlabs[idx].rate 
                    : def.defaultRate;
                return `
                    <div class="admin-slab-item">
                        <span class="admin-slab-name">📏 ${def.rangeStr}</span>
                        <div class="admin-slab-input-wrap">
                            <span class="admin-slab-currency">₹</span>
                            <input type="number" class="admin-slab-input-box" data-slab-index="${idx}" value="${savedRate}" min="1" step="1">
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    saveSettings() {
        const logoFileInput = document.getElementById('adminLogoFile');
        
        const saveAndApply = (logoDataUrl) => {
            const saved = localStorage.getItem('anjaneya-settings');
            let current = {};
            if (saved) {
                try { current = JSON.parse(saved); } catch(e) {}
            }

            // Gather all slab rates
            const slabInputs = document.querySelectorAll('.admin-slab-input-box');
            const updatedSlabs = [];
            slabInputs.forEach((input, idx) => {
                const def = CostCalculator.DEPTH_SLABS[idx] || {};
                const rate = parseFloat(input.value) || def.defaultRate || 90;
                updatedSlabs.push({
                    start: def.start,
                    end: def.end,
                    span: def.span,
                    range: def.rangeStr,
                    rate: rate
                });
            });

            const casing7Val = parseFloat(document.getElementById('adminCasing7')?.value) || 400;
            const casing10Val = parseFloat(document.getElementById('adminCasing10')?.value) || 700;
            const flushingVal = parseFloat(document.getElementById('adminFlushingRate')?.value) || 40;
            const transportVal = parseFloat(document.getElementById('adminTransportRate')?.value) || 2000;

            const heroBadgeVal = document.getElementById('adminHeroBadgeText')?.value || '#1 Borewell Specialists in Namakkal • 25+ Yrs Trust';
            const yearsExpVal = document.getElementById('adminYearsExp')?.value || '25+';
            const viewersVal = parseInt(document.getElementById('adminViewersCount')?.value, 10) || 1;

            const updatedSettings = {
                companyInfo: {
                    phone1: document.getElementById('adminPhone1')?.value || '+91 965 965 7777',
                    phone2: document.getElementById('adminPhone2')?.value || '+91 944 33 73573',
                    whatsapp: document.getElementById('adminWhatsapp')?.value || '919659657777',
                    email: document.getElementById('adminEmailAddress')?.value || 'anjaneyaborewells@gmail.com',
                    slogan: document.getElementById('adminSlogan')?.value || 'ஆழமான நம்பிக்கை!',
                    location: document.getElementById('adminLocationText')?.value || 'Namakkal & Tamil Nadu',
                    heroBadge: heroBadgeVal,
                    yearsExp: yearsExpVal,
                    viewersCount: viewersVal,
                    logo: logoDataUrl || current.companyInfo?.logo || 'logo.jpg'
                },
                rates: {
                    casing7: casing7Val,
                    casing10: casing10Val,
                    flushing: flushingVal,
                    transport: transportVal,
                    slabRates: updatedSlabs
                }
            };

            localStorage.setItem('anjaneya-settings', JSON.stringify(updatedSettings));
            localStorage.setItem('ab_total_pageviews', viewersVal.toString());
            
            // Also store in calculator settings format
            const calcSettings = {
                pvc7Rate: casing7Val,
                pvc10Rate: casing10Val,
                boreBataRate: transportVal,
                flushingRate: flushingVal,
                oldBoreRate: flushingVal,
                slabRates: updatedSlabs
            };
            localStorage.setItem('anjaneya-calculator-settings', JSON.stringify(calcSettings));

            this.applyStoredSettings();

            if (this.saveToast) {
                this.saveToast.style.display = 'block';
                setTimeout(() => { this.saveToast.style.display = 'none'; }, 3000);
            }
        };

        if (logoFileInput && logoFileInput.files && logoFileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => saveAndApply(e.target.result);
            reader.readAsDataURL(logoFileInput.files[0]);
        } else {
            saveAndApply(null);
        }
    }

    applyStoredSettings() {
        const saved = localStorage.getItem('anjaneya-settings');
        if (!saved) return;

        try {
            const settings = JSON.parse(saved);
            const comp = settings.companyInfo || {};
            const rates = settings.rates || {};

            // 1. Phone numbers site-wide
            if (comp.phone1) {
                document.querySelectorAll('a[href^="tel:"]').forEach(link => {
                    if (link.href.includes('9659657777')) {
                        link.href = `tel:${comp.phone1.replace(/\s+/g, '')}`;
                    }
                });
                const heroPhone = document.querySelector('.hero-btn-secondary span');
                if (heroPhone) heroPhone.textContent = comp.phone1;
            }

            // 2. WhatsApp
            if (comp.whatsapp) {
                const wa = document.getElementById('floatingWhatsApp');
                if (wa) wa.href = `https://wa.me/${comp.whatsapp}?text=Hi! I'm interested in your borewell drilling services.`;
            }

            // 3. Slogan
            if (comp.slogan) {
                document.querySelectorAll('.tamil-slogan').forEach(el => {
                    el.textContent = comp.slogan;
                });
            }

            // 4. Logo
            if (comp.logo) {
                document.querySelectorAll('.brand-logo-img').forEach(img => {
                    img.src = comp.logo;
                });
                const fav = document.querySelector("link[rel*='icon']");
                if (fav) fav.href = comp.logo;
            }

            // 5. Serving Location Badge
            if (comp.location) {
                const badge = document.getElementById('fixedRoadBadgeText');
                if (badge) badge.textContent = comp.location;
            }

            // 6. Hero Top Trust Badge & Years of Experience
            if (comp.heroBadge) {
                const heroBadgeEl = document.getElementById('heroTrustBadgeText');
                if (heroBadgeEl) heroBadgeEl.textContent = comp.heroBadge;
            }
            if (comp.yearsExp) {
                const statYearsEl = document.getElementById('statYearsExp');
                if (statYearsEl) statYearsEl.textContent = comp.yearsExp;
                const featureYearsEl = document.getElementById('featureTrustYears');
                if (featureYearsEl) {
                    featureYearsEl.textContent = comp.yearsExp.includes('Yrs') ? comp.yearsExp : `${comp.yearsExp} Yrs Trust`;
                }
            }

            // 7. Footer Page Views / Visitors Counter
            if (comp.viewersCount) {
                const viewsEl = document.getElementById('footerPageViewsCount');
                if (viewsEl) viewsEl.textContent = comp.viewersCount.toLocaleString('en-IN');
            }

            // 8. Calculator & Real-Time Rates Refresh
            if (window.anjaneyaApp) {
                if (window.anjaneyaApp.calculator) {
                    if (rates.casing7) window.anjaneyaApp.calculator.defaults.pvc7Rate = rates.casing7;
                    if (rates.casing10) window.anjaneyaApp.calculator.defaults.pvc10Rate = rates.casing10;
                    if (rates.transport) window.anjaneyaApp.calculator.defaults.boreBataRate = rates.transport;
                    if (rates.flushing) {
                        window.anjaneyaApp.calculator.defaults.flushingRate = rates.flushing;
                        window.anjaneyaApp.calculator.defaults.oldBoreRate = rates.flushing;
                    }
                    if (rates.slabRates && rates.slabRates.length > 0) {
                        window.anjaneyaApp.calculator.slabRates = rates.slabRates;
                    }
                    window.anjaneyaApp.calculator.refreshSettings();
                }
                if (typeof window.anjaneyaApp.loadInlineSettings === 'function') {
                    window.anjaneyaApp.loadInlineSettings();
                }
                if (typeof window.anjaneyaApp.renderInlineSlabRates === 'function') {
                    window.anjaneyaApp.renderInlineSlabRates();
                }
                if (window.anjaneyaApp.calculator && typeof window.anjaneyaApp.calculator.calculate === 'function') {
                    window.anjaneyaApp.calculator.calculate();
                }
            }
        } catch(e) {
            console.error('Error applying admin settings:', e);
        }
    }

    exportConfigJson() {
        const saved = localStorage.getItem('anjaneya-settings');
        let current = {};
        if (saved) {
            try { current = JSON.parse(saved); } catch(e) {}
        }
        current.lastUpdated = new Date().toISOString();

        const jsonStr = JSON.stringify(current, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'site-config.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (this.saveToast) {
            this.saveToast.textContent = '📥 site-config.json downloaded! Ready for permanent server sync.';
            this.saveToast.style.display = 'block';
            setTimeout(() => { 
                this.saveToast.style.display = 'none'; 
                this.saveToast.textContent = '✅ Settings successfully saved & applied site-wide!';
            }, 5000);
        }
    }

    resetDefaults() {
        localStorage.removeItem('anjaneya-settings');
        location.reload();
    }

    logout() {
        this.isAuthenticated = false;
        this.showLogin();
        this.close();
    }
}

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
