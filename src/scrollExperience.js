import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finishInitialLoad = () => {
  const startedAt = window.__bullfyLoadStartedAt || performance.now();
  const elapsed = performance.now() - startedAt;
  const delay = Math.max(0, 900 - elapsed);

  window.setTimeout(() => {
    document.body.classList.remove('is-loading');
    document.body.classList.add('hero-scene-ready');
  }, delay);
};

const initMagneticButtons = () => {
  document.querySelectorAll('button, .btn-white, .btn-outline, .btn-primary-glow, .social-icon').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const bounds = button.getBoundingClientRect();
      const x = event.clientX - bounds.left - bounds.width / 2;
      const y = event.clientY - bounds.top - bounds.height / 2;

      gsap.to(button, {
        x: x * 0.12,
        y: y * 0.18,
        rotateX: y * -0.05,
        rotateY: x * 0.05,
        duration: 0.35,
        ease: 'power3.out',
      });
    });

    button.addEventListener('pointerleave', () => {
      gsap.to(button, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.45)',
      });
    });
  });
};

const initFloatingChrome = () => {
  const intro = document.querySelector('.intro-logo-section');
  const hero = document.querySelector('.main-grid-container');
  let lastScrollY = window.scrollY;
  let ticking = false;

  const updateChrome = () => {
    const currentY = window.scrollY;
    const scrollingUp = currentY < lastScrollY - 8;
    const scrollingDown = currentY > lastScrollY + 8;
    const introEnd = intro ? intro.offsetTop + intro.offsetHeight : window.innerHeight;
    const heroEnd = hero ? hero.offsetTop + hero.offsetHeight : introEnd + window.innerHeight;
    const canShowNav = currentY > introEnd * 0.65;

    if (scrollingUp && canShowNav) {
      document.body.classList.add('nav-visible');
    } else if (scrollingDown || currentY < 80) {
      document.body.classList.remove('nav-visible');
    }

    document.body.classList.toggle('show-page-watermark', currentY > heroEnd - window.innerHeight * 0.35);
    lastScrollY = currentY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(updateChrome);
  }, { passive: true });

  updateChrome();
};

const initHeroMotion = () => {
  const heroItems = gsap.utils.toArray('.badge-pill, .hero-title, .hero-subtitle, .hero-actions, .trust-score');
  const videoCard = document.querySelector('.video-preview-card');
  const heroStage = document.querySelector('.hero-logo-stage');
  const scrollCue = document.querySelector('.hero-scroll-cue');

  gsap.set(heroItems, {
    x: -36,
    y: 34,
  });

  if (videoCard) {
    gsap.set(videoCard, {
      y: 54,
      rotateX: -7,
      rotateY: 8,
    });

    gsap.to(videoCard, {
      y: -10,
      rotateX: 1.6,
      rotateY: -1.2,
      duration: 4.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: 1.5,
    });
  }

  ScrollTrigger.create({
    trigger: '.intro-logo-section',
    start: 'top top',
    end: 'bottom top',
    onUpdate: (self) => {
      document.body.classList.toggle('hero-content-ready', self.progress > 0.72);
    },
    onLeave: () => document.body.classList.add('hero-content-ready'),
    onEnterBack: (self) => {
      document.body.classList.toggle('hero-content-ready', self.progress > 0.72);
    },
  });

  const introTimeline = gsap.timeline({
    scrollTrigger: {
      trigger: '.intro-logo-section',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });

  if (heroStage) {
    introTimeline.to(heroStage, {
      yPercent: -18,
      scale: 0.72,
      opacity: 0,
      ease: 'none',
    }, 0.22);
  }

  if (scrollCue) {
    introTimeline.to(scrollCue, {
      y: -24,
      opacity: 0,
      ease: 'none',
    }, 0);
  }

  introTimeline.to(heroItems, {
    x: 0,
    y: 0,
    stagger: 0.035,
    ease: 'none',
  }, 0.62);

  if (videoCard) {
    introTimeline.to(videoCard, {
      y: 0,
      rotateX: 0,
      rotateY: 0,
      ease: 'none',
    }, 0.68);
  }

  gsap.to('.hero-left', {
    y: -28,
    ease: 'none',
    scrollTrigger: {
      trigger: '.main-grid-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });

  gsap.to('.hero-right', {
    y: -52,
    ease: 'none',
    scrollTrigger: {
      trigger: '.main-grid-container',
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
};

const initScrollReveals = () => {
  const revealSets = [
    { selector: '.section-badge, .section-title, .section-subtitle', x: 0, y: 60, stagger: 0.08 },
    { selector: '.tabs-container, .account-size-selector, .plan-card', x: 0, y: 80, stagger: 0.12 },
    { selector: '.social-card-left', x: -80, y: 30, stagger: 0 },
    { selector: '.social-card-right', x: 90, y: -10, stagger: 0 },
    { selector: '.testimonials-carousel-container', x: 0, y: 90, stagger: 0 },
    { selector: '.step-card', x: -70, y: 30, stagger: 0.1 },
    { selector: '.footer-container', x: 0, y: 60, stagger: 0 },
  ];

  revealSets.forEach(({ selector, x, y, stagger }) => {
    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;

    elements.forEach((element, index) => {
      gsap.fromTo(element, {
        autoAlpha: 0,
        x,
        y,
        rotateX: y ? 8 : 0,
        filter: 'blur(14px)',
      }, {
        autoAlpha: 1,
        x: 0,
        y: 0,
        rotateX: 0,
        filter: 'blur(0px)',
        duration: 1.05,
        delay: index * stagger,
        ease: 'power4.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          once: true,
        },
      });
    });
  });

  gsap.utils.toArray('.section-container').forEach((section) => {
    gsap.fromTo(section, {
      '--section-light': '0%',
    }, {
      '--section-light': '100%',
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  gsap.utils.toArray('.plan-card, .social-card-left, .social-card-right, .testimonials-carousel-container').forEach((card, index) => {
    gsap.to(card, {
      y: index % 2 === 0 ? -38 : -24,
      rotateX: index % 2 === 0 ? 2.5 : -2,
      ease: 'none',
      scrollTrigger: {
        trigger: card,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
      },
    });
  });

  ScrollTrigger.refresh();
};

const createPointCloud = () => {
  const geometry = new THREE.BufferGeometry();
  const count = 240;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const colorA = new THREE.Color('#3b82f6');
  const colorB = new THREE.Color('#22d3ee');

  for (let i = 0; i < count; i += 1) {
    const radius = 3.5 + Math.random() * 6;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 8;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 2;

    const mixed = colorA.clone().lerp(colorB, Math.random());
    colors[i * 3] = mixed.r;
    colors[i * 3 + 1] = mixed.g;
    colors[i * 3 + 2] = mixed.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
};

const createPlanetMaterial = () => new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uOpacity: { value: 1 },
    uBase: { value: new THREE.Color('#030a15') },
    uOcean: { value: new THREE.Color('#073b67') },
    uLand: { value: new THREE.Color('#42a5d8') },
    uIce: { value: new THREE.Color('#b9e6ff') },
  },
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uBase;
    uniform vec3 uOcean;
    uniform vec3 uLand;
    uniform vec3 uIce;

    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vWorldPosition;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);

      return mix(
        mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
        mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
        u.y
      );
    }

    float fbm(vec2 p) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 6; i++) {
        value += amplitude * noise(p);
        p *= 2.02;
        amplitude *= 0.52;
      }
      return value;
    }

    void main() {
      vec2 planetUv = vec2(vUv.x + uTime * 0.018, vUv.y);
      float continents = fbm(planetUv * vec2(5.2, 2.8));
      float detail = fbm(planetUv * vec2(18.0, 8.0));
      float landField = continents + detail * 0.24;
      float landMask = smoothstep(0.48, 0.58, landField);
      float polarMask = smoothstep(0.78, 0.98, abs(vUv.y - 0.5) * 2.0);
      float coastline = smoothstep(0.47, 0.5, landField) - smoothstep(0.59, 0.63, landField);

      vec3 color = mix(uOcean, uLand, landMask);
      color = mix(color, uIce, polarMask * 0.52);
      color = mix(uBase, color, 0.94);

      vec3 lightDirection = normalize(vec3(-0.25, 0.55, 0.82));
      float light = max(dot(normalize(vNormal), lightDirection), 0.0);
      float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
      float clouds = smoothstep(0.58, 0.74, fbm(vec2(vUv.x + uTime * 0.04, vUv.y) * vec2(10.0, 4.0)));

      color *= 0.42 + light * 1.32;
      color += vec3(0.2, 0.78, 1.0) * coastline * 0.42;
      color += vec3(0.42, 0.72, 1.0) * rim * 0.52;
      color = mix(color, vec3(0.86, 0.96, 1.0), clouds * 0.16);

      gl_FragColor = vec4(color, uOpacity);
    }
  `,
});

const createAtmosphereMaterial = () => new THREE.ShaderMaterial({
  uniforms: {
    uGlow: { value: new THREE.Color('#5fb7ff') },
    uOpacity: { value: 1 },
  },
  vertexShader: `
    varying vec3 vNormal;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uGlow;
    uniform float uOpacity;
    varying vec3 vNormal;

    void main() {
      float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
      gl_FragColor = vec4(uGlow, intensity * 0.42 * uOpacity);
    }
  `,
  blending: THREE.AdditiveBlending,
  transparent: true,
  side: THREE.BackSide,
  depthWrite: false,
});

const prepareBullfyLogoModel = (model, targetSize = 2.6) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const logoMaterials = [];

  model.position.sub(center);
  model.scale.setScalar(targetSize / maxDimension);

  model.traverse((child) => {
    if (!child.isMesh) return;

    child.geometry.computeVertexNormals();
    child.material = new THREE.MeshPhysicalMaterial({
      color: '#1c96d4',
      emissive: '#0ea5e9',
      emissiveIntensity: 0.42,
      metalness: 0.46,
      roughness: 0.16,
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
    });
    logoMaterials.push(child.material);
  });

  return logoMaterials;
};

const degreesToRadians = (degrees) => degrees * Math.PI / 180;

const normalizeLongitude = (longitude) => {
  let normalized = longitude;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
};

const ellipseMask = (longitude, latitude, centerLongitude, centerLatitude, width, height, tilt = 0) => {
  const dx = normalizeLongitude(longitude - degreesToRadians(centerLongitude));
  const dy = latitude - degreesToRadians(centerLatitude);
  const cos = Math.cos(tilt);
  const sin = Math.sin(tilt);
  const rx = dx * cos - dy * sin;
  const ry = dx * sin + dy * cos;

  return (rx / degreesToRadians(width)) ** 2 + (ry / degreesToRadians(height)) ** 2;
};

const isContinentPoint = (position) => {
  const radius = Math.hypot(position.x, position.y, position.z);
  if (!radius) return false;

  const latitude = Math.asin(position.y / radius);
  const longitude = Math.atan2(position.z, position.x);
  const masks = [
    ellipseMask(longitude, latitude, -103, 46, 42, 24, -0.2),
    ellipseMask(longitude, latitude, -95, 21, 22, 13, 0.2),
    ellipseMask(longitude, latitude, -61, -19, 17, 34, -0.36),
    ellipseMask(longitude, latitude, -43, 71, 18, 8, 0.1),
    ellipseMask(longitude, latitude, 16, 8, 24, 34, -0.08),
    ellipseMask(longitude, latitude, 68, 48, 70, 24, 0.05),
    ellipseMask(longitude, latitude, 81, 22, 34, 20, -0.15),
    ellipseMask(longitude, latitude, 134, -25, 22, 13, 0.08),
    ellipseMask(longitude, latitude, 0, -78, 180, 10, 0),
  ];
  const closestMask = Math.min(...masks);
  const coastlineNoise = Math.sin(longitude * 9.0 + latitude * 4.0) * 0.1
    + Math.sin(longitude * 17.0 - latitude * 11.0) * 0.055;

  return closestMask < 1.02 + coastlineNoise;
};

const filterPointGeometryToContinents = (geometry, center) => {
  const position = geometry.getAttribute('position');
  if (!position) return geometry;

  const filteredPositions = [];
  const point = new THREE.Vector3();

  for (let index = 0; index < position.count; index += 1) {
    point.set(
      position.getX(index) - center.x,
      position.getY(index) - center.y,
      position.getZ(index) - center.z,
    );

    if (!isContinentPoint(point)) continue;

    filteredPositions.push(
      position.getX(index),
      position.getY(index),
      position.getZ(index),
    );
  }

  const nextGeometry = new THREE.BufferGeometry();
  nextGeometry.setAttribute('position', new THREE.Float32BufferAttribute(filteredPositions, 3));
  return nextGeometry;
};

const preparePlanetModel = (model, targetSize = 3.52) => {
  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z) || 1;
  const modelMaterials = [];

  model.position.sub(center);
  model.scale.setScalar(targetSize / maxDimension);
  model.rotation.set(0.08, -0.36, -0.08);

  model.traverse((child) => {
    if (!child.isMesh && !child.isPoints) return;

    if (child.geometry.computeVertexNormals) {
      child.geometry.computeVertexNormals();
    }

    if (child.isPoints) {
      child.geometry = filterPointGeometryToContinents(child.geometry, center);
      child.material = new THREE.PointsMaterial({
        color: '#b8f2ff',
        size: 0.026,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      modelMaterials.push(child.material);
      return;
    }

    const source = Array.isArray(child.material) ? child.material : [child.material];
    const preparedMaterials = source.map((material) => {
      const nextMaterial = material?.clone ? material.clone() : new THREE.MeshStandardMaterial();
      nextMaterial.transparent = true;
      nextMaterial.opacity = 0;
      nextMaterial.depthWrite = true;
      nextMaterial.roughness = Math.min(nextMaterial.roughness ?? 0.7, 0.78);
      nextMaterial.metalness = Math.min(nextMaterial.metalness ?? 0, 0.12);
      if ('color' in nextMaterial && nextMaterial.color) {
        nextMaterial.color.lerp(new THREE.Color('#5d7287'), 0.5);
        nextMaterial.color.multiplyScalar(0.64);
      }
      if ('emissive' in nextMaterial) {
        nextMaterial.emissive = new THREE.Color('#021527');
        nextMaterial.emissiveIntensity = 0.04;
      }
      modelMaterials.push(nextMaterial);
      return nextMaterial;
    });

    child.material = Array.isArray(child.material) ? preparedMaterials : preparedMaterials[0];
    child.castShadow = false;
    child.receiveShadow = false;
  });

  return modelMaterials;
};

const initHeroLogoModel = () => {
  const canvas = document.getElementById('hero-logo-canvas');
  const heroStage = canvas?.closest('.hero-logo-stage');
  if (!canvas || !heroStage) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const logoAnchor = new THREE.Group();
  logoAnchor.position.set(0, 0, 0);
  logoAnchor.rotation.set(-0.1, -0.25, 0);
  scene.add(logoAnchor);

  scene.add(new THREE.AmbientLight('#6abfff', 1.15));
  const keyLight = new THREE.DirectionalLight('#d9f3ff', 3.1);
  keyLight.position.set(-2.2, 2.6, 4);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight('#1c96d4', 2.2, 8);
  rimLight.position.set(2.4, -1.6, 2.2);
  scene.add(rimLight);

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.floor(bounds.width));
    const height = Math.max(1, Math.floor(bounds.height));
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize);

  const loader = new GLTFLoader();
  let logoModel;
  let isVisible = true;

  const visibilityObserver = new IntersectionObserver((entries) => {
    isVisible = entries.some((entry) => entry.isIntersecting);
  }, { threshold: 0.05 });
  visibilityObserver.observe(heroStage);

  loader.load('/model.gltf', (gltf) => {
    logoModel = gltf.scene;
    const logoMaterials = prepareBullfyLogoModel(logoModel, 4.35);
    logoAnchor.add(logoModel);
    document.body.classList.add('hero-logo-model-loaded');

    gsap.fromTo(logoMaterials, {
      opacity: 0.72,
    }, {
      opacity: 0.96,
      duration: 0.9,
      stagger: 0.035,
      ease: 'power2.out',
      delay: 0.2,
    });
    gsap.fromTo(logoAnchor.scale, {
      x: 0.82,
      y: 0.82,
      z: 0.82,
    }, {
      x: 1,
      y: 1,
      z: 1,
      duration: 1.15,
      ease: 'power3.out',
      delay: 0.2,
    });
    window.dispatchEvent(new CustomEvent('bullfy:hero-logo-ready'));
    finishInitialLoad();
  }, undefined, () => {
    window.dispatchEvent(new CustomEvent('bullfy:hero-logo-ready'));
    finishInitialLoad();
  });

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();

    if (isVisible) {
      logoAnchor.rotation.y = -0.25 + elapsed * 0.42;
      logoAnchor.rotation.x = -0.1 + Math.sin(elapsed * 0.7) * 0.055;
      logoAnchor.rotation.z = Math.sin(elapsed * 0.5) * 0.025;
      if (logoModel) {
        logoModel.position.y = Math.sin(elapsed * 0.8) * 0.025;
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  };

  animate();
};

const initThreeScene = () => {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;
  const propSection = document.getElementById('prop');

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: 'high-performance',
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  group.position.set(1.05, -3.15, -0.85);
  group.scale.setScalar(0.96);
  scene.add(group);

  const planetAnchor = new THREE.Group();
  group.add(planetAnchor);

  const oceanMaterial = new THREE.MeshPhysicalMaterial({
    color: '#071d31',
    roughness: 0.82,
    metalness: 0.02,
    clearcoat: 0.22,
    clearcoatRoughness: 0.65,
    transparent: true,
    opacity: 0,
  });
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.74, 48, 48),
    oceanMaterial,
  );

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.84, 48, 48),
    createAtmosphereMaterial(),
  );

  const terminatorGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.755, 48, 48),
    new THREE.MeshBasicMaterial({
      color: '#0ea5e9',
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  planetAnchor.add(planet, atmosphere, terminatorGlow);

  const keyLight = new THREE.DirectionalLight('#9ecfff', 1.35);
  keyLight.position.set(-3.8, 3.2, 4.6);
  const fillLight = new THREE.PointLight('#1d4ed8', 0.42, 14);
  fillLight.position.set(3.4, -1.8, 2.2);
  scene.add(keyLight);
  scene.add(fillLight);
  scene.add(new THREE.AmbientLight('#0d1b38', 0.38));

  const planetModelState = {
    model: null,
    materials: [],
    opacity: { value: 0 },
    loaded: false,
  };

  const modelLoader = new GLTFLoader();
  modelLoader.load('/a_windy_day/scene.gltf', (gltf) => {
    const model = gltf.scene;
    const modelMaterials = preparePlanetModel(model);

    planetModelState.model = model;
    planetModelState.materials = modelMaterials;
    planetModelState.loaded = true;
    planetAnchor.add(model);

    gsap.to(modelMaterials, {
      opacity: planetModelState.opacity.value,
      duration: 0.75,
      ease: 'power2.out',
    });
  }, undefined, () => {
    planetModelState.loaded = false;
  });

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize);

  let isSceneActive = false;
  const setPlanetVisible = (visible) => {
    document.body.classList.toggle('planet-visible', visible);
    isSceneActive = visible;
    if (!visible) {
      renderer.clear();
    }
  };

  if (propSection) {
    ScrollTrigger.create({
      trigger: propSection,
      start: 'top bottom',
      endTrigger: document.body,
      end: 'bottom bottom',
      onEnter: () => setPlanetVisible(true),
      onEnterBack: () => setPlanetVisible(true),
      onLeaveBack: () => setPlanetVisible(false),
    });

    setPlanetVisible(window.scrollY + window.innerHeight >= propSection.offsetTop);
  }

  gsap.to(group.position, {
    x: 0.35,
    y: -1.35,
    z: -1.45,
    ease: 'none',
    scrollTrigger: {
      trigger: '#prop',
      start: 'top bottom',
      end: 'bottom 55%',
      scrub: true,
    },
  });

  planet.material.opacity = 0;
  atmosphere.material.uniforms.uOpacity.value = 0;
  terminatorGlow.material.opacity = 0;

  gsap.to(planet.material, {
    opacity: 0.86,
    ease: 'none',
    scrollTrigger: {
      trigger: '#prop',
      start: 'top 90%',
      end: 'top 35%',
      scrub: true,
    },
  });
  gsap.to(planetModelState.opacity, {
    value: 0.95,
    ease: 'none',
    onUpdate: () => {
      if (!planetModelState.loaded) return;
      planetModelState.materials.forEach((material) => {
        material.opacity = planetModelState.opacity.value;
      });
    },
    scrollTrigger: {
      trigger: '#prop',
      start: 'top 90%',
      end: 'top 35%',
      scrub: true,
    },
  });
  gsap.to(atmosphere.material.uniforms.uOpacity, {
    value: 0.42,
    ease: 'none',
    scrollTrigger: {
      trigger: '#prop',
      start: 'top 90%',
      end: 'top 35%',
      scrub: true,
    },
  });
  gsap.to(terminatorGlow.material, {
    opacity: 0.028,
    ease: 'none',
    scrollTrigger: {
      trigger: '#prop',
      start: 'top 90%',
      end: 'top 35%',
      scrub: true,
    },
  });
  gsap.to(planetAnchor.scale, {
    x: 1.16,
    y: 1.16,
    z: 1.16,
    ease: 'none',
    scrollTrigger: {
      trigger: '#testimonials',
      start: 'top 80%',
      end: 'bottom 20%',
      scrub: true,
    },
  });

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();

    if (isSceneActive && !document.hidden) {
      planetAnchor.rotation.y += 0.0023;
      planetAnchor.rotation.x = Math.sin(elapsed * 0.12) * 0.04;
      atmosphere.rotation.y += 0.0013;
      terminatorGlow.rotation.y = planetAnchor.rotation.y;

      group.rotation.y += (pointer.x * 0.12 - group.rotation.y * 0.02) * 0.008;
      group.rotation.x += (-pointer.y * 0.08 - group.rotation.x * 0.01) * 0.008;

      renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
  };

  animate();
};

const initPlanetWhenNeeded = () => {
  const propSection = document.getElementById('prop');
  if (!propSection) {
    initThreeScene();
    return;
  }

  let initialized = false;
  const startPlanet = () => {
    if (initialized) return;
    initialized = true;
    initThreeScene();
  };

  const observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      observer.disconnect();
      window.requestAnimationFrame(startPlanet);
    }
  }, {
    root: null,
    rootMargin: '700px 0px 700px 0px',
    threshold: 0,
  });

  observer.observe(propSection);
};

export const initScrollExperience = () => {
  if (prefersReducedMotion()) {
    finishInitialLoad();
    document.body.classList.add('hero-content-ready');
    initFloatingChrome();
    gsap.set('.section-badge, .section-title, .section-subtitle, .plan-card, .social-card-left, .social-card-right, .testimonial-card, .step-card, .footer-container, .hero-left > *, .hero-right', {
      autoAlpha: 1,
      clearProps: 'transform,filter',
    });
    return;
  }

  let heroMotionStarted = false;
  const startHeroMotion = () => {
    if (heroMotionStarted) return;
    heroMotionStarted = true;
    initHeroMotion();
  };

  window.addEventListener('bullfy:hero-logo-ready', startHeroMotion, { once: true });
  window.setTimeout(startHeroMotion, 1800);
  window.setTimeout(finishInitialLoad, 2800);

  initHeroLogoModel();
  initScrollReveals();
  initMagneticButtons();
  initFloatingChrome();
};
