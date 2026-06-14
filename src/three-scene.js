/* ==========================================================================
   3D LIVE PORTFOLIO - THREE.JS ENGINE (VANILLA THREE.JS) - PREMIUM UPGRADE
   ========================================================================== */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class ThreeEngine {
  constructor() {
    this.canvas = document.getElementById('three-canvas');
    if (!this.canvas) return;

    this.hudTelemetry = document.getElementById('hud-telemetry');
    this.hudFps = document.getElementById('hud-fps');
    this.lastFpsUpdate = 0;
    this.frames = 0;

    // Active particle explosions array
    this.bursts = [];

    this.initScene();
    this.initLights();
    this.initGlobe();
    this.initParticles();
    this.initControls();
    
    this.animate();

    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // Add Click listener for deploying particle bursts
    this.canvas.addEventListener('click', this.onCanvasClick.bind(this));

    // Telemetry log items
    this.logItems = [
      "AI_MODEL_OPTIMIZING", "POSTGRESQL_INDEX_SCAN", "REACT_DOM_HYDRATING", 
      "FASTIFY_API_LISTENING", "MONGO_DB_INDEXING", "VITE_HOT_RELOAD_READY",
      "MATLAB_REGRESSION_CALC", "ARVR_MESH_RENDERING", "LEETCODE_DSA_RESOLVED",
      "ECOTRADE_ORDER_STABLE", "EXPLORE_VISTA_ROUTING", "KAFKA_TOPIC_STREAMING"
    ];
    this.lastLogChange = 0;
  }

  // Initialize Scene, Camera, and WebGL Renderer
  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030308, 0.015);

    this.camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.z = 45;
    this.camera.position.y = 8;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
  }

  // Setup Ambient and Accent Lighting
  initLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.15);
    this.scene.add(ambientLight);

    // Glowing Neon Lights (Cyan & Purple)
    this.cyanLight = new THREE.PointLight(0x00f2fe, 6, 80);
    this.cyanLight.position.set(-30, 20, 20);
    this.scene.add(this.cyanLight);

    this.purpleLight = new THREE.PointLight(0x9b51e0, 5, 80);
    this.purpleLight.position.set(30, -20, 20);
    this.scene.add(this.purpleLight);
  }

  // Create the Double-Shell Gyroscopic Wireframe Globe
  initGlobe() {
    this.globeGroup = new THREE.Group();
    this.scene.add(this.globeGroup);

    const radius = 15;
    const segments = 24;

    // 1. Core Sphere (Semi-transparent dark mesh to block back particles)
    const sphereGeo = new THREE.SphereGeometry(radius - 0.2, segments, segments);
    const sphereMat = new THREE.MeshBasicMaterial({
      color: 0x030308,
      transparent: true,
      opacity: 0.88
    });
    this.globeCore = new THREE.Mesh(sphereGeo, sphereMat);
    this.globeGroup.add(this.globeCore);

    // 2. Shell 1: Inner cyan wireframe structure
    const wireGeo = new THREE.SphereGeometry(radius, segments, segments);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x14142b,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    this.globeWire = new THREE.Mesh(wireGeo, wireMat);
    this.globeGroup.add(this.globeWire);

    // 3. Shell 2: Outer Purple Gyroscopic Ring Shell (Rotating oppositely!)
    const outerWireGeo = new THREE.SphereGeometry(radius + 1.2, 16, 16);
    const outerWireMat = new THREE.MeshBasicMaterial({
      color: 0x9b51e0,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    this.outerGlobeWire = new THREE.Mesh(outerWireGeo, outerWireMat);
    this.outerGlobeWire.rotation.x = Math.PI / 4;
    this.globeGroup.add(this.outerGlobeWire);

    // 4. Digital Glowing Server Dots (Placed at vertices of inner sphere)
    const pointsGeo = new THREE.BufferGeometry();
    const positionAttribute = wireGeo.getAttribute('position');
    pointsGeo.setAttribute('position', positionAttribute);

    const pointsMat = new THREE.PointsMaterial({
      color: 0x00f2fe,
      size: 0.38,
      transparent: true,
      opacity: 0.95,
      sizeAttenuation: true
    });
    this.globePoints = new THREE.Points(pointsGeo, pointsMat);
    this.globeGroup.add(this.globePoints);

    // 5. Orbiting Telemetry Rings/Paths (Simulating full-stack API connections)
    this.orbitingPaths = [];
    const colors = [0x00f2fe, 0x9b51e0, 0x10b981];
    
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.RingGeometry(radius + 2.0 + i * 2.0, radius + 2.05 + i * 2.0, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colors[i],
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.18
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      
      // Rotate rings at different angles
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.y = Math.random() * Math.PI;
      this.globeGroup.add(ring);
      this.orbitingPaths.push({ mesh: ring, speed: 0.006 * (i + 1) });

      // Add a packet traveler (glowing particle) on each path
      const packetGeo = new THREE.SphereGeometry(0.24, 8, 8);
      const packetMat = new THREE.MeshBasicMaterial({ color: colors[i] });
      const packet = new THREE.Mesh(packetGeo, packetMat);
      this.globeGroup.add(packet);
      this.orbitingPaths[i].packet = packet;
      this.orbitingPaths[i].angle = Math.random() * Math.PI * 2;
      this.orbitingPaths[i].radius = radius + 2.0 + i * 2.0;
    }
  }

  // Create dynamic particle starfield
  initParticles() {
    this.particleCount = 600;
    this.particlesGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const speeds = [];

    for (let i = 0; i < this.particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 120;
      positions[i + 1] = (Math.random() - 0.5) * 85;
      positions[i + 2] = (Math.random() - 0.5) * 85;

      speeds.push({
        x: (Math.random() - 0.5) * 0.06,
        y: (Math.random() - 0.5) * 0.06,
        z: (Math.random() - 0.5) * 0.06
      });
    }

    this.particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleSpeeds = speeds;

    const particleTexture = this.generateParticleTexture();

    const particlesMat = new THREE.PointsMaterial({
      color: 0x9b51e0,
      size: 0.6,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleSystem = new THREE.Points(this.particlesGeo, particlesMat);
    this.scene.add(this.particleSystem);
  }

  // Programmatic canvas gradient to make beautiful glowing particles
  generateParticleTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(
      size / 2, size / 2, 0,
      size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(0,242,254,0.8)');
    gradient.addColorStop(0.5, 'rgba(155,81,224,0.3)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  // Deploy interactive particle bursts on Click
  onCanvasClick(e) {
    // Determine 3D coordinates based on mouse position on canvas
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    );

    // Unproject to map to 3D space near the core wireframe globe
    const vector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
    vector.unproject(this.camera);
    const dir = vector.sub(this.camera.position).normalize();
    const distance = -this.camera.position.z / dir.z;
    const pos = this.camera.position.clone().add(dir.multiplyScalar(distance));

    // Spawn burst at calculated position
    this.spawnBurst(pos);
  }

  // Spawns 40 glowing particles radiating from a point coordinate
  spawnBurst(pos) {
    const count = 40;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = [];
    const colors = [0x00f2fe, 0x9b51e0, 0x10b981];
    
    // Choose random color for this click packet
    const col = colors[Math.floor(Math.random() * colors.length)];

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Start at explosion center
      positions[idx] = pos.x;
      positions[idx + 1] = pos.y;
      positions[idx + 2] = pos.z;

      // Random expanding velocities
      const speed = 0.15 + Math.random() * 0.25;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);

      velocities.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.sin(phi) * Math.sin(theta) * speed,
        z: Math.cos(phi) * speed
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: col,
      size: 0.65,
      map: this.generateParticleTexture(),
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const burstSystem = new THREE.Points(geometry, material);
    this.scene.add(burstSystem);

    this.bursts.push({
      mesh: burstSystem,
      velocities: velocities,
      age: 0,
      maxAge: 60 // 60 frames lifetime
    });
  }

  // Setup standard controls with OrbitControls
  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.zoomSpeed = 0.5;
    this.controls.maxDistance = 100;
    this.controls.minDistance = 20;

    this.mouseX = 0;
    this.mouseY = 0;
  }

  // Window Resize handler
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  // Track Mouse movement to dynamically skew camera and lights slightly
  onMouseMove(e) {
    this.mouseX = (e.clientX / window.innerWidth) - 0.5;
    this.mouseY = (e.clientY / window.innerHeight) - 0.5;
  }

  // Main Render Loop
  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const time = Date.now() * 0.001;

    // 1. Update FPS Counter dynamically on the HUD bar
    this.frames++;
    if (Date.now() - this.lastFpsUpdate >= 1000) {
      if (this.hudFps) {
        const calculatedFps = (this.frames * 1000) / (Date.now() - this.lastFpsUpdate);
        this.hudFps.textContent = calculatedFps.toFixed(1);
      }
      this.frames = 0;
      this.lastFpsUpdate = Date.now();
    }

    // 2. Animate random logging items to HUD Telemetry
    if (Date.now() - this.lastLogChange >= 2500) {
      if (this.hudTelemetry) {
        const item = this.logItems[Math.floor(Math.random() * this.logItems.length)];
        this.hudTelemetry.textContent = item;
      }
      this.lastLogChange = Date.now();
    }

    // 3. Orbit controls dampening
    if (this.controls) this.controls.update();

    // 4. Rotate the Globe Group & shells
    if (this.globeGroup) {
      this.globeGroup.rotation.y = time * 0.05;
      this.globeGroup.position.y = Math.sin(time * 0.5) * 1.5;

      // Spin outer wire shell oppositely on X/Z coordinates
      if (this.outerGlobeWire) {
        this.outerGlobeWire.rotation.y = -time * 0.07;
        this.outerGlobeWire.rotation.z = time * 0.03;
      }
    }

    // 5. Animate the Packet travelers along their orbit paths
    if (this.orbitingPaths) {
      this.orbitingPaths.forEach((path) => {
        path.angle += path.speed;
        const x = Math.cos(path.angle) * path.radius;
        const z = Math.sin(path.angle) * path.radius;
        
        path.packet.position.set(x, 0, z);
        path.packet.position.applyEuler(path.mesh.rotation);
      });
    }

    // 6. Animate floating starfield particles
    if (this.particleSystem) {
      const positionAttr = this.particlesGeo.getAttribute('position');
      const arr = positionAttr.array;

      for (let i = 0; i < this.particleCount; i++) {
        const idx = i * 3;
        const speed = this.particleSpeeds[i];

        arr[idx] += speed.x;
        arr[idx + 1] += speed.y;
        arr[idx + 2] += speed.z;

        if (Math.abs(arr[idx]) > 75) speed.x = -speed.x;
        if (Math.abs(arr[idx + 1]) > 55) speed.y = -speed.y;
        if (Math.abs(arr[idx + 2]) > 55) speed.z = -speed.z;
      }
      positionAttr.needsUpdate = true;
    }

    // 7. Update Click Particle Bursts
    for (let b = this.bursts.length - 1; b >= 0; b--) {
      const burst = this.bursts[b];
      burst.age++;

      // If max age reached, delete
      if (burst.age >= burst.maxAge) {
        this.scene.remove(burst.mesh);
        burst.mesh.geometry.dispose();
        burst.mesh.material.dispose();
        this.bursts.splice(b, 1);
        continue;
      }

      // Dynamic expansion
      const positionAttr = burst.mesh.geometry.getAttribute('position');
      const arr = positionAttr.array;

      for (let i = 0; i < velocities.length; i++) {
        const idx = i * 3;
        const vel = burst.velocities[i];

        arr[idx] += vel.x;
        arr[idx + 1] += vel.y;
        arr[idx + 2] += vel.z;

        // Apply friction and slight gravity drift
        vel.x *= 0.96;
        vel.y *= 0.96;
        vel.z *= 0.96;
        vel.y -= 0.005; // gravity pull
      }

      positionAttr.needsUpdate = true;
      // Fade out dynamically
      burst.mesh.material.opacity = 1.0 - (burst.age / burst.maxAge);
    }

    // 8. Dynamic Camera/Light Reactivity based on Mouse Coordinate
    if (this.camera && !this.controls.state === -1) {
      this.camera.position.x += (this.mouseX * 25 - this.camera.position.x) * 0.05;
      this.camera.position.y += (-this.mouseY * 20 + 8 - this.camera.position.y) * 0.05;
    }

    if (this.cyanLight) {
      this.cyanLight.position.x = -30 + Math.sin(time) * 10;
      this.cyanLight.position.y = 20 + Math.cos(time) * 10;
    }
    if (this.purpleLight) {
      this.purpleLight.position.x = 30 + Math.cos(time) * 10;
      this.purpleLight.position.y = -20 + Math.sin(time) * 10;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Dummy object to satisfy velocities inside inner burst scope
const velocities = Array.from({length: 40});

export default ThreeEngine;
