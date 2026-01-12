/**
 * EPIC LOADING SYSTEM
 * Multi-stage cinematic loading experience with advanced animations
 */

class EpicLoadingSystem {
    constructor() {
        this.loadingScreen = document.getElementById('epicLoadingScreen');
        this.progressFill = document.getElementById('epicProgressFill');
        this.progressText = document.getElementById('progressText');

        this.currentStage = 0;
        this.totalStages = 5;
        this.isComplete = false;

        this.particleSystems = {};
        this.textScramblers = {};
        this.geometryScene = null;
        this.animationTimelines = {};
        this.audioEnabled = false;
        this.audioContext = null;
        this.audioBuffers = {};

        this.init();
    }

    init() {
        try {
            this.setupEventListeners();
            this.initializeParticleSystems();
            this.initializeTextScramblers();
            this.initializeGeometryScene();
            this.startLoadingSequence();
        } catch (error) {
            console.error('Epic Loading System initialization failed:', error);
            this.fallbackToBasicLoading();
        }
    }

    fallbackToBasicLoading() {
        // Fallback to basic loading if epic system fails
        console.log('Falling back to basic loading system');
        const epicLoading = document.getElementById('epicLoadingScreen');
        const basicLoading = document.getElementById('loadingScreen');

        if (epicLoading) epicLoading.style.display = 'none';
        if (basicLoading) {
            basicLoading.style.display = 'flex';
            setTimeout(() => {
                basicLoading.classList.add('hidden');
                document.body.style.overflow = 'auto';
                window.dispatchEvent(new CustomEvent('epicLoadingComplete'));
            }, 2000);
        }
    }

    setupEventListeners() {
        // Prevent scrolling during loading
        document.body.style.overflow = 'hidden';

        // Click to skip (for development)
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            document.addEventListener('keydown', (e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.skipToEnd();
                }
            });
        }

        // Initialize audio system
        this.initAudioSystem();
    }

    initAudioSystem() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.audioEnabled = true;
        } catch (e) {
            console.log('Web Audio API not supported');
            this.audioEnabled = false;
        }
    }

    playSound(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioEnabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;

        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playStageSound(stage) {
        if (!this.audioEnabled) return;

        switch (stage) {
            case 1:
                // Logo burst sound
                this.playSound(800, 0.3, 'sine', 0.15);
                setTimeout(() => this.playSound(1000, 0.2, 'sine', 0.1), 150);
                setTimeout(() => this.playSound(1200, 0.2, 'sine', 0.08), 300);
                break;
            case 2:
                // Name scramble sound
                this.playSound(600, 0.8, 'sawtooth', 0.05);
                break;
            case 3:
                // 3D geometry sound
                this.playSound(400, 0.5, 'triangle', 0.08);
                break;
            case 4:
                // Code typing sound
                this.playSound(1000, 0.1, 'square', 0.03);
                break;
            case 5:
                // Final reveal sound
                this.playSound(300, 1.0, 'sine', 0.12);
                setTimeout(() => this.playSound(400, 0.8, 'sine', 0.1), 200);
                setTimeout(() => this.playSound(500, 0.6, 'sine', 0.08), 400);
                break;
        }
    }

    initializeParticleSystems() {
        // Logo particles (Stage 1)
        this.createLogoParticles();

        // Name particles (Stage 2)
        this.createNameParticles();

        // Entrance particles (Stage 5)
        this.createEntranceParticles();
    }

    createLogoParticles() {
        const canvas = document.getElementById('logo-particles-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.particleSystems.logo = {
            canvas,
            ctx,
            particles: [],
            mouse: { x: undefined, y: undefined }
        };

        // Create burst particles
        for (let i = 0; i < 50; i++) {
            this.particleSystems.logo.particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1,
                maxLife: 1,
                size: Math.random() * 3 + 1,
                color: this.getRandomColor()
            });
        }

        this.animateLogoParticles();
    }

    createNameParticles() {
        const canvas = document.getElementById('name-particles-canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = 600;
        canvas.height = 200;

        this.particleSystems.name = {
            canvas,
            ctx,
            particles: []
        };

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            this.particleSystems.name.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        this.animateNameParticles();
    }

    createEntranceParticles() {
        const canvas = document.getElementById('entrance-particles');
        const ctx = canvas.getContext('2d');

        canvas.width = window.innerWidth;
        canvas.height = 200;

        this.particleSystems.entrance = {
            canvas,
            ctx,
            particles: []
        };

        // Create portal particles
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const radius = Math.random() * 100 + 50;

            this.particleSystems.entrance.particles.push({
                x: canvas.width / 2 + Math.cos(angle) * radius,
                y: canvas.height / 2 + Math.sin(angle) * radius,
                vx: Math.cos(angle) * 2,
                vy: Math.sin(angle) * 2,
                life: 1,
                size: Math.random() * 2 + 1,
                color: this.getRandomColor()
            });
        }

        this.animateEntranceParticles();
    }

    getRandomColor() {
        const colors = ['#4facfe', '#ff6b81', '#a855f7', '#00ff88', '#ffd700'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    animateLogoParticles() {
        const { ctx, canvas, particles } = this.particleSystems.logo;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= 0.01;

            if (particle.life <= 0) {
                particles.splice(index, 1);
                return;
            }

            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        if (particles.length > 0) {
            requestAnimationFrame(() => this.animateLogoParticles());
        }
    }

    animateNameParticles() {
        const { ctx, canvas, particles } = this.particleSystems.name;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Bounce off walls
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

            ctx.save();
            ctx.globalAlpha = particle.opacity;
            ctx.fillStyle = '#4facfe';
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        requestAnimationFrame(() => this.animateNameParticles());
    }

    animateEntranceParticles() {
        const { ctx, canvas, particles } = this.particleSystems.entrance;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.005;

            if (particle.life <= 0) {
                // Reset particle
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * 100 + 50;
                particle.x = canvas.width / 2 + Math.cos(angle) * radius;
                particle.y = canvas.height / 2 + Math.sin(angle) * radius;
                particle.vx = Math.cos(angle) * 2;
                particle.vy = Math.sin(angle) * 2;
                particle.life = 1;
            }

            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        requestAnimationFrame(() => this.animateEntranceParticles());
    }

    initializeTextScramblers() {
        this.textScramblers.name = new TextScramble(document.getElementById('nameScramble'));
        this.textScramblers.role = new TextScramble(document.getElementById('roleScramble'));
    }

    initializeGeometryScene() {
        // Initialize Three.js scene for Stage 3
        const canvas = document.getElementById('geometry-canvas');
        if (!canvas) return;

        this.geometryScene = {
            scene: new THREE.Scene(),
            camera: new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
            renderer: new THREE.WebGLRenderer({ canvas, alpha: true }),
            objects: []
        };

        const { scene, camera, renderer, objects } = this.geometryScene;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);

        camera.position.z = 5;

        // Create geometric objects
        const geometries = [
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.TetrahedronGeometry(1, 0),
            new THREE.DodecahedronGeometry(1, 0)
        ];

        const materials = [
            new THREE.MeshBasicMaterial({ color: 0x4facfe, wireframe: true }),
            new THREE.MeshBasicMaterial({ color: 0xff6b81, wireframe: true }),
            new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true }),
            new THREE.MeshBasicMaterial({ color: 0x00ff88, wireframe: true })
        ];

        for (let i = 0; i < 4; i++) {
            const mesh = new THREE.Mesh(geometries[i], materials[i]);
            mesh.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            );
            scene.add(mesh);
            objects.push(mesh);
        }

        this.animateGeometryScene();
    }

    animateGeometryScene() {
        if (!this.geometryScene) return;

        const { scene, camera, renderer, objects } = this.geometryScene;

        objects.forEach((obj, index) => {
            obj.rotation.x += 0.01 * (index + 1);
            obj.rotation.y += 0.015 * (index + 1);
            obj.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
        });

        renderer.render(scene, camera);
        requestAnimationFrame(() => this.animateGeometryScene());
    }

    startLoadingSequence() {
        this.runStage1();
    }

    runStage1() {
        this.updateProgress(0, 'Initializing...');
        this.currentStage = 1;
        this.playStageSound(1);

        // Logo reveal animation
        const logoTl = gsap.timeline();

        logoTl.to('.logo-symbol', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "elastic.out(1, 0.5)"
        })
        .to('.logo-rings .ring', {
            duration: 0.8,
            scale: 1.5,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.5");

        // Progress to stage 2
        setTimeout(() => {
            this.transitionToStage(2);
            this.runStage2();
        }, 3000);
    }

    runStage2() {
        this.updateProgress(25, 'Loading identity...');
        this.currentStage = 2;
        this.playStageSound(2);

        // Name scramble animation
        setTimeout(() => {
            this.textScramblers.name.setText('KYLE EURIE');
        }, 500);

        setTimeout(() => {
            this.textScramblers.role.setText('DEVELOPER');
        }, 1500);

        // Progress to stage 3
        setTimeout(() => {
            this.transitionToStage(3);
            this.runStage3();
        }, 4000);
    }

    runStage3() {
        this.updateProgress(50, 'Building environment...');
        this.currentStage = 3;
        this.playStageSound(3);

        // 3D geometry reveal
        gsap.fromTo('.tech-stack .tech-item', {
            y: 50,
            opacity: 0,
            scale: 0.5
        }, {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            stagger: 0.2,
            ease: "back.out(1.7)"
        });

        // Progress to stage 4
        setTimeout(() => {
            this.transitionToStage(4);
            this.runStage4();
        }, 4000);
    }

    runStage4() {
        this.updateProgress(75, 'Compiling code...');
        this.currentStage = 4;
        this.playStageSound(4);

        // Code typing animation
        const codeLines = document.querySelectorAll('.code-line');
        codeLines.forEach((line, index) => {
            setTimeout(() => {
                gsap.to(line, {
                    x: 0,
                    opacity: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }, index * 200);
        });

        // Stats counter animation
        setTimeout(() => {
            document.querySelectorAll('.stat-value').forEach(stat => {
                const target = parseInt(stat.dataset.target);
                gsap.fromTo(stat,
                    { innerText: 0 },
                    {
                        innerText: target,
                        duration: 2,
                        ease: "power2.out",
                        snap: { innerText: 1 },
                        onUpdate: function() {
                            stat.textContent = Math.round(this.targets()[0].innerText);
                        }
                    }
                );
            });
        }, 1000);

        // Progress to stage 5
        setTimeout(() => {
            this.transitionToStage(5);
            this.runStage5();
        }, 5000);
    }

    runStage5() {
        this.updateProgress(100, 'Welcome aboard!');
        this.currentStage = 5;
        this.playStageSound(5);

        // Final reveal animation
        const finalTl = gsap.timeline();

        finalTl.to('.welcome-main', {
            duration: 1,
            scale: 1,
            opacity: 1,
            ease: "elastic.out(1, 0.5)"
        })
        .to('.portal-ring', {
            duration: 1,
            scale: 2,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out"
        }, "-=0.5")
        .to('.final-text', {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "power2.out"
        }, "-=0.3");

        // Complete loading
        setTimeout(() => {
            this.completeLoading();
        }, 3000);
    }

    transitionToStage(newStage) {
        const currentStageEl = document.querySelector(`.stage-${this.currentStage}`);
        const newStageEl = document.querySelector(`.stage-${newStage}`);

        if (currentStageEl) {
            currentStageEl.classList.remove('active');
            currentStageEl.classList.add('hidden-stage');
        }

        if (newStageEl) {
            newStageEl.classList.add('active');
        }
    }

    updateProgress(percentage, text) {
        gsap.to(this.progressFill, {
            width: `${percentage}%`,
            duration: 0.8,
            ease: "power2.out"
        });

        this.progressText.textContent = text;
    }

    completeLoading() {
        this.isComplete = true;

        // Dramatic exit animation
        const exitTl = gsap.timeline();

        exitTl.to(this.loadingScreen, {
            duration: 1,
            scale: 1.2,
            opacity: 0,
            ease: "power2.inOut",
            onComplete: () => {
                this.loadingScreen.style.display = 'none';
                document.body.style.overflow = 'auto';

                // Trigger hero animations after loading
                if (typeof initHeroAnimations === 'function') {
                    setTimeout(() => {
                        initHeroAnimations();
                    }, 200);
                }
            }
        });

        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('epicLoadingComplete'));
    }

    skipToEnd() {
        if (this.isComplete) return;

        // Fast-forward to completion
        this.completeLoading();
    }
}

// Enhanced TextScramble class with more effects
class TextScramble {
    constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
        this.queue = [];
        this.frame = 0;
        this.frameRequest = null;
        this.resolve = null;
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

// Initialize the epic loading system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Check if epic loading screen exists, otherwise use regular loading
    const epicLoading = document.getElementById('epicLoadingScreen');
    if (epicLoading) {
        new EpicLoadingSystem();
    } else {
        // Fallback to original loading system
        window.addEventListener('load', () => {
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                setTimeout(() => {
                    loadingScreen.classList.add('hidden');
                }, 2000);
            }
        });
    }
});