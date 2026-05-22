export function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let lines = [];
  let isPageVisible = true;

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

  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
  });

  for (let i = 0; i < 32; i++) particles.push(new Particle());
  for (let i = 0; i < 8; i++) lines.push(new FlowLine());

  let lastFrame = 0;
  const frameInterval = 1000 / 30;

  const animate = (timestamp = 0) => {
    if (!isPageVisible) {
      requestAnimationFrame(animate);
      return;
    }

    if (timestamp - lastFrame < frameInterval) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrame = timestamp;

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
      for (let j = i + 1; j < particles.length; j++) {
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

    requestAnimationFrame(animate);
  };

  animate();
}
