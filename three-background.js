/**
 * Three.js Interactive 3D Background
 * Creates an immersive 3D scene that responds to scroll and mouse movements
 */

class ThreeBackground {
    constructor() {
        this.container = document.getElementById('three-canvas');
        if (!this.container) return;

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.scrollProgress = 0;
        this.time = 0;
        this.isLoaded = false;

        this.init();
        this.createScene();
        this.createLights();
        this.createMainGeometry();
        this.createParticleField();
        this.createFloatingShapes();
        this.addEventListeners();
        this.animate();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a0f, 0.0008);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;

        // Renderer with transparency
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.container,
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);

        // Clock for animations
        this.clock = new THREE.Clock();
    }

    createScene() {
        // Create gradient background mesh
        const bgGeometry = new THREE.PlaneGeometry(200, 200);
        const bgMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uColor1: { value: new THREE.Color(0x0a0a0f) },
                uColor2: { value: new THREE.Color(0x1a1a2e) }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                varying vec2 vUv;

                void main() {
                    float noise = sin(vUv.x * 10.0 + uTime * 0.5) * 0.5 + 0.5;
                    noise *= sin(vUv.y * 8.0 + uTime * 0.3) * 0.5 + 0.5;
                    vec3 color = mix(uColor1, uColor2, vUv.y + noise * 0.1);
                    gl_FragColor = vec4(color, 0.3);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
        this.bgMesh.position.z = -50;
        this.scene.add(this.bgMesh);
    }

    createLights() {
        // Ambient light - reduced intensity for darker look
        const ambientLight = new THREE.AmbientLight(0x202020, 0.3);
        this.scene.add(ambientLight);

        // Colored point lights - much dimmer for subtle effect
        this.pointLight1 = new THREE.PointLight(0x2a2d6e, 0.8, 100);
        this.pointLight1.position.set(20, 20, 20);
        this.scene.add(this.pointLight1);

        this.pointLight2 = new THREE.PointLight(0x034e5a, 0.8, 100);
        this.pointLight2.position.set(-20, -20, 20);
        this.scene.add(this.pointLight2);

        this.pointLight3 = new THREE.PointLight(0x3d1f5c, 0.6, 100);
        this.pointLight3.position.set(0, 0, 30);
        this.scene.add(this.pointLight3);
    }

    createMainGeometry() {
        // Main torus knot - the centerpiece
        const torusKnotGeometry = new THREE.TorusKnotGeometry(8, 2.5, 200, 32, 3, 4);

        // Custom shader material for the main geometry
        this.mainMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uScroll: { value: 0 }
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uScroll;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vDisplacement;

                // Noise function
                vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
                vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);

                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);

                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - D.yyy;

                    i = mod289(i);
                    vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

                    float n_ = 0.142857142857;
                    vec3 ns = n_ * D.wyz - D.xzx;

                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);

                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);

                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);

                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));

                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);

                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;

                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }

                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;

                    // Mouse influence on displacement
                    float mouseInfluence = length(uMouse) * 0.5;
                    
                    // Create morphing displacement
                    float displacement = snoise(position * 0.15 + uTime * 0.3) * 1.5;
                    displacement += snoise(position * 0.3 + uTime * 0.5) * 0.8;
                    displacement *= (1.0 + mouseInfluence);
                    displacement *= (1.0 + uScroll * 0.5);

                    vDisplacement = displacement;

                    vec3 newPosition = position + normal * displacement;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                varying vec3 vNormal;
                varying vec3 vPosition;
                varying float vDisplacement;

                void main() {
                    // Dynamic color - much darker and more subtle
                    vec3 color1 = vec3(0.12, 0.13, 0.28);  // Dark Indigo
                    vec3 color2 = vec3(0.01, 0.18, 0.22);  // Dark Cyan
                    vec3 color3 = vec3(0.16, 0.08, 0.25);  // Dark Purple

                    float mixFactor = sin(vPosition.x * 0.1 + uTime * 0.5) * 0.5 + 0.5;
                    float mixFactor2 = cos(vPosition.y * 0.1 + uTime * 0.3) * 0.5 + 0.5;

                    vec3 baseColor = mix(color1, color2, mixFactor);
                    baseColor = mix(baseColor, color3, mixFactor2 * 0.5);

                    // Fresnel effect for edges - subtle
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float fresnel = pow(1.0 - abs(dot(viewDirection, vNormal)), 3.0);

                    // Add subtle glow based on displacement
                    vec3 glowColor = vec3(0.15, 0.25, 0.35);
                    baseColor += glowColor * abs(vDisplacement) * 0.05;

                    // Final color with reduced fresnel
                    vec3 finalColor = baseColor + fresnel * 0.15;

                    // Add subtle wireframe-like lines
                    float line = sin(vPosition.x * 5.0) * sin(vPosition.y * 5.0) * sin(vPosition.z * 5.0);
                    finalColor += vec3(0.03, 0.06, 0.09) * smoothstep(0.8, 1.0, abs(line));

                    gl_FragColor = vec4(finalColor, 0.4);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
            wireframe: false
        });

        this.mainMesh = new THREE.Mesh(torusKnotGeometry, this.mainMaterial);
        this.mainMesh.position.set(25, 0, -10);
        this.scene.add(this.mainMesh);

        // Add wireframe overlay - darker
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a1d4a,
            wireframe: true,
            transparent: true,
            opacity: 0.08
        });
        this.wireframeMesh = new THREE.Mesh(torusKnotGeometry, wireframeMaterial);
        this.wireframeMesh.position.copy(this.mainMesh.position);

        // Store initial values for scroll animations
        this.initialCameraZ = 50;
        this.initialMainScale = 1;
        this.scene.add(this.wireframeMesh);
    }

    createParticleField() {
        const particleCount = 800;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);
        const velocities = [];

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            // Spread particles in a wider field
            positions[i3] = (Math.random() - 0.5) * 150;
            positions[i3 + 1] = (Math.random() - 0.5) * 150;
            positions[i3 + 2] = (Math.random() - 0.5) * 100 - 20;

            // Random colors - much darker and more subtle
            const colorChoice = Math.random();
            if (colorChoice < 0.33) {
                colors[i3] = 0.1;
                colors[i3 + 1] = 0.12;
                colors[i3 + 2] = 0.25;
            } else if (colorChoice < 0.66) {
                colors[i3] = 0.01;
                colors[i3 + 1] = 0.18;
                colors[i3 + 2] = 0.22;
            } else {
                colors[i3] = 0.15;
                colors[i3 + 1] = 0.08;
                colors[i3 + 2] = 0.24;
            }

            sizes[i] = Math.random() * 2 + 0.5;

            velocities.push({
                x: (Math.random() - 0.5) * 0.02,
                y: (Math.random() - 0.5) * 0.02,
                z: (Math.random() - 0.5) * 0.01
            });
        }

        this.particleVelocities = velocities;

        const particleGeometry = new THREE.BufferGeometry();
        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uMouse: { value: new THREE.Vector2(0, 0) },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                uniform float uTime;
                uniform vec2 uMouse;
                uniform float uPixelRatio;
                attribute float size;
                attribute vec3 color;
                varying vec3 vColor;

                void main() {
                    vColor = color;

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

                    // Size attenuation
                    gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);
                    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;

                void main() {
                    // Circular particle with soft edges
                    float distanceToCenter = length(gl_PointCoord - vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.3, 0.5, distanceToCenter);

                    if (alpha < 0.01) discard;

                    // Subtle glow effect
                    vec3 glowColor = vColor * 0.8;
                    gl_FragColor = vec4(glowColor, alpha * 0.4);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.particles);
    }

    createFloatingShapes() {
        this.floatingShapes = [];

        const geometries = [
            new THREE.IcosahedronGeometry(2, 0),
            new THREE.OctahedronGeometry(2, 0),
            new THREE.TetrahedronGeometry(2, 0),
            new THREE.DodecahedronGeometry(1.5, 0)
        ];

        const shapeColor = new THREE.Color(0x1a1d4a);

        for (let i = 0; i < 12; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshBasicMaterial({
                color: shapeColor,
                wireframe: true,
                transparent: true,
                opacity: 0.15
            });

            const mesh = new THREE.Mesh(geometry, material);

            mesh.position.set(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 40 - 20
            );

            mesh.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );

            mesh.userData = {
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.02,
                    y: (Math.random() - 0.5) * 0.02,
                    z: (Math.random() - 0.5) * 0.01
                },
                floatSpeed: Math.random() * 0.5 + 0.5,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };

            this.floatingShapes.push(mesh);
            this.scene.add(mesh);
        }
    }

    addEventListeners() {
        // Mouse move
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        // Scroll
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            this.scrollProgress = window.scrollY / scrollHeight;
        });

        // Resize
        window.addEventListener('resize', () => this.onResize());
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.particles) {
            this.particles.material.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = this.clock.getDelta();
        this.time += delta;

        // Smooth mouse follow
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Update main geometry with scroll-based animations
        if (this.mainMesh && this.mainMaterial) {
            // Rotation based on time and scroll - faster rotation on scroll
            this.mainMesh.rotation.x = this.time * 0.1 + this.scrollProgress * Math.PI * 4;
            this.mainMesh.rotation.y = this.time * 0.15 + this.scrollProgress * Math.PI * 2;
            this.mainMesh.rotation.z = Math.sin(this.time * 0.2) * 0.2 + this.scrollProgress * 0.5;

            // Position influenced by mouse and scroll - moves from right to left
            this.mainMesh.position.x = 25 + this.mouse.x * 5 - this.scrollProgress * 50;
            this.mainMesh.position.y = this.mouse.y * 5 + this.scrollProgress * 8;

            // Scroll-based ZOOM effect - scale increases as you scroll
            const scrollScale = this.initialMainScale + this.scrollProgress * 0.8;
            this.mainMesh.scale.set(scrollScale, scrollScale, scrollScale);

            // Fade out slightly as scrolling
            this.mainMaterial.uniforms.uTime.value = this.time;
            this.mainMaterial.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
            this.mainMaterial.uniforms.uScroll.value = this.scrollProgress;

            // Sync wireframe with scale
            if (this.wireframeMesh) {
                this.wireframeMesh.rotation.copy(this.mainMesh.rotation);
                this.wireframeMesh.position.copy(this.mainMesh.position);
                this.wireframeMesh.scale.copy(this.mainMesh.scale);
                // Reduce wireframe opacity on scroll
                this.wireframeMesh.material.opacity = 0.08 * (1 - this.scrollProgress * 0.7);
            }
        }

        // Update background shader
        if (this.bgMesh) {
            this.bgMesh.material.uniforms.uTime.value = this.time;
            this.bgMesh.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
        }

        // Animate particles
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;

            for (let i = 0; i < positions.length; i += 3) {
                const idx = i / 3;
                const vel = this.particleVelocities[idx];

                // Apply velocity
                positions[i] += vel.x;
                positions[i + 1] += vel.y;
                positions[i + 2] += vel.z;

                // Wave motion
                positions[i + 1] += Math.sin(this.time + positions[i] * 0.05) * 0.02;

                // Mouse repulsion
                const dx = this.mouse.x * 50 - positions[i];
                const dy = this.mouse.y * 50 - positions[i + 1];
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 30) {
                    const force = (30 - dist) / 30 * 0.1;
                    positions[i] -= dx * force * 0.02;
                    positions[i + 1] -= dy * force * 0.02;
                }

                // Boundary wrapping
                if (positions[i] > 75) positions[i] = -75;
                if (positions[i] < -75) positions[i] = 75;
                if (positions[i + 1] > 75) positions[i + 1] = -75;
                if (positions[i + 1] < -75) positions[i + 1] = 75;
            }

            this.particles.geometry.attributes.position.needsUpdate = true;
            this.particles.material.uniforms.uTime.value = this.time;
            this.particles.material.uniforms.uMouse.value.set(this.mouse.x, this.mouse.y);
        }

        // Animate floating shapes
        this.floatingShapes.forEach(shape => {
            shape.rotation.x += shape.userData.rotationSpeed.x;
            shape.rotation.y += shape.userData.rotationSpeed.y;
            shape.rotation.z += shape.userData.rotationSpeed.z;

            // Float animation
            shape.position.y = shape.userData.originalY +
                Math.sin(this.time * shape.userData.floatSpeed + shape.userData.floatOffset) * 3;

            // Parallax with scroll
            shape.position.z = -20 - this.scrollProgress * 30;
            shape.material.opacity = 0.4 - this.scrollProgress * 0.3;
        });

        // Animate lights
        if (this.pointLight1) {
            this.pointLight1.position.x = Math.sin(this.time * 0.3) * 30;
            this.pointLight1.position.y = Math.cos(this.time * 0.3) * 30;
        }
        if (this.pointLight2) {
            this.pointLight2.position.x = -Math.cos(this.time * 0.4) * 30;
            this.pointLight2.position.y = -Math.sin(this.time * 0.4) * 30;
        }

        // Camera movement with scroll-based zoom
        this.camera.position.x = this.mouse.x * 3;
        this.camera.position.y = this.mouse.y * 2;
        // Zoom in as user scrolls - camera moves closer
        this.camera.position.z = this.initialCameraZ - this.scrollProgress * 25;
        this.camera.lookAt(this.scrollProgress * 5, 0, 0);

        // Render
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for the loading screen
    setTimeout(() => {
        new ThreeBackground();
    }, 500);
});
