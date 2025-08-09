// ======= Welcome Screen Logic =======
document.addEventListener("DOMContentLoaded", () => {
  const welcomeScreen = document.getElementById("welcome");
  const mainContent = document.getElementById("main-content");

  setTimeout(() => {
    welcomeScreen.style.transition = "opacity 1s ease, transform 1s ease";
    welcomeScreen.style.opacity = 0;
    welcomeScreen.style.transform = "translateY(-100px)";
    setTimeout(() => {
      welcomeScreen.style.display = "none";
      mainContent.classList.remove("hidden");
    }, 1000);
  }, 4000);
});

// ======= Scroll Fade-In Effect =======
function animateSections() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll(".fade-in").forEach(section => observer.observe(section));
}
window.addEventListener("load", animateSections);

// ======= Swirl Background Animation =======
window.addEventListener("load", () => {
  const container = document.querySelector('.content--canvas');
  if (!container) return;

  const particleCount = 700;
  const particlePropCount = 9;
  const particlePropsLength = particleCount * particlePropCount;
  const rangeY = 100;
  const baseTTL = 50;
  const rangeTTL = 150;
  const baseSpeed = 0.1;
  const rangeSpeed = 2;
  const baseRadius = 1;
  const rangeRadius = 4;
  const baseHue = 220;
  const rangeHue = 100;
  const noiseSteps = 8;
  const xOff = 0.00125;
  const yOff = 0.00125;
  const zOff = 0.0005;
  const backgroundColor = 'hsla(260,40%,5%,1)';
  const TAU = Math.PI * 2;

  let canvas, ctx, center, gradient, tick, simplex, particleProps;

  class SimplexNoise {
    constructor(r = Math) {
      this.grad3 = new Float32Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,
                                      1,0,1,-1,0,1,1,0,-1,-1,0,-1,
                                      0,1,1,0,-1,1,0,1,-1,0,-1,-1]);
      this.p = new Uint8Array(256);
      for (let i = 0; i < 256; i++) this.p[i] = r.random() * 256;
      this.perm = new Uint8Array(512);
      this.permMod12 = new Uint8Array(512);
      for (let i = 0; i < 512; i++) {
        this.perm[i] = this.p[i & 255];
        this.permMod12[i] = this.perm[i] % 12;
      }
    }

    noise3D(xin, yin, zin) {
      const grad3 = this.grad3;
      const permMod12 = this.permMod12;
      const perm = this.perm;

      const F3 = 1/3;
      const G3 = 1/6;
      let n0, n1, n2, n3;

      let s = (xin + yin + zin) * F3;
      let i = Math.floor(xin + s);
      let j = Math.floor(yin + s);
      let k = Math.floor(zin + s);

      let t = (i + j + k) * G3;
      let X0 = i - t;
      let Y0 = j - t;
      let Z0 = k - t;
      let x0 = xin - X0;
      let y0 = yin - Y0;
      let z0 = zin - Z0;

      let i1, j1, k1;
      let i2, j2, k2;

      if (x0 >= y0) {
        if (y0 >= z0) {
          i1=1; j1=0; k1=0;
          i2=1; j2=1; k2=0;
        } else if (x0 >= z0) {
          i1=1; j1=0; k1=0;
          i2=1; j2=0; k2=1;
        } else {
          i1=0; j1=0; k1=1;
          i2=1; j2=0; k2=1;
        }
      } else {
        if (y0 < z0) {
          i1=0; j1=0; k1=1;
          i2=0; j2=1; k2=1;
        } else if (x0 < z0) {
          i1=0; j1=1; k1=0;
          i2=0; j2=1; k2=1;
        } else {
          i1=0; j1=1; k1=0;
          i2=1; j2=1; k2=0;
        }
      }

      let x1 = x0 - i1 + G3;
      let y1 = y0 - j1 + G3;
      let z1 = z0 - k1 + G3;
      let x2 = x0 - i2 + 2*G3;
      let y2 = y0 - j2 + 2*G3;
      let z2 = z0 - k2 + 2*G3;
      let x3 = x0 - 1 + 3*G3;
      let y3 = y0 - 1 + 3*G3;
      let z3 = z0 - 1 + 3*G3;

      i &= 255; j &= 255; k &= 255;
      let gi0 = permMod12[i + perm[j + perm[k]]];
      let gi1 = permMod12[i + i1 + perm[j + j1 + perm[k + k1]]];
      let gi2 = permMod12[i + i2 + perm[j + j2 + perm[k + k2]]];
      let gi3 = permMod12[i + 1 + perm[j + 1 + perm[k + 1]]];

      let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
      if (t0<0) n0 = 0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * (grad3[gi0*3]*x0 + grad3[gi0*3+1]*y0 + grad3[gi0*3+2]*z0);
      }

      let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
      if (t1<0) n1 = 0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * (grad3[gi1*3]*x1 + grad3[gi1*3+1]*y1 + grad3[gi1*3+2]*z1);
      }

      let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
      if (t2<0) n2 = 0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * (grad3[gi2*3]*x2 + grad3[gi2*3+1]*y2 + grad3[gi2*3+2]*z2);
      }

      let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
      if (t3<0) n3 = 0;
      else {
        t3 *= t3;
        n3 = t3 * t3 * (grad3[gi3*3]*x3 + grad3[gi3*3+1]*y3 + grad3[gi3*3+2]*z3);
      }

      return 32 * (n0 + n1 + n2 + n3);
    }
  }

  const rand = n => Math.random() * n;
  const randRange = n => n - Math.random() * n * 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const fadeInOut = (t, m) => {
    let hm = 0.5 * m;
    return Math.abs((t + hm) % m - hm) / hm;
  };

  function createCanvas() {
    canvas = {
      a: document.createElement('canvas'),
      b: document.createElement('canvas')
    };
    canvas.b.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    `;
    container.appendChild(canvas.b);
    ctx = {
      a: canvas.a.getContext('2d'),
      b: canvas.b.getContext('2d')
    };
    center = [];
  }

  function resize() {
    const { innerWidth, innerHeight } = window;
    canvas.a.width = canvas.b.width = innerWidth;
    canvas.a.height = canvas.b.height = innerHeight;
    center[0] = 0.5 * innerWidth;
    center[1] = 0.5 * innerHeight;
  }

  function initParticles() {
    tick = 0;
    simplex = new SimplexNoise();
    particleProps = new Float32Array(particlePropsLength);
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      initParticle(i);
    }
  }

  function initParticle(i) {
    let x = rand(canvas.a.width);
    let y = center[1] + randRange(rangeY);
    let vx = 0;
    let vy = 0;
    let life = 0;
    let ttl = baseTTL + rand(rangeTTL);
    let speed = baseSpeed + rand(rangeSpeed);
    let radius = baseRadius + rand(rangeRadius);
    let hue = baseHue + rand(rangeHue);
    particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
  }

  function drawParticles() {
    for (let i = 0; i < particlePropsLength; i += particlePropCount) {
      updateParticle(i);
    }
  }

  function updateParticle(i) {
    let i2=1+i, i3=2+i, i4=3+i, i5=4+i, i6=5+i, i7=6+i, i8=7+i, i9=8+i;
    let x = particleProps[i];
    let y = particleProps[i2];
    let n = simplex.noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
    let vx = lerp(particleProps[i3], Math.cos(n), 0.5);
    let vy = lerp(particleProps[i4], Math.sin(n), 0.5);
    let life = particleProps[i5];
    let ttl = particleProps[i6];
    let speed = particleProps[i7];
    let x2 = x + vx * speed;
    let y2 = y + vy * speed;
    let radius = particleProps[i8];
    let hue = particleProps[i9];

    drawParticle(x, y, x2, y2, life, ttl, radius, hue);

    life++;

    particleProps[i] = x2;
    particleProps[i2] = y2;
    particleProps[i3] = vx;
    particleProps[i4] = vy;
    particleProps[i5] = life;

    if (x2 > canvas.a.width || x2 < 0 || y2 > canvas.a.height || y2 < 0 || life > ttl) {
      initParticle(i);
    }
  }

  function drawParticle(x, y, x2, y2, life, ttl, radius, hue) {
    ctx.a.save();
    ctx.a.lineCap = 'round';
    ctx.a.lineWidth = radius;
    ctx.a.strokeStyle = `hsla(${hue},100%,60%,${fadeInOut(life, ttl)})`;
    ctx.a.beginPath();
    ctx.a.moveTo(x, y);
    ctx.a.lineTo(x2, y2);
    ctx.a.stroke();
    ctx.a.closePath();
    ctx.a.restore();
  }

  function renderGlow() {
    ctx.b.save();
    ctx.b.filter = 'blur(8px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();

    ctx.b.save();
    ctx.b.filter = 'blur(4px) brightness(200%)';
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();
  }

  function renderToScreen() {
    ctx.b.save();
    ctx.b.globalCompositeOperation = 'lighter';
    ctx.b.drawImage(canvas.a, 0, 0);
    ctx.b.restore();
  }

  function draw() {
    tick++;
    ctx.a.clearRect(0, 0, canvas.a.width, canvas.a.height);
    ctx.b.fillStyle = backgroundColor;
    ctx.b.fillRect(0, 0, canvas.a.width, canvas.a.height);
    drawParticles();
    renderGlow();
    renderToScreen();
    window.requestAnimationFrame(draw);
  }

  createCanvas();
  resize();
  initParticles();
  draw();
  window.addEventListener("resize", resize);
});
