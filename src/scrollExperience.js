import * as THREE from 'three';
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
    uBase: { value: new THREE.Color('#07111f') },
    uOcean: { value: new THREE.Color('#0f4a7c') },
    uLand: { value: new THREE.Color('#2f7bbd') },
    uIce: { value: new THREE.Color('#b9e6ff') },
  },
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
      float landMask = smoothstep(0.52, 0.68, continents + detail * 0.18);
      float polarMask = smoothstep(0.78, 0.98, abs(vUv.y - 0.5) * 2.0);

      vec3 color = mix(uOcean, uLand, landMask);
      color = mix(color, uIce, polarMask * 0.62);
      color = mix(uBase, color, 0.88);

      vec3 lightDirection = normalize(vec3(-0.25, 0.55, 0.82));
      float light = max(dot(normalize(vNormal), lightDirection), 0.0);
      float rim = pow(1.0 - max(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0)), 0.0), 2.4);
      float clouds = smoothstep(0.58, 0.74, fbm(vec2(vUv.x + uTime * 0.04, vUv.y) * vec2(10.0, 4.0)));

      color *= 0.36 + light * 1.22;
      color += vec3(0.42, 0.72, 1.0) * rim * 0.46;
      color = mix(color, vec3(0.82, 0.94, 1.0), clouds * 0.22);

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
  group.position.set(1.2, 0.18, -0.25);
  group.scale.setScalar(1.18);
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
    x: -1.05,
    y: -0.8,
    z: -1.4,
    ease: 'none',
    scrollTrigger: {
      trigger: '#social',
      start: 'top bottom',
      end: 'bottom top',
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
  initScrollReveals();
  initMagneticButtons();
};
