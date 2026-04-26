/**
 * EntryX Visitor Portal Logic
 * Version: 1.0.0
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    lucide.createIcons();

    // Elements
    const navbar = document.getElementById('navbar');
    const mobileToggle = document.getElementById('mobile-toggle');
    const mobileClose = document.getElementById('mobile-close');
    const mobileMenu = document.getElementById('mobile-menu');
    const clockElement = document.getElementById('live-clock');
    const weatherElement = document.getElementById('live-weather');

    // 1. Multi-page Active Link Logic
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active-nav');
        } else {
            link.classList.remove('active-nav');
        }
    });

    // 2. Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-white/80', 'shadow-sm', 'backdrop-blur-md');
            navbar.classList.remove('py-4');
            navbar.classList.add('py-2');
        } else {
            navbar.classList.remove('bg-white/80', 'shadow-sm', 'backdrop-blur-md');
            navbar.classList.add('py-4');
            navbar.classList.remove('py-2');
        }
    });

    // 3. Mobile Menu Logic
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileMenu.classList.remove('hidden');

            // allow DOM render before animation
            setTimeout(() => {
                mobileMenu.classList.remove('-translate-y-full');
            }, 10);
        });
    }

    if (mobileClose) {
        mobileClose.addEventListener('click', () => {
            mobileMenu.classList.add('-translate-y-full');

            setTimeout(() => {
                mobileMenu.classList.add('hidden');
            }, 300);
        });
    }

    // 4. Real-Time Clock
    function updateClock() {
        if (!clockElement) return;
        const now = new Date();
        const options = { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Manila'
        };
        const timeString = now.toLocaleTimeString('en-US', options);
        clockElement.textContent = timeString;
    }
    if (clockElement) {
        setInterval(updateClock, 1000);
        updateClock();
    }

    // 5. Reveal on Scroll Observer
    const observerOptions = {
        threshold: 0.15
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // 6. FAQ Accordion Logic (Specific to help.html)
    const faqTriggers = document.querySelectorAll('.faq-trigger');
    faqTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.faq-item');
            const content = item.querySelector('.faq-content');
            const icon = trigger.querySelector('[data-lucide]');
            
            // Toggle current
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
                if (icon) icon.style.transform = 'rotate(0deg)';
            } else {
                content.style.maxHeight = content.scrollHeight + 'px';
                if (icon) icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // 7. Simulated Campus Weather
    if (weatherElement) {
        const weatherConditions = ['Sunny', 'Partly Cloudy', 'Clear Skies'];
        const temp = Math.floor(Math.random() * (32 - 27 + 1)) + 27;
        const condition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        weatherElement.textContent = `Vigan City: ${temp}°C ${condition}`;
    }

    // 8. Map Navigation Logic (Specific to map.html)
    const mapCatBtns = document.querySelectorAll('.map-cat-btn');
    const locationCards = document.querySelectorAll('.location-card');

    mapCatBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update Active Button
            mapCatBtns.forEach(b => {
                b.classList.remove('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-md');
                b.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
            });
            btn.classList.add('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-md');
            btn.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');

            // Filter Locations
            const category = btn.getAttribute('data-category');
            locationCards.forEach(card => {
                if (card.getAttribute('data-category') === category) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    locationCards.forEach(card => {
        card.addEventListener('click', () => {
            const details = card.querySelector('.location-details');
            const icon = card.querySelector('[data-lucide="chevron-right"]');
            
            // Toggle
            if (details.classList.contains('hidden')) {
                details.classList.remove('hidden');
                if (icon) icon.style.transform = 'rotate(90deg)';
                card.classList.add('bg-brand-blue/5', 'border-brand-blue/30');
            } else {
                details.classList.add('hidden');
                if (icon) icon.style.transform = 'rotate(0deg)';
                card.classList.remove('bg-brand-blue/5', 'border-brand-blue/30');
            }
        });
    });

    // 10. Policy Tab Logic (Specific to policy.html)
    const policyTabs = document.querySelectorAll('.policy-tab');
    const policyPanes = document.querySelectorAll('.policy-pane');

    policyTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');
            
            // Update Tabs
            policyTabs.forEach(t => {
                t.classList.remove('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-lg', 'shadow-brand-blue/20');
                t.classList.add('bg-white', 'text-slate-500', 'border-slate-100');
            });
            tab.classList.add('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-lg', 'shadow-brand-blue/20');
            tab.classList.remove('bg-white', 'text-slate-500', 'border-slate-100');

            // Update Panes
            policyPanes.forEach(pane => {
                if (pane.id === `policy-pane-${target}`) {
                    pane.classList.remove('hidden');
                    pane.classList.add('active');
                } else {
                    pane.classList.add('hidden');
                    pane.classList.remove('active');
                }
            });
        });
    });

    // 11. Help Center Logic (Specific to help.html)
    const faqSearch = document.getElementById('faq-search');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqFilterBtns = document.querySelectorAll('.faq-filter-btn');

    if (faqSearch) {
        faqSearch.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            faqItems.forEach(item => {
                const Question = item.querySelector('h4').textContent.toLowerCase();
                const Answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                if (Question.includes(term) || Answer.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    faqFilterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            
            // Update Buttons
            faqFilterBtns.forEach(b => {
                b.classList.remove('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-md');
                b.classList.add('bg-white', 'text-slate-500', 'border-slate-200');
            });
            btn.classList.add('active', 'bg-brand-blue', 'text-white', 'border-brand-blue', 'shadow-md');
            btn.classList.remove('bg-white', 'text-slate-500', 'border-slate-200');

            // Filter List
            faqItems.forEach(item => {
                if (filter === 'All' || item.getAttribute('data-category') === filter) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });

    const faqToggles = document.querySelectorAll('.faq-toggle');
    faqToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const answer = toggle.nextElementSibling;
            const icon = toggle.querySelector('.faq-icon');
            
            if (answer.classList.contains('hidden')) {
                answer.classList.remove('hidden');
                icon.style.transform = 'rotate(180deg)';
                toggle.parentElement.classList.add('bg-white', 'shadow-xl');
            } else {
                answer.classList.add('hidden');
                icon.style.transform = 'rotate(0deg)';
                toggle.parentElement.classList.remove('bg-white', 'shadow-xl');
            }
        });
    });

    // 12. Contact Form Logic (Specific to contact.html)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            
            submitBtn.disabled = true;
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span>Sending...</span><div class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>';

            setTimeout(() => {
                submitBtn.classList.remove('bg-brand-blue');
                submitBtn.classList.add('bg-brand-green');
                submitBtn.innerHTML = '<span>Message Sent!</span><i data-lucide="check-circle" class="w-5 h-5 ml-2"></i>';
                lucide.createIcons();
                contactForm.reset();
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.classList.remove('bg-brand-green');
                    submitBtn.classList.add('bg-brand-blue');
                    submitBtn.innerHTML = originalHTML;
                    lucide.createIcons();
                }, 3000);
            }, 1500);
        });
    }
    
const buttons = document.querySelectorAll(".map-cat-btn");

const academicList = document.getElementById("academic-list");
const libraryList = document.getElementById("library-list");

buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        const category = btn.dataset.category;

        // active button UI
        buttons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // hide all lists first
        academicList.classList.add("hidden");
        libraryList.classList.add("hidden");

        // show only selected
        if (category === "academic") {
            academicList.classList.remove("hidden");
        }

        if (category === "library") {
            libraryList.classList.remove("hidden");
        }
    });
});


});

  tailwind.config = {
    theme: {
      extend: {
        colors: {
          'brand-blue': '#0070f3',
          'brand-green': '#34d399',
          'brand-orange': '#f59e0b',
          'brand-slate': '#0f172a' // DARK BACKGROUND
        }
      }
    }
  }
  
