/* ================================================================
   JAVIER GÓMEZ M. — script.js
   1. Neon Particle System (canvas)
   2. 3D Card Tilt on Mouse Move
   3. Card Shine sweep
   ================================================================ */

/* ── 1. PARTICLE SYSTEM ── */
(function () {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let W, H, particles, animId;

    const CONFIG = {
        count: 55,
        speed: 0.28,
        minRadius: 1,
        maxRadius: 2.8,
        connectDist: 130,
        colors: [
            'rgba(59,123,248,',    /* blue  */
            'rgba(34,211,238,',    /* cyan  */
            'rgba(59,123,248,',    /* more blue weight */
        ],
    };

    class Particle {
        constructor() { this.reset(true); }

        reset(initial) {
            this.x = Math.random() * W;
            this.y = initial ? Math.random() * H : H + 5;
            this.vx = (Math.random() - 0.5) * CONFIG.speed;
            this.vy = -(Math.random() * CONFIG.speed * 0.6 + CONFIG.speed * 0.2);
            this.r = Math.random() * (CONFIG.maxRadius - CONFIG.minRadius) + CONFIG.minRadius;
            this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
            this.alpha = Math.random() * 0.5 + 0.15;
            this.life = 0;
            this.maxLife = Math.random() * 300 + 200;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            /* fade in/out */
            const t = this.life / this.maxLife;
            this.currentAlpha = t < 0.15
                ? this.alpha * (t / 0.15)
                : t > 0.75
                    ? this.alpha * (1 - (t - 0.75) / 0.25)
                    : this.alpha;
            if (this.life > this.maxLife || this.x < -10 || this.x > W + 10) this.reset(false);
        }

        draw() {
            /* glow */
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r * 3);
            grd.addColorStop(0, this.color + this.currentAlpha + ')');
            grd.addColorStop(0.5, this.color + (this.currentAlpha * 0.4) + ')');
            grd.addColorStop(1, this.color + '0)');
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
            /* core */
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.currentAlpha + ')';
            ctx.fill();
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONFIG.connectDist) {
                    const alpha = (1 - dist / CONFIG.connectDist) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(59,123,248,${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();
                }
            }
        }
    }

    function init() {
        W = canvas.width = window.innerWidth;
        H = canvas.height = window.innerHeight;
        particles = Array.from({ length: CONFIG.count }, () => new Particle());
    }

    function loop() {
        ctx.clearRect(0, 0, W, H);
        drawConnections();
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(loop);
    }

    function onResize() {
        cancelAnimationFrame(animId);
        init();
        loop();
    }

    window.addEventListener('resize', onResize);
    init();
    loop();
})();


/* ── 2. 3D CARD TILT ── */
(function () {
    const INTENSITY = 8;    /* max degrees */
    const SCALE = 1.02; /* subtle lift */

    document.querySelectorAll('[data-tilt]').forEach(card => {
        let raf;

        card.addEventListener('mousemove', e => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const cx = rect.left + rect.width / 2;
                const cy = rect.top + rect.height / 2;
                const dx = (e.clientX - cx) / (rect.width / 2);  /* -1 to 1 */
                const dy = (e.clientY - cy) / (rect.height / 2);  /* -1 to 1 */

                const rx = dy * INTENSITY;   /* rotate around X axis */
                const ry = -dx * INTENSITY;   /* rotate around Y axis */

                card.style.transition = 'transform .05s linear, box-shadow .2s';
                card.style.transform =
                    `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${SCALE})`;

                /* Dynamic specular highlight */
                const px = (dx + 1) / 2 * 100;
                const py = (dy + 1) / 2 * 100;
                card.style.setProperty('--shine-x', `${px}%`);
                card.style.setProperty('--shine-y', `${py}%`);
            });
        });

        card.addEventListener('mouseleave', () => {
            cancelAnimationFrame(raf);
            card.style.transition = 'transform .55s cubic-bezier(.23,1,.32,1), box-shadow .4s';
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
        });
    });
})();