// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Hide loading screen animation
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.8,
            delay: 1.5, // Wait for initial load simulation
            onComplete: () => {
                loadingScreen.classList.add('hidden');
                initHeroAnimations();
            }
        });
    } else {
        initHeroAnimations();
    }

    // Initialize all other section animations
    initSectionAnimations();
});

// Hero Section Animations
function initHeroAnimations() {
    const heroTimeline = gsap.timeline();

    heroTimeline
        .from('.hero-text', {
            x: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        })
        .from('.hero-visual', {
            x: 50,
            opacity: 0,
            duration: 1,
            ease: "power3.out"
        }, "-=0.8") // Overlap with previous animation
        .from('.hero-stats', {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
        }, "-=0.5")
        .from('.hero-actions', {
            y: 20,
            opacity: 0,
            duration: 0.8,
            ease: "power2.out"
        }, "-=0.6");

    // Animate the "Full Stack Developer" text parts
    gsap.from('.static-text', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        delay: 0.5,
        ease: "power2.out"
    });
}

function initSectionAnimations() {
    // About Section
    gsap.from('.about-content', {
        scrollTrigger: {
            trigger: '#about',
            start: "top 80%",
            toggleActions: "play none none reverse"
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    });

    gsap.utils.toArray('.highlight').forEach((highlight, i) => {
        gsap.from(highlight, {
            scrollTrigger: {
                trigger: '.about-highlights',
                start: "top 85%",
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1, // Stagger effect
            ease: "back.out(1.7)"
        });
    });

    // Skills Section
    gsap.utils.toArray('.skill-category').forEach((category, i) => {
        gsap.from(category, {
            scrollTrigger: {
                trigger: category,
                start: "top 85%",
            },
            y: 40,
            opacity: 0,
            duration: 0.8,
            delay: i * 0.2,
            ease: "power3.out"
        });
    });

    // Animate progress bars when they come into view
    gsap.utils.toArray('.skill-progress').forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%'; // Reset for animation

        gsap.to(bar, {
            scrollTrigger: {
                trigger: bar,
                start: "top 90%",
            },
            width: width,
            duration: 1.5,
            ease: "power2.out"
        });
    });

    // Projects Section
    gsap.utils.toArray('.project-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
            },
            y: 50,
            opacity: 0,
            duration: 0.8,
            delay: 0.1, // Small delay
            ease: "power3.out"
        });
    });

    // Experience Section
    gsap.utils.toArray('.timeline-item').forEach((item, i) => {
        const direction = i % 2 === 0 ? -50 : 50; // Alternate slide direction

        gsap.from(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
            },
            x: direction,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out"
        });
    });

    // Contact Section
    gsap.from('.contact-content', {
        scrollTrigger: {
            trigger: '#contact',
            start: "top 80%",
        },
        scale: 0.95,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
    });

    gsap.utils.toArray('.contact-card').forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: '.contact-content',
                start: "top 80%",
            },
            y: 30,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1,
            ease: "back.out(1.7)"
        });
    });
}
