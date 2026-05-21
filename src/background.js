export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let lines = [];

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  };

  window.addEventListener('resize', resize);
  resize();

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      // Blue hues matching the new palette
      this.color = Math.random() > 0.5 ? 'rgba(59, 130, 246, 0.5)' : 'rgba(96, 165, 250, 0.3)'; 
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Candlestick-like background floating bars but with blue themes
  class FlowLine {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height + height;
      this.h = Math.random() * 100 + 20;
      this.w = Math.random() * 2 + 1;
      this.speedY = -(Math.random() * 0.5 + 0.1);
      this.opacity = Math.random() * 0.1;
      this.isDarkBlue = Math.random() > 0.5;
    }
    update() {
      this.y += this.speedY;
      if (this.y + this.h < 0) {
        this.y = height + this.h;
        this.x = Math.random() * width;
      }
    }
    draw() {
      ctx.fillStyle = this.isDarkBlue ? `rgba(30, 58, 138, ${this.opacity})` : `rgba(59, 130, 246, ${this.opacity})`;
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }

  for (let i = 0; i < 70; i++) particles.push(new Particle());
  for (let i = 0; i < 20; i++) lines.push(new FlowLine());

  // --- Bull Constellation ---
  const bullShape = [
    // Tail
    {x: -70, y: -20}, {x: -60, y: -25}, {x: -50, y: -15},
    // Back
    {x: -40, y: -30}, {x: -20, y: -35}, {x: 0, y: -35}, {x: 20, y: -30},
    // Neck/Head
    {x: 40, y: -40}, {x: 50, y: -45}, {x: 65, y: -25}, {x: 80, y: -10}, {x: 75, y: 10}, {x: 60, y: 15}, {x: 45, y: 5},
    // Horn
    {x: 60, y: -45}, {x: 70, y: -50},
    // Front Leg Right
    {x: 35, y: 15}, {x: 40, y: 40}, {x: 50, y: 65}, {x: 60, y: 60},
    // Front Leg Left
    {x: 20, y: 15}, {x: 25, y: 45}, {x: 35, y: 70}, {x: 45, y: 70},
    // Belly
    {x: 0, y: 20}, {x: -20, y: 20},
    // Back Leg Right
    {x: -30, y: 10}, {x: -20, y: 45}, {x: -10, y: 75}, {x: 0, y: 75},
    // Back Leg Left
    {x: -40, y: 5}, {x: -45, y: 40}, {x: -45, y: 70}, {x: -35, y: 70},
    // Body fillers
    {x: -20, y: -10}, {x: 0, y: -10}, {x: 20, y: -10}, {x: 40, y: -15},
    {x: -30, y: -5}, {x: -10, y: 5}, {x: 10, y: 5}, {x: 30, y: 0}
  ];

  class BullParticle {
    constructor(baseX, baseY) {
      this.baseX = baseX;
      this.baseY = baseY;
      this.offsetX = 0;
      this.offsetY = 0;
      this.angle = Math.random() * Math.PI * 2;
      this.speed = Math.random() * 0.02 + 0.01;
      this.size = Math.random() * 1.5 + 1.5;
    }
    update(centerX, centerY, scale) {
      this.angle += this.speed;
      this.offsetX = Math.cos(this.angle) * 3;
      this.offsetY = Math.sin(this.angle) * 3;
      this.x = centerX + this.baseX * scale + this.offsetX;
      this.y = centerY + this.baseY * scale + this.offsetY;
    }
    draw() {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 12;
      ctx.shadowColor = 'rgba(59, 130, 246, 1)';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  let bullParticles = bullShape.map(p => new BullParticle(p.x, p.y));

  const animate = () => {
    // Fading trail slightly darker/bluer to match the deep blue theme
    ctx.fillStyle = 'rgba(3, 7, 18, 0.3)'; 
    ctx.fillRect(0, 0, width, height);

    lines.forEach(line => {
      line.update();
      line.draw();
    });

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Draw network connections for background
    for (let i = 0; i < particles.length; i++) {
      for (let j = i; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
          ctx.beginPath();
          const opacity = 0.3 - (distance / 150) * 0.3;
          ctx.strokeStyle = `rgba(147, 197, 253, ${opacity})`;
          ctx.lineWidth = 1.0;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // --- Update & Draw Bull Constellation ---
    const time = Date.now() * 0.0005;
    const bullX = width > 768 ? width * 0.75 + Math.cos(time) * 40 : width * 0.5 + Math.cos(time) * 20;
    const bullY = width > 768 ? height * 0.4 + Math.sin(time * 0.7) * 30 : height * 0.3 + Math.sin(time * 0.7) * 20;
    const bullScale = width > 768 ? 2.5 : 1.2;

    bullParticles.forEach(bp => {
      bp.update(bullX, bullY, bullScale);
      bp.draw();
    });

    // Internal bull connections
    for (let i = 0; i < bullParticles.length; i++) {
      for (let j = i + 1; j < bullParticles.length; j++) {
        const dx = bullParticles[i].x - bullParticles[j].x;
        const dy = bullParticles[i].y - bullParticles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const maxDist = 55 * (bullScale / 2.5); // Tune connection distance based on scale
        
        if (dist < maxDist) {
          ctx.beginPath();
          const opacity = 0.8 - (dist / maxDist) * 0.8;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.lineWidth = 1.5;
          ctx.moveTo(bullParticles[i].x, bullParticles[i].y);
          ctx.lineTo(bullParticles[j].x, bullParticles[j].y);
          ctx.stroke();
        }
      }
    }

    // Connect bull to background optionally
    bullParticles.forEach(bp => {
      particles.forEach(p => {
        const dx = bp.x - p.x;
        const dy = bp.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          const opacity = 0.2 - (dist / 100) * 0.2;
          ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
          ctx.lineWidth = 1.0;
          ctx.moveTo(bp.x, bp.y);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });
    });

    requestAnimationFrame(animate);
  };

  animate();
}
