// Loading Screen
// Project Counter - Direct Function
function updateProjectCount() {
    const countElement = document.getElementById('projectCount');
    if (countElement) {
        // Force update immediately
        const projectCards = document.querySelectorAll('.project-card');
        const count = projectCards.length;
        countElement.textContent = count;
        // console.log(`Force Project Count Update: ${count}`);
    }
}

// Run immediately if DOM is ready, otherwise wait
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateProjectCount);
} else {
    updateProjectCount();
}

window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 2000);
});

// Theme Management
class ThemeManager {
    constructor() {
        this.themes = {
            dark: {
                primary: '#4facfe',
                secondary: '#ff6b81',
                accent: '#a855f7'
            },
            light: {
                primary: '#4facfe',
                secondary: '#ff6b81',
                accent: '#a855f7'
            },
            neon: {
                primary: '#00ff88',
                secondary: '#ff0080',
                accent: '#8000ff'
            },
            cyberpunk: {
                primary: '#ff073a',
                secondary: '#00d4ff',
                accent: '#ffd700'
            }
        };
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Theme toggle button
        const themeToggle = document.getElementById('themeToggle');
        const themePanel = document.getElementById('themePanel');

        themeToggle.addEventListener('click', () => {
            themePanel.classList.toggle('active');
        });

        // Close theme panel when clicking outside
        document.addEventListener('click', (e) => {
            if (!themeToggle.contains(e.target) && !themePanel.contains(e.target)) {
                themePanel.classList.remove('active');
            }
        });

        // Theme options
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.dataset.theme;
                this.setTheme(theme);
                themePanel.classList.remove('active');
            });
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        this.applyTheme(theme);
    }

    applyTheme(theme) {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);

        // Update active theme option
        document.querySelectorAll('.theme-option').forEach(option => {
            option.classList.toggle('active', option.dataset.theme === theme);
        });
    }
}

// Canvas Background Animation
class CanvasAnimation {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: undefined, y: undefined };
        this.particleCount = 80;
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.createParticles();
        this.animate();

        window.addEventListener('resize', () => this.resizeCanvas());
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createParticles() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        this.connectParticles();
        requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.2;
                    this.ctx.strokeStyle = `rgba(79, 172, 254, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[j].x);
                    this.ctx.lineTo(this.particles[i].y, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
    }

    update(mouse) {
        this.x += this.speedX;
        this.y += this.speedY;

        // Mouse interaction
        if (mouse.x && mouse.y) {
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                const force = (100 - distance) / 100;
                this.x -= dx * force * 0.01;
                this.y -= dy * force * 0.01;
            }
        }

        // Boundary check
        if (this.x > this.canvas.width) this.x = 0;
        if (this.x < 0) this.x = this.canvas.width;
        if (this.y > this.canvas.height) this.y = 0;
        if (this.y < 0) this.y = this.canvas.height;
    }

    draw(ctx) {
        ctx.fillStyle = `rgba(79, 172, 254, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Typing Animation
class TypingAnimation {
    constructor() {
        this.texts = [
            "Quick Learner",
            "Problem Solver",
            "Creative Thinker",
            "Tech Enthusiast"
        ];
        this.element = document.getElementById('dynamicText');
        this.textIndex = 0;
        this.charIndex = 0;
        this.isDeleting = false;
        this.typeSpeed = 100;
        this.init();
    }

    init() {
        setTimeout(() => this.type(), 1000);
    }

    type() {
        const currentText = this.texts[this.textIndex];

        if (this.isDeleting) {
            this.element.textContent = currentText.substring(0, this.charIndex - 1);
            this.charIndex--;
            this.typeSpeed = 50;
        } else {
            this.element.textContent = currentText.substring(0, this.charIndex + 1);
            this.charIndex++;
            this.typeSpeed = 100;
        }

        if (!this.isDeleting && this.charIndex === currentText.length) {
            this.typeSpeed = 2000;
            this.isDeleting = true;
        } else if (this.isDeleting && this.charIndex === 0) {
            this.isDeleting = false;
            this.textIndex = (this.textIndex + 1) % this.texts.length;
            this.typeSpeed = 500;
        }

        setTimeout(() => this.type(), this.typeSpeed);
    }
}

// Navigation
class Navigation {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.navMenu = document.getElementById('navMenu');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.scrollTopBtn = document.getElementById('scrollToTop');
        this.init();
    }

    init() {
        this.setupScrollEffects();
        this.setupMobileMenu();
        this.setupSmoothScroll();
        this.setupScrollToTop();
        this.setupActiveLinks();
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY > 100;
            this.navbar.classList.toggle('scrolled', scrolled);
            this.scrollTopBtn.classList.toggle('visible', window.scrollY > 300);
        });
    }

    setupMobileMenu() {
        this.menuToggle.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.menuToggle.classList.toggle('active');
        });

        // Close menu on link click
        document.querySelectorAll('#navMenu a').forEach(link => {
            link.addEventListener('click', () => {
                this.navMenu.classList.remove('active');
                this.menuToggle.classList.remove('active');
            });
        });
    }

    setupSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setupScrollToTop() {
        this.scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    setupActiveLinks() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        });
    }
}





// Resume Modal Management
function openResumeModal() {
    const modal = document.getElementById('resumeModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeResumeModal() {
    const modal = document.getElementById('resumeModal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('resumeModal');
    if (e.target === modal) {
        closeResumeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeResumeModal();
    }
});

// Copy-to-clipboard for contact info (email / phone)
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const value = btn.dataset.copy;
            try {
                await navigator.clipboard.writeText(value);
                const tooltip = btn.parentElement.querySelector('.copy-tooltip');
                if (tooltip) {
                    tooltip.classList.add('show');
                    setTimeout(() => tooltip.classList.remove('show'), 1800);
                }
            } catch (err) {
                console.error('Copy failed', err);
            }
        });
    });
});

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    new ThemeManager();
    new CanvasAnimation();
    new TypingAnimation();
    new Navigation();
    new Navigation();
    new RestrictedLinkManager();
    updateProjectCount();
    initProjectFilters();
});

// Project Filter Logic
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                    card.classList.remove('hidden');
                    // Retrigger animation
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = null;
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Restricted Link Manager
class RestrictedLinkManager {
    constructor() {
        this.restrictedLinks = document.querySelectorAll('.restricted-link');
        this.init();
    }

    init() {
        this.restrictedLinks = document.querySelectorAll('.restricted-link');
        this.restrictedLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const message = link.dataset.message || "Access Denied: This project is confidential.";
                this.showRestrictionMessage(message);
            });
        });
    }

    showRestrictionMessage(message) {
        // Remove existing toast if any
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.className = 'toast-message';
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-lock"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles dynamically (or could be in CSS)
        Object.assign(toast.style, {
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%) translateY(100px)',
            background: 'rgba(255, 71, 87, 0.95)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: '10000',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '500',
            transition: 'transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)'
        });

        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}