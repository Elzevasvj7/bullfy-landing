import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  gsap.to('.hero-title', {
    yPercent: -12,
    ease: 'none',
    scrollTrigger: {
      trigger: '.main-grid-container',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  ScrollTrigger.refresh();
};

const createPointCloud = () => {
  const geometry = new THREE.BufferGeometry();
  const count = 900;
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
      size: 0.025,
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

      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

const createAtmosphereMaterial = () => new THREE.ShaderMaterial({
  uniforms: {
    uGlow: { value: new THREE.Color('#5fb7ff') },
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
    varying vec3 vNormal;

    void main() {
      float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
      gl_FragColor = vec4(uGlow, intensity * 0.42);
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
      opacity: 0,
      side: THREE.DoubleSide,
    });
    logoMaterials.push(child.material);
  });

  return logoMaterials;
};

const initHeroLogoModel = () => {
  const canvas = document.getElementById('hero-logo-canvas');
  const heroRight = canvas?.closest('.hero-right');
  if (!canvas || !heroRight) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
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
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);

    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize);

  const loader = new GLTFLoader();
  let logoModel;
  loader.load('/model.gltf', (gltf) => {
    logoModel = gltf.scene;
    const logoMaterials = prepareBullfyLogoModel(logoModel, 3.75);
    logoAnchor.add(logoModel);

    gsap.to(logoMaterials, {
      opacity: 0.95,
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
  });

  const clock = new THREE.Clock();
  const animate = () => {
    const elapsed = clock.getElapsedTime();

    logoAnchor.rotation.y = -0.25 + elapsed * 0.42;
    logoAnchor.rotation.x = -0.1 + Math.sin(elapsed * 0.7) * 0.055;
    logoAnchor.rotation.z = Math.sin(elapsed * 0.5) * 0.025;
    if (logoModel) {
      logoModel.position.y = Math.sin(elapsed * 0.8) * 0.025;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
};

const initThreeScene = () => {
  const canvas = document.getElementById('fx-canvas');
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance',
  });

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  group.position.set(1.05, -4.15, -0.45);
  group.scale.setScalar(1.08);
  scene.add(group);

  const planetMaterial = createPlanetMaterial();
  const planet = new THREE.Mesh(
    new THREE.SphereGeometry(1.72, 96, 96),
    planetMaterial,
  );

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(1.86, 96, 96),
    createAtmosphereMaterial(),
  );

  const terminatorGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.735, 96, 96),
    new THREE.MeshBasicMaterial({
      color: '#0ea5e9',
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );

  const particles = createPointCloud();
  particles.material.opacity = 0.28;
  group.add(planet, atmosphere, terminatorGlow, particles);

  const keyLight = new THREE.DirectionalLight('#c8edff', 3.2);
  keyLight.position.set(-3.8, 3.2, 4.6);
  const fillLight = new THREE.PointLight('#2563eb', 1.2, 14);
  fillLight.position.set(3.4, -1.8, 2.2);
  scene.add(keyLight);
  scene.add(fillLight);
  scene.add(new THREE.AmbientLight('#102b5f', 0.95));

  const pointer = { x: 0, y: 0 };
  window.addEventListener('pointermove', (event) => {
    pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
    pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
  });

  const resize = () => {
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight, false);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  };

  resize();
  window.addEventListener('resize', resize);

  gsap.to(group.rotation, {
    x: Math.PI * 0.85,
    y: Math.PI * 1.8,
    z: Math.PI * 0.35,
    ease: 'none',
    scrollTrigger: {
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
    },
  });

  gsap.to(group.position, {
    x: 0.35,
    y: -0.95,
    z: -1.25,
    ease: 'none',
    scrollTrigger: {
      trigger: '#prop',
      start: 'top bottom',
      end: 'bottom 45%',
      scrub: true,
    },
  });

  gsap.to(planet.scale, {
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

    planetMaterial.uniforms.uTime.value = elapsed;
    planet.rotation.y += 0.0028;
    planet.rotation.x = Math.sin(elapsed * 0.12) * 0.04;
    atmosphere.rotation.y += 0.0018;
    terminatorGlow.rotation.y = planet.rotation.y;
    particles.rotation.y = elapsed * 0.025;

    group.rotation.y += (pointer.x * 0.18 - group.rotation.y * 0.02) * 0.01;
    group.rotation.x += (-pointer.y * 0.12 - group.rotation.x * 0.01) * 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
};

export const initScrollExperience = () => {
  if (prefersReducedMotion()) {
    gsap.set('.section-badge, .section-title, .section-subtitle, .plan-card, .social-card-left, .social-card-right, .testimonial-card, .step-card, .footer-container, .hero-left > *, .hero-right', {
      autoAlpha: 1,
      clearProps: 'transform,filter',
    });
    return;
  }

  initThreeScene();
  initHeroLogoModel();
  initScrollReveals();
  initMagneticButtons();
};
