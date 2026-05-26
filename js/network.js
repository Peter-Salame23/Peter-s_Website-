(function () {
  const container = document.querySelector('.content--canvas');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, stars, shooters = [];
  const mouse = { x: -9999, y: -9999 };

  const STAR_COUNT       = 220;
  const CONSTELLATION_D  = 110;
  const MOUSE_REPEL_R    = 160;

  const COLORS = [
    [255, 255, 255],   // pure white
    [210, 228, 255],   // blue-white
    [180, 210, 255],   // cool blue
    [255, 245, 210],   // warm yellow-white
    [230, 220, 255],   // faint violet
  ];

  /* ─── resize ─── */
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  /* ─── star factory ─── */
  function mkStar() {
    const tier = Math.random();               // 0 = tiny, 1 = bright
    const r    = tier < 0.65 ? Math.random() * 0.7 + 0.15
               : tier < 0.92 ? Math.random() * 1.1 + 0.8
               :                Math.random() * 1.6 + 1.6;
    const col  = COLORS[Math.floor(Math.random() * COLORS.length)];
    return {
      x:  Math.random() * W,
      y:  Math.random() * H,
      ox: 0, oy: 0,                          // parallax offset
      vx: (Math.random() - .5) * 0.06,
      vy: (Math.random() - .5) * 0.06,
      r,
      col,
      phase:       Math.random() * Math.PI * 2,
      twinkleSpd:  Math.random() * 0.018 + 0.004,
      baseAlpha:   tier < 0.65 ? Math.random() * 0.45 + 0.25
                 : tier < 0.92 ? Math.random() * 0.35 + 0.55
                 :                Math.random() * 0.2  + 0.78,
    };
  }

  /* ─── shooting star factory ─── */
  function mkShooter() {
    return {
      x:   Math.random() * W,
      y:   Math.random() * H * 0.5,
      len: Math.random() * 120 + 60,
      spd: Math.random() * 6 + 5,
      ang: Math.PI / 4 + (Math.random() - .5) * 0.3,
      life: 1,
      decay: Math.random() * 0.022 + 0.012,
    };
  }

  function init() {
    stars = Array.from({ length: STAR_COUNT }, mkStar);
  }

  /* ─── nebula layer ─── */
  function drawNebula() {
    [
      // large anchor clouds
      { cx: W * 0.15, cy: H * 0.22, r: W * 0.52, rgb: '90,30,140',   a: 0.10 },
      { cx: W * 0.85, cy: H * 0.75, r: W * 0.48, rgb: '20,55,150',   a: 0.09 },
      { cx: W * 0.50, cy: H * 0.50, r: W * 0.65, rgb: '6, 10,  60',  a: 0.07 },
      // accent wisps
      { cx: W * 0.30, cy: H * 0.78, r: W * 0.32, rgb: '110,20,100',  a: 0.08 },
      { cx: W * 0.72, cy: H * 0.18, r: W * 0.28, rgb: '30, 80,160',  a: 0.07 },
      { cx: W * 0.60, cy: H * 0.88, r: W * 0.25, rgb: '60, 20,120',  a: 0.06 },
      // subtle blue-green core glow
      { cx: W * 0.48, cy: H * 0.38, r: W * 0.20, rgb: '0, 120,160',  a: 0.05 },
      // deep warm core
      { cx: W * 0.22, cy: H * 0.60, r: W * 0.22, rgb: '140,40, 60',  a: 0.045 },
    ].forEach(({ cx, cy, r, rgb, a }) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0,   `rgba(${rgb},${a})`);
      g.addColorStop(0.5, `rgba(${rgb},${a * 0.4})`);
      g.addColorStop(1,   `rgba(${rgb},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    });
  }

  /* ─── sparkle cross on bright stars ─── */
  function drawSparkle(x, y, r, alpha, col) {
    const arm = r * 5;
    ctx.save();
    ctx.globalAlpha = alpha * 0.28;
    ctx.strokeStyle = `rgb(${col})`;
    ctx.lineWidth   = 0.5;
    [-1, 1].forEach(d => {
      ctx.beginPath();
      ctx.moveTo(x - arm * d, y);
      ctx.lineTo(x + arm * d, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y - arm);
      ctx.lineTo(x, y + arm);
      ctx.stroke();
    });
    ctx.restore();
  }

  /* ─── main render loop ─── */
  function tick() {
    /* background */
    ctx.fillStyle = 'rgb(3, 3, 12)';
    ctx.fillRect(0, 0, W, H);

    drawNebula();

    /* occasional shooting stars */
    if (Math.random() < 0.003) shooters.push(mkShooter());

    shooters = shooters.filter(s => {
      s.x  += Math.cos(s.ang) * s.spd;
      s.y  += Math.sin(s.ang) * s.spd;
      s.life -= s.decay;
      if (s.life <= 0) return false;

      const tx = s.x - Math.cos(s.ang) * s.len * s.life;
      const ty = s.y - Math.sin(s.ang) * s.len * s.life;
      const g  = ctx.createLinearGradient(tx, ty, s.x, s.y);
      g.addColorStop(0, `rgba(255,255,255,0)`);
      g.addColorStop(1, `rgba(255,255,255,${s.life * 0.7})`);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(s.x, s.y);
      ctx.strokeStyle = g;
      ctx.lineWidth   = 1.2;
      ctx.stroke();
      return true;
    });

    /* constellation lines */
    ctx.lineWidth = 0.35;
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const d = Math.hypot(
          stars[i].x + stars[i].ox - stars[j].x - stars[j].ox,
          stars[i].y + stars[i].oy - stars[j].y - stars[j].oy
        );
        if (d < CONSTELLATION_D) {
          const a = (1 - d / CONSTELLATION_D) * 0.1;
          ctx.beginPath();
          ctx.moveTo(stars[i].x + stars[i].ox, stars[i].y + stars[i].oy);
          ctx.lineTo(stars[j].x + stars[j].ox, stars[j].y + stars[j].oy);
          ctx.strokeStyle = `rgba(190,210,255,${a})`;
          ctx.stroke();
        }
      }
    }

    /* stars */
    stars.forEach(s => {
      /* slow drift */
      s.x += s.vx;  s.y += s.vy;
      if (s.x < 0) s.x = W;  if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H;  if (s.y > H) s.y = 0;

      /* mouse repel parallax */
      const dx = s.x - mouse.x, dy = s.y - mouse.y;
      const md = Math.hypot(dx, dy);
      if (md < MOUSE_REPEL_R && md > 0) {
        const push = (1 - md / MOUSE_REPEL_R) * 10;
        s.ox = dx / md * push;
        s.oy = dy / md * push;
      } else {
        s.ox *= 0.9;
        s.oy *= 0.9;
      }

      /* twinkle */
      s.phase += s.twinkleSpd;
      const twinkle = 0.72 + Math.sin(s.phase) * 0.28;
      const alpha   = s.baseAlpha * twinkle;
      const px = s.x + s.ox, py = s.y + s.oy;
      const [r, g, b] = s.col;

      /* glow halo on medium/bright stars */
      if (s.r > 0.9) {
        const halo = ctx.createRadialGradient(px, py, 0, px, py, s.r * 5);
        halo.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.22})`);
        halo.addColorStop(1, `rgba(${r},${g},${b},0)`);
        ctx.beginPath();
        ctx.arc(px, py, s.r * 5, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }

      /* sparkle cross on the brightest */
      if (s.r > 1.8) drawSparkle(px, py, s.r, alpha, s.col);

      /* core */
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  window.addEventListener('resize', () => { resize(); init(); });

  resize();
  init();
  requestAnimationFrame(tick);
})();
