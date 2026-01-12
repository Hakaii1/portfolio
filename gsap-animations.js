/**
 * GSAP Animation System for Kyle Eurie Portfolio
 * Enhanced with dramatic effects, text scramble, and 3D transforms
 */

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
    ease: {
        smooth: "power4.out",
        bounce: "back.out(1.7)",
        elastic: "elastic.out(1, 0.3)",
        expo: "expo.out",
        circ: "circ.out",
        dramatic: "power4.inOut"
    },
    duration: {
        fast: 0.4,
        normal: 0.8,
        slow: 1.2,
        dramatic: 1.6
    }
};

// ============================================
// TEXT SCRAMBLE EFFECT
// ============================================
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
    }

    setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = newText[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];
            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += `<span class="scramble-char">${char}</span>`;
            } else {
                output += from;
            }
        }

        this.el.innerHTML = output;

        if (complete === this.queue.length) {
            this.resolve();
        } else {
            this.frameRequest = requestAnimationFrame(this.update);
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================
function initScrollProgress() {
    const progressBar = document.querySelector('.scroll-progress');
    if (!progressBar) return;

    gsap.to(progressBar, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3
        }
    });
}

// ============================================
// DRAMATIC HERO SECTION ANIMATIONS
// ============================================
function initHeroAnimations() {
    const heroTl = gsap.timeline({
        defaults: { ease: CONFIG.ease.smooth }
    });

    // Wait for loading screen to hide
    heroTl.delay(2.2);

    // Greeting text with blur and scale
    heroTl.fromTo('.greeting',
        {
            opacity: 0,
            y: 60,
            scale: 0.8,
            filter: 'blur(10px)'
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
            duration: 1,
            ease: CONFIG.ease.expo
        }
    );

    // Name with simple fade-in animation (no character splitting to avoid visibility issues)
    heroTl.fromTo('.name',
        {
            opacity: 0,
            y: 50,
            filter: 'blur(10px)'
        },
        {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            ease: CONFIG.ease.bounce
        },
        "-=0.5"
    );

    // Subtitle with typewriter-like reveal
    heroTl.fromTo('.hero-subtitle',
        {
            opacity: 0,
            y: 30,
            clipPath: "inset(0 100% 0 0)"
        },
        {
            opacity: 1,
            y: 0,
            clipPath: "inset(0 0% 0 0)",
            duration: 0.8,
            ease: CONFIG.ease.expo
        },
        "-=0.4"
    );

    // Description with split lines
    heroTl.fromTo('.hero-description',
        {
            opacity: 0,
            y: 40,
            filter: 'blur(5px)'
        },
        {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.8
        },
        "-=0.5"
    );

    // Profile image with dramatic 3D entrance
    heroTl.fromTo('.profile-container',
        {
            opacity: 0,
            scale: 0.3,
            rotateY: 180,
            rotateX: 45,
            filter: 'blur(20px)'
        },
        {
            opacity: 1,
            scale: 1,
            rotateY: 0,
            rotateX: 0,
            filter: 'blur(0px)',
            duration: 1.5,
            ease: CONFIG.ease.elastic
        },
        "-=1"
    );

    // Profile glow pulse
    gsap.to('.profile-glow', {
        scale: 1.2,
        opacity: 0.4,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Stats with counter and 3D pop
    heroTl.fromTo('.stat',
        {
            opacity: 0,
            y: 60,
            scale: 0.5,
            rotateX: -45
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.7,
            stagger: {
                each: 0.15,
                from: "end"
            },
            ease: CONFIG.ease.bounce
        },
        "-=0.8"
    );

    // Animate stat numbers with dramatic scaling
    document.querySelectorAll('.stat-number').forEach(stat => {
        const text = stat.textContent;
        const isPercent = text.includes('%');
        const hasPlus = text.includes('+');
        const num = parseInt(text.replace(/[^0-9]/g, ''));

        if (!isNaN(num)) {
            gsap.fromTo(stat,
                { innerText: 0 },
                {
                    innerText: num,
                    duration: 2.5,
                    delay: 2.5,
                    ease: "power2.out",
                    snap: { innerText: 1 },
                    onUpdate: function () {
                        const current = Math.round(this.targets()[0].innerText);
                        stat.textContent = current + (hasPlus ? '+' : '') + (isPercent ? '%' : '');
                    }
                }
            );
        }
    });

    // CTA buttons with staggered 3D entrance
    heroTl.fromTo('.hero-actions .btn',
        {
            opacity: 0,
            y: 50,
            scale: 0.7,
            rotateX: -30
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateX: 0,
            duration: 0.8,
            stagger: 0.2,
            ease: CONFIG.ease.bounce
        },
        "-=0.5"
    );

    // Scroll indicator with floating animation
    heroTl.fromTo('.scroll-indicator',
        { opacity: 0, y: -30 },
        { opacity: 1, y: 0, duration: 0.8 },
        "-=0.3"
    );

    // Continuous floating animation for scroll indicator
    gsap.to('.scroll-indicator', {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });
}

// ============================================
// DRAMATIC SECTION HEADER ANIMATIONS
// ============================================
function initSectionHeaders() {
    document.querySelectorAll('.section-header').forEach(header => {
        const title = header.querySelector('.section-title');
        const subtitle = header.querySelector('.section-subtitle');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: header,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });

        if (title) {
            // Simple animation without character splitting to avoid visibility issues
            tl.fromTo(title,
                {
                    opacity: 0,
                    y: 60,
                    filter: 'blur(10px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.8,
                    ease: CONFIG.ease.bounce
                }
            );
        }

        if (subtitle) {
            tl.fromTo(subtitle,
                {
                    opacity: 0,
                    y: 30,
                    filter: 'blur(8px)'
                },
                {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.8
                },
                "-=0.4"
            );
        }
    });
}

// ============================================
// DRAMATIC ABOUT SECTION
// ============================================
function initAboutSection() {
    const aboutImage = document.querySelector('.about-image');
    const aboutText = document.querySelector('.about-text');

    if (aboutImage) {
        gsap.fromTo(aboutImage,
            {
                opacity: 0,
                x: -150,
                rotateY: -45,
                scale: 0.7,
                filter: 'blur(10px)'
            },
            {
                opacity: 1,
                x: 0,
                rotateY: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1.2,
                ease: CONFIG.ease.smooth,
                scrollTrigger: {
                    trigger: aboutImage,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    if (aboutText) {
        gsap.fromTo(aboutText,
            {
                opacity: 0,
                x: 150,
                filter: 'blur(10px)'
            },
            {
                opacity: 1,
                x: 0,
                filter: 'blur(0px)',
                duration: 1.2,
                ease: CONFIG.ease.smooth,
                scrollTrigger: {
                    trigger: aboutText,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }

    // Highlights with dramatic pop
    gsap.fromTo('.highlight',
        {
            opacity: 0,
            y: 60,
            scale: 0.5,
            rotateZ: -10
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateZ: 0,
            duration: 0.6,
            stagger: {
                each: 0.1,
                from: "random"
            },
            ease: CONFIG.ease.bounce,
            scrollTrigger: {
                trigger: '.about-highlights',
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

// ============================================
// DRAMATIC SKILLS SECTION
// ============================================
function initSkillsSection() {
    // Skill categories with 3D flip entrance
    document.querySelectorAll('.skill-category').forEach((category, index) => {
        const fromX = index % 2 === 0 ? -100 : 100;

        gsap.fromTo(category,
            {
                opacity: 0,
                x: fromX,
                rotateY: index % 2 === 0 ? -30 : 30,
                scale: 0.8
            },
            {
                opacity: 1,
                x: 0,
                rotateY: 0,
                scale: 1,
                duration: 1,
                ease: CONFIG.ease.smooth,
                scrollTrigger: {
                    trigger: category,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Skill items with explosive stagger
    document.querySelectorAll('.skill-category').forEach(category => {
        const items = category.querySelectorAll('.skill-item');

        gsap.fromTo(items,
            {
                opacity: 0,
                y: 80,
                scale: 0.3,
                rotateX: -90
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
                duration: 0.6,
                stagger: {
                    each: 0.1,
                    from: "start"
                },
                ease: CONFIG.ease.bounce,
                scrollTrigger: {
                    trigger: category,
                    start: "top 75%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });

    // Progress bar animations with glow pulse
    document.querySelectorAll('.skill-progress').forEach(progress => {
        const width = progress.style.width;
        progress.style.width = '0%';

        gsap.to(progress, {
            width: width,
            duration: 1.5,
            ease: "elastic.out(1, 0.5)",
            scrollTrigger: {
                trigger: progress,
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        });
    });
}

// ============================================
// DRAMATIC PROJECTS SECTION
// ============================================
function initProjectsSection() {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach((card, index) => {
        // Dramatic 3D card entrance with perspective
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 150,
                rotateX: 45,
                rotateY: index % 2 === 0 ? -25 : 25,
                scale: 0.6,
                filter: 'blur(15px)'
            },
            {
                opacity: 1,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                filter: 'blur(0px)',
                duration: 1,
                delay: index * 0.2,
                ease: CONFIG.ease.smooth,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Tech tags with explosive entrance
        const techTags = card.querySelectorAll('.tech-tag');
        gsap.fromTo(techTags,
            {
                opacity: 0,
                scale: 0,
                y: 30,
                rotation: -180
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                rotation: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: CONFIG.ease.bounce,
                scrollTrigger: {
                    trigger: card,
                    start: "top 70%",
                    toggleActions: "play none none reverse"
                }
            }
        );

        // Enhanced hover parallax on image
        const image = card.querySelector('.project-image img');
        const overlay = card.querySelector('.project-overlay');

        if (image) {
            card.addEventListener('mouseenter', () => {
                gsap.to(image, {
                    scale: 1.2,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to(card, {
                    y: -10,
                    boxShadow: "0 30px 60px rgba(79, 172, 254, 0.3)",
                    duration: 0.4
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(image, {
                    scale: 1,
                    duration: 0.8,
                    ease: "power2.out"
                });
                gsap.to(card, {
                    y: 0,
                    boxShadow: "none",
                    duration: 0.4
                });
            });
        }

        // 3D tilt effect on mouse move
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const rotateX = (e.clientY - centerY) / 20;
            const rotateY = (centerX - e.clientX) / 20;

            gsap.to(card, {
                rotateX: rotateX,
                rotateY: rotateY,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: CONFIG.ease.elastic
            });
        });
    });
}

// ============================================
// DRAMATIC EXPERIENCE TIMELINE
// ============================================
function initTimeline() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    // Timeline items with dramatic slide-in
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item, index) => {
        const content = item.querySelector('.timeline-content');
        const marker = item.querySelector('.timeline-marker');

        // Marker with pulse effect
        if (marker) {
            gsap.fromTo(marker,
                {
                    scale: 0,
                    opacity: 0,
                    boxShadow: "0 0 0 0 rgba(79, 172, 254, 0)"
                },
                {
                    scale: 1,
                    opacity: 1,
                    boxShadow: "0 0 30px 10px rgba(79, 172, 254, 0.4)",
                    duration: 0.8,
                    delay: index * 0.3,
                    ease: CONFIG.ease.bounce,
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );

            // Continuous pulse
            gsap.to(marker, {
                boxShadow: "0 0 20px 5px rgba(79, 172, 254, 0.6)",
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut",
                delay: 1 + index * 0.3
            });
        }

        // Content with dramatic entrance
        if (content) {
            const fromX = index % 2 === 0 ? -120 : 120;
            gsap.fromTo(content,
                {
                    opacity: 0,
                    x: fromX,
                    y: 50,
                    rotateZ: index % 2 === 0 ? -5 : 5,
                    scale: 0.8,
                    filter: 'blur(8px)'
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    rotateZ: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                    duration: 1,
                    delay: index * 0.25,
                    ease: CONFIG.ease.smooth,
                    scrollTrigger: {
                        trigger: item,
                        start: "top 80%",
                        toggleActions: "play none none reverse"
                    }
                }
            );
        }
    });
}

// ============================================
// DRAMATIC CONTACT SECTION
// ============================================
function initContactSection() {
    const contactCards = document.querySelectorAll('.contact-card');

    gsap.fromTo(contactCards,
        {
            opacity: 0,
            y: 100,
            scale: 0.5,
            rotateY: 90
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            rotateY: 0,
            duration: 0.8,
            stagger: {
                each: 0.15,
                from: "random"
            },
            ease: CONFIG.ease.bounce,
            scrollTrigger: {
                trigger: '.contact-info',
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        }
    );

    // Social links with spin entrance
    const socialLinks = document.querySelectorAll('.social-links a');
    gsap.fromTo(socialLinks,
        {
            opacity: 0,
            scale: 0,
            rotation: -360
        },
        {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: CONFIG.ease.elastic,
            scrollTrigger: {
                trigger: '.social-links',
                start: "top 85%",
                toggleActions: "play none none reverse"
            }
        }
    );

    // Add hover effects to contact cards
    contactCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            gsap.to(card, {
                y: -10,
                scale: 1.05,
                boxShadow: "0 20px 40px rgba(79, 172, 254, 0.3)",
                duration: 0.3
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                y: 0,
                scale: 1,
                boxShadow: "none",
                duration: 0.3
            });
        });
    });
}

// ============================================
// FOOTER WITH REVEAL
// ============================================
function initFooter() {
    gsap.fromTo('footer .footer-content',
        {
            opacity: 0,
            y: 80,
            filter: 'blur(10px)'
        },
        {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 1,
            ease: CONFIG.ease.smooth,
            scrollTrigger: {
                trigger: 'footer',
                start: "top 90%",
                toggleActions: "play none none reverse"
            }
        }
    );
}

// ============================================
// ENHANCED MAGNETIC BUTTON EFFECT
// ============================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.btn, .cta-nav, .theme-toggle, .scroll-to-top');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(btn, {
                x: x * 0.4,
                y: y * 0.4,
                scale: 1.1,
                duration: 0.3,
                ease: "power3.out"
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.6,
                ease: CONFIG.ease.elastic
            });
        });
    });
}

// ============================================
// ENHANCED PARALLAX WITH DEPTH LAYERS
// ============================================
function initParallax() {
    const shapes = document.querySelectorAll('.shape');

    shapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.15;

        gsap.to(shape, {
            y: () => window.scrollY * speed,
            rotation: () => window.scrollY * 0.02 * (index + 1),
            ease: "none",
            scrollTrigger: {
                trigger: document.body,
                start: "top top",
                end: "bottom bottom",
                scrub: 1
            }
        });
    });

    // Dynamic profile glow parallax
    gsap.to('.profile-glow', {
        y: () => window.scrollY * 0.2,
        rotation: () => window.scrollY * 0.05,
        ease: "none",
        scrollTrigger: {
            trigger: '#hero',
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });

    // Section parallax depth
    document.querySelectorAll('section').forEach((section, index) => {
        gsap.fromTo(section,
            { backgroundPositionY: "0%" },
            {
                backgroundPositionY: "30%",
                ease: "none",
                scrollTrigger: {
                    trigger: section,
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            }
        );
    });
}

// ============================================
// ENHANCED HOVER ANIMATIONS
// ============================================
function initHoverAnimations() {
    // Skill item hover with 3D effect
    document.querySelectorAll('.skill-item').forEach(item => {
        const icon = item.querySelector('.skill-icon');

        item.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                scale: 1.2,
                rotate: 15,
                boxShadow: "0 10px 30px rgba(79, 172, 254, 0.4)",
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to(item, {
                y: -5,
                duration: 0.3
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                scale: 1,
                rotate: 0,
                boxShadow: "none",
                duration: 0.4,
                ease: "power2.out"
            });
            gsap.to(item, {
                y: 0,
                duration: 0.3
            });
        });
    });

    // Contact card hover with bounce
    document.querySelectorAll('.contact-card').forEach(card => {
        const icon = card.querySelector('.contact-icon');

        card.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                scale: 1.2,
                rotate: -10,
                duration: 0.4,
                ease: CONFIG.ease.bounce
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                scale: 1,
                rotate: 0,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });

    // Highlight items with wave effect
    document.querySelectorAll('.highlight').forEach((item, index) => {
        const icon = item.querySelector('i');

        item.addEventListener('mouseenter', () => {
            gsap.to(icon, {
                scale: 1.3,
                rotate: 20,
                color: "var(--primary-color)",
                duration: 0.4,
                ease: CONFIG.ease.bounce
            });
        });

        item.addEventListener('mouseleave', () => {
            gsap.to(icon, {
                scale: 1,
                rotate: 0,
                color: "",
                duration: 0.4,
                ease: "power2.out"
            });
        });
    });
}

// ============================================
// TYPING CURSOR WITH GLOW
// ============================================
function initCursorBlink() {
    const dynamicText = document.getElementById('dynamicText');
    if (!dynamicText) return;

    // Add blinking cursor with glow
    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.style.cssText = `
        color: var(--primary-color);
        text-shadow: 0 0 10px var(--primary-color);
        font-weight: normal;
    `;
    dynamicText.after(cursor);

    gsap.to(cursor, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)"
    });
}

// ============================================
// LOADING SCREEN ANIMATION
// ============================================
function initLoadingAnimation() {
    const loadingLogo = document.querySelector('.loading-logo');

    if (loadingLogo) {
        // Dramatic pulse with glow
        gsap.to(loadingLogo, {
            scale: 1.15,
            textShadow: "0 0 50px rgba(79, 172, 254, 0.8)",
            duration: 0.8,
            repeat: -1,
            yoyo: true,
            ease: "power1.inOut"
        });
    }
}

// ============================================
// SCROLL-TRIGGERED REVEAL ANIMATIONS
// ============================================
function initScrollReveals() {
    // Fade-in reveal for paragraphs
    gsap.utils.toArray('.about-text p, .timeline-content p').forEach(p => {
        gsap.fromTo(p,
            {
                opacity: 0,
                y: 30,
                filter: 'blur(5px)'
            },
            {
                opacity: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.8,
                scrollTrigger: {
                    trigger: p,
                    start: "top 90%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
}

// ============================================
// INITIALIZATION
// ============================================
function initGSAPAnimations() {
    // Loading animation starts immediately
    initLoadingAnimation();

    // Initialize all animations after loading
    window.addEventListener('load', () => {
        setTimeout(() => {
            initScrollProgress();
            initHeroAnimations();
            initSectionHeaders();
            initAboutSection();
            initSkillsSection();
            initProjectsSection();
            initTimeline();
            initContactSection();
            initFooter();
            initMagneticButtons();
            initParallax();
            initHoverAnimations();
            initCursorBlink();
            initScrollReveals();

            // Refresh ScrollTrigger after all elements are in place
            ScrollTrigger.refresh();
        }, 100);
    });
}

// Start the animation system
initGSAPAnimations();
